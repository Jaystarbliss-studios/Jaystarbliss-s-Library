import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Firebase Admin environment variables are not configured.');
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Firebase authorization token.' });
    }

    const idToken = authHeader.slice('Bearer '.length).trim();
    const adminApp = getAdminApp();
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);

    const adminEmails = new Set([
      'general5242@gmail.com',
      'johnrufai242@gmail.com'
    ]);

    if (!decoded.email || !adminEmails.has(decoded.email.toLowerCase())) {
      return res.status(403).json({ error: 'Only an authorized Library X administrator can send chapter notifications.' });
    }

    const { chapterId } = req.body || {};
    if (!chapterId || typeof chapterId !== 'string') {
      return res.status(400).json({ error: 'chapterId is required.' });
    }

    const db = getFirestore(adminApp);
    const chapterSnap = await db.collection('chapters').doc(chapterId).get();
    if (!chapterSnap.exists) {
      return res.status(404).json({ error: 'Chapter not found.' });
    }

    const chapter = chapterSnap.data() as {
      id: string;
      bookId: string;
      chapterNumber: number;
      title: string;
      subtitle?: string;
      status: string;
    };

    if (chapter.status !== 'published') {
      return res.status(400).json({ error: 'Only published chapters can trigger reader notifications.' });
    }

    const bookSnap = await db.collection('books').doc(chapter.bookId).get();
    const book = bookSnap.exists ? bookSnap.data() as { title?: string; slug?: string } : {};

    const bookmarkSnap = await db
      .collection('bookmarks')
      .where('bookId', '==', chapter.bookId)
      .where('emailNotificationsEnabled', '==', true)
      .get();

    const recipients = Array.from(new Set(
      bookmarkSnap.docs
        .map((doc) => String(doc.data().userEmail || '').trim().toLowerCase())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ));

    if (recipients.length === 0) {
      return res.status(200).json({ sent: 0, skipped: 0, message: 'No readers are subscribed to this book.' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || 'Library X <onboarding@resend.dev>';
    if (!resendApiKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY is not configured on Vercel.' });
    }

    const resend = new Resend(resendApiKey);
    const appUrl = process.env.APP_URL || 'https://library-x.vercel.app';
    const readerUrl = chapter.bookId
      ? `${appUrl.replace(/\/$/, '')}/#/reader/${encodeURIComponent(book.slug || chapter.bookId)}/${chapter.chapterNumber}`
      : appUrl;

    const subject = `New chapter: ${book.title || 'Library X'} — Chapter ${chapter.chapterNumber}`;
    const html = `
      <div style="margin:0;padding:32px 16px;background:#f4f1eb;font-family:Georgia,'Times New Roman',serif;color:#171717">
        <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #ded9d0">
          <div style="padding:28px 32px;border-bottom:1px solid #e6e1d8">
            <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#777">Library X</div>
            <h1 style="margin:14px 0 6px;font-size:28px;line-height:1.2;font-weight:600">${escapeHtml(book.title || 'A new chapter is available')}</h1>
            <div style="font-family:Arial,sans-serif;font-size:13px;color:#777">Chapter ${chapter.chapterNumber}</div>
          </div>
          <div style="padding:30px 32px">
            <h2 style="margin:0 0 12px;font-size:22px">${escapeHtml(chapter.title || `Chapter ${chapter.chapterNumber}`)}</h2>
            ${chapter.subtitle ? `<p style="margin:0 0 22px;color:#777;font-style:italic">${escapeHtml(chapter.subtitle)}</p>` : ''}
            <p style="margin:0 0 26px;line-height:1.7">A new chapter has been published in your Library X shelf.</p>
            <a href="${readerUrl}" style="display:inline-block;padding:12px 18px;background:#171717;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:13px">READ CHAPTER</a>
          </div>
          <div style="padding:18px 32px;border-top:1px solid #e6e1d8;font-family:Arial,sans-serif;font-size:11px;color:#888">
            You received this because email notifications are enabled for this book in Library X.
          </div>
        </div>
      </div>
    `;

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const result = await resend.emails.send(
        {
          from,
          to: [recipient],
          subject,
          html,
        },
        {
          idempotencyKey: `library-x/chapter/${chapterId}/recipient/${recipient}`,
        }
      );

      if (result.error) {
        failed += 1;
        console.error('Resend failed for recipient:', recipient, result.error);
      } else {
        sent += 1;
      }
    }

    return res.status(failed > 0 ? 207 : 200).json({
      sent,
      failed,
      total: recipients.length,
      chapterId,
    });
  } catch (error) {
    console.error('Chapter notification error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to send chapter notifications.',
    });
  }
}

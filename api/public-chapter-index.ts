import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
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

function buildPublicChapterTeaser(content: string, maxWords = 180): string {
  const safeBlocks = content
    .replace(/<script[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<style[\\s\\S]*?<\\/style>/gi, '')
    .split(/<\\/p>|<\\/div>|<br\\s*\\/?>/gi)
    .map((block) => block.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim())
    .filter(Boolean);

  let wordsUsed = 0;
  const paragraphs: string[] = [];

  for (const block of safeBlocks) {
    const words = block.split(/\\s+/).filter(Boolean);
    const remaining = maxWords - wordsUsed;
    if (!words.length || remaining <= 0) break;

    const selected = words.slice(0, remaining);
    paragraphs.push(selected.join(' '));
    wordsUsed += selected.length;

    if (selected.length < words.length) break;
  }

  return paragraphs
    .map((paragraph) =>
      '<p>' + paragraph
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;') + '</p>'
    )
    .join('');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminApp = getAdminApp();
    const databaseId = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-jaystarblissslib-3ce40f20-6e76-4db9-b86c-ea4fc2fc0b57';
    const db = getFirestore(adminApp, databaseId);

    const snapshot = await db
      .collection('chapters')
      .where('status', '==', 'published')
      .get();

    const chapters = snapshot.docs
      .map((doc) => {
        const chapter = doc.data() as {
          id?: string;
          bookId?: string;
          chapterNumber?: number;
          title?: string;
          subtitle?: string;
          status?: string;
          publishedAt?: string;
          wordCount?: number;
          readingTimeMinutes?: number;
          content?: string;
        };

        if (
          !chapter.id ||
          !chapter.bookId ||
          typeof chapter.chapterNumber !== 'number' ||
          chapter.chapterNumber < 11 ||
          chapter.status !== 'published'
        ) {
          return null;
        }

        return {
          id: chapter.id,
          bookId: chapter.bookId,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title || '',
          subtitle: chapter.subtitle,
          status: 'published',
          publishedAt: chapter.publishedAt,
          wordCount: chapter.wordCount,
          readingTimeMinutes: chapter.readingTimeMinutes,
          teaserContent: buildPublicChapterTeaser(chapter.content || ''),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.chapterNumber - b!.chapterNumber));

    return res.status(200).json({ chapters });
  } catch (error) {
    console.error('Public chapter index error:', error);
    return res.status(500).json({ error: 'Could not load locked chapter metadata.' });
  }
}

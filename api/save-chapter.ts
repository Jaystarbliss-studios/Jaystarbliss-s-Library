import type { VercelRequest, VercelResponse } from '@vercel/node';
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

const ADMIN_EMAILS = new Set(['general5242@gmail.com', 'johnrufai242@gmail.com']);

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined).map(sanitize);
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item !== undefined) result[key] = sanitize(item);
    }
    return result;
  }
  return value;
}

function buildTeaser(content: string, maxWords = 180): string {
  const safe = (content || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const blocks = safe
    .split(/<\/p>|<\/div>|<br\s*\/?>/gi)
    .map((block) => block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  let used = 0;
  const paragraphs: string[] = [];
  for (const block of blocks) {
    const words = block.split(/\s+/).filter(Boolean);
    const remaining = maxWords - used;
    if (!words.length || remaining <= 0) break;
    const selected = words.slice(0, remaining);
    paragraphs.push('<p>' + escapeHtml(selected.join(' ')) + '</p>');
    used += selected.length;
    if (selected.length < words.length) break;
  }
  return paragraphs.join('');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Firebase authorization token.' });
    }

    const adminApp = getAdminApp();
    const decoded = await getAuth(adminApp).verifyIdToken(authorization.slice(7));
    const email = (decoded.email || '').toLowerCase();

    if (!decoded.email_verified || !ADMIN_EMAILS.has(email)) {
      return res.status(403).json({ error: 'Only a verified Library X administrator can save chapters.' });
    }

    const chapter = sanitize(req.body?.chapter) as Record<string, any>;
    if (!chapter?.id || !chapter?.bookId || typeof chapter.chapterNumber !== 'number' ||
        typeof chapter.title !== 'string' || typeof chapter.content !== 'string' ||
        !['draft', 'published', 'scheduled', 'unpublished'].includes(chapter.status)) {
      return res.status(400).json({ error: 'Invalid chapter payload.' });
    }

    const databaseId = process.env.FIRESTORE_DATABASE_ID ||
      'ai-studio-jaystarblissslib-3ce40f20-6e76-4db9-b86c-ea4fc2fc0b57';
    const db = getFirestore(adminApp, databaseId);

    await db.collection('chapters').doc(chapter.id).set(chapter);

    const indexRef = db.collection('chapterIndex').doc(chapter.id);
    if (chapter.status === 'published' && chapter.chapterNumber >= 11) {
      await indexRef.set({
        id: chapter.id,
        bookId: chapter.bookId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        subtitle: chapter.subtitle,
        status: chapter.status,
        publishedAt: chapter.publishedAt,
        wordCount: chapter.wordCount,
        readingTimeMinutes: chapter.readingTimeMinutes,
        teaserContent: buildTeaser(chapter.content),
      });
    } else {
      await indexRef.delete().catch(() => undefined);
    }

    return res.status(200).json({ ok: true, chapterId: chapter.id });
  } catch (error) {
    console.error('Save chapter API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Could not save chapter.' });
  }
}

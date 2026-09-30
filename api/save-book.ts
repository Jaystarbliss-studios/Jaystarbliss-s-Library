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
      return res.status(403).json({ error: 'Only a verified Library X administrator can save books.' });
    }

    const book = sanitize(req.body?.book) as Record<string, any>;
    if (!book?.id || typeof book.title !== 'string' || typeof book.author !== 'string' ||
        !['ongoing', 'completed', 'hiatus'].includes(book.status) ||
        !['published', 'draft', 'private'].includes(book.visibility)) {
      return res.status(400).json({ error: 'Invalid book payload.' });
    }

    const databaseId = process.env.FIRESTORE_DATABASE_ID ||
      'ai-studio-jaystarblissslib-3ce40f20-6e76-4db9-b86c-ea4fc2fc0b57';
    const db = getFirestore(adminApp, databaseId);
    await db.collection('books').doc(book.id).set(book);

    return res.status(200).json({ ok: true, bookId: book.id });
  } catch (error) {
    console.error('Save book API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Could not save book.' });
  }
}

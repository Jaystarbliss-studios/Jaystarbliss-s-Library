import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Book, Chapter, Bookmark, ReadingProgress, UserProfile, ChapterComment } from '../types';
import { INITIAL_BOOKS, INITIAL_CHAPTERS } from '../data/initialData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test Firestore connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline');
    } else {
      console.log('Firestore connection verified (test doc response):', error);
    }
    return false;
  }
}

// Initial connection test
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log('Redirect sign-in resolved:', result.user.email);
      return result.user;
    }
  } catch (error) {
    console.warn('Redirect sign-in notice:', error);
  }
  return null;
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

export const ADMIN_EMAILS = [
  'general5242@gmail.com',
  'johnrufai242@gmail.com'
];

export interface SimpleAuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export function isUserAdmin(user: SimpleAuthUser | User | null | undefined): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

// Automatically syncs and initializes Reader or Author account upon Google Auth
export async function syncUserProfileToFirestore(user: User): Promise<{ role: 'admin' | 'reader'; displayName: string }> {
  const admin = isUserAdmin(user);
  const role: 'admin' | 'reader' = admin ? 'admin' : 'reader';
  const displayName = user.displayName || user.email?.split('@')[0] || (admin ? 'Author' : 'Reader');
  
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userDocRef);
    if (!existingSnap.exists()) {
      // Create new reader or author profile
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email || '',
        displayName,
        role,
        avatarUrl: user.photoURL || null,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
      console.log(`Initialized ${role} account in Firestore for:`, user.email);
    } else {
      // Update last active
      await setDoc(userDocRef, {
        displayName,
        lastLoginAt: new Date().toISOString(),
        avatarUrl: user.photoURL || null
      }, { merge: true });
    }
  } catch (error) {
    console.warn('Could not sync user account to Firestore (continuing session):', error);
  }

  return { role, displayName };
}

// Real-time canonical catalog listeners. Firestore is the source of truth for books/chapters.
export function listenToBooks(
  onUpdate: (books: Book[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'books'),
    (snapshot) => {
      onUpdate(snapshot.docs.map((item) => item.data() as Book));
    },
    (error) => {
      console.error('Firestore books listener error:', error);
      onError?.(error);
    }
  );
}

export function listenToChapters(
  onUpdate: (chapters: Chapter[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'chapters'),
    (snapshot) => {
      onUpdate(snapshot.docs.map((item) => item.data() as Chapter));
    },
    (error) => {
      console.error('Firestore chapters listener error:', error);
      onError?.(error);
    }
  );
}

/**
 * Public chapter feed for anonymous readers.
 * Chapters 1–10 come from the full chapter collection. Chapters 11+ are represented
 * only by public metadata in chapterIndex, never by their manuscript content.
 */
export function listenToPublicChapters(
  onUpdate: (chapters: Chapter[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const readableQuery = query(
    collection(db, 'chapters'),
    where('status', '==', 'published'),
    where('chapterNumber', '<=', 10)
  );
  let readable: Chapter[] = [];
  let locked: Chapter[] = [];

  const emit = () => {
    onUpdate(
      [...readable, ...locked]
        .filter((chapter) => chapter.chapterNumber <= 10 || chapter.chapterNumber >= 11)
        .sort((a, b) => a.chapterNumber - b.chapterNumber)
    );
  };

  const unsubscribeReadable = onSnapshot(
    readableQuery,
    (snapshot) => {
      readable = snapshot.docs
        .map((item) => item.data() as Chapter)
        .filter((chapter) => chapter.chapterNumber <= 10);
      emit();
    },
    (error) => {
      console.error('Firestore public chapter feed error:', error);
      onError?.(error);
    }
  );

  const unsubscribeLocked = onSnapshot(
    collection(db, 'chapterIndex'),
    (snapshot) => {
      locked = snapshot.docs.map((item) => ({
        ...(item.data() as Omit<Chapter, 'content'>),
        content: (item.data() as { teaserContent?: string }).teaserContent || '',
        teaserContent: (item.data() as { teaserContent?: string }).teaserContent || ''
      } as Chapter));
      emit();
    },
    (error) => {
      console.error('Firestore locked chapter index error:', error);
      onError?.(error);
    }
  );

  return () => {
    unsubscribeReadable();
    unsubscribeLocked();
  };
}

export async function reconcileLockedChapterIndex(): Promise<void> {
  if (!auth.currentUser || !isUserAdmin(auth.currentUser)) return;

  const snapshot = await getDocs(query(
    collection(db, 'chapters'),
    where('status', '==', 'published')
  ));

  for (const item of snapshot.docs) {
    const chapter = item.data() as Chapter;
    if (chapter.chapterNumber < 11) continue;

    await setDoc(doc(db, 'chapterIndex', chapter.id), sanitizeFirestoreData({
      id: chapter.id,
      bookId: chapter.bookId,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      subtitle: chapter.subtitle,
      status: chapter.status,
      publishedAt: chapter.publishedAt,
      wordCount: chapter.wordCount,
      readingTimeMinutes: chapter.readingTimeMinutes,
      teaserContent: buildPublicChapterTeaser(chapter.content)
    }));
  }
}

// Data synchronization with Firestore
export async function seedInitialFirestoreData(): Promise<void> {
  // Wireframe policy: No hardcoded or AI-imputed data is seeded.
  // All books and chapters must be uploaded or authored directly by the admin.
  return;
}

export async function clearAllFirestoreBooksAndChapters(): Promise<void> {
  if (!auth.currentUser || !isUserAdmin(auth.currentUser)) {
    throw new Error('Only the verified author/admin can clear library records.');
  }
  try {
    const booksSnap = await getDocs(collection(db, 'books'));
    for (const d of booksSnap.docs) {
      await deleteDoc(d.ref);
    }
    const chaptersSnap = await getDocs(collection(db, 'chapters'));
    for (const d of chaptersSnap.docs) {
      await deleteDoc(d.ref);
    }
    console.log('Cleared all books and chapters from Firestore successfully.');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'books/chapters');
  }
}

export async function deleteBookFromFirestore(bookId: string): Promise<void> {
  const path = `books/${bookId}`;
  try {
    await deleteDoc(doc(db, 'books', bookId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchBooksFromFirestore(): Promise<Book[]> {
  const path = 'books';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.data() as Book);
  } catch (error) {
    console.warn('Firestore books listing unavailable, falling back to local storage:', error);
    return [];
  }
}

export async function fetchChaptersFromFirestore(): Promise<Chapter[]> {
  const path = 'chapters';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.data() as Chapter);
  } catch (error) {
    console.warn('Firestore chapters listing unavailable, falling back to local storage:', error);
    return [];
  }
}

/**
 * Firestore rejects JavaScript undefined values. Optional fields in our domain
 * models are intentionally represented as undefined when they are empty, so
 * strip those fields before every document write rather than letting a single
 * optional property abort the entire publication.
 */
function sanitizeFirestoreData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as T;
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      if (item !== undefined) {
        sanitized[key] = sanitizeFirestoreData(item);
      }
    });
    return sanitized as T;
  }

  return value;
}

function buildPublicChapterTeaser(content: string, maxWords = 180): string {
  const withoutUnsafeBlocks = content
    .replace(/<script[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<style[\\s\\S]*?<\\/style>/gi, '');

  const blocks = withoutUnsafeBlocks
    .split(/<\\/p>|<\\/div>|<br\\s*\\/?>/gi)
    .map((block) => block.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim())
    .filter(Boolean);

  let wordsUsed = 0;
  const paragraphs: string[] = [];

  for (const block of blocks) {
    const words = block.split(/\\s+/).filter(Boolean);
    if (!words.length) continue;

    const remaining = maxWords - wordsUsed;
    if (remaining <= 0) break;

    const selected = words.slice(0, remaining);
    paragraphs.push(selected.join(' '));
    wordsUsed += selected.length;

    if (selected.length < words.length) break;
  }

  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
}

export async function saveBookToFirestore(book: Book): Promise<void> {
  const path = `books/${book.id}`;
  try {
    await setDoc(doc(db, 'books', book.id), sanitizeFirestoreData(book));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveChapterToFirestore(chapter: Chapter): Promise<void> {
  const path = `chapters/${chapter.id}`;
  try {
    await setDoc(doc(db, 'chapters', chapter.id), sanitizeFirestoreData(chapter));

    const indexRef = doc(db, 'chapterIndex', chapter.id);
    if (chapter.status === 'published' && chapter.chapterNumber >= 11) {
      await setDoc(indexRef, sanitizeFirestoreData({
        id: chapter.id,
        bookId: chapter.bookId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        subtitle: chapter.subtitle,
        status: chapter.status,
        publishedAt: chapter.publishedAt,
        wordCount: chapter.wordCount,
        readingTimeMinutes: chapter.readingTimeMinutes,
        teaserContent: buildPublicChapterTeaser(chapter.content)
      }));
    } else {
      await deleteDoc(indexRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteChapterFromFirestore(chapterId: string): Promise<void> {
  const path = `chapters/${chapterId}`;
  try {
    await deleteDoc(doc(db, 'chapters', chapterId));
    await deleteDoc(doc(db, 'chapterIndex', chapterId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchUserBookmarksFromFirestore(userId: string): Promise<Bookmark[]> {
  const path = 'bookmarks';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Bookmark);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveBookmarkToFirestore(bookmark: Bookmark): Promise<void> {
  const path = `bookmarks/${bookmark.id}`;
  try {
    await setDoc(doc(db, 'bookmarks', bookmark.id), bookmark);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeBookmarkFromFirestore(bookmarkId: string): Promise<void> {
  const path = `bookmarks/${bookmarkId}`;
  try {
    await deleteDoc(doc(db, 'bookmarks', bookmarkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchUserReadingProgressFromFirestore(userId: string): Promise<ReadingProgress[]> {
  const path = 'readingProgress';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ReadingProgress);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveReadingProgressToFirestore(progress: ReadingProgress): Promise<void> {
  const path = `readingProgress/${progress.id}`;
  try {
    await setDoc(doc(db, 'readingProgress', progress.id), progress);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------- COMMENTS SYSTEM ----------------

export async function fetchChapterCommentsFromFirestore(chapterId: string): Promise<ChapterComment[]> {
  const path = 'comments';
  try {
    const q = query(collection(db, path), where('chapterId', '==', chapterId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs
      .map(doc => doc.data() as ChapterComment)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function listenToChapterComments(
  chapterId: string,
  onUpdate: (comments: ChapterComment[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = 'comments';
  const q = query(collection(db, path), where('chapterId', '==', chapterId));
  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs
        .map(doc => doc.data() as ChapterComment)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onUpdate(comments);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addCommentToFirestore(comment: ChapterComment): Promise<void> {
  const path = `comments/${comment.id}`;
  try {
    await setDoc(doc(db, 'comments', comment.id), comment);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCommentFromFirestore(commentId: string): Promise<void> {
  const path = `comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Reconcile denormalized chapter counters from the canonical chapter collection.
// This repairs legacy book documents and keeps public book metadata accurate.
// Scheduled chapters are intentionally not exposed to readers as chapter documents;
// their aggregate count lives on the public book record.
export async function reconcileBookChapterCounts(books: Book[], chapters: Chapter[]): Promise<void> {
  if (!auth.currentUser || !isUserAdmin(auth.currentUser) || !auth.currentUser.emailVerified) {
    return;
  }

  const writes: Promise<void>[] = [];

  for (const book of books) {
    const bookChapters = chapters.filter((chapter) => chapter.bookId === book.id);
    const publishedCount = bookChapters.filter((chapter) => chapter.status === 'published').length;
    const scheduledCount = bookChapters.filter((chapter) => chapter.status === 'scheduled').length;
    const latestPublished = [...bookChapters]
      .filter((chapter) => chapter.status === 'published')
      .sort((a, b) => b.chapterNumber - a.chapterNumber)[0];

    const needsUpdate =
      book.totalChapters !== bookChapters.length ||
      book.publishedChapterCount !== publishedCount ||
      book.scheduledChapterCount !== scheduledCount ||
      book.latestChapterNumber !== (latestPublished?.chapterNumber || 0) ||
      book.latestChapterTitle !== (latestPublished?.title || '');

    if (!needsUpdate) continue;

    writes.push(
      saveBookToFirestore({
        ...book,
        totalChapters: bookChapters.length,
        publishedChapterCount: publishedCount,
        scheduledChapterCount: scheduledCount,
        latestChapterNumber: latestPublished?.chapterNumber || 0,
        latestChapterTitle: latestPublished?.title || '',
        lastUpdatedAt: new Date().toISOString()
      })
    );
  }

  if (writes.length > 0) {
    await Promise.all(writes);
  }
}

// ---------------- CHAPTER NOTIFICATION SUBSCRIBERS ----------------

export async function fetchSubscribersForBook(bookId: string): Promise<{ userId: string; userEmail: string }[]> {
  const path = 'bookmarks';
  try {
    // A bookmark is the book-level subscription. Query by book only so this
    // remains index-free and treat missing notification flags as enabled for
    // legacy bookmarks created before the explicit subscription field existed.
    const q = query(collection(db, path), where('bookId', '==', bookId));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map(doc => {
        const data = doc.data() as Bookmark;
        return {
          userId: data.userId,
          userEmail: data.userEmail || ''
        };
      })
      .filter((subscriber, index) => {
        const data = snapshot.docs[index].data() as Bookmark;
        return data.emailNotificationsEnabled !== false && Boolean(subscriber.userEmail);
      });
  } catch (error) {
    console.warn('Could not query subscribers from Firestore:', error);
    return [];
  }
}



export async function sendChapterNotification(chapterId: string): Promise<{ sent: number; failed: number; total: number }> {
  if (!auth.currentUser || !isUserAdmin(auth.currentUser)) {
    throw new Error('Only an authorized Library X administrator can send chapter notifications.');
  }

  const idToken = await auth.currentUser.getIdToken();
  const response = await fetch('/api/send-chapter-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ chapterId })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 207) {
    throw new Error(payload.error || 'Chapter notification service failed.');
  }

  return {
    sent: Number(payload.sent || 0),
    failed: Number(payload.failed || 0),
    total: Number(payload.total || 0)
  };
}

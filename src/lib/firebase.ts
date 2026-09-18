import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
import { Book, Chapter, Bookmark, ReadingProgress, UserProfile } from '../types';
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

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === 'johnrufai242@gmail.com';
}

// Data synchronization with Firestore
export async function seedInitialFirestoreData(): Promise<void> {
  const booksPath = 'books';
  // Only the verified admin can seed or write initial library documents
  if (!auth.currentUser || !isUserAdmin(auth.currentUser)) {
    return;
  }
  try {
    const snap = await getDocs(collection(db, booksPath));
    if (snap.empty) {
      console.log('Seeding initial canonical books & chapters into Cloud Firestore...');
      for (const book of INITIAL_BOOKS) {
        await setDoc(doc(db, 'books', book.id), book);
      }
      for (const chapter of INITIAL_CHAPTERS) {
        await setDoc(doc(db, 'chapters', chapter.id), chapter);
      }
      console.log('Canonical library seeded into Cloud Firestore successfully.');
    }
  } catch (error) {
    console.warn('Unable to auto-seed Firestore, using local canon:', error);
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

export async function saveBookToFirestore(book: Book): Promise<void> {
  const path = `books/${book.id}`;
  try {
    await setDoc(doc(db, 'books', book.id), book);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveChapterToFirestore(chapter: Chapter): Promise<void> {
  const path = `chapters/${chapter.id}`;
  try {
    await setDoc(doc(db, 'chapters', chapter.id), chapter);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteChapterFromFirestore(chapterId: string): Promise<void> {
  const path = `chapters/${chapterId}`;
  try {
    await deleteDoc(doc(db, 'chapters', chapterId));
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

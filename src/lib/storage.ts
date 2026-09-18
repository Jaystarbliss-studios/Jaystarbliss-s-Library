/**
 * Jaystarbliss's Library Persistent Data Layer
 * Provides robust, typed CRUD operations, query filtering, and automatic scheduled publication checks.
 */

import {
  Book,
  Chapter,
  Bookmark,
  ReadingProgress,
  ScheduledPublication,
  LibrarySettings,
  UserProfile,
  ReaderPreferences,
  ChapterStatus
} from '../types';
import { INITIAL_BOOKS, INITIAL_CHAPTERS, INITIAL_SETTINGS } from '../data/initialData';
import {
  auth,
  isUserAdmin,
  saveBookmarkToFirestore,
  removeBookmarkFromFirestore,
  saveReadingProgressToFirestore,
  saveChapterToFirestore,
  saveBookToFirestore,
  deleteChapterFromFirestore
} from './firebase';

const STORAGE_KEYS = {
  BOOKS: 'jsb_books',
  CHAPTERS: 'jsb_chapters',
  BOOKMARKS: 'jsb_bookmarks',
  READING_PROGRESS: 'jsb_reading_progress',
  SCHEDULED: 'jsb_scheduled',
  SETTINGS: 'jsb_settings',
  CURRENT_USER: 'jsb_current_user',
  READER_PREFERENCES: 'jsb_reader_prefs'
};

const DEFAULT_PREFERENCES: ReaderPreferences = {
  fontSize: 'base',
  fontFamily: 'cambria',
  readingWidth: 'standard',
  theme: 'light',
  showAuthorsThoughts: true,
  lineHeight: 'relaxed'
};

const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'user-admin-1',
  email: 'johnrufai242@gmail.com',
  displayName: 'Jaystarbliss (Author)',
  role: 'admin',
  createdAt: '2026-08-01T00:00:00.000Z'
};

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage item ${key}:`, err);
    return fallback;
  }
}

function safeSetJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('jsb_library_updated', { detail: { key } }));
  } catch (err) {
    console.error(`Failed to set localStorage item ${key}:`, err);
  }
}

/**
 * Initialize storage with default manuscript data if empty
 */
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    safeSetJSON(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
    safeSetJSON(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    safeSetJSON(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default logged in as admin author for seamless publishing experience, toggleable in UI
    safeSetJSON(STORAGE_KEYS.CURRENT_USER, DEFAULT_ADMIN_USER);
  }
  // Immediately check scheduled chapters
  checkAndPublishScheduled();
}

/**
 * Evaluates all scheduled chapters against current time.
 * If the scheduled release time has arrived, automatically transitions to 'published'.
 */
export function checkAndPublishScheduled(): boolean {
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const now = new Date().toISOString();
  let updatedAny = false;

  const newChapters = chapters.map((ch) => {
    if (ch.status === 'scheduled' && ch.scheduledFor && ch.scheduledFor <= now) {
      updatedAny = true;
      return {
        ...ch,
        status: 'published' as ChapterStatus,
        publishedAt: ch.publishedAt || now,
        updatedAt: now
      };
    }
    return ch;
  });

  if (updatedAny) {
    safeSetJSON(STORAGE_KEYS.CHAPTERS, newChapters);

    // Sync book counts and timestamps
    const updatedBooks = books.map((book) => {
      const bookChs = newChapters.filter((c) => c.bookId === book.id);
      const publishedChs = bookChs.filter((c) => c.status === 'published');
      const latest = [...publishedChs].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];

      return {
        ...book,
        totalChapters: bookChs.length,
        publishedChapterCount: publishedChs.length,
        latestChapterNumber: latest ? latest.chapterNumber : 0,
        latestChapterTitle: latest ? latest.title : '',
        lastUpdatedAt: now
      };
    });

    safeSetJSON(STORAGE_KEYS.BOOKS, updatedBooks);
  }

  return updatedAny;
}

// ---------------- BOOK METHODS ----------------

export function getAllBooks(options?: { visibility?: 'all' | 'published'; includeDrafts?: boolean }): Book[] {
  checkAndPublishScheduled();
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  if (options?.visibility === 'published' || !options?.includeDrafts) {
    return books.filter((b) => b.visibility === 'published');
  }
  return books;
}

export function getBookBySlug(slug: string): Book | undefined {
  checkAndPublishScheduled();
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  return books.find((b) => b.slug === slug || b.id === slug);
}

export function getBookById(id: string): Book | undefined {
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  return books.find((b) => b.id === id);
}

export function saveBook(book: Book): Book {
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const now = new Date().toISOString();
  const index = books.findIndex((b) => b.id === book.id);

  let updatedBook: Book;
  if (index >= 0) {
    updatedBook = { ...books[index], ...book, updatedAt: now };
    books[index] = updatedBook;
  } else {
    updatedBook = {
      ...book,
      id: book.id || `book-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      firstPublishedAt: book.firstPublishedAt || now,
      lastUpdatedAt: now
    };
    books.push(updatedBook);
  }

  safeSetJSON(STORAGE_KEYS.BOOKS, books);

  // Sync to Cloud Firestore if admin
  if (auth.currentUser && isUserAdmin(auth.currentUser)) {
    saveBookToFirestore(updatedBook).catch((err) =>
      console.warn('Could not sync book to Cloud Firestore:', err)
    );
  }

  return updatedBook;
}

export function deleteBook(id: string): void {
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const filtered = books.filter((b) => b.id !== id);
  safeSetJSON(STORAGE_KEYS.BOOKS, filtered);

  // Also remove chapters for this book
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const filteredChs = chapters.filter((c) => c.bookId !== id);
  safeSetJSON(STORAGE_KEYS.CHAPTERS, filteredChs);
}

// ---------------- CHAPTER METHODS ----------------

export function getChaptersForBook(bookId: string, options?: { includeUnpublished?: boolean }): Chapter[] {
  checkAndPublishScheduled();
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const bookChapters = chapters.filter((c) => c.bookId === bookId);

  let result = bookChapters;
  if (!options?.includeUnpublished) {
    result = bookChapters.filter((c) => c.status === 'published');
  }

  return [...result].sort((a, b) => a.chapterNumber - b.chapterNumber);
}

export function getChapter(bookId: string, chapterNumber: number, includeUnpublished = false): Chapter | undefined {
  checkAndPublishScheduled();
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  return chapters.find((c) => {
    if (c.bookId !== bookId || c.chapterNumber !== chapterNumber) return false;
    if (!includeUnpublished && c.status !== 'published') return false;
    return true;
  });
}

export function getChapterById(id: string): Chapter | undefined {
  checkAndPublishScheduled();
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  return chapters.find((c) => c.id === id);
}

export function saveChapter(chapter: Chapter): Chapter {
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const now = new Date().toISOString();

  // Calculate word count & reading time
  const cleanText = (chapter.content || '').replace(/<[^>]*>?/gm, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  let savedChapter: Chapter;
  const index = chapters.findIndex((c) => c.id === chapter.id);

  if (index >= 0) {
    savedChapter = {
      ...chapters[index],
      ...chapter,
      wordCount: words,
      readingTimeMinutes: readingTime,
      updatedAt: now,
      version: (chapters[index].version || 1) + 1
    };
    chapters[index] = savedChapter;
  } else {
    savedChapter = {
      ...chapter,
      id: chapter.id || `ch-${Date.now()}`,
      wordCount: words,
      readingTimeMinutes: readingTime,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    chapters.push(savedChapter);
  }

  safeSetJSON(STORAGE_KEYS.CHAPTERS, chapters);

  // Sync book metadata
  const bookIndex = books.findIndex((b) => b.id === savedChapter.bookId);
  if (bookIndex >= 0) {
    const bookChs = chapters.filter((c) => c.bookId === savedChapter.bookId);
    const publishedChs = bookChs.filter((c) => c.status === 'published');
    const latest = [...publishedChs].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];

    books[bookIndex] = {
      ...books[bookIndex],
      totalChapters: bookChs.length,
      publishedChapterCount: publishedChs.length,
      latestChapterNumber: latest ? latest.chapterNumber : 0,
      latestChapterTitle: latest ? latest.title : '',
      lastUpdatedAt: now
    };
    safeSetJSON(STORAGE_KEYS.BOOKS, books);
  }

  // Sync chapter to Cloud Firestore if admin
  if (auth.currentUser && isUserAdmin(auth.currentUser)) {
    saveChapterToFirestore(savedChapter).catch((err) =>
      console.warn('Could not sync chapter to Cloud Firestore:', err)
    );
  }

  return savedChapter;
}

export function deleteChapter(id: string): void {
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const target = chapters.find((c) => c.id === id);
  if (!target) return;

  const filtered = chapters.filter((c) => c.id !== id);
  safeSetJSON(STORAGE_KEYS.CHAPTERS, filtered);

  // Cloud Firestore sync if admin
  if (auth.currentUser && isUserAdmin(auth.currentUser)) {
    deleteChapterFromFirestore(id).catch((err) =>
      console.warn('Could not delete chapter from Cloud Firestore:', err)
    );
  }

  // Update book
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const bookIndex = books.findIndex((b) => b.id === target.bookId);
  if (bookIndex >= 0) {
    const bookChs = filtered.filter((c) => c.bookId === target.bookId);
    const publishedChs = bookChs.filter((c) => c.status === 'published');
    const latest = [...publishedChs].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];

    books[bookIndex] = {
      ...books[bookIndex],
      totalChapters: bookChs.length,
      publishedChapterCount: publishedChs.length,
      latestChapterNumber: latest ? latest.chapterNumber : 0,
      latestChapterTitle: latest ? latest.title : '',
      lastUpdatedAt: new Date().toISOString()
    };
    safeSetJSON(STORAGE_KEYS.BOOKS, books);
  }
}

export function reorderChapters(bookId: string, orderedIds: string[]): void {
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const now = new Date().toISOString();

  orderedIds.forEach((id, index) => {
    const ch = chapters.find((c) => c.id === id && c.bookId === bookId);
    if (ch) {
      ch.chapterNumber = index + 1;
      ch.updatedAt = now;
    }
  });

  safeSetJSON(STORAGE_KEYS.CHAPTERS, chapters);
}

export function publishScheduledNow(chapterId: string): Chapter | undefined {
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const target = chapters.find((c) => c.id === chapterId);
  if (!target) return undefined;

  const now = new Date().toISOString();
  target.status = 'published';
  target.publishedAt = now;
  target.scheduledFor = undefined;
  target.updatedAt = now;

  safeSetJSON(STORAGE_KEYS.CHAPTERS, chapters);

  // Update Book
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const bookIndex = books.findIndex((b) => b.id === target.bookId);
  if (bookIndex >= 0) {
    const bookChs = chapters.filter((c) => c.bookId === target.bookId);
    const publishedChs = bookChs.filter((c) => c.status === 'published');
    const latest = [...publishedChs].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];

    books[bookIndex] = {
      ...books[bookIndex],
      publishedChapterCount: publishedChs.length,
      latestChapterNumber: latest ? latest.chapterNumber : 0,
      latestChapterTitle: latest ? latest.title : '',
      lastUpdatedAt: now
    };
    safeSetJSON(STORAGE_KEYS.BOOKS, books);
  }

  return target;
}

// ---------------- LATEST UPDATES STREAM ----------------

export interface LatestUpdateItem {
  chapter: Chapter;
  book: Book;
  releaseDate: string;
}

export function getLatestUpdates(limitCount = 20): LatestUpdateItem[] {
  checkAndPublishScheduled();
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const publishedChs = chapters.filter((c) => c.status === 'published' && c.publishedAt);
  publishedChs.sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());

  const items: LatestUpdateItem[] = [];
  for (const ch of publishedChs.slice(0, limitCount)) {
    const book = bookMap.get(ch.bookId);
    if (book && book.visibility === 'published') {
      items.push({
        chapter: ch,
        book,
        releaseDate: ch.publishedAt!
      });
    }
  }

  return items;
}

// ---------------- SEARCH ----------------

export function searchLibrary(query: string, filter?: { genre?: string; status?: string }): { books: Book[]; chapters: { chapter: Chapter; book: Book }[] } {
  checkAndPublishScheduled();
  const normalized = query.trim().toLowerCase();
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS).filter((b) => b.visibility === 'published');
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS).filter((c) => c.status === 'published');
  const bookMap = new Map(books.map((b) => [b.id, b]));

  let matchedBooks = books;

  if (filter?.status && filter.status !== 'all') {
    matchedBooks = matchedBooks.filter((b) => b.status === filter.status);
  }
  if (filter?.genre && filter.genre !== 'all') {
    matchedBooks = matchedBooks.filter((b) => b.genres.some((g) => g.toLowerCase() === filter.genre?.toLowerCase()));
  }

  if (normalized) {
    matchedBooks = matchedBooks.filter((b) => {
      return (
        b.title.toLowerCase().includes(normalized) ||
        b.tagline.toLowerCase().includes(normalized) ||
        b.description.toLowerCase().includes(normalized) ||
        b.author.toLowerCase().includes(normalized) ||
        b.genres.some((g) => g.toLowerCase().includes(normalized)) ||
        b.tags.some((t) => t.toLowerCase().includes(normalized))
      );
    });
  }

  const matchedChapters: { chapter: Chapter; book: Book }[] = [];
  if (normalized) {
    chapters.forEach((ch) => {
      const book = bookMap.get(ch.bookId);
      if (!book) return;
      const titleMatch = ch.title.toLowerCase().includes(normalized);
      const subtitleMatch = ch.subtitle?.toLowerCase().includes(normalized);
      const thoughtsMatch = ch.authorsThoughts?.toLowerCase().includes(normalized);
      if (titleMatch || subtitleMatch || thoughtsMatch) {
        matchedChapters.push({ chapter: ch, book });
      }
    });
  }

  return { books: matchedBooks, chapters: matchedChapters };
}

// ---------------- BOOKMARKS ----------------

export function getBookmarks(userId: string): Bookmark[] {
  const allBookmarks = safeGetJSON<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  return allBookmarks.filter((bm) => bm.userId === userId);
}

export function isBookmarked(userId: string, bookId: string): boolean {
  const bookmarks = getBookmarks(userId);
  return bookmarks.some((b) => b.bookId === bookId);
}

export function toggleBookmark(userId: string, book: Book): boolean {
  const allBookmarks = safeGetJSON<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  const existingIndex = allBookmarks.findIndex((b) => b.userId === userId && b.bookId === book.id);

  if (existingIndex >= 0) {
    const removedId = allBookmarks[existingIndex].id;
    allBookmarks.splice(existingIndex, 1);
    safeSetJSON(STORAGE_KEYS.BOOKMARKS, allBookmarks);
    
    // Cloud sync if user authenticated
    if (auth.currentUser && auth.currentUser.uid === userId) {
      removeBookmarkFromFirestore(removedId).catch((err) =>
        console.warn('Could not remove bookmark from Firestore:', err)
      );
    }
    return false;
  } else {
    const newBm: Bookmark = {
      id: `bm-${Date.now()}`,
      userId,
      bookId: book.id,
      bookTitle: book.title,
      bookSlug: book.slug,
      bookCoverUrl: book.coverUrl,
      bookStatus: book.status,
      createdAt: new Date().toISOString()
    };
    allBookmarks.push(newBm);
    safeSetJSON(STORAGE_KEYS.BOOKMARKS, allBookmarks);

    // Cloud sync if user authenticated
    if (auth.currentUser && auth.currentUser.uid === userId) {
      saveBookmarkToFirestore(newBm).catch((err) =>
        console.warn('Could not save bookmark to Firestore:', err)
      );
    }
    return true;
  }
}

// ---------------- READING PROGRESS ----------------

export function getReadingProgressForBook(userId: string, bookId: string): ReadingProgress | undefined {
  const allProgress = safeGetJSON<ReadingProgress[]>(STORAGE_KEYS.READING_PROGRESS, []);
  return allProgress.find((p) => p.userId === userId && p.bookId === bookId);
}

export function getAllReadingProgress(userId: string): ReadingProgress[] {
  const allProgress = safeGetJSON<ReadingProgress[]>(STORAGE_KEYS.READING_PROGRESS, []);
  return allProgress.filter((p) => p.userId === userId).sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
}

export function saveReadingProgress(
  userId: string,
  book: Book,
  chapter: Chapter,
  progressPercent: number,
  scrollPosition: number
): void {
  const allProgress = safeGetJSON<ReadingProgress[]>(STORAGE_KEYS.READING_PROGRESS, []);
  const index = allProgress.findIndex((p) => p.userId === userId && p.bookId === book.id);
  const now = new Date().toISOString();

  const progressRecord: ReadingProgress = {
    id: index >= 0 ? allProgress[index].id : `rp-${Date.now()}`,
    userId,
    bookId: book.id,
    bookSlug: book.slug,
    bookTitle: book.title,
    bookCoverUrl: book.coverUrl,
    lastChapterId: chapter.id,
    lastChapterNumber: chapter.chapterNumber,
    lastChapterTitle: chapter.title,
    progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
    scrollPosition: Math.round(scrollPosition),
    lastReadAt: now
  };

  if (index >= 0) {
    allProgress[index] = progressRecord;
  } else {
    allProgress.push(progressRecord);
  }

  safeSetJSON(STORAGE_KEYS.READING_PROGRESS, allProgress);

  // Cloud sync if user authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    saveReadingProgressToFirestore(progressRecord).catch((err) =>
      console.warn('Could not save reading progress to Firestore:', err)
    );
  }
}

export function syncBookmarksWithFirestore(cloudBookmarks: Bookmark[]): void {
  if (!cloudBookmarks || cloudBookmarks.length === 0) return;
  const current = safeGetJSON<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  const map = new Map<string, Bookmark>();
  current.forEach((b) => map.set(b.id, b));
  cloudBookmarks.forEach((b) => map.set(b.id, b));
  safeSetJSON(STORAGE_KEYS.BOOKMARKS, Array.from(map.values()));
}

export function syncProgressWithFirestore(cloudProgress: ReadingProgress[]): void {
  if (!cloudProgress || cloudProgress.length === 0) return;
  const current = safeGetJSON<ReadingProgress[]>(STORAGE_KEYS.READING_PROGRESS, []);
  const map = new Map<string, ReadingProgress>();
  current.forEach((p) => map.set(p.id, p));
  cloudProgress.forEach((p) => map.set(p.id, p));
  safeSetJSON(STORAGE_KEYS.READING_PROGRESS, Array.from(map.values()));
}

// ---------------- SCHEDULED PUBLICATIONS ----------------

export function getAllScheduledChapters(): { chapter: Chapter; book: Book }[] {
  checkAndPublishScheduled();
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const books = safeGetJSON<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const scheduled = chapters.filter((c) => c.status === 'scheduled');
  scheduled.sort((a, b) => new Date(a.scheduledFor || 0).getTime() - new Date(b.scheduledFor || 0).getTime());

  return scheduled.map((ch) => ({
    chapter: ch,
    book: bookMap.get(ch.bookId) || ({} as Book)
  }));
}

// ---------------- SETTINGS & USER ----------------

export function getSettings(): LibrarySettings {
  return safeGetJSON<LibrarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSettings(settings: LibrarySettings): void {
  safeSetJSON(STORAGE_KEYS.SETTINGS, settings);
}

export function getCurrentUser(): UserProfile | null {
  return safeGetJSON<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, DEFAULT_ADMIN_USER);
}

export function setCurrentUser(user: UserProfile | null): void {
  safeSetJSON(STORAGE_KEYS.CURRENT_USER, user);
}

export function getReaderPreferences(): ReaderPreferences {
  return safeGetJSON<ReaderPreferences>(STORAGE_KEYS.READER_PREFERENCES, DEFAULT_PREFERENCES);
}

export function saveReaderPreferences(prefs: ReaderPreferences): void {
  safeSetJSON(STORAGE_KEYS.READER_PREFERENCES, prefs);
}

export function getAllChapters(): Chapter[] {
  checkAndPublishScheduled();
  return safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
}

export const getChapters = getAllChapters;
export const getBooks = getAllBooks;
export const getReadingProgressList = getAllReadingProgress;
export const getReadingProgress = getReadingProgressForBook;

export function cancelScheduledRelease(chapterId: string): void {
  const chapters = safeGetJSON<Chapter[]>(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  const target = chapters.find((c) => c.id === chapterId);
  if (target && target.status === 'scheduled') {
    target.status = 'draft';
    target.scheduledFor = undefined;
    target.updatedAt = new Date().toISOString();
    safeSetJSON(STORAGE_KEYS.CHAPTERS, chapters);
  }
}

export function saveBooks(books: Book[]): void {
  safeSetJSON(STORAGE_KEYS.BOOKS, books);
}

export function saveChapters(chs: Chapter[]): void {
  safeSetJSON(STORAGE_KEYS.CHAPTERS, chs);
}

export function resetLibraryToDefault(): void {
  safeSetJSON(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  safeSetJSON(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  safeSetJSON(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  safeSetJSON(STORAGE_KEYS.BOOKMARKS, []);
  safeSetJSON(STORAGE_KEYS.READING_PROGRESS, []);
  safeSetJSON(STORAGE_KEYS.CURRENT_USER, DEFAULT_ADMIN_USER);
}


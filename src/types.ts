/**
 * Core Domain Types for Jaystarbliss's Library
 */

export type BookStatus = 'ongoing' | 'completed' | 'hiatus';
export type BookVisibility = 'published' | 'draft' | 'private';
export type ChapterStatus = 'draft' | 'published' | 'scheduled' | 'unpublished';

export interface Book {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  author: string;
  publisher: string;
  description: string;
  coverUrl: string;
  status: BookStatus;
  visibility: BookVisibility;
  isFeatured: boolean;
  genres: string[];
  tags: string[];
  totalChapters: number;
  publishedChapterCount: number;
  latestChapterNumber: number;
  latestChapterTitle: string;
  firstPublishedAt: string;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  subtitle?: string;
  content: string;
  authorsThoughts?: string;
  status: ChapterStatus;
  scheduledFor?: string;
  publishedAt?: string;
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  bookCoverUrl: string;
  bookStatus: BookStatus;
  createdAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  bookCoverUrl: string;
  lastChapterId: string;
  lastChapterNumber: number;
  lastChapterTitle: string;
  progressPercent: number;
  scrollPosition: number;
  lastReadAt: string;
}

export interface ScheduledPublication {
  id: string;
  chapterId: string;
  bookId: string;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  scheduledFor: string;
  timezone: string;
  status: 'pending' | 'published' | 'cancelled';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'reader';
  avatarUrl?: string;
  createdAt: string;
}

export interface LibrarySettings {
  siteTitle: string;
  siteDescription: string;
  authorName: string;
  publisherName: string;
  defaultTimezone: string;
  contactEmail: string;
  tagline: string;
  announcement?: string;
}

export type ReaderFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type ReaderFontFamily = 'cambria' | 'calibri';
export type ReaderWidth = 'narrow' | 'standard' | 'wide';
export type ReaderTheme = 'light' | 'sepia' | 'dark';

export interface ReaderPreferences {
  fontSize: ReaderFontSize;
  fontFamily: ReaderFontFamily;
  readingWidth: ReaderWidth;
  theme: ReaderTheme;
  showAuthorsThoughts: boolean;
  lineHeight: 'normal' | 'relaxed' | 'loose';
}

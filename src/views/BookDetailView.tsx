import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';
import { Book, Chapter, ReadingProgress } from '../types';
import { ChapterList } from '../components/ChapterList';
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  Clock,
  Calendar,
  Share2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Feather,
  Plus,
  Bell,
  BellOff
} from 'lucide-react';
import { isBookmarked as checkIsBookmarked, toggleBookmark, updateBookmarkNotification, getBookmarks } from '../lib/storage';

interface BookDetailViewProps {
  book: Book;
  chapters: Chapter[];
  progress?: ReadingProgress;
  userId: string;
  currentUser?: User | SimpleAuthUser | null;
  onSelectChapter: (chapterNumber: number) => void;
  onStartReading: (chapterNumber: number) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onEditBook?: (bookId: string) => void;
  isAdmin?: boolean;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  chapters,
  progress,
  userId,
  currentUser,
  onSelectChapter,
  onStartReading,
  onShowToast,
  onEditBook,
  isAdmin = false
}) => {
  const [isBookmarked, setIsBookmarked] = useState(checkIsBookmarked(userId, book.id));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [coverError, setCoverError] = useState(false);

  const resumeChapterNumber = progress?.lastChapterNumber || 1;

  React.useEffect(() => {
    setIsBookmarked(checkIsBookmarked(userId, book.id));
    const bookmark = getBookmarks(userId).find((item) => item.bookId === book.id);
    setNotificationsEnabled(bookmark?.emailNotificationsEnabled !== false);
  }, [userId, book.id]);
  const hasStarted = !!progress && progress.lastChapterNumber > 0;

  const handleToggleBookmark = () => {
    const bookmarkedNow = toggleBookmark(userId, book, currentUser?.email || undefined);
    setIsBookmarked(bookmarkedNow);
    onShowToast(
      bookmarkedNow
        ? `Added "${book.title}" to My Shelf • Email alerts active`
        : `Removed "${book.title}" from My Shelf`,
      'info'
    );
  };

  const handleToggleNotifications = () => {
    if (!isBookmarked) {
      const bookmarkedNow = toggleBookmark(userId, book, currentUser?.email || undefined);
      setIsBookmarked(bookmarkedNow);
      setNotificationsEnabled(bookmarkedNow);
      onShowToast(
        bookmarkedNow
          ? 'Added to My Shelf. Chapter email notifications are now active.'
          : 'Book removed from My Shelf.',
        'success'
      );
      return;
    }

    const nextEnabled = !notificationsEnabled;
    const updated = updateBookmarkNotification(userId, book.id, nextEnabled);
    if (!updated) {
      onShowToast('Could not update this book subscription. Please try again.', 'error');
      return;
    }

    setNotificationsEnabled(nextEnabled);
    onShowToast(
      nextEnabled
        ? 'Chapter email notifications are now active for this book.'
        : 'Chapter email notifications are muted for this book.',
      'info'
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast('Book link copied to clipboard', 'success');
  };

  const publishedChapters = chapters.filter((c) => c.status === 'published');
  // Readers receive published chapters only, so scheduled count must come from
  // the live book metadata maintained in Firestore.
  const scheduledChapterCount = book.scheduledChapterCount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 font-calibri">
      
      {/* Book Metadata & Synopsis Hero */}
      <div className="relative overflow-hidden bg-[#131319]/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-md">
        {/* Subtle backdrop texture */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-luminosity filter blur-sm scale-105"
          style={{ backgroundImage: `url(${book.coverUrl || 'https://images.unsplash.com/photo-1507842229451-7f01be44e21a?auto=format&fit=crop&w=2000&q=80'})` }}
        />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Book Cover & Actions */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="max-w-[280px] sm:max-w-[320px] w-full aspect-[2/3] rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-950 flex items-center justify-center transition-transform hover:scale-[1.01]">
              {book.coverUrl && !coverError ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  onError={() => setCoverError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-600 space-y-3">
                  <Feather className="w-12 h-12 text-zinc-400 stroke-1" />
                  <span className="font-cinzel text-sm text-zinc-300 font-bold uppercase tracking-wider">
                    {book.title}
                  </span>
                  <span className="font-mono-space text-[10px] text-zinc-500 uppercase">
                    Original Serial Manuscript
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action Bar Under Cover */}
            <div className="w-full max-w-[320px] mt-4 flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-mono-space tracking-wider transition-all active:scale-95 ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm'
                    : 'bg-zinc-900/90 text-zinc-200 border-zinc-700/80 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'IN MY SHELF' : 'ADD TO SHELF'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 rounded-xl transition-all active:scale-95"
                title="Share link"
                aria-label="Share Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {isAdmin && onEditBook && (
                <button
                  onClick={() => onEditBook(book.id)}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 rounded-xl text-xs font-mono-space"
                  title="Edit Book Metadata"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Book-level chapter notification subscription */}
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`w-full max-w-[320px] mt-3 p-3 rounded-xl border text-left flex items-center gap-3 transition-all active:scale-[0.99] ${
                notificationsEnabled && isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                  : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700'
              }`}
              title={notificationsEnabled && isBookmarked ? 'Mute chapter email notifications' : 'Enable chapter email notifications'}
              aria-label={notificationsEnabled && isBookmarked ? 'Mute chapter email notifications' : 'Enable chapter email notifications'}
            >
              {notificationsEnabled && isBookmarked ? (
                <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <BellOff className="w-4 h-4 text-zinc-500 shrink-0" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-mono-space text-zinc-200 font-semibold">
                  {notificationsEnabled && isBookmarked ? 'CHAPTER ALERTS ACTIVE' : 'TURN ON CHAPTER ALERTS'}
                </span>
                <span className="block mt-0.5 text-[10px] font-sans text-zinc-400">
                  {currentUser?.email
                    ? `Email me whenever a new chapter is published • ${currentUser.email}`
                    : 'Sign in with Google to receive email notifications for this book'}
                </span>
              </span>
              <span className={`shrink-0 text-[9px] font-mono-space font-bold px-2 py-1 rounded-full border ${
                notificationsEnabled && isBookmarked
                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                  : 'text-zinc-500 bg-zinc-900 border-zinc-700'
              }`}>
                {notificationsEnabled && isBookmarked ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Right: Book Details & Stats */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Publisher & Status */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1 text-xs font-mono-space tracking-widest uppercase font-bold rounded-full border ${
                book.status === 'ongoing'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}>
                {book.status === 'ongoing' ? 'Serializing' : book.status}
              </span>
              <span className="text-xs font-mono-space text-zinc-400 tracking-wider">
                PUBLISHER: {book.publisher}
              </span>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                {book.title}
              </h1>
              {book.tagline && (
                <p className="font-mono-space text-xs sm:text-sm text-amber-400/90 font-bold uppercase tracking-wider">
                  {book.tagline}
                </p>
              )}
            </div>

            {/* Statistics Matrix with soft rounded corners */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
              <div>
                <span className="block font-cinzel text-xl font-bold text-white">
                  {publishedChapters.length}
                </span>
                <span className="block font-mono-space text-[10px] text-zinc-400 tracking-wider uppercase">
                  Published Chapters
                </span>
              </div>
              <div>
                <span className="block font-cinzel text-xl font-bold text-amber-400">
                  {scheduledChapterCount}
                </span>
                <span className="block font-mono-space text-[10px] text-zinc-400 tracking-wider uppercase">
                  Scheduled
                </span>
              </div>
              <div>
                <span className="block font-cinzel text-xl font-bold text-zinc-200">
                  {book.latestChapterNumber > 0 ? `Ch. ${book.latestChapterNumber}` : '—'}
                </span>
                <span className="block font-mono-space text-[10px] text-zinc-400 tracking-wider uppercase">
                  Latest Chapter
                </span>
              </div>
              <div>
                <span className="block font-cinzel text-xl font-bold text-zinc-300">
                  {new Date(book.lastUpdatedAt).toLocaleDateString()}
                </span>
                <span className="block font-mono-space text-[10px] text-zinc-400 tracking-wider uppercase">
                  Last Updated
                </span>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="font-mono-space text-xs font-bold uppercase tracking-widest text-zinc-300">
                SYNOPSIS & ARCHIVAL RECORD
              </h3>
              <p className="font-cambria text-base sm:text-lg text-zinc-300 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>

            {/* Genres & Tags */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono-space text-zinc-400">GENRES:</span>
                {book.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-0.5 bg-zinc-900/90 text-zinc-300 text-xs font-mono-space border border-zinc-800 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono-space text-zinc-400">TAGS:</span>
                {book.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 bg-zinc-950 text-zinc-400 text-xs font-mono-space border border-zinc-900 rounded-full"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Reading Status / Progress Callout */}
            {hasStarted && (
              <div className="p-4 bg-zinc-900/90 border border-emerald-900/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-mono-space text-zinc-300">
                      Reading Progress: <strong>{progress.progressPercent}%</strong>
                    </span>
                    <span className="block font-cinzel text-sm text-white font-bold">
                      Last read: Chapter {progress.lastChapterNumber} — {progress.lastChapterTitle}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onStartReading(resumeChapterNumber)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 self-end sm:self-auto"
                >
                  RESUME READING
                </button>
              </div>
            )}

            {/* CTA Button */}
            {!hasStarted && (
              <div className="pt-2">
                {publishedChapters.length > 0 ? (
                  <button
                    onClick={() => onStartReading(1)}
                    className="flex items-center gap-3 px-6 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold tracking-widest uppercase rounded-2xl shadow-xl transition-all active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-zinc-950" />
                    <span>START READING CHAPTER 1</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs font-mono-space text-zinc-400">
                    No chapters published yet. Subscribe to receive Google email notifications when the first chapter releases!
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Chapters Table of Contents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-cinzel text-2xl font-bold text-white uppercase tracking-wider">
              TABLE OF CONTENTS
            </h2>
            <p className="font-mono-space text-xs text-zinc-400 uppercase tracking-widest">
              OFFICIALLY INDEXED CHAPTER ARCHIVE ({publishedChapters.length} AVAILABLE)
            </p>
          </div>
        </div>

        <ChapterList
          chapters={chapters}
          bookSlug={book.slug}
          onSelectChapter={onSelectChapter}
          progress={progress}
        />
      </div>

    </div>
  );
};

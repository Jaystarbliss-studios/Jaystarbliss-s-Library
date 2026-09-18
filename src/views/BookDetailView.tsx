import React, { useState } from 'react';
import { Book, Chapter, ReadingProgress } from '../types';
import { ChapterList } from '../components/ChapterList';
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  Clock,
  Calendar,
  Sparkles,
  Share2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { isBookmarked as checkIsBookmarked, toggleBookmark } from '../lib/storage';

interface BookDetailViewProps {
  book: Book;
  chapters: Chapter[];
  progress?: ReadingProgress;
  userId: string;
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
  onSelectChapter,
  onStartReading,
  onShowToast,
  onEditBook,
  isAdmin = false
}) => {
  const [isBookmarked, setIsBookmarked] = useState(checkIsBookmarked(userId, book.id));

  const resumeChapterNumber = progress?.lastChapterNumber || 1;
  const hasStarted = !!progress && progress.lastChapterNumber > 0;

  const handleToggleBookmark = () => {
    const bookmarkedNow = toggleBookmark(userId, book);
    setIsBookmarked(bookmarkedNow);
    onShowToast(
      bookmarkedNow ? `Saved "${book.title}" to My Library` : `Removed "${book.title}" from My Library`,
      'info'
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast('Book link copied to clipboard', 'success');
  };

  const publishedChapters = chapters.filter((c) => c.status === 'published');
  const scheduledChapters = chapters.filter((c) => c.status === 'scheduled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 font-calibri">
      
      {/* Book Metadata & Synopsis Hero */}
      <div className="bg-[#121216] border border-zinc-800 rounded-sm p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Book Cover */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="max-w-[280px] sm:max-w-[320px] w-full rounded-sm overflow-hidden border border-zinc-700/80 shadow-2xl">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Quick Action Bar Under Cover */}
            <div className="w-full max-w-[320px] mt-4 flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm border text-xs font-mono-space tracking-wider transition-colors ${
                  isBookmarked
                    ? 'bg-zinc-800 text-amber-400 border-amber-500/60 font-semibold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <BookmarkIcon className="w-4 h-4 fill-current" />
                <span>{isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm transition-colors"
                title="Share link"
                aria-label="Share Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {isAdmin && onEditBook && (
                <button
                  onClick={() => onEditBook(book.id)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 rounded-sm text-xs font-mono-space"
                  title="Edit Book Metadata"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Book Details & Stats */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Publisher & Status */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2.5 py-1 text-xs font-mono-space tracking-widest uppercase font-bold rounded-sm border ${
                book.status === 'ongoing'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}>
                {book.status}
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
              <p className="font-mono-space text-xs sm:text-sm text-rose-400 font-bold uppercase tracking-wider">
                {book.tagline}
              </p>
            </div>

            {/* Statistics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-950/80 border border-zinc-800 rounded-sm">
              <div>
                <span className="block font-cinzel text-xl font-bold text-white">
                  {book.publishedChapterCount}
                </span>
                <span className="block font-mono-space text-[10px] text-zinc-400 tracking-wider uppercase">
                  Published Chapters
                </span>
              </div>
              <div>
                <span className="block font-cinzel text-xl font-bold text-amber-400">
                  {scheduledChapters.length}
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
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono-space text-zinc-400">GENRES:</span>
                {book.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 bg-zinc-900 text-zinc-300 text-xs font-mono-space border border-zinc-800 rounded-sm"
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
                    className="px-2 py-0.5 bg-zinc-950 text-zinc-400 text-xs font-mono-space border border-zinc-900 rounded-sm"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Reading Status / Progress Callout */}
            {hasStarted && (
              <div className="p-4 bg-zinc-900/90 border border-emerald-900/60 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono-space text-xs font-bold rounded-sm shadow-md transition-colors self-end sm:self-auto"
                >
                  RESUME READING
                </button>
              </div>
            )}

            {/* CTA Button */}
            {!hasStarted && (
              <div className="pt-2">
                <button
                  onClick={() => onStartReading(1)}
                  className="flex items-center gap-2 px-6 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-sm font-bold tracking-widest rounded-sm shadow-xl transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>BEGIN READING CHAPTER 1</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Chapters Table of Contents */}
      <section className="bg-[#121216] border border-zinc-800 rounded-sm p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-white">
              MANUSCRIPT CHAPTER INDEX
            </h2>
            <p className="font-mono-space text-xs text-zinc-400">
              SERIALIZED CHRONICLE • 15 CANONICAL CHAPTERS
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono-space text-xs text-zinc-400">
              {publishedChapters.length} Released • {scheduledChapters.length} Scheduled
            </span>
          </div>
        </div>

        <ChapterList
          chapters={chapters}
          bookSlug={book.slug}
          progress={progress}
          onSelectChapter={onSelectChapter}
          isAdmin={isAdmin}
        />
      </section>

    </div>
  );
};

import React from 'react';
import { Book, ReadingProgress } from '../types';
import { BookOpen, Bookmark as BookmarkIcon, Check, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface BookHeroProps {
  book: Book;
  progress?: ReadingProgress;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onStartReading: (chapterNumber: number) => void;
  onViewBook: (slug: string) => void;
}

export const BookHero: React.FC<BookHeroProps> = ({
  book,
  progress,
  isBookmarked,
  onToggleBookmark,
  onStartReading,
  onViewBook
}) => {
  const resumeChapter = progress?.lastChapterNumber || 1;
  const hasStarted = !!progress && progress.lastChapterNumber > 0;

  return (
    <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-[#121216] via-[#0d0d10] to-[#0a0a0c] py-12 md:py-16">
      {/* Subtle architectural grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b0a_1px,transparent_1px),linear-gradient(to_bottom,#18181b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Cover Presentation */}
          <div className="lg:col-span-5 flex justify-center">
            <div 
              onClick={() => onViewBook(book.slug)}
              className="group cursor-pointer relative max-w-[320px] sm:max-w-[360px] w-full rounded-sm shadow-2xl overflow-hidden border border-zinc-700/60 transition-transform duration-300 hover:scale-[1.02]"
            >
              <img
                src={book.coverUrl}
                alt={`${book.title} Book Cover`}
                className="w-full h-auto object-cover block shadow-inner"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="px-4 py-2 bg-zinc-900/90 text-zinc-100 text-xs font-mono-space tracking-widest border border-zinc-700 rounded-sm">
                  EXPLORE BOOK ARCHIVE →
                </span>
              </div>
            </div>
          </div>

          {/* Book Content & Narrative Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Publisher & Status Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700/80 rounded-full text-xs font-mono-space tracking-widest text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ONGOING • SERIALIZED DAILY</span>
              </span>
              <span className="text-xs font-mono-space text-zinc-400 tracking-widest uppercase">
                BY {book.author}
              </span>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-3">
              <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-none">
                {book.title}
              </h1>
              <p className="font-mono-space text-xs sm:text-sm tracking-widest text-rose-400 font-bold uppercase leading-relaxed">
                {book.tagline}
              </p>
            </div>

            {/* Synopsis / Description */}
            <p className="font-cambria text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              {book.description}
            </p>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {book.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-1 bg-zinc-900/90 text-zinc-300 text-xs font-mono-space tracking-wider border border-zinc-800 rounded-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Status Statistics */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm max-w-xl text-center">
              <div>
                <span className="block font-cinzel text-xl sm:text-2xl font-bold text-white">
                  {book.publishedChapterCount}
                </span>
                <span className="block font-mono-space text-[10px] sm:text-xs text-zinc-400 tracking-widest uppercase">
                  Published
                </span>
              </div>
              <div className="border-x border-zinc-800">
                <span className="block font-cinzel text-xl sm:text-2xl font-bold text-emerald-400">
                  Daily
                </span>
                <span className="block font-mono-space text-[10px] sm:text-xs text-zinc-400 tracking-widest uppercase">
                  Releases
                </span>
              </div>
              <div>
                <span className="block font-cinzel text-xl sm:text-2xl font-bold text-zinc-200">
                  {book.latestChapterNumber > 0 ? `Ch. ${book.latestChapterNumber}` : 'Ch. 1'}
                </span>
                <span className="block font-mono-space text-[10px] sm:text-xs text-zinc-400 tracking-widest uppercase">
                  Latest Chapter
                </span>
              </div>
            </div>

            {/* Reading Status Notice if user has progress */}
            {hasStarted && (
              <div className="flex items-center gap-3 p-3 bg-zinc-900/80 border border-zinc-700/60 rounded-sm text-xs font-mono-space text-zinc-300 max-w-xl">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="flex-1">
                  You are currently reading: <strong>Chapter {progress.lastChapterNumber} — {progress.lastChapterTitle}</strong> ({progress.progressPercent}% complete)
                </span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartReading(resumeChapter)}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-zinc-100 text-zinc-950 font-mono-space text-xs sm:text-sm tracking-widest font-bold rounded-sm shadow-xl hover:bg-white transition-all transform active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>{hasStarted ? `CONTINUE CH. ${resumeChapter}` : 'START READING CH. 1'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onViewBook(book.slug)}
                className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 text-zinc-200 border border-zinc-700 font-mono-space text-xs sm:text-sm tracking-widest hover:bg-zinc-800 hover:text-white transition-colors rounded-sm"
              >
                <span>TABLE OF CONTENTS</span>
              </button>

              <button
                onClick={onToggleBookmark}
                title={isBookmarked ? 'Remove from My Library' : 'Save to My Library'}
                className={`p-3.5 border rounded-sm transition-colors ${
                  isBookmarked
                    ? 'bg-zinc-800 text-amber-400 border-amber-500/50'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
                aria-label="Bookmark this book"
              >
                <BookmarkIcon className="w-5 h-5 fill-current" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

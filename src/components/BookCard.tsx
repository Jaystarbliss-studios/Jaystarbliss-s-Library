import React from 'react';
import { Book, ReadingProgress } from '../types';
import { BookOpen, Bookmark as BookmarkIcon, Clock, ChevronRight } from 'lucide-react';

interface BookCardProps {
  book: Book;
  progress?: ReadingProgress;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSelect: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  progress,
  isBookmarked,
  onToggleBookmark,
  onSelect
}) => {
  return (
    <div className="group relative bg-[#121215] border border-zinc-800/90 rounded-sm hover:border-zinc-600 transition-all duration-300 flex flex-col overflow-hidden shadow-md">
      
      {/* Top Banner / Cover Area */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-zinc-950 cursor-pointer" onClick={onSelect}>
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 text-[10px] font-mono-space tracking-widest uppercase font-bold rounded-sm backdrop-blur-md shadow-sm ${
            book.status === 'ongoing'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
              : book.status === 'completed'
              ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80'
              : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
          }`}>
            {book.status}
          </span>
          {book.isFeatured && (
            <span className="px-2 py-0.5 text-[9px] font-mono-space tracking-wider uppercase bg-zinc-900/90 text-zinc-300 border border-zinc-700 rounded-sm">
              FEATURED
            </span>
          )}
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this book'}
          className={`absolute top-3 right-3 p-2 rounded-sm backdrop-blur-md transition-colors ${
            isBookmarked
              ? 'bg-zinc-900/90 text-amber-400 border border-amber-500/60'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-700/60'
          }`}
          aria-label="Bookmark"
        >
          <BookmarkIcon className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Progress Bar if Read */}
      {progress && progress.progressPercent > 0 && (
        <div className="w-full bg-zinc-800 h-1">
          <div
            className="bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      )}

      {/* Book Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          
          <div className="flex items-center justify-between text-xs font-mono-space text-zinc-400">
            <span>{book.publishedChapterCount} CHAPTERS</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>UPDATED {new Date(book.lastUpdatedAt).toLocaleDateString()}</span>
            </span>
          </div>

          <h3 
            onClick={onSelect}
            className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-white cursor-pointer hover:text-zinc-200 transition-colors"
          >
            {book.title}
          </h3>

          <p className="font-mono-space text-[11px] text-rose-400 font-semibold tracking-wider uppercase line-clamp-1">
            {book.tagline}
          </p>

          <p className="font-cambria text-sm text-zinc-400 line-clamp-3 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Genres & Explore Action */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {book.genres.slice(0, 3).map((g) => (
              <span key={g} className="px-2 py-0.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono-space tracking-wider border border-zinc-800 rounded-sm">
                {g}
              </span>
            ))}
            {book.genres.length > 3 && (
              <span className="text-[10px] font-mono-space text-zinc-400 self-center">
                +{book.genres.length - 3}
              </span>
            )}
          </div>

          <button
            onClick={onSelect}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono-space tracking-widest border border-zinc-700/80 rounded-sm transition-colors"
          >
            <span>{progress ? `CONTINUE CH. ${progress.lastChapterNumber}` : 'OPEN BOOK ARCHIVE'}</span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Book, ReadingProgress } from '../types';
import { BookOpen, Bookmark as BookmarkIcon, Clock, ChevronRight, Feather } from 'lucide-react';

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
  const [imageError, setImageError] = useState(false);

  const hasValidImage = book.coverUrl && book.coverUrl.trim() !== '' && !imageError;

  return (
    <div className="group relative bg-[#131318]/90 border border-zinc-800/80 rounded-2xl hover:border-zinc-700/80 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-0.5">
      
      {/* Top Banner / Cover Area */}
      <div 
        className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-zinc-950 cursor-pointer flex items-center justify-center rounded-t-2xl"
        onClick={onSelect}
      >
        {hasValidImage ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800">
            <Feather className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-zinc-300 transition-colors" />
            <span className="font-cinzel text-sm font-bold tracking-wider text-zinc-200 uppercase line-clamp-2">
              {book.title}
            </span>
            <span className="font-mono-space text-[10px] text-zinc-400 mt-1 uppercase">
              {book.author || 'Library X'}
            </span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-3 py-1 text-[10px] font-mono-space tracking-widest uppercase font-bold rounded-full backdrop-blur-md shadow-sm ${
            book.status === 'ongoing'
              ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-700/60'
              : book.status === 'completed'
              ? 'bg-sky-950/85 text-sky-300 border border-sky-700/60'
              : 'bg-amber-950/85 text-amber-300 border border-amber-700/60'
          }`}>
            {book.status === 'ongoing' ? 'Serializing' : book.status}
          </span>
          {book.isFeatured && (
            <span className="px-2.5 py-0.5 text-[9px] font-mono-space tracking-wider uppercase bg-zinc-900/90 text-amber-300 border border-amber-800/50 rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          title={isBookmarked ? 'In My Shelf (Click to remove)' : 'Add to My Shelf'}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-all active:scale-90 ${
            isBookmarked
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-md'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-700/60'
          }`}
          aria-label="Bookmark"
        >
          <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Progress Bar if Read */}
      {progress && progress.progressPercent > 0 && (
        <div className="w-full bg-zinc-800/80 h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-1.5 transition-all duration-300 rounded-r-full"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      )}

      {/* Book Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          
          <div className="flex items-center justify-between text-xs font-mono-space text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span>{book.publishedChapterCount} PUBLISHED</span>
              {book.scheduledChapterCount > 0 && (
                <span className="text-amber-400">• {book.scheduledChapterCount} SCHEDULED</span>
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{new Date(book.lastUpdatedAt).toLocaleDateString()}</span>
            </span>
          </div>

          <h3 
            onClick={onSelect}
            className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-white cursor-pointer hover:text-zinc-200 transition-colors"
          >
            {book.title}
          </h3>

          {book.tagline && (
            <p className="font-mono-space text-[11px] text-amber-400/90 font-semibold tracking-wider uppercase line-clamp-1">
              {book.tagline}
            </p>
          )}

          <p className="font-cambria text-sm text-zinc-300 line-clamp-3 leading-relaxed">
            {book.description || 'No synopsis provided yet.'}
          </p>
        </div>

        {/* Genres & Explore Action */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-3">
          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.genres.slice(0, 3).map((g) => (
                <span key={g} className="px-2.5 py-0.5 bg-zinc-900/90 text-zinc-400 text-[10px] font-mono-space tracking-wider border border-zinc-800 rounded-full">
                  {g}
                </span>
              ))}
              {book.genres.length > 3 && (
                <span className="text-[10px] font-mono-space text-zinc-500 self-center">
                  +{book.genres.length - 3}
                </span>
              )}
            </div>
          )}

          <button
            onClick={onSelect}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-mono-space tracking-widest border border-zinc-700/60 rounded-xl transition-all active:scale-98 shadow-sm"
          >
            <span>{progress ? `CONTINUE CH. ${progress.lastChapterNumber}` : 'OPEN BOOK'}</span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
};

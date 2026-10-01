import React from 'react';
import { Book, ReadingProgress } from '../types';
import { Bookmark, CheckCircle2, MoreVertical, Play } from 'lucide-react';

interface BookCardProps {
  book: Book;
  progress?: ReadingProgress;
  isBookmarked?: boolean;
  onToggleBookmark?: (book: Book) => void;
  onSelectBook: (slug: string) => void;
  onSelectChapter?: (slug: string, chapterNumber: number) => void;
  showProgress?: boolean;
  variant?: 'grid' | 'carousel' | 'compact';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  progress,
  isBookmarked = false,
  onToggleBookmark,
  onSelectBook,
  onSelectChapter,
  showProgress = true,
  variant = 'grid'
}) => {
  const isCompleted = progress && progress.progressPercent >= 100;
  const isReading = progress && progress.progressPercent > 0 && !isCompleted;
  const currentChapterNum = progress?.lastChapterNumber || 1;
  const progressPercent = progress ? Math.round(progress.progressPercent) : 0;

  return (
    <div
      onClick={() => onSelectBook(book.slug)}
      className="group relative bg-[#12131b] hover:bg-[#161722] border border-white/5 hover:border-white/15 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#181924] border border-white/5 mb-3">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Floating Actions: Bookmark */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(book);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-teal-500 text-zinc-950 shadow-md'
                : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
            }`}
            title={isBookmarked ? 'In My Library' : 'Save to Library'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Quick Read / Resume Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-950 font-sans-clean text-xs font-bold shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-3 h-3 fill-current" />
            <span>{isReading ? `Resume Ch ${currentChapterNum}` : 'Read'}</span>
          </span>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="space-y-1 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-zinc-100 group-hover:text-teal-300 line-clamp-1 transition-colors font-sans-clean">
            {book.title}
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            {book.author}
          </p>
        </div>

        {/* Progress or Status Bar */}
        {showProgress && (
          <div className="pt-2">
            {isReading ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono-space text-zinc-400">
                  <span className="text-teal-400 font-semibold">{progressPercent}%</span>
                  <span>Chapter {currentChapterNum}</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : isCompleted ? (
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </div>
            ) : (
              <span className="text-[10px] font-mono-space text-zinc-500 uppercase tracking-wider">
                {book.publishedChapterCount} Chapters
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { LatestUpdateItem } from '../lib/storage';
import { Clock, BookOpen, ChevronRight, Calendar, Sparkles } from 'lucide-react';

interface LatestUpdatesViewProps {
  updates: LatestUpdateItem[];
  onSelectChapter: (bookSlug: string, chapterNumber: number) => void;
  onSelectBook: (bookSlug: string) => void;
}

export const LatestUpdatesView: React.FC<LatestUpdatesViewProps> = ({
  updates,
  onSelectChapter,
  onSelectBook
}) => {
  // Group updates by date categories: Today, Yesterday, Earlier
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-calibri">
      
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            LATEST CHAPTER UPDATES
          </h1>
        </div>
        <p className="font-mono-space text-xs sm:text-sm text-zinc-400">
          SERIALIZED RELEASES STREAM • NOVEL UPDATES INFORMATION ARCHITECTURE
        </p>
      </div>

      {/* Release Schedule Commitment Banner */}
      <div className="p-4 sm:p-5 bg-[#121216] border border-zinc-800 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-cinzel text-sm font-bold text-zinc-100 block">
              DAILY CHAPTER RELEASES ACTIVE
            </span>
            <span className="font-mono-space text-xs text-zinc-400 block">
              New chapters automatically unlock according to the scheduled publication timeline (WAT / Africa/Lagos).
            </span>
          </div>
        </div>

        <span className="px-3 py-1 bg-zinc-900 text-zinc-300 text-xs font-mono-space tracking-wider border border-zinc-700 rounded-sm shrink-0">
          {updates.length} TOTAL RELEASES RECORDED
        </span>
      </div>

      {/* Stream Table */}
      <div className="bg-[#121215] border border-zinc-800 rounded-sm divide-y divide-zinc-800/80 overflow-hidden shadow-xl">
        {updates.map(({ chapter, book, releaseDate }) => {
          const relDate = new Date(releaseDate);
          const isToday = relDate.toDateString() === todayStr;
          const isYesterday = relDate.toDateString() === yesterdayStr;

          const dateLabel = isToday
            ? 'Today'
            : isYesterday
            ? 'Yesterday'
            : relDate.toLocaleDateString();

          return (
            <div
              key={chapter.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                {/* Book Mini Cover */}
                <div
                  onClick={() => onSelectBook(book.slug)}
                  className="w-12 h-16 shrink-0 bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors flex items-center justify-center"
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-5 h-5 text-zinc-600" />
                  )}
                </div>

                {/* Chapter Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onSelectBook(book.slug)}
                      className="font-cinzel text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      {book.title}
                    </button>
                    <span className="text-zinc-600">•</span>
                    <span className="px-1.5 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-mono-space rounded">
                      RELEASED
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectChapter(book.slug, chapter.chapterNumber)}
                    className="font-cinzel text-base sm:text-lg font-bold text-white hover:text-zinc-300 transition-colors cursor-pointer truncate"
                  >
                    Chapter {chapter.chapterNumber} — {chapter.title}
                  </h3>

                  {chapter.subtitle && (
                    <p className="font-cambria text-xs sm:text-sm text-zinc-400 italic truncate">
                      {chapter.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] font-mono-space text-zinc-500 pt-1">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Calendar className="w-3 h-3" />
                      <span>{dateLabel} at {relDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span>•</span>
                    <span>{chapter.wordCount} words</span>
                    <span>•</span>
                    <span>{chapter.readingTimeMinutes} min read</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectChapter(book.slug, chapter.chapterNumber)}
                className="self-end sm:self-center px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>READ NOW</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {updates.length === 0 && (
          <div className="p-12 text-center text-zinc-400 font-mono-space text-xs">
            No published chapters yet in the stream.
          </div>
        )}
      </div>

    </div>
  );
};

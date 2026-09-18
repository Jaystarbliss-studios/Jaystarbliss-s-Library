import React, { useState } from 'react';
import { Chapter, ReadingProgress } from '../types';
import { BookOpen, Clock, Calendar, CheckCircle2, Lock, ArrowUpDown, Search } from 'lucide-react';

interface ChapterListProps {
  chapters: Chapter[];
  bookSlug: string;
  progress?: ReadingProgress;
  onSelectChapter: (chapterNumber: number) => void;
  isAdmin?: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  bookSlug,
  progress,
  onSelectChapter,
  isAdmin = false
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(true);

  const filteredChapters = chapters.filter((c) => {
    const query = filterQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(query)) ||
      c.chapterNumber.toString().includes(query)
    );
  });

  const sortedChapters = [...filteredChapters].sort((a, b) =>
    sortAscending ? a.chapterNumber - b.chapterNumber : b.chapterNumber - a.chapterNumber
  );

  return (
    <div className="space-y-4">
      
      {/* Chapter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter chapters by title or #..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#121215] border border-zinc-800 rounded-sm pl-9 pr-3 py-2 text-xs font-mono-space text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-mono-space text-zinc-400">
            {filteredChapters.length} {filteredChapters.length === 1 ? 'Chapter' : 'Chapters'}
          </span>
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-sm text-xs font-mono-space tracking-wider transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortAscending ? '1 → END' : 'END → 1'}</span>
          </button>
        </div>
      </div>

      {/* Chapters Table / List */}
      <div className="divide-y divide-zinc-800/80 border-y border-zinc-800/80">
        {sortedChapters.map((chapter) => {
          const isPublished = chapter.status === 'published';
          const isScheduled = chapter.status === 'scheduled';
          const isDraft = chapter.status === 'draft';
          const isCurrentReading = progress?.lastChapterNumber === chapter.chapterNumber;
          const isCompleted = progress && progress.lastChapterNumber > chapter.chapterNumber;
          const isClickable = isPublished || isAdmin;

          return (
            <div
              key={chapter.id}
              onClick={() => isClickable && onSelectChapter(chapter.chapterNumber)}
              className={`group p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                isClickable
                  ? 'cursor-pointer hover:bg-zinc-900/60'
                  : 'opacity-60 cursor-not-allowed bg-zinc-950/40'
              } ${isCurrentReading ? 'bg-zinc-900/80 border-l-4 border-emerald-500' : ''}`}
            >
              <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                
                {/* Chapter Number Badge */}
                <div className="shrink-0 text-center w-14 sm:w-16">
                  <span className="block font-cinzel text-base sm:text-lg font-bold text-zinc-300 group-hover:text-white transition-colors">
                    {chapter.chapterNumber < 10 ? `0${chapter.chapterNumber}` : chapter.chapterNumber}
                  </span>
                  <span className="block font-mono-space text-[9px] text-zinc-400 tracking-widest uppercase">
                    CHAPTER
                  </span>
                </div>

                {/* Chapter Title & Subtitle */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                      {chapter.title}
                    </h4>

                    {isPublished && (
                      <span className="px-1.5 py-0.2 bg-zinc-800/80 text-zinc-400 text-[10px] font-mono-space rounded">
                        {chapter.readingTimeMinutes} min read
                      </span>
                    )}

                    {isScheduled && (
                      <span className="px-2 py-0.5 bg-amber-950/80 text-amber-400 text-[10px] font-mono-space tracking-wider border border-amber-800/60 rounded">
                        SCHEDULED FOR {chapter.scheduledFor ? new Date(chapter.scheduledFor).toLocaleDateString() : 'SOON'}
                      </span>
                    )}

                    {isDraft && (
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-mono-space tracking-wider rounded">
                        DRAFT
                      </span>
                    )}

                    {isCurrentReading && (
                      <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-400 text-[10px] font-mono-space tracking-wider border border-emerald-800/80 rounded">
                        CURRENT
                      </span>
                    )}
                  </div>

                  {chapter.subtitle && (
                    <p className="font-cambria text-xs sm:text-sm text-zinc-400 italic truncate">
                      {chapter.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] font-mono-space text-zinc-400">
                    {chapter.publishedAt ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
                      </span>
                    ) : chapter.scheduledFor ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Clock className="w-3 h-3" />
                        <span>Releasing {new Date(chapter.scheduledFor).toLocaleString()}</span>
                      </span>
                    ) : null}

                    <span>•</span>
                    <span>{chapter.wordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Status / Action Glyph */}
              <div className="shrink-0">
                {isPublished ? (
                  isCompleted ? (
                    <span title="Completed">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </span>
                  ) : (
                    <button
                      className="px-3 py-1.5 bg-zinc-900 group-hover:bg-zinc-800 text-zinc-300 group-hover:text-white border border-zinc-700/80 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
                    >
                      READ →
                    </button>
                  )
                ) : isScheduled ? (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-mono-space">
                    <Lock className="w-4 h-4" />
                    <span className="hidden sm:inline">LOCKED</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono-space text-zinc-400">AUTHOR ONLY</span>
                )}
              </div>

            </div>
          );
        })}

        {sortedChapters.length === 0 && (
          <div className="p-8 text-center text-zinc-400 font-mono-space text-xs">
            No chapters match your search criteria.
          </div>
        )}
      </div>

    </div>
  );
};

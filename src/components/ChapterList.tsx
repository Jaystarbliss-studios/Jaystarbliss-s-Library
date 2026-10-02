import React, { useState } from 'react';
import { Chapter, ReadingProgress } from '../types';
import { Clock, Calendar, CheckCircle2, Lock, ArrowUpDown, Search } from 'lucide-react';
import { isChapterUnlocked } from '../lib/storage';

interface ChapterListProps {
  chapters: Chapter[];
  bookSlug: string;
  progress?: ReadingProgress;
  onSelectChapter: (chapterNumber: number) => void;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  userId?: string;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  bookSlug,
  progress,
  onSelectChapter,
  isAdmin = false,
  isAuthenticated = false,
  userId = 'guest_user'
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter chapters by title or #..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#14141b] border border-zinc-800/80 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono-space text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <span className="text-xs font-mono-space text-zinc-400">
            {filteredChapters.length} {filteredChapters.length === 1 ? 'Chapter' : 'Chapters'}
          </span>
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-mono-space tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortAscending ? '1 → END' : 'END → 1'}</span>
          </button>
        </div>
      </div>

      {/* Chapters Table / List with Soft Rounded Rows */}
      <div className="space-y-2">
        {sortedChapters.map((chapter) => {
          const isPublished = chapter.status === 'published';
          const isScheduled = chapter.status === 'scheduled';
          const isDraft = chapter.status === 'draft';
          
          const isLockedByAuthor = chapter.isLocked !== undefined 
            ? chapter.isLocked 
            : (chapter.chapterNumber >= 11);
          
          const isUnlocked = isChapterUnlocked(userId, chapter.id);
          const isLocked = isPublished && isLockedByAuthor && !isAuthenticated && !isAdmin && !isUnlocked;
          
          const isCurrentReading = progress?.lastChapterNumber === chapter.chapterNumber;
          const isCompleted = progress && progress.lastChapterNumber > chapter.chapterNumber;
          const isClickable = isPublished || isAdmin;

          return (
            <div
              key={chapter.id}
              onClick={() => isClickable && onSelectChapter(chapter.chapterNumber)}
              className={`group p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 transition-all border shadow-sm ${
                isClickable
                  ? 'cursor-pointer hover:bg-zinc-800/40 hover:border-zinc-700/80'
                  : 'opacity-60 cursor-not-allowed bg-zinc-950/40 border-zinc-800/60'
              } ${
                isCurrentReading 
                  ? 'bg-zinc-800/60 border-teal-500/50 shadow-md ring-1 ring-teal-500/20' 
                  : 'bg-[#121217]/70 border-zinc-800/60'
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-6 min-w-0 flex-1">
                
                {/* Chapter Number Badge */}
                <div className="shrink-0 text-center w-12 sm:w-14">
                  <span className="block font-cinzel text-base sm:text-lg font-bold text-zinc-300 group-hover:text-white transition-colors">
                    {chapter.chapterNumber < 10 ? `0${chapter.chapterNumber}` : chapter.chapterNumber}
                  </span>
                  <span className="block font-mono-space text-[9px] text-zinc-500 tracking-widest uppercase">
                    CH.
                  </span>
                </div>

                {/* Chapter Title & Subtitle */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                      {chapter.title}
                    </h4>

                    {isLocked && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-mono-space rounded-full border border-amber-500/30">
                        <Lock className="w-2.5 h-2.5" />
                        <span>LOCKED</span>
                      </span>
                    )}

                    {isPublished && !isLocked && (
                      <span className="px-2 py-0.5 bg-zinc-800/90 text-zinc-400 text-[10px] font-mono-space rounded-full">
                        {chapter.readingTimeMinutes || 4} min read
                      </span>
                    )}

                    {isScheduled && (
                      <span className="px-2.5 py-0.5 bg-amber-950/80 text-amber-300 text-[10px] font-mono-space tracking-wider border border-amber-800/60 rounded-full">
                        SCHEDULED
                      </span>
                    )}

                    {isDraft && (
                      <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-mono-space tracking-wider rounded-full">
                        DRAFT
                      </span>
                    )}

                    {isCurrentReading && (
                      <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-mono-space tracking-wider border border-teal-500/40 rounded-full font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>

                  {chapter.subtitle && (
                    <p className="font-cambria text-xs sm:text-sm text-zinc-400 italic truncate">
                      {chapter.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] font-mono-space text-zinc-400 pt-0.5">
                    {chapter.publishedAt ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
                      </span>
                    ) : chapter.scheduledFor ? (
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Clock className="w-3 h-3" />
                        <span>Releasing {new Date(chapter.scheduledFor).toLocaleDateString()}</span>
                      </span>
                    ) : null}

                    <span>•</span>
                    <span>{chapter.wordCount || 750} words</span>
                  </div>
                </div>
              </div>

              {/* Status / Action Glyph */}
              <div className="shrink-0">
                {isLocked ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono-space">
                    <Lock className="w-3.5 h-3.5" />
                    <span>PREVIEW</span>
                  </div>
                ) : isPublished ? (
                  isCompleted ? (
                    <span title="Completed" className="p-2 block">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </span>
                  ) : (
                    <button
                      className="px-3.5 py-1.5 bg-zinc-900 group-hover:bg-zinc-800 text-zinc-300 group-hover:text-white border border-zinc-700/80 text-xs font-mono-space tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      READ →
                    </button>
                  )
                ) : isScheduled ? (
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono-space px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">LOCKED</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono-space text-zinc-500">AUTHOR ONLY</span>
                )}
              </div>

            </div>
          );
        })}

        {sortedChapters.length === 0 && (
          <div className="p-8 text-center text-zinc-400 font-mono-space text-xs bg-[#121217]/50 border border-zinc-800/80 rounded-2xl">
            No chapters match your search criteria.
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Bookmark, ReadingProgress, Book } from '../types';
import { Bookmark as BookmarkIcon, History, BookOpen, Clock, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';

interface MyLibraryViewProps {
  bookmarks: Bookmark[];
  readingProgressList: ReadingProgress[];
  onSelectBook: (slug: string) => void;
  onSelectChapter: (slug: string, chapterNumber: number) => void;
  onRemoveBookmark: (bookId: string) => void;
  onExploreLibrary: () => void;
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({
  bookmarks,
  readingProgressList,
  onSelectBook,
  onSelectChapter,
  onRemoveBookmark,
  onExploreLibrary
}) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'bookmarks'>('reading');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-calibri">
      
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5 text-amber-400" />
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            MY PERSONAL LIBRARY
          </h1>
        </div>
        <p className="font-mono-space text-xs sm:text-sm text-zinc-400">
          SAVED MANUSCRIPTS, READING PROGRESS, AND HISTORICAL ARCHIVE
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono-space tracking-widest uppercase transition-colors border-b-2 ${
            activeTab === 'reading'
              ? 'border-zinc-100 text-white font-bold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>CURRENT READING & HISTORY ({readingProgressList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono-space tracking-widest uppercase transition-colors border-b-2 ${
            activeTab === 'bookmarks'
              ? 'border-zinc-100 text-white font-bold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookmarkIcon className="w-4 h-4" />
          <span>SAVED BOOKMARKS ({bookmarks.length})</span>
        </button>
      </div>

      {/* Reading Progress Tab Content */}
      {activeTab === 'reading' && (
        <div className="space-y-6">
          {readingProgressList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {readingProgressList.map((prog) => (
                <div
                  key={prog.id}
                  className="p-5 bg-[#121215] border border-zinc-800 rounded-sm space-y-4 hover:border-zinc-700 transition-colors shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={prog.bookCoverUrl}
                      alt={prog.bookTitle}
                      className="w-16 h-24 object-cover rounded-sm border border-zinc-700 shrink-0 cursor-pointer"
                      onClick={() => onSelectBook(prog.bookSlug)}
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-mono-space text-zinc-400 tracking-wider uppercase block">
                        LAST READ: {new Date(prog.lastReadAt).toLocaleString()}
                      </span>

                      <h3
                        onClick={() => onSelectBook(prog.bookSlug)}
                        className="font-cinzel text-lg font-bold text-white hover:text-zinc-200 cursor-pointer truncate"
                      >
                        {prog.bookTitle}
                      </h3>

                      <p className="font-mono-space text-xs text-emerald-400 font-semibold">
                        Chapter {prog.lastChapterNumber} — {prog.lastChapterTitle}
                      </p>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-mono-space text-zinc-400">
                          <span>Progress Depth</span>
                          <span>{prog.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${prog.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onSelectBook(prog.bookSlug)}
                      className="text-xs font-mono-space text-zinc-400 hover:text-white"
                    >
                      Table of Contents
                    </button>

                    <button
                      onClick={() => onSelectChapter(prog.bookSlug, prog.lastChapterNumber)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space tracking-wider font-bold rounded-sm shadow-md transition-colors"
                    >
                      <span>RESUME CH. {prog.lastChapterNumber}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#121215] border border-zinc-800 rounded-sm space-y-4 max-w-md mx-auto">
              <History className="w-8 h-8 text-zinc-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-cinzel text-lg font-bold text-white uppercase">
                  NO READING HISTORY YET
                </h3>
                <p className="font-cambria text-sm text-zinc-400 leading-relaxed">
                  Start reading TWO DECADES or any book in the library, and your scroll depth and chapter progress will automatically be recorded here.
                </p>
              </div>
              <button
                onClick={onExploreLibrary}
                className="px-5 py-2.5 bg-zinc-100 text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-sm hover:bg-white transition-colors"
              >
                START READING NOW
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bookmarks Tab Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-5 bg-[#121215] border border-zinc-800 rounded-sm space-y-4 hover:border-zinc-700 transition-colors shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={bm.bookCoverUrl}
                      alt={bm.bookTitle}
                      className="w-16 h-24 object-cover rounded-sm border border-zinc-700 shrink-0 cursor-pointer"
                      onClick={() => onSelectBook(bm.bookSlug)}
                    />

                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-mono-space text-amber-400 uppercase tracking-wider block font-bold">
                        {bm.bookStatus}
                      </span>
                      <h3
                        onClick={() => onSelectBook(bm.bookSlug)}
                        className="font-cinzel text-base font-bold text-white hover:text-zinc-200 cursor-pointer truncate"
                      >
                        {bm.bookTitle}
                      </h3>
                      <span className="text-[11px] font-mono-space text-zinc-400 block">
                        Saved on {new Date(bm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onRemoveBookmark(bm.bookId)}
                      className="p-2 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Remove Bookmark"
                      aria-label="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectBook(bm.bookSlug)}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono-space tracking-wider border border-zinc-700 rounded-sm transition-colors"
                    >
                      OPEN BOOK
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#121216] border border-zinc-800 rounded-sm space-y-4 max-w-md mx-auto">
              <BookmarkIcon className="w-8 h-8 text-zinc-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-cinzel text-lg font-bold text-white uppercase">
                  NO SAVED BOOKMARKS YET
                </h3>
                <p className="font-cambria text-sm text-zinc-400 leading-relaxed">
                  Click the bookmark icon on any book to add it to your personal reading list.
                </p>
              </div>
              <button
                onClick={onExploreLibrary}
                className="px-5 py-2.5 bg-zinc-100 text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-sm hover:bg-white transition-colors"
              >
                BROWSE ARCHIVE
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

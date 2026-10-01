import React, { useState, useMemo } from 'react';
import { Bookmark, ReadingProgress, Book } from '../types';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Play, 
  MoreVertical, 
  Trash2, 
  Bell, 
  BellOff,
  Sparkles,
  Layers
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';

interface MyLibraryViewProps {
  bookmarks: Bookmark[];
  readingProgressList: ReadingProgress[];
  firebaseUser?: User | SimpleAuthUser | null;
  onLoginWithGoogle: () => void;
  onSelectBook: (slug: string) => void;
  onSelectChapter: (slug: string, chapterNumber: number) => void;
  onRemoveBookmark: (bookId: string) => void;
  onToggleNotification?: (bookId: string, enabled: boolean) => void;
  onExploreLibrary: () => void;
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({
  bookmarks,
  readingProgressList,
  firebaseUser,
  onLoginWithGoogle,
  onSelectBook,
  onSelectChapter,
  onRemoveBookmark,
  onToggleNotification,
  onExploreLibrary
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'reading' | 'completed' | 'wishlist'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Merge bookmarks and reading progress into unified shelf items
  const shelfItems = useMemo(() => {
    const itemsMap = new Map<string, {
      bookId: string;
      slug: string;
      title: string;
      coverUrl: string;
      progress?: ReadingProgress;
      bookmark?: Bookmark;
    }>();

    // Add all bookmarks
    bookmarks.forEach((bm) => {
      itemsMap.set(bm.bookId, {
        bookId: bm.bookId,
        slug: bm.bookSlug,
        title: bm.bookTitle,
        coverUrl: bm.bookCoverUrl,
        bookmark: bm
      });
    });

    // Merge reading progress
    readingProgressList.forEach((p) => {
      const existing = itemsMap.get(p.bookId);
      if (existing) {
        existing.progress = p;
      } else {
        itemsMap.set(p.bookId, {
          bookId: p.bookId,
          slug: p.bookSlug,
          title: p.bookTitle,
          coverUrl: p.bookCoverUrl,
          progress: p
        });
      }
    });

    return Array.from(itemsMap.values());
  }, [bookmarks, readingProgressList]);

  // Filter shelf items by tab
  const filteredItems = useMemo(() => {
    return shelfItems.filter((item) => {
      const isCompleted = item.progress && item.progress.progressPercent >= 100;
      const isReading = item.progress && item.progress.progressPercent > 0 && !isCompleted;
      const isWishlist = Boolean(item.bookmark) && (!item.progress || item.progress.progressPercent === 0);

      if (filterTab === 'reading') return isReading;
      if (filterTab === 'completed') return isCompleted;
      if (filterTab === 'wishlist') return isWishlist;
      return true;
    });
  }, [shelfItems, filterTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      
      {/* Header & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 font-sans-clean">
            My Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your books, your journey.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['all', 'reading', 'completed', 'wishlist'] as const).map((tab) => {
            const isActive = filterTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-400/20 text-teal-300 border border-teal-400/30 shadow-sm'
                    : 'bg-[#141520] hover:bg-[#1a1b2a] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookshelf Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredItems.map((item) => {
            const progress = item.progress;
            const isCompleted = progress && progress.progressPercent >= 100;
            const isReading = progress && progress.progressPercent > 0 && !isCompleted;
            const progressPercent = progress ? Math.round(progress.progressPercent) : 0;
            const currentChapter = progress?.lastChapterNumber || 1;
            const isMenuOpen = activeMenuId === item.bookId;

            return (
              <div
                key={item.bookId}
                onClick={() => onSelectBook(item.slug)}
                className="group relative bg-[#12131b] hover:bg-[#161722] border border-white/5 hover:border-white/15 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Book Cover */}
                <div className="relative aspect-[2/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#181924] border border-white/5 mb-3">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Context Menu Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : item.bookId);
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 text-white/80 hover:text-white backdrop-blur-md transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-10 right-2 z-20 w-44 bg-[#181926] border border-white/10 rounded-2xl p-1.5 shadow-2xl space-y-1 animate-in zoom-in-95 duration-100"
                    >
                      {item.bookmark && onToggleNotification && (
                        <button
                          onClick={() => {
                            const current = item.bookmark?.emailNotificationsEnabled !== false;
                            onToggleNotification(item.bookId, !current);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {item.bookmark.emailNotificationsEnabled !== false ? (
                            <>
                              <BellOff className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Mute Notifications</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5 text-teal-400" />
                              <span>Enable Notifications</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onRemoveBookmark(item.bookId);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove from Shelf</span>
                      </button>
                    </div>
                  )}

                  {/* Hover Read Action */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChapter(item.slug, currentChapter);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-950 font-sans-clean text-xs font-bold shadow-xl"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isReading ? `Resume Ch ${currentChapter}` : 'Read'}</span>
                    </button>
                  </div>
                </div>

                {/* Metadata & Progress */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm sm:text-base text-zinc-100 group-hover:text-teal-300 line-clamp-1 transition-colors font-sans-clean">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Jaystarbliss
                  </p>

                  <div className="pt-2">
                    {isReading ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono-space text-zinc-400">
                          <span className="text-teal-400 font-semibold">{progressPercent}%</span>
                          <span>Chapter {currentChapter}</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-500 font-medium">
                        Not Started
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State Matching Mockup */
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-sm mx-auto space-y-5 bg-[#12131b] border border-white/5 rounded-3xl shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#181926] border border-white/10 flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-zinc-100 font-sans-clean">
              Your library is empty
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Start exploring and add your first book to begin your journey.
            </p>
          </div>

          <button
            onClick={onExploreLibrary}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-sans-clean text-xs font-bold shadow-lg transition-all active:scale-95"
          >
            <span>Browse Books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};

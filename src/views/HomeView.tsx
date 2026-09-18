import React, { useState, useMemo } from 'react';
import { Book, ReadingProgress, BookStatus } from '../types';
import { BookCard } from '../components/BookCard';
import { 
  BookOpen, 
  Search, 
  Flame, 
  Star, 
  Clock, 
  CheckCircle, 
  Layers, 
  ArrowRight,
  Shield,
  Filter,
  Sparkles,
  Plus
} from 'lucide-react';
import { LatestUpdateItem } from '../lib/storage';

interface HomeViewProps {
  allBooks: Book[];
  latestUpdates?: LatestUpdateItem[];
  progressMap?: Record<string, ReadingProgress>;
  bookmarksMap?: Record<string, boolean>;
  onToggleBookmark: (book: Book) => void;
  onViewBook: (slug: string) => void;
  onSelectChapter?: (bookSlug: string, chapterNumber: number) => void;
  onNavigate: (route: string) => void;
}

type LibraryTab = 'all' | 'hot' | 'top' | 'serializing' | 'completed';

export const HomeView: React.FC<HomeViewProps> = ({
  allBooks,
  latestUpdates = [],
  progressMap = {},
  bookmarksMap = {},
  onToggleBookmark,
  onViewBook,
  onSelectChapter,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Collect all distinct genres from available books
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    allBooks.forEach((b) => {
      (b.genres || []).forEach((g) => set.add(g));
    });
    return Array.from(set);
  }, [allBooks]);

  // Filter books based on active tab and query
  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      // Visibility check
      if (book.visibility !== 'published') return false;

      // Tab filters
      if (activeTab === 'hot' && !book.isFeatured) return false;
      if (activeTab === 'top' && !book.isFeatured && book.publishedChapterCount < 1) return false;
      if (activeTab === 'serializing' && book.status !== 'ongoing') return false;
      if (activeTab === 'completed' && book.status !== 'completed') return false;

      // Genre filter
      if (selectedGenre !== 'all' && (!book.genres || !book.genres.includes(selectedGenre))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = book.title?.toLowerCase().includes(q);
        const matchDesc = book.description?.toLowerCase().includes(q);
        const matchAuthor = book.author?.toLowerCase().includes(q);
        const matchTags = (book.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchAuthor && !matchTags) return false;
      }

      return true;
    });
  }, [allBooks, activeTab, selectedGenre, searchQuery]);

  const tabs: { id: LibraryTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'ALL BOOKS', icon: Layers },
    { id: 'hot', label: 'HOT NOVELS', icon: Flame },
    { id: 'top', label: 'TOP NOVELS', icon: Star },
    { id: 'serializing', label: 'SERIALIZING', icon: Clock },
    { id: 'completed', label: 'COMPLETED', icon: CheckCircle },
  ];

  return (
    <div className="w-full pb-20 font-calibri text-zinc-100">
      
      {/* Top Banner / Library Introduction Header */}
      <div className="border-b border-zinc-800 bg-gradient-to-b from-[#111116] to-[#0a0a0c] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono-space text-xs tracking-widest text-emerald-400 uppercase">
                  ONLINE LITERARY CATALOGUE
                </span>
              </div>
              <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
                LIBRARY X
              </h1>
              <p className="font-mono-space text-xs text-zinc-400 max-w-xl">
                Serial releases, memoirs, and sovereign written works. Live updates synchronized directly from cloud archives.
              </p>
            </div>

            {/* Quick action for author studio */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono-space tracking-wider border border-zinc-700 rounded-sm transition-colors active:scale-95 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>AUTHOR STUDIO</span>
              </button>
            </div>
          </div>

          {/* Quick Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by book title, genre, keyword, or synopsis..."
                className="w-full bg-[#141418] border border-zinc-700/80 rounded-sm pl-10 pr-4 py-2.5 text-xs font-mono-space text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-space text-zinc-400 hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            {allGenres.length > 0 && (
              <div className="shrink-0">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full sm:w-auto bg-[#141418] border border-zinc-700/80 rounded-sm px-3.5 py-2.5 text-xs font-mono-space text-zinc-200 focus:outline-none focus:border-zinc-500"
                >
                  <option value="all">ALL GENRES</option>
                  {allGenres.map((g) => (
                    <option key={g} value={g}>{g.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Library Navigation Tabs: Mobile Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-1 border-t border-zinc-800/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs font-mono-space tracking-wider whitespace-nowrap transition-all select-none ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Book Grid / Shelf Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        
        {/* Count Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono-space text-zinc-400">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>
              {allBooks.length === 0 
                ? 'CATALOG WIREFRAME (0 PUBLISHED BOOKS)' 
                : `${filteredBooks.length} ${filteredBooks.length === 1 ? 'BOOK' : 'BOOKS'} AVAILABLE`}
            </span>
          </div>

          {allBooks.length > 0 && (
            <span className="text-[11px] font-mono-space text-zinc-500">
              TAP BOOK TO READ CHAPTERS
            </span>
          )}
        </div>

        {/* CONDITION 1: REAL BOOKS EXIST */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                progress={progressMap[book.id]}
                isBookmarked={!!bookmarksMap[book.id]}
                onToggleBookmark={() => onToggleBookmark(book)}
                onSelect={() => onViewBook(book.slug)}
              />
            ))}
          </div>
        ) : allBooks.length > 0 ? (
          /* Search / Filter returned empty */
          <div className="p-12 text-center border border-zinc-800 bg-[#121216] rounded-sm space-y-4">
            <Search className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-zinc-200 uppercase">
                NO BOOKS MATCHED YOUR FILTER
              </h3>
              <p className="font-mono-space text-xs text-zinc-500">
                Try clearing search terms or selecting a different shelf tab.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
                setSelectedGenre('all');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono-space rounded-sm"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          /* CONDITION 2: WIREFRAME STATE (No books in database yet) */
          <div className="space-y-8">
            
            {/* Wireframe Banner Notice */}
            <div className="p-6 sm:p-8 bg-[#121216] border border-dashed border-zinc-700 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[10px] font-mono-space uppercase tracking-wider">
                  <span>WIREFRAME VIEW READY</span>
                </div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wide text-white">
                  LIBRARY SHELF IS CURRENTLY CLEAR
                </h2>
                <p className="font-mono-space text-xs text-zinc-400 max-w-xl leading-relaxed">
                  All AI-imputed and placeholder books have been removed. As soon as you add books and upload cover images via ImgBB in the Author Studio, your actual manuscripts will dynamically appear here.
                </p>
              </div>

              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold tracking-widest rounded-sm transition-all shadow-md shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE FIRST BOOK</span>
              </button>
            </div>

            {/* Wireframe Skeleton Book Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((index) => (
                <div 
                  key={index}
                  className="bg-[#121215]/80 border border-zinc-800/80 rounded-sm p-4 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  {/* Wireframe Cover Area */}
                  <div className="relative aspect-[16/10] w-full rounded-sm bg-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center p-4">
                    <BookOpen className="w-8 h-8 text-zinc-700 mb-2" />
                    <span className="font-mono-space text-[10px] text-zinc-500 uppercase tracking-widest">
                      ImgBB Cover Slot {index}
                    </span>
                    <span className="font-mono-space text-[9px] text-zinc-600 mt-1">
                      [Dynamic Wireframe]
                    </span>
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 text-[9px] font-mono-space text-zinc-400 rounded-sm">
                      {index % 2 === 0 ? 'SERIALIZING' : 'NEW RELEASE'}
                    </div>
                  </div>

                  {/* Wireframe Content info */}
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-800/80 rounded-xs w-3/4 animate-pulse" />
                    <div className="h-3 bg-zinc-900 rounded-xs w-1/2" />
                    <div className="space-y-1 pt-1">
                      <div className="h-2.5 bg-zinc-900 rounded-xs w-full" />
                      <div className="h-2.5 bg-zinc-900 rounded-xs w-4/5" />
                    </div>
                  </div>

                  {/* Wireframe Button */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    <div className="w-full py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-sm text-center text-zinc-600 font-mono-space text-[10px] uppercase tracking-wider">
                      AWAITING BOOK PUBLICATION
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

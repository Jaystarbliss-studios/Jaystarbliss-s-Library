import React, { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
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
  Plus,
  LogIn,
  Bookmark
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
  firebaseUser?: User | null;
  onLoginWithGoogle?: () => void;
  isAdmin?: boolean;
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
  onNavigate,
  firebaseUser,
  onLoginWithGoogle,
  isAdmin = false
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
    <div className="w-full pb-20 font-calibri text-zinc-100 animate-in fade-in duration-500">
      
      {/* Top Banner / Library Introduction Header with Atmospheric Background Image */}
      <div className="relative border-b border-zinc-800/80 bg-[#0c0c12] px-4 sm:px-6 lg:px-8 py-10 sm:py-14 overflow-hidden">
        {/* Subtle literary background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none mix-blend-luminosity filter brightness-75 scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507842229451-7f01be44e21a?auto=format&fit=crop&w=2000&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14] via-[#0d0d14]/90 to-[#0a0a0f]/95 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-wide text-white uppercase">
                LIBRARY X
              </h1>
              <p className="font-mono-space text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                Live updates synchronized directly to your personal shelf, the curated serial releases.
              </p>
            </div>

            {/* Quick action for author studio (strictly visible only to verified admin) */}
            {isAdmin && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs font-mono-space tracking-wider border border-zinc-700/80 rounded-xl transition-all active:scale-95 shadow-md"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>AUTHOR STUDIO</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Search & Filter Controls with Soft Corners */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by book title, genre, keyword, or synopsis..."
                className="w-full bg-[#15151e] border border-zinc-700/80 rounded-2xl pl-11 pr-14 py-3 text-xs font-mono-space text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono-space text-zinc-400 hover:text-white px-2 py-0.5 rounded-full hover:bg-zinc-800"
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
                  className="w-full sm:w-auto bg-[#15151e] border border-zinc-700/80 rounded-2xl px-4 py-3 text-xs font-mono-space text-zinc-200 focus:outline-none focus:border-zinc-500 shadow-sm"
                >
                  <option value="all">ALL GENRES</option>
                  {allGenres.map((g) => (
                    <option key={g} value={g}>{g.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Library Navigation Tabs: Mobile Scrollable with Soft Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-1 border-t border-zinc-800/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono-space tracking-wider whitespace-nowrap transition-all select-none ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md scale-[1.02]'
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
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
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
          <div className="p-12 text-center border border-zinc-800/80 bg-[#131319]/80 rounded-2xl space-y-4 max-w-lg mx-auto shadow-xl">
            <Search className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-zinc-200 uppercase">
                NO BOOKS MATCHED YOUR FILTER
              </h3>
              <p className="font-mono-space text-xs text-zinc-400">
                Try clearing search terms or selecting a different shelf tab.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
                setSelectedGenre('all');
              }}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono-space rounded-xl transition-colors"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          /* CONDITION 2: WIREFRAME STATE (No books in database yet) */
          <div className="space-y-8">
            
            {/* Soft rounded banner notice: Reader version vs Admin version */}
            <div className="p-6 sm:p-8 bg-[#131319]/90 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wide text-white">
                  {isAdmin ? 'LIBRARY SHELF IS READY FOR MANUSCRIPTS' : 'UPCOMING SERIAL RELEASES PREPARING'}
                </h2>
                <p className="font-mono-space text-xs text-zinc-400 max-w-xl leading-relaxed">
                  {isAdmin
                    ? 'As the verified author, use the Author Studio to publish books, upload covers, and schedule daily chapter releases.'
                    : 'The literary archive is currently preparing upcoming serialized manuscripts. Connect with Google to follow releases and save novels to your reader shelf.'}
                </p>
              </div>

              {isAdmin ? (
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold tracking-widest rounded-xl transition-all shadow-md shrink-0 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>OPEN AUTHOR STUDIO</span>
                </button>
              ) : !firebaseUser ? (
                <button
                  onClick={onLoginWithGoogle}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold tracking-widest rounded-xl transition-all shadow-md shrink-0 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>SIGN IN</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-mono-space text-xs rounded-xl shadow-sm">
                  <Bookmark className="w-4 h-4 text-zinc-400" />
                  <span>READER ACCOUNT ACTIVE</span>
                </div>
              )}
            </div>

            {/* Skeleton / Upcoming Preview Cards with soft rounded corners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((index) => (
                <div 
                  key={index}
                  className="bg-[#131318]/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  {/* Preview Slot Area */}
                  <div className="relative aspect-[16/10] w-full rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center p-4">
                    <BookOpen className="w-8 h-8 text-zinc-700 mb-2" />
                    <span className="font-mono-space text-[10px] text-zinc-400 uppercase tracking-widest">
                      Upcoming Volume {index}
                    </span>
                    <span className="font-mono-space text-[9px] text-zinc-600 mt-1">
                      [Editorial Review]
                    </span>
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-zinc-900/90 border border-zinc-800 text-[9px] font-mono-space text-zinc-400 rounded-full">
                      {index % 2 === 0 ? 'SERIALIZING' : 'NEW RELEASE'}
                    </div>
                  </div>

                  {/* Wireframe Content info */}
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-800/80 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-3 bg-zinc-900 rounded-lg w-1/2" />
                    <div className="space-y-1 pt-1">
                      <div className="h-2.5 bg-zinc-900 rounded-lg w-full" />
                      <div className="h-2.5 bg-zinc-900 rounded-lg w-4/5" />
                    </div>
                  </div>

                  {/* Preview Status */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    <div className="w-full py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center text-zinc-500 font-mono-space text-[10px] uppercase tracking-wider">
                      RELEASE PENDING
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

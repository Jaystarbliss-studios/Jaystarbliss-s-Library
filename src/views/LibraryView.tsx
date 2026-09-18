import React, { useState } from 'react';
import { Book, BookStatus, ReadingProgress } from '../types';
import { BookCard } from '../components/BookCard';
import { BookOpen, Search, ArrowUpDown, Filter } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  progressMap: Record<string, ReadingProgress>;
  bookmarksMap: Record<string, boolean>;
  onToggleBookmark: (book: Book) => void;
  onSelectBook: (slug: string) => void;
  onNavigate: (route: string) => void;
}

type SortOption = 'updated' | 'published' | 'title' | 'chapters';

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  progressMap,
  bookmarksMap,
  onToggleBookmark,
  onSelectBook,
  onNavigate
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | BookStatus>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all unique genres across books
  const allGenres = Array.from(new Set(books.flatMap((b) => b.genres)));

  // Filter books
  let filtered = books.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (selectedGenre !== 'all' && !b.genres.includes(selectedGenre)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchDesc = b.description.toLowerCase().includes(q);
      const matchTag = b.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  // Sort books
  filtered.sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    }
    if (sortBy === 'published') {
      return new Date(b.firstPublishedAt).getTime() - new Date(a.firstPublishedAt).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'chapters') {
      return b.publishedChapterCount - a.publishedChapterCount;
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-calibri animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#131319]/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-2 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-luminosity filter blur-xs"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=2000&q=80')` }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            PUBLIC ARCHIVE & LIBRARY
          </h1>
        </div>
        <p className="relative z-10 font-mono-space text-xs sm:text-sm text-zinc-400">
          EXPLORE COMPLETE SERIALIZED MANUSCRIPTS, MEMOIRS, AND WRITTEN WORKS
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-[#131319]/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs with Soft Rounded Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950/80 p-1.5 border border-zinc-800/80 rounded-xl">
            {(['all', 'ongoing', 'completed', 'hiatus'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 text-xs font-mono-space tracking-wider uppercase rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-zinc-800 text-white font-bold shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono-space text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all shadow-inner"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-mono-space text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <span>SORT:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-950/80 border border-zinc-800/80 text-zinc-300 text-xs font-mono-space py-2 px-3 rounded-xl focus:outline-none focus:border-zinc-600 shadow-sm"
            >
              <option value="updated">Recently Updated</option>
              <option value="published">Recently Published</option>
              <option value="title">Title (A-Z)</option>
              <option value="chapters">Most Chapters</option>
            </select>
          </div>

        </div>

        {/* Genre Tags Filter Row */}
        <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono-space text-zinc-400 mr-1">GENRES:</span>
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1 text-xs font-mono-space rounded-full border transition-all ${
              selectedGenre === 'all'
                ? 'bg-zinc-800 text-white border-zinc-600 font-semibold shadow-sm'
                : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            All Genres
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 text-xs font-mono-space rounded-full border transition-all ${
                selectedGenre === genre
                  ? 'bg-zinc-800 text-white border-zinc-600 font-semibold shadow-sm'
                  : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            progress={progressMap[book.id]}
            isBookmarked={!!bookmarksMap[book.id]}
            onToggleBookmark={() => onToggleBookmark(book)}
            onSelect={() => onSelectBook(book.slug)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center border border-zinc-800/80 bg-[#131319]/80 rounded-2xl space-y-4 max-w-lg mx-auto shadow-xl">
          <Search className="w-10 h-10 text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-zinc-200 uppercase">
              NO MATCHING MANUSCRIPTS
            </h3>
            <p className="font-mono-space text-xs text-zinc-400">
              No titles match the selected genre or status filters.
            </p>
          </div>
          <button
            onClick={() => {
              setStatusFilter('all');
              setSelectedGenre('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono-space rounded-xl transition-colors"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

    </div>
  );
};

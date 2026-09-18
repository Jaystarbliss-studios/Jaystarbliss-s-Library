import React, { useState } from 'react';
import { Book, BookStatus, ReadingProgress } from '../types';
import { BookCard } from '../components/BookCard';
import { BookOpen, Search, ArrowUpDown, Filter, Sparkles } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-calibri">
      
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-zinc-300" />
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            PUBLIC ARCHIVE & LIBRARY
          </h1>
        </div>
        <p className="font-mono-space text-xs sm:text-sm text-zinc-400">
          EXPLORE COMPLETE SERIALIZED MANUSCRIPTS, MEMOIRS, AND WRITTEN WORKS
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-[#121216] border border-zinc-800 rounded-sm p-4 sm:p-5 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-sm">
            {(['all', 'ongoing', 'completed', 'hiatus'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-mono-space tracking-wider uppercase rounded-sm transition-colors ${
                  statusFilter === st
                    ? 'bg-zinc-800 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-sm pl-9 pr-3 py-1.5 text-xs font-mono-space text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-mono-space text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>SORT:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono-space py-1.5 px-2.5 rounded-sm focus:outline-none focus:border-zinc-600"
            >
              <option value="updated">Recently Updated</option>
              <option value="published">Recently Published</option>
              <option value="title">Title (A-Z)</option>
              <option value="chapters">Most Chapters</option>
            </select>
          </div>

        </div>

        {/* Genre Tags Filter Row */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono-space text-zinc-400 mr-1">GENRES:</span>
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-2 py-0.5 text-xs font-mono-space rounded-sm border transition-colors ${
              selectedGenre === 'all'
                ? 'bg-zinc-800 text-white border-zinc-600 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            All Genres
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-2 py-0.5 text-xs font-mono-space rounded-sm border transition-colors ${
                selectedGenre === genre
                  ? 'bg-zinc-800 text-white border-zinc-600 font-semibold'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
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
        <div className="p-12 text-center bg-[#121216] border border-zinc-800 rounded-sm space-y-3">
          <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="font-cinzel text-lg font-bold text-zinc-200">
            NO WORKS FOUND MATCHING FILTER
          </h3>
          <p className="font-mono-space text-xs text-zinc-400 max-w-sm mx-auto">
            Try resetting your status or genre filter to see all publications.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setSelectedGenre('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-zinc-800 text-zinc-200 text-xs font-mono-space tracking-wider rounded-sm hover:bg-zinc-700"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Book, ReadingProgress } from '../types';
import { BookCard } from '../components/BookCard';
import { Search, Layers, Sparkles } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  progressMap: Record<string, ReadingProgress>;
  bookmarksMap: Record<string, boolean>;
  onToggleBookmark: (book: Book) => void;
  onSelectBook: (slug: string) => void;
  onNavigate?: (route: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  progressMap,
  bookmarksMap,
  onToggleBookmark,
  onSelectBook,
  onNavigate
}) => {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const genres = ['All', 'Fantasy', 'Mystery', 'Adventure', 'Romance', 'Sci-Fi', 'Thriller'];

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchGenre = selectedGenre === 'All' || b.genres.includes(selectedGenre);
      const matchSearch = !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGenre && matchSearch;
    });
  }, [books, selectedGenre, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 font-sans-clean">
            Books & Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete archive of original serialized novels and literature.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#12131c] border border-white/10 text-zinc-100 text-xs sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {genres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 shadow-md'
                  : 'bg-[#141520] hover:bg-[#1a1b2a] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Catalog Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              progress={progressMap[book.id]}
              isBookmarked={bookmarksMap[book.id]}
              onToggleBookmark={onToggleBookmark}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#12131b] border border-white/5 rounded-3xl space-y-2">
          <Layers className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">No books found</p>
          <p className="text-xs text-zinc-500">Try choosing a different genre or clearing your search.</p>
        </div>
      )}

    </div>
  );
};

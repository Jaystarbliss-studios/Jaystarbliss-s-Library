import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { BookCard } from '../components/BookCard';
import { Search, Layers, Sparkles, Star } from 'lucide-react';

interface GenresViewProps {
  books: Book[];
  onSelectBook: (slug: string) => void;
  onFilterGenre?: (genre: string) => void;
}

export const GenresView: React.FC<GenresViewProps> = ({
  books,
  onSelectBook
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const genres = [
    { name: 'Fantasy', count: '10 books', bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' },
    { name: 'Mystery', count: '8 books', bg: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=600&auto=format&fit=crop' },
    { name: 'Adventure', count: '16 books', bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Romance', count: '7 books', bg: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=600&auto=format&fit=crop' },
    { name: 'Sci-Fi', count: '6 books', bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop' },
    { name: 'Thriller', count: '5 books', bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop' }
  ];

  const filterChips = ['All', 'Fantasy', 'Mystery', 'Adventure', 'Romance', 'Sci-Fi', 'Thriller'];

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesGenre = selectedGenre === 'All' || b.genres.includes(selectedGenre);
      const matchesQuery = !searchQuery || 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesQuery;
    });
  }, [books, selectedGenre, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 font-sans-clean">
              Browse & Genres
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Explore stories categorized by tone, world, and literary atmosphere.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search genres or titles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#12131c] border border-white/10 text-zinc-100 text-xs sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterChips.map((chip) => {
            const isActive = selectedGenre === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedGenre(chip)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-md scale-102'
                    : 'bg-[#141520] hover:bg-[#1c1d2c] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Genres 2x3 Grid (Cards with visual cover textures) */}
      {selectedGenre === 'All' && !searchQuery && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-200 font-sans-clean">
            Popular Genres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {genres.map((g) => (
              <div
                key={g.name}
                onClick={() => setSelectedGenre(g.name)}
                className="group relative overflow-hidden h-32 sm:h-36 rounded-2xl sm:rounded-3xl bg-[#141520] border border-white/10 hover:border-teal-500/40 p-4 flex flex-col justify-end cursor-pointer shadow-lg transition-all duration-300 hover:scale-102"
              >
                <img
                  src={g.bg}
                  alt={g.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c12] via-[#0b0c12]/60 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-bold text-base text-white group-hover:text-teal-300 font-sans-clean transition-colors">
                    {g.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono-space">
                    {g.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured / Catalog Books List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-200 font-sans-clean">
            {selectedGenre === 'All' ? 'Featured Books' : `${selectedGenre} Books (${filteredBooks.length})`}
          </h2>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelectBook={onSelectBook}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#12131b] border border-white/5 rounded-3xl space-y-2">
            <Layers className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No books found for this selection</p>
            <p className="text-xs text-zinc-500">Try choosing another genre or clearing the search query.</p>
          </div>
        )}
      </section>

    </div>
  );
};

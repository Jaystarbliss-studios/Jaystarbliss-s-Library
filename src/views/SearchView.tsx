import React, { useState, useMemo } from 'react';
import { Book, Chapter } from '../types';
import { Search, BookOpen, Clock, X, ArrowRight } from 'lucide-react';
import { getBooks, getChapters } from '../lib/storage';

interface SearchViewProps {
  onSelectBook: (slug: string) => void;
  onSelectChapter: (slug: string, chapterNumber: number) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectBook,
  onSelectChapter
}) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'books' | 'chapters'>('all');

  const allBooks = useMemo(() => getBooks(), []);
  const allChapters = useMemo(() => getChapters(), []);

  // Filter books matching query
  const matchingBooks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allBooks.filter((b) => 
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.genres.some((g) => g.toLowerCase().includes(q))
    );
  }, [allBooks, query]);

  // Filter chapters matching query
  const matchingChapters = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allChapters.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );
  }, [allChapters, query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-sans-clean">
            Search Archive
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Find books, serialized chapters, authors, and genres.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, chapter name, or genre..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#12131c] border border-white/10 text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:border-teal-500 shadow-xl transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'books', 'chapters'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedType === type
                  ? 'bg-zinc-100 text-zinc-950 shadow-md'
                  : 'bg-[#141520] hover:bg-[#1a1b28] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {query.trim() ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Books Results */}
          {(selectedType === 'all' || selectedType === 'books') && matchingBooks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono-space text-zinc-400 uppercase tracking-wider px-1">
                Matching Books ({matchingBooks.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book.slug)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#12131b] hover:bg-[#171824] border border-white/5 hover:border-white/15 cursor-pointer transition-all group shadow-md"
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-xl shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-teal-300 truncate font-sans-clean">
                        {book.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 font-mono-space">
                          {book.publishedChapterCount} Ch.
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0 mr-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapters Results */}
          {(selectedType === 'all' || selectedType === 'chapters') && matchingChapters.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono-space text-zinc-400 uppercase tracking-wider px-1">
                Matching Chapters ({matchingChapters.length})
              </h2>
              <div className="divide-y divide-white/5 bg-[#12131b] rounded-2xl border border-white/5 overflow-hidden">
                {matchingChapters.map((ch) => {
                  const parentBook = allBooks.find((b) => b.id === ch.bookId);
                  return (
                    <div
                      key={ch.id}
                      onClick={() => parentBook && onSelectChapter(parentBook.slug, ch.chapterNumber)}
                      className="flex items-center justify-between p-4 hover:bg-[#171824] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono-space text-zinc-300 shrink-0">
                          {ch.chapterNumber}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-zinc-200 truncate">
                            {ch.title}
                          </h4>
                          <p className="text-xs text-zinc-500">
                            from <span className="text-zinc-400">{parentBook?.title || 'Library X'}</span>
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results */}
          {matchingBooks.length === 0 && matchingChapters.length === 0 && (
            <div className="text-center py-12 bg-[#12131b] rounded-3xl border border-white/5 space-y-2">
              <Search className="w-8 h-8 text-zinc-500 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No matching titles or chapters found</p>
              <p className="text-xs text-zinc-500">Try searching for different keywords or genres.</p>
            </div>
          )}

        </div>
      ) : (
        /* Search Suggestions */
        <div className="p-6 bg-[#12131b] rounded-3xl border border-white/5 space-y-3">
          <p className="text-xs font-mono-space text-zinc-400 uppercase tracking-wider">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {['The Whisper of Shadows', 'Echoes of Tomorrow', 'Fantasy', 'Sci-Fi', 'Jaystarbliss', 'Adventure'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3.5 py-1.5 rounded-full bg-[#181926] hover:bg-[#202232] text-xs text-zinc-300 hover:text-white border border-white/5 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

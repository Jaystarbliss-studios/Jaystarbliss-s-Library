import React, { useState } from 'react';
import { Book, Chapter } from '../types';
import { searchLibrary } from '../lib/storage';
import { Search, BookOpen, FileText, ChevronRight, X } from 'lucide-react';

interface SearchViewProps {
  onSelectBook: (slug: string) => void;
  onSelectChapter: (bookSlug: string, chapterNumber: number) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectBook,
  onSelectChapter
}) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const { books: matchedBooks, chapters: matchedChapters } = searchLibrary(query, {
    genre: selectedGenre !== 'all' ? selectedGenre : undefined
  });

  const popularTags = ['Autobiography', 'Memoir', 'Nigeria', 'Resilience', 'Survival', 'Identity', 'Backstory'];

  const hasSearched = query.trim().length > 0;
  const hasResults = matchedBooks.length > 0 || matchedChapters.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-calibri">
      
      {/* Header & Search Bar */}
      <div className="relative overflow-hidden bg-[#131319]/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 space-y-4 text-center max-w-3xl mx-auto shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-luminosity filter blur-xs"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=2000&q=80')` }}
        />
        <div className="relative z-10 space-y-2">
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            SEARCH ARCHIVE
          </h1>
          <p className="font-mono-space text-xs sm:text-sm text-zinc-400">
            QUERY TITLES, CHAPTERS, NARRATIVE THEMES, AND AUTHOR'S COMMENTARY
          </p>
        </div>

        {/* Big Search Input */}
        <div className="relative z-10 mt-4 max-w-xl mx-auto">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type book title, chapter, or theme..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0d0d12] border border-zinc-700/80 rounded-2xl pl-12 pr-10 py-3.5 text-sm font-mono-space text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 shadow-xl transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggested Search Prompts */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-[11px] font-mono-space text-zinc-400">SUGGESTED:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-0.5 bg-zinc-900 text-zinc-300 text-xs font-mono-space rounded-full border border-zinc-800 hover:border-zinc-600 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      <div className="space-y-10">
        
        {/* Books Results */}
        {matchedBooks.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-cinzel text-base font-bold tracking-widest text-zinc-300 uppercase pb-2 border-b border-zinc-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>MATCHED BOOKS ({matchedBooks.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book.slug)}
                  className="p-4 bg-[#121215] border border-zinc-800 hover:border-zinc-600 rounded-sm cursor-pointer transition-colors flex items-start gap-4 shadow-sm"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-16 h-22 object-cover rounded-sm border border-zinc-700 shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono-space text-emerald-400 uppercase tracking-widest">
                      {book.status}
                    </span>
                    <h3 className="font-cinzel text-base font-bold text-white truncate">
                      {book.title}
                    </h3>
                    <p className="font-mono-space text-[10px] text-rose-400 font-bold uppercase truncate">
                      {book.tagline}
                    </p>
                    <p className="font-cambria text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Chapters Results */}
        {matchedChapters.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-cinzel text-base font-bold tracking-widest text-zinc-300 uppercase pb-2 border-b border-zinc-800 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>MATCHED CHAPTERS ({matchedChapters.length})</span>
            </h2>

            <div className="divide-y divide-zinc-800/80 bg-[#121215] border border-zinc-800 rounded-sm">
              {matchedChapters.map(({ chapter, book }) => (
                <div
                  key={chapter.id}
                  onClick={() => onSelectChapter(book.slug, chapter.chapterNumber)}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-900/60 cursor-pointer transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono-space text-zinc-400 uppercase tracking-wider block">
                      {book.title} • CHAPTER {chapter.chapterNumber}
                    </span>
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-white truncate">
                      {chapter.title}
                    </h4>
                    {chapter.subtitle && (
                      <p className="font-cambria text-xs text-zinc-400 italic truncate">
                        {chapter.subtitle}
                      </p>
                    )}
                  </div>

                  <button className="px-3 py-1.5 bg-zinc-900 text-zinc-200 border border-zinc-700 text-xs font-mono-space rounded-sm shrink-0 flex items-center gap-1">
                    <span>READ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Thoughtful Empty States */}
        {hasSearched && !hasResults && (
          <div className="p-12 text-center bg-[#121215] border border-zinc-800 rounded-sm space-y-4 max-w-lg mx-auto">
            <Search className="w-8 h-8 text-zinc-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-white">
                NO STORIES FOUND FOR "{query}"
              </h3>
              <p className="font-cambria text-sm text-zinc-400 leading-relaxed">
                The library archive found no matching manuscripts or chapters. Try searching for broader terms like "Survival", "Nigeria", "Queen", or "Memoir".
              </p>
            </div>
            <button
              onClick={() => setQuery('')}
              className="px-4 py-2 bg-zinc-800 text-zinc-200 text-xs font-mono-space tracking-wider rounded-sm hover:bg-zinc-700"
            >
              CLEAR SEARCH
            </button>
          </div>
        )}

        {!hasSearched && (
          <div className="p-10 text-center text-zinc-400 font-mono-space text-xs space-y-2 border border-zinc-800/60 rounded-sm">
            <span>ENTER SEARCH KEYWORDS ABOVE TO QUERY THE LITERARY DATABASE</span>
          </div>
        )}

      </div>

    </div>
  );
};

import React from 'react';
import { Book, Chapter, ReadingProgress } from '../types';
import { BookHero } from '../components/BookHero';
import { BookCard } from '../components/BookCard';
import {
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Feather,
  ChevronRight
} from 'lucide-react';
import { LatestUpdateItem } from '../lib/storage';

interface HomeViewProps {
  featuredBook: Book;
  allBooks: Book[];
  latestUpdates: LatestUpdateItem[];
  progress?: ReadingProgress;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onStartReading: (chapterNumber: number) => void;
  onViewBook: (slug: string) => void;
  onSelectChapter: (bookSlug: string, chapterNumber: number) => void;
  onNavigate: (route: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  featuredBook,
  allBooks,
  latestUpdates,
  progress,
  isBookmarked,
  onToggleBookmark,
  onStartReading,
  onViewBook,
  onSelectChapter,
  onNavigate
}) => {
  return (
    <div className="space-y-14 sm:space-y-20 pb-16 font-calibri">
      
      {/* Hero Section Featuring TWO DECADES */}
      <BookHero
        book={featuredBook}
        progress={progress}
        isBookmarked={isBookmarked}
        onToggleBookmark={onToggleBookmark}
        onStartReading={onStartReading}
        onViewBook={onViewBook}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Latest Chapter Releases Section (Novel Updates Style Inspiration) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-white uppercase">
                  LATEST CHAPTER RELEASES
                </h2>
              </div>
              <p className="font-mono-space text-xs text-zinc-400 tracking-wider">
                CHRONOLOGICAL STREAM OF DAILY SERIALIZED RELEASES
              </p>
            </div>

            <button
              onClick={() => onNavigate('latest')}
              className="flex items-center gap-1.5 text-xs font-mono-space tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              <span>VIEW FULL STREAM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid of Latest Updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestUpdates.slice(0, 6).map(({ chapter, book, releaseDate }) => (
              <div
                key={chapter.id}
                onClick={() => onSelectChapter(book.slug, chapter.chapterNumber)}
                className="group p-4 bg-[#121215] border border-zinc-800/90 hover:border-zinc-600 rounded-sm cursor-pointer transition-all duration-200 flex items-start gap-4 shadow-sm"
              >
                {/* Book Thumbnail */}
                <div className="w-12 h-16 shrink-0 bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono-space text-zinc-400">
                    <span className="truncate max-w-[120px] uppercase">{book.title}</span>
                    <span className="text-emerald-400 shrink-0">
                      {new Date(releaseDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-cinzel text-sm font-bold text-white group-hover:text-zinc-200 transition-colors truncate">
                    Ch. {chapter.chapterNumber} — {chapter.title}
                  </h4>

                  {chapter.subtitle && (
                    <p className="font-cambria text-xs text-zinc-400 italic truncate">
                      {chapter.subtitle}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono-space text-zinc-400">
                    <span>{chapter.readingTimeMinutes} min read</span>
                    <span className="text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      READ <ChevronRight className="w-3 h-3 inline" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Works in the Library */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-300" />
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-white uppercase">
                  MANUSCRIPTS IN THE LIBRARY
                </h2>
              </div>
              <p className="font-mono-space text-xs text-zinc-400 tracking-wider">
                OFFICIAL AUTOBIOGRAPHICAL AND LITERARY CANON
              </p>
            </div>

            <button
              onClick={() => onNavigate('library')}
              className="flex items-center gap-1.5 text-xs font-mono-space tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              <span>BROWSE ARCHIVE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                progress={progress}
                isBookmarked={isBookmarked}
                onToggleBookmark={onToggleBookmark}
                onSelect={() => onViewBook(book.slug)}
              />
            ))}
          </div>
        </section>

        {/* Jaystarbliss Studios Publishing Philosophy / Manifesto */}
        <section className="p-8 sm:p-12 bg-gradient-to-r from-[#121216] via-[#15151b] to-[#121216] border border-zinc-800 rounded-sm shadow-xl">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-sm bg-zinc-900 border border-zinc-700 text-zinc-200">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
              A Personal Archive of Stories
            </h3>
            <p className="font-cambria text-base sm:text-lg text-zinc-300 leading-relaxed italic">
              "Jaystarbliss’s Library is not an impersonal storefront. It is a sovereign digital archive where serialized memoirs and written works are typeset with classical discipline, published with unwavering consistency, and shared without dilution."
            </p>
            <div className="pt-2 font-mono-space text-xs text-zinc-400 tracking-widest uppercase">
              JAYSTARBLISS STUDIOS • LAGOS, NIGERIA
            </div>
          </div>
        </section>

      </div>

    </div>
  );
};

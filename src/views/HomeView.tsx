import React from 'react';
import { Book, ReadingProgress } from '../types';
import { BookCard } from '../components/BookCard';
import { ArrowRight, BookOpen, Bookmark } from 'lucide-react';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';

interface HomeViewProps {
  allBooks: Book[];
  latestUpdates?: any[];
  progressMap: Record<string, ReadingProgress>;
  bookmarksMap: Record<string, boolean>;
  onToggleBookmark: (book: Book) => void;
  onViewBook: (slug: string) => void;
  onSelectChapter: (slug: string, chapterNumber: number) => void;
  onNavigate: (route: string) => void;
  firebaseUser?: User | SimpleAuthUser | null;
  onLoginWithGoogle: () => void;
  isAdmin?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  allBooks,
  progressMap,
  bookmarksMap,
  onToggleBookmark,
  onViewBook,
  onSelectChapter,
  onNavigate
}) => {
  const featuredBook = allBooks.find((b) => b.isFeatured) || allBooks[0];
  const trendingBooks = allBooks.slice(0, 6);

  const genresList = [
    { name: 'Fantasy', count: '10 books', bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop' },
    { name: 'Mystery', count: '8 books', bg: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=400&auto=format&fit=crop' },
    { name: 'Adventure', count: '16 books', bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop' },
    { name: 'Romance', count: '7 books', bg: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=400&auto=format&fit=crop' },
    { name: 'Sci-Fi', count: '6 books', bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop' },
    { name: 'Thriller', count: '5 books', bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14">
      
      {/* 1. HERO SECTION (Desktop 2-Col / Mobile Stacked) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#12131d] via-[#101119] to-[#0c0d14] border border-white/10 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Atmospheric Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 font-sans-clean leading-[1.1]">
              Great Stories <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-teal-200 bg-clip-text text-transparent">
                Live Here
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-zinc-400 max-w-lg leading-relaxed font-sans-clean">
              Discover serialized books, follow new releases, and immerse yourself in compelling stories.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onNavigate('library')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-sans-clean text-sm font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer"
              >
                <span>Browse Books</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('my-library')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1a1b28] hover:bg-[#222434] text-zinc-200 border border-white/10 font-sans-clean text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span>My Library</span>
              </button>
            </div>
          </div>

          {/* Right Hero Visual: Featured Book */}
          {featuredBook && (
            <div className="lg:col-span-5 flex justify-center items-center py-4">
              <div 
                onClick={() => onViewBook(featuredBook.slug)}
                className="relative group cursor-pointer"
              >
                {/* Flanking Book Shadows/Layers */}
                <div className="hidden sm:block absolute -left-10 top-6 w-36 h-52 rounded-2xl bg-[#161724] border border-white/5 opacity-40 -rotate-6 transform scale-90 blur-[1px]" />
                <div className="hidden sm:block absolute -right-10 top-6 w-36 h-52 rounded-2xl bg-[#161724] border border-white/5 opacity-40 rotate-6 transform scale-90 blur-[1px]" />

                {/* Main Hero Book Card */}
                <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 group-hover:border-teal-500/40 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                  <img
                    src={featuredBook.coverUrl}
                    alt={featuredBook.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <p className="text-[11px] font-medium text-teal-300 mb-0.5">
                      {featuredBook.author}
                    </p>
                    <h3 className="text-sm font-bold text-white line-clamp-1 font-sans-clean">
                      {featuredBook.title}
                    </h3>
                  </div>
                </div>

                {/* Slide Indicator Dots */}
                <div className="flex justify-center items-center gap-1.5 mt-4">
                  <span className="w-5 h-1.5 rounded-full bg-teal-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 2. TRENDING BOOKS SECTION */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-teal-400 to-indigo-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 font-sans-clean">
              Trending Books
            </h2>
          </div>

          <button
            onClick={() => onNavigate('library')}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-teal-400 transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {trendingBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              progress={progressMap[book.id]}
              isBookmarked={bookmarksMap[book.id]}
              onToggleBookmark={onToggleBookmark}
              onSelectBook={onViewBook}
              onSelectChapter={onSelectChapter}
            />
          ))}
        </div>
      </section>

      {/* 3. POPULAR GENRES SECTION */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-indigo-400 to-teal-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 font-sans-clean">
              Popular Genres
            </h2>
          </div>

          <button
            onClick={() => onNavigate('genres')}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-teal-400 transition-colors cursor-pointer"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {genresList.map((g) => (
            <div
              key={g.name}
              onClick={() => onNavigate('genres')}
              className="group relative overflow-hidden h-28 sm:h-32 rounded-2xl bg-[#141520] border border-white/5 hover:border-white/20 p-3.5 flex flex-col justify-end cursor-pointer shadow-md transition-all hover:scale-102"
            >
              <img
                src={g.bg}
                alt={g.name}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f17] via-[#0e0f17]/60 to-transparent" />
              
              <div className="relative z-10">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-teal-300 font-sans-clean">
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

    </div>
  );
};

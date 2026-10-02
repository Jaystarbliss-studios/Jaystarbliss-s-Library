import React, { useState } from 'react';
import { Book, Chapter, ReadingProgress } from '../types';
import { 
  BookOpen, 
  Bookmark, 
  FileText, 
  Calendar, 
  ChevronLeft, 
  Heart,
  Share2,
  Edit
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';
import { getReadingProgressForBook } from '../lib/storage';

interface BookDetailViewProps {
  book: Book;
  chapters: Chapter[];
  progress?: ReadingProgress;
  userId?: string;
  currentUser?: User | SimpleAuthUser | null;
  onSelectChapter: (chapterNumber: number) => void;
  onStartReading: (chapterNumber: number) => void;
  onBack?: () => void;
  onShowToast?: (msg: string, type: 'info' | 'success' | 'error') => void;
  isAdmin?: boolean;
  onEditBook?: (bookId: string) => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  chapters,
  progress,
  userId,
  currentUser,
  onSelectChapter,
  onStartReading,
  onBack,
  onShowToast,
  isAdmin = false,
  onEditBook
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'chapters' | 'reviews'>('about');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isAuthenticated = Boolean(currentUser);
  
  // Real-time lookup of user's reading progress for this book
  const activeProgress = progress || (userId ? getReadingProgressForBook(userId, book.id) : undefined) || getReadingProgressForBook('guest_user', book.id);
  const currentResumeChapter = activeProgress?.lastChapterNumber || 1;
  const isReading = Boolean(activeProgress && activeProgress.lastChapterNumber && activeProgress.lastChapterNumber > 0);

  // Derive total words from chapters
  const totalWords = chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  const formattedWords = totalWords > 0 ? `${Math.round(totalWords / 1000)}k Words` : '248k Words';
  const publishedYear = new Date(book.firstPublishedAt || book.createdAt).getFullYear() || 2024;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onShowToast?.('Book link copied to clipboard', 'info');
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      
      {/* Top Header Actions (Mobile back chevron, favorite, share) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141520] hover:bg-[#1a1c2a] text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors active:scale-95 cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && onEditBook && (
            <button
              onClick={() => onEditBook(book.id)}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Manuscript</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsFavorited(!isFavorited);
              onShowToast?.(isFavorited ? 'Removed from favorites' : 'Added to favorites', 'info');
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isFavorited
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                : 'bg-[#141520] hover:bg-[#1a1c2a] border-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Favorite"
          >
            <Heart className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#141520] hover:bg-[#1a1c2a] border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Book Hero / Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Book Cover */}
        <div className="md:col-span-5 lg:col-span-4 flex justify-center">
          <div className="relative w-56 sm:w-64 md:w-full max-w-xs aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Book Metadata & Synopsis */}
        <div className="md:col-span-7 lg:col-span-8 space-y-5">
          
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 font-sans-clean tracking-tight">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-1 font-medium">
              By {book.author}
            </p>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans-clean max-w-2xl">
            {book.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartReading(currentResumeChapter)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-sans-clean text-sm font-bold shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isReading ? `Continue Ch. ${currentResumeChapter}` : 'Start Reading'}</span>
            </button>

            <button
              onClick={() => {
                setIsSaved(!isSaved);
                onShowToast?.(isSaved ? 'Removed from your library' : 'Saved to My Library', 'info');
              }}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border font-sans-clean text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                isSaved
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : 'bg-[#181926] hover:bg-[#202232] text-zinc-200 border-white/10'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'In My Library' : 'Add to My Library'}</span>
            </button>
          </div>

          {/* Clean Metadata Info Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs font-mono-space text-zinc-400 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>{chapters.length || book.publishedChapterCount} Chapters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formattedWords}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Published {publishedYear}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Navigation: About / Chapters / Reviews */}
      <div className="border-b border-white/10">
        <div className="flex items-center gap-8">
          {(['about', 'chapters', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold capitalize transition-colors relative cursor-pointer ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT 1: ABOUT */}
      {activeTab === 'about' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="space-y-3 bg-[#12131b] p-6 rounded-3xl border border-white/5">
            <h3 className="text-base font-bold text-zinc-200 font-sans-clean">
              Publisher's Synopsis
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans-clean">
              {book.description}
            </p>
            {book.tagline && (
              <p className="text-xs italic text-teal-400/90 font-mono-space pt-2">
                "{book.tagline}"
              </p>
            )}
          </div>

          {/* Author Spotlight */}
          <div className="flex items-center gap-4 bg-[#12131b] p-6 rounded-3xl border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-md">
              J
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100 font-sans-clean">
                {book.author}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Author & Sovereign Creator at Jaystarbliss Studios. Serialized fiction, speculative fantasy, and digital archives.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CHAPTER ARCHIVE */}
      {activeTab === 'chapters' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs font-mono-space text-zinc-400">
              Showing {chapters.length} chapters (Chapters 1–10 free preview; Ch 11+ unlocked with Google)
            </p>
          </div>

          <div className="divide-y divide-white/5 bg-[#12131b] rounded-3xl border border-white/5 overflow-hidden">
            {chapters.map((ch) => {
              const isLocked = ch.chapterNumber >= 11 && !isAuthenticated && !isAdmin;
              const isCurrent = progress && progress.lastChapterNumber === ch.chapterNumber;

              return (
                <div
                  key={ch.id}
                  onClick={() => onSelectChapter(ch.chapterNumber)}
                  className={`flex items-center justify-between p-4 sm:p-5 hover:bg-[#181924] transition-colors cursor-pointer ${
                    isCurrent ? 'bg-teal-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono-space font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-teal-500 text-zinc-950 shadow-sm'
                        : 'bg-[#181926] text-zinc-400 border border-white/5'
                    }`}>
                      {ch.chapterNumber}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold truncate font-sans-clean ${
                          isCurrent ? 'text-teal-300' : 'text-zinc-200'
                        }`}>
                          {ch.title}
                        </h4>
                        {isLocked && (
                          <span className="text-[10px] font-mono-space text-amber-400/90 font-medium">
                            🔒 Locked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 font-mono-space mt-0.5">
                        {ch.readingTimeMinutes || 5} min read • {ch.wordCount || 1800} words
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-zinc-400 hover:text-white shrink-0">
                    Read →
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-8 bg-[#12131b] border border-white/5 rounded-3xl text-center space-y-3">
            <h3 className="text-base font-bold text-zinc-100 font-sans-clean">
              Reader Reviews & Discussion
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Read community thoughts, leave comments at the end of every chapter, and engage with Jaystarbliss readers.
            </p>
            <button
              onClick={() => onStartReading(1)}
              className="mt-2 px-6 py-2.5 rounded-2xl bg-[#181926] hover:bg-[#202234] border border-white/10 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
            >
              Start reading to join discussion
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

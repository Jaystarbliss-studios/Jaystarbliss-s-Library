import React, { useState, useEffect, useRef } from 'react';
import { Book, Chapter, ReaderPreferences } from '../types';
import { ReadingControls } from '../components/ReadingControls';
import { AuthorsThoughts } from '../components/AuthorsThoughts';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  Sliders,
  List,
  CheckCircle2,
  Share2,
  BookOpen
} from 'lucide-react';
import {
  saveReadingProgress,
  isBookmarked as checkIsBookmarked,
  toggleBookmark,
  getReaderPreferences,
  saveReaderPreferences
} from '../lib/storage';

interface ReaderViewProps {
  book: Book;
  chapter: Chapter;
  allChapters: Chapter[];
  userId: string;
  onNavigateChapter: (chapterNumber: number) => void;
  onBackToBook: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  chapter,
  allChapters,
  userId,
  onNavigateChapter,
  onBackToBook,
  onShowToast
}) => {
  const [preferences, setPreferences] = useState<ReaderPreferences>(getReaderPreferences());
  const [showControls, setShowControls] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(checkIsBookmarked(userId, book.id));
  const contentRef = useRef<HTMLDivElement>(null);

  // Sort published chapters in order
  const publishedChapters = [...allChapters]
    .filter((c) => c.status === 'published')
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const prevChapter = publishedChapters.find((c) => c.chapterNumber === chapter.chapterNumber - 1);
  const nextChapter = publishedChapters.find((c) => c.chapterNumber === chapter.chapterNumber + 1);

  // Track scroll depth and save reading progress
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(100);
        return;
      }

      const currentScroll = window.scrollY;
      const percent = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setScrollProgress(percent);

      // Save reading progress debounced
      saveReadingProgress(userId, book, chapter, percent, currentScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial record
    saveReadingProgress(userId, book, chapter, 0, 0);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [book, chapter, userId]);

  // Handle preference updates
  const handleUpdatePreferences = (updated: Partial<ReaderPreferences>) => {
    const newPrefs = { ...preferences, ...updated };
    setPreferences(newPrefs);
    saveReaderPreferences(newPrefs);
  };

  const handleToggleBookmark = () => {
    const bookmarkedNow = toggleBookmark(userId, book);
    setIsBookmarked(bookmarkedNow);
    onShowToast(
      bookmarkedNow ? `Added "${book.title}" to My Library` : `Removed "${book.title}" from My Library`,
      'info'
    );
  };

  // Font size class mapping
  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-loose',
    '2xl': 'text-2xl leading-loose'
  };

  // Column width class mapping
  const widthClasses = {
    narrow: 'max-w-2xl',
    standard: 'max-w-3xl',
    wide: 'max-w-4xl'
  };

  // Theme styling mapping
  const themeStyles = {
    light: {
      wrapper: 'bg-[#0f0f12]',
      pageSheet: 'bg-[#ffffff] text-[#18181b] border-zinc-300/80 shadow-2xl',
      headerBorder: 'border-zinc-300',
      metaText: 'text-zinc-500',
      ruleColor: 'border-zinc-300',
      prose: 'text-[#1c1c20]'
    },
    sepia: {
      wrapper: 'bg-[#231e18]',
      pageSheet: 'bg-[#f7f0df] text-[#2b2219] border-[#e2d6b9] shadow-2xl',
      headerBorder: 'border-[#dfd1b3]',
      metaText: 'text-[#7d6951]',
      ruleColor: 'border-[#dfd1b3]',
      prose: 'text-[#2e241b]'
    },
    dark: {
      wrapper: 'bg-[#09090b]',
      pageSheet: 'bg-[#121216] text-[#e4e4e7] border-zinc-800 shadow-2xl',
      headerBorder: 'border-zinc-800',
      metaText: 'text-zinc-400',
      ruleColor: 'border-zinc-800',
      prose: 'text-[#dedee3]'
    }
  };

  const currentThemeStyle = themeStyles[preferences.theme];

  return (
    <div className={`min-h-screen ${currentThemeStyle.wrapper} transition-colors duration-200`}>
      
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-zinc-400 dark:bg-zinc-200 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Sticky Header Controls */}
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0d]/95 backdrop-blur-md border-b border-zinc-800/90 text-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Left: Back to Book */}
          <button
            onClick={onBackToBook}
            className="flex items-center gap-1.5 text-xs font-mono-space tracking-wider text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">TABLE OF CONTENTS</span>
            <span className="sm:hidden">TOC</span>
          </button>

          {/* Center: Current Chapter Title */}
          <div className="text-center truncate px-3 max-w-[200px] sm:max-w-md">
            <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wider text-white block truncate">
              CH. {chapter.chapterNumber}: {chapter.title}
            </span>
            <span className="font-mono-space text-[10px] text-zinc-400 tracking-widest uppercase block">
              {book.title}
            </span>
          </div>

          {/* Right: Quick Chapter Switcher & Reader Preferences */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Prev / Next Chapter Buttons */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-sm">
              <button
                disabled={!prevChapter}
                onClick={() => prevChapter && onNavigateChapter(prevChapter.chapterNumber)}
                className={`p-1.5 transition-colors ${
                  prevChapter ? 'text-zinc-300 hover:text-white' : 'text-zinc-400 cursor-not-allowed'
                }`}
                title={prevChapter ? `Previous: ${prevChapter.title}` : 'First chapter'}
                aria-label="Previous Chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowChapterDrawer(!showChapterDrawer)}
                className="px-2 py-1 text-[11px] font-mono-space text-zinc-300 hover:text-white border-x border-zinc-800"
                title="Select chapter from list"
              >
                {chapter.chapterNumber} / {publishedChapters.length}
              </button>

              <button
                disabled={!nextChapter}
                onClick={() => nextChapter && onNavigateChapter(nextChapter.chapterNumber)}
                className={`p-1.5 transition-colors ${
                  nextChapter ? 'text-zinc-300 hover:text-white' : 'text-zinc-400 cursor-not-allowed'
                }`}
                title={nextChapter ? `Next: ${nextChapter.title}` : 'Latest released chapter'}
                aria-label="Next Chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-sm border transition-colors ${
                isBookmarked
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/60'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Add to My Library'}
              aria-label="Toggle Bookmark"
            >
              <BookmarkIcon className="w-4 h-4 fill-current" />
            </button>

            {/* Reading Preferences Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowControls(!showControls)}
                className={`p-2 rounded-sm border transition-colors ${
                  showControls
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                }`}
                title="Reading Settings (Font, Size, Theme)"
                aria-label="Reading Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showControls && (
                <div className="absolute right-0 top-12 z-50 animate-in fade-in slide-in-from-top-2">
                  <ReadingControls
                    preferences={preferences}
                    onChangePreferences={handleUpdatePreferences}
                    onClose={() => setShowControls(false)}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Quick Chapter Selector Drawer Popover */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181c] border border-zinc-700 max-w-md w-full rounded-sm max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold tracking-widest text-zinc-100">
                {book.title} • CHAPTER INDEX
              </span>
              <button
                onClick={() => setShowChapterDrawer(false)}
                className="text-xs font-mono-space text-zinc-400 hover:text-white"
              >
                CLOSE
              </button>
            </div>

            <div className="divide-y divide-zinc-800/80 overflow-y-auto p-2">
              {publishedChapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    onNavigateChapter(ch.chapterNumber);
                    setShowChapterDrawer(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-sm flex items-center justify-between text-xs transition-colors ${
                    ch.chapterNumber === chapter.chapterNumber
                      ? 'bg-zinc-800 text-white font-bold border-l-2 border-emerald-400'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono-space text-zinc-400 shrink-0">
                      CH. {ch.chapterNumber < 10 ? `0${ch.chapterNumber}` : ch.chapterNumber}
                    </span>
                    <span className="font-cinzel truncate">{ch.title}</span>
                  </div>
                  <span className="font-mono-space text-[10px] text-zinc-400 shrink-0">
                    {ch.readingTimeMinutes}m
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Literary Page Container (Interior Manuscript Layout) */}
      <main ref={contentRef} className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className={`mx-auto ${widthClasses[preferences.readingWidth]} ${currentThemeStyle.pageSheet} rounded-sm p-6 sm:p-12 md:p-16 transition-all duration-200 border`}>
          
          {/* Interior Book Header Structure */}
          <div className={`pb-8 mb-8 border-b ${currentThemeStyle.headerBorder} text-center space-y-4`}>
            
            {/* Publisher / Archival Tagline */}
            <div className={`font-mono-space text-[10px] sm:text-xs tracking-[0.25em] uppercase ${currentThemeStyle.metaText}`}>
              JAYSTARBLISS STUDIOS • OFFICIAL MANUSCRIPT
            </div>

            {/* Book Title */}
            <h2 className="font-cinzel text-xl sm:text-2xl font-black tracking-widest uppercase">
              {book.title}
            </h2>

            {/* Chapter Header Block */}
            <div className="pt-2 space-y-2">
              <div className="inline-block px-3 py-1 font-mono-space text-xs font-bold tracking-widest uppercase bg-black/5 dark:bg-white/5 rounded-sm border border-current/20">
                CHAPTER {chapter.chapterNumber}
              </div>
              <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-tight uppercase">
                {chapter.title}
              </h1>
              {chapter.subtitle && (
                <p className="font-cambria text-base sm:text-lg italic opacity-80 max-w-xl mx-auto">
                  {chapter.subtitle}
                </p>
              )}
            </div>

            {/* Manuscript Metadata */}
            <div className={`flex items-center justify-center gap-4 text-[11px] font-mono-space ${currentThemeStyle.metaText} pt-2`}>
              <span>{chapter.wordCount} WORDS</span>
              <span>•</span>
              <span>APPROX. {chapter.readingTimeMinutes} MIN READ</span>
              {chapter.publishedAt && (
                <>
                  <span>•</span>
                  <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>

          </div>

          {/* Dedicated "Author's Thoughts..." Editorial Layer */}
          {preferences.showAuthorsThoughts && chapter.authorsThoughts && (
            <div className="mb-10">
              <AuthorsThoughts
                content={chapter.authorsThoughts}
                authorName={book.author}
                mode="sidebar"
              />
            </div>
          )}

          {/* Chapter Narrative Body */}
          <article
            className={`prose prose-zinc max-w-none ${fontSizeClasses[preferences.fontSize]} ${
              preferences.fontFamily === 'cambria' ? 'font-cambria' : 'font-calibri'
            } ${currentThemeStyle.prose} space-y-5`}
          >
            <div
              className="drop-cap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          </article>

          {/* End of Chapter Ornament */}
          <div className="my-12 text-center">
            <span className="font-cinzel text-lg tracking-[0.3em] opacity-40">
              — ❦ —
            </span>
          </div>

          {/* Bottom Chapter Navigation Bar */}
          <div className={`pt-8 border-t ${currentThemeStyle.ruleColor} flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-space text-xs`}>
            
            {prevChapter ? (
              <button
                onClick={() => onNavigateChapter(prevChapter.chapterNumber)}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-current/20 rounded-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <div className="text-left">
                  <span className="block text-[10px] opacity-60">PREVIOUS CHAPTER</span>
                  <span className="block font-bold truncate max-w-[180px]">
                    Ch. {prevChapter.chapterNumber}: {prevChapter.title}
                  </span>
                </div>
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <button
              onClick={onBackToBook}
              className="px-4 py-2 text-center text-xs font-bold tracking-widest border border-current/20 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              TABLE OF CONTENTS
            </button>

            {nextChapter ? (
              <button
                onClick={() => onNavigateChapter(nextChapter.chapterNumber)}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-2 px-4 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-current/20 rounded-sm transition-colors"
              >
                <div className="text-right">
                  <span className="block text-[10px] opacity-60">NEXT CHAPTER</span>
                  <span className="block font-bold truncate max-w-[180px]">
                    Ch. {nextChapter.chapterNumber}: {nextChapter.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3 text-center sm:text-right text-[11px] opacity-70">
                You have caught up with all released chapters!
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
};

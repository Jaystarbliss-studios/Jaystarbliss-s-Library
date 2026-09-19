import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';
import { Book, Chapter, ReaderPreferences } from '../types';
import { ReadingControls } from '../components/ReadingControls';
import { AuthorsThoughts } from '../components/AuthorsThoughts';
import { ChapterComments } from '../components/ChapterComments';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  Sliders,
  CheckCircle2,
  Share2,
  BookOpen,
  X,
  Bell
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
  currentUser: User | SimpleAuthUser | null;
  onNavigateChapter: (chapterNumber: number) => void;
  onBackToBook: () => void;
  onLoginWithGoogle: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  chapter,
  allChapters,
  userId,
  currentUser,
  onNavigateChapter,
  onBackToBook,
  onLoginWithGoogle,
  onShowToast
}) => {
  const [preferences, setPreferences] = useState<ReaderPreferences>(getReaderPreferences());
  const [showControls, setShowControls] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(checkIsBookmarked(userId, book.id));
  const contentRef = useRef<HTMLDivElement>(null);

  // Keep bookmark state in sync
  useEffect(() => {
    setIsBookmarked(checkIsBookmarked(userId, book.id));
  }, [userId, book.id]);

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

      saveReadingProgress(userId, book, chapter, percent, currentScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
    const bookmarkedNow = toggleBookmark(userId, book, currentUser?.email || undefined);
    setIsBookmarked(bookmarkedNow);
    onShowToast(
      bookmarkedNow
        ? `Added "${book.title}" to My Shelf • Email alerts enabled`
        : `Removed "${book.title}" from My Shelf`,
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

  // Font family class mapping
  const fontClasses: Record<string, string> = {
    merriweather: 'font-merriweather',
    lora: 'font-lora',
    inter: 'font-inter',
    roboto: 'font-roboto',
    garamond: 'font-garamond',
    newsreader: 'font-newsreader',
    cambria: 'font-cambria',
    sans: 'font-sans-clean',
    mono: 'font-mono-space'
  };

  const currentFontFamilyStyle: React.CSSProperties['fontFamily'] = {
    merriweather: '"Merriweather", Georgia, serif',
    lora: '"Lora", Georgia, serif',
    inter: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    roboto: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    garamond: '"EB Garamond", Georgia, serif',
    newsreader: '"Newsreader", Georgia, serif',
    cambria: 'Cambria, Georgia, serif',
    sans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Space Mono", monospace'
  }[preferences.fontFamily] || 'Merriweather, Georgia, serif';

  // Theme styling mapping (softened, easy on reader eyes)
  const themeStyles = {
    light: {
      wrapper: 'bg-[#f4efe8]',
      pageSheet: 'bg-[#ffffff] text-[#1c1c20] border-zinc-200 shadow-xl shadow-zinc-300/40',
      headerBg: 'bg-[#ffffff]/95 border-zinc-200 text-zinc-800',
      headerBorder: 'border-zinc-200',
      metaText: 'text-zinc-500',
      ruleColor: 'border-zinc-200',
      prose: 'text-[#1c1c20]',
      buttonBg: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
    },
    sepia: {
      wrapper: 'bg-[#221c16]',
      pageSheet: 'bg-[#f7f0e1] text-[#2c2217] border-[#e4d7be] shadow-2xl shadow-black/40',
      headerBg: 'bg-[#1c1712]/95 border-[#3d3124] text-[#e6dcc8]',
      headerBorder: 'border-[#e4d7be]',
      metaText: 'text-[#7d684d]',
      ruleColor: 'border-[#dfd0b2]',
      prose: 'text-[#2c2217]',
      buttonBg: 'bg-[#2d241c] hover:bg-[#382d23] text-[#e6dcc8] border-[#4a3b2b]'
    },
    dark: {
      wrapper: 'bg-[#0e0e13]',
      pageSheet: 'bg-[#15151c] text-[#dededc] border-zinc-800/80 shadow-2xl shadow-black/60',
      headerBg: 'bg-[#0d0d12]/95 border-zinc-800/80 text-zinc-200',
      headerBorder: 'border-zinc-800/80',
      metaText: 'text-zinc-400',
      ruleColor: 'border-zinc-800/80',
      prose: 'text-[#f4f6fb]',
      buttonBg: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
    },
    obsidian: {
      wrapper: 'bg-[#070709]',
      pageSheet: 'bg-[#0f0f13] text-[#d6d6d8] border-zinc-800/70 shadow-2xl shadow-black/90',
      headerBg: 'bg-[#08080b]/95 border-zinc-800 text-zinc-300',
      headerBorder: 'border-zinc-800',
      metaText: 'text-zinc-500',
      ruleColor: 'border-zinc-800',
      prose: 'text-[#d6d6d8]',
      buttonBg: 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
    }
  };

  const currentThemeStyle = themeStyles[preferences.theme] || themeStyles.dark;
  const currentFontClass = fontClasses[preferences.fontFamily] || 'font-cambria';

  // Reading themes are intentionally resolved here rather than trusting old
  // saved custom colors. This prevents a stale low-contrast text color from
  // surviving a theme switch.
  const resolvedTheme = preferences.theme === 'obsidian' ? 'dark' : preferences.theme;
  const themePalette = {
    light: { page: '#ffffff', text: '#17181c', wrapper: '#f1f3f6' },
    sepia: { page: '#f4ecd8', text: '#2b2117', wrapper: '#2b241d' },
    dark: { page: '#151922', text: '#f4f6fb', wrapper: '#080b10' }
  } as const;
  const activePalette = themePalette[resolvedTheme as keyof typeof themePalette] || themePalette.dark;
  const customPageColor = activePalette.page;
  const customTextColor = activePalette.text;
  const customWrapperBg = activePalette.wrapper;
  const isDarkPage = resolvedTheme === 'dark';

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: customWrapperBg }}
    >
      
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-amber-400/80 dark:bg-amber-300/80 transition-all duration-150 rounded-r-full"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Sticky Header Controls */}
      <header 
        className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors"
        style={{
          backgroundColor: isDarkPage ? 'rgba(13, 13, 18, 0.95)' : 'rgba(250, 248, 245, 0.95)',
          borderColor: isDarkPage ? 'rgba(63, 63, 70, 0.5)' : 'rgba(228, 228, 231, 0.8)',
          color: isDarkPage ? '#f4f4f5' : '#18181b'
        }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2">
          
          {/* Left: Back to Book */}
          <button
            onClick={onBackToBook}
            className="shrink-0 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95"
            aria-label="Back to book"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Center: Current Chapter Title */}
          <div className="min-w-0 flex-1 text-center truncate px-1 sm:px-3 max-w-[190px] sm:max-w-md mx-auto">
            <span className="font-cinzel text-[10px] sm:text-xs font-bold tracking-wide block truncate">
              CH. {chapter.chapterNumber}: {chapter.title}
            </span>
            {chapter.subtitle && (
              <span className="font-cambria text-[9px] sm:text-[10px] italic opacity-65 block truncate">
                {chapter.subtitle}
              </span>
            )}
          </div>

          {/* Right: Quick Chapter Switcher & Reader Preferences */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            
            {/* Compact chapter navigation */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                disabled={!prevChapter}
                onClick={() => prevChapter && onNavigateChapter(prevChapter.chapterNumber)}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  prevChapter ? 'hover:bg-black/10 dark:hover:bg-white/10' : 'opacity-25 cursor-not-allowed'
                }`}
                title={prevChapter ? `Previous: ${prevChapter.title}` : 'First chapter'}
                aria-label="Previous Chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={!nextChapter}
                onClick={() => nextChapter && onNavigateChapter(nextChapter.chapterNumber)}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  nextChapter ? 'hover:bg-black/10 dark:hover:bg-white/10' : 'opacity-25 cursor-not-allowed'
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
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm'
                  : currentThemeStyle.buttonBg
              }`}
              title={isBookmarked ? 'Bookmarked in My Shelf' : 'Add to My Shelf (Auto-alerts)'}
              aria-label="Toggle Bookmark"
            >
              <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Reading Preferences Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowControls(!showControls)}
                className={`p-2 rounded-xl border transition-all active:scale-95 ${
                  showControls
                    ? 'bg-zinc-800 text-white border-zinc-600 ring-2 ring-amber-400/30'
                    : currentThemeStyle.buttonBg
                }`}
                title="Reading Settings (Font, Size, Theme)"
                aria-label="Reading Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showControls && (
                <div className="absolute right-0 top-13 z-50 animate-in fade-in slide-in-from-top-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#181822] border border-zinc-700/80 max-w-md w-full rounded-2xl max-h-[82vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-cinzel text-sm font-bold tracking-wider text-zinc-100 block">
                  {book.title}
                </span>
                <span className="font-mono-space text-[10px] text-zinc-400">
                  Select a chapter to jump directly
                </span>
              </div>
              <button
                onClick={() => setShowChapterDrawer(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
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
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between text-xs transition-all my-0.5 ${
                    ch.chapterNumber === chapter.chapterNumber
                      ? 'bg-amber-500/15 text-amber-200 font-bold border border-amber-500/30'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono-space text-zinc-400 text-[11px] shrink-0">
                      CH. {ch.chapterNumber < 10 ? `0${ch.chapterNumber}` : ch.chapterNumber}
                    </span>
                    <span className="font-cinzel truncate text-sm">{ch.title}</span>
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
      <main ref={contentRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div 
          className={`mx-auto ${widthClasses[preferences.readingWidth]} rounded-3xl p-5 sm:p-12 md:p-16 transition-all duration-300 border shadow-2xl`}
          style={{
            backgroundColor: customPageColor,
            color: customTextColor,
            borderColor: isDarkPage ? 'rgba(63, 63, 70, 0.4)' : 'rgba(215, 215, 222, 0.7)'
          }}
        >
          
          {/* Chapter Narrative Body */}
          <article
            className={`reader-content-font prose max-w-none [&_*]:!text-inherit ${fontSizeClasses[preferences.fontSize]} ${currentFontClass} space-y-5`}
            style={{ color: customTextColor, fontFamily: currentFontFamilyStyle }}
          >
            <div
              className="drop-cap leading-relaxed"
              style={{ color: customTextColor, '--reader-text-color': customTextColor } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          </article>

          {/* Author's Thoughts intentionally comes after the narrative so the reader
              reaches the reflection only after experiencing the chapter. */}
          {preferences.showAuthorsThoughts && chapter.authorsThoughts && (
            <div className="mt-12 mb-8">
              <AuthorsThoughts
                content={chapter.authorsThoughts}
                authorName={book.author}
                mode="sidebar"
              />
            </div>
          )}

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
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-current/20 rounded-2xl transition-all active:scale-95"
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
              className="px-5 py-2.5 text-center text-xs font-bold tracking-widest border border-current/20 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
            >
              TABLE OF CONTENTS
            </button>

            {nextChapter ? (
              <button
                onClick={() => onNavigateChapter(nextChapter.chapterNumber)}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-2.5 px-4 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-current/20 rounded-2xl transition-all active:scale-95"
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

          {/* Reader Chapter Comments Section (Directly uploaded to Firebase for all readers) */}
          <ChapterComments
            chapterId={chapter.id}
            bookId={book.id}
            chapterNumber={chapter.chapterNumber}
            currentUser={currentUser}
            onLoginWithGoogle={onLoginWithGoogle}
            onShowToast={onShowToast}
          />

        </div>
      </main>

    </div>
  );
};

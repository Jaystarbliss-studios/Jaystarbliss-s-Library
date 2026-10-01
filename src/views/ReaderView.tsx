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
  MessageSquare,
  X
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
  const [showComments, setShowComments] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(checkIsBookmarked(userId, book.id));
  const contentRef = useRef<HTMLDivElement>(null);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartFontSizeRef = useRef<ReaderPreferences['fontSize']>('base');
  const pinchLastIndexRef = useRef<number>(1);

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

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.email === 'johnrufai242@gmail.com' || (currentUser as any)?.role === 'admin';
  const isLocked = chapter.chapterNumber >= 11 && !isAuthenticated && !isAdmin;
  const previewContent = chapter.teaserContent || chapter.content;

  // Track scroll depth and save reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(100);
        return;
      }
      const currentScroll = window.scrollY;
      const percent = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
      setScrollProgress(percent);

      if (percent > 3 && !isLocked) {
        saveReadingProgress(userId, book, chapter, percent, currentScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (!isLocked) {
      saveReadingProgress(userId, book, chapter, 0, 0);
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [book, chapter, userId, isLocked]);

  // Handle preference updates
  const handleUpdatePreferences = (updated: Partial<ReaderPreferences>) => {
    const newPrefs = { ...preferences, ...updated };
    setPreferences(newPrefs);
    saveReaderPreferences(newPrefs);
  };

  const handleToggleBookmark = async () => {
    const bookmarkedNow = await toggleBookmark(userId, book, currentUser?.email || undefined);
    setIsBookmarked(bookmarkedNow);
    onShowToast(
      bookmarkedNow
        ? `Added "${book.title}" to My Library`
        : `Removed "${book.title}" from My Library`,
      'info'
    );
  };

  // Typography scale
  const readerFontSizes: Record<ReaderPreferences['fontSize'], { size: string; lineHeight: number }> = {
    sm: { size: '16px', lineHeight: 1.7 },
    base: { size: '18px', lineHeight: 1.78 },
    lg: { size: '21px', lineHeight: 1.82 },
    xl: { size: '25px', lineHeight: 1.86 },
    '2xl': { size: '30px', lineHeight: 1.9 }
  };

  const activeTypography = readerFontSizes[preferences.fontSize] || readerFontSizes.base;
  const fontSizeOrder: ReaderPreferences['fontSize'][] = ['sm', 'base', 'lg', 'xl', '2xl'];
  const fontSizeIndex = fontSizeOrder.indexOf(preferences.fontSize);

  const distanceBetweenTouches = (touches: React.TouchList | TouchList) => {
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleReaderTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 2) return;
    pinchStartDistanceRef.current = distanceBetweenTouches(event.touches);
    pinchStartFontSizeRef.current = preferences.fontSize;
    pinchLastIndexRef.current = fontSizeIndex;
  };

  const handleReaderTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 2 || pinchStartDistanceRef.current === null) return;
    const currentDistance = distanceBetweenTouches(event.touches);
    const ratio = currentDistance / pinchStartDistanceRef.current;

    let nextIndex = fontSizeOrder.indexOf(pinchStartFontSizeRef.current);
    if (ratio >= 1.12) nextIndex += Math.min(2, Math.floor((ratio - 1) / 0.12));
    if (ratio <= 0.88) nextIndex -= Math.min(2, Math.floor((1 - ratio) / 0.12));
    nextIndex = Math.max(0, Math.min(fontSizeOrder.length - 1, nextIndex));

    if (nextIndex !== pinchLastIndexRef.current) {
      pinchLastIndexRef.current = nextIndex;
      handleUpdatePreferences({ fontSize: fontSizeOrder[nextIndex] });
    }
  };

  const handleReaderTouchEnd = () => {
    pinchStartDistanceRef.current = null;
  };

  // Font family styles
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
  }[preferences.fontFamily] || '"Merriweather", Georgia, serif';

  // High contrast color palettes for immersive reading
  const resolvedTheme = preferences.theme === 'obsidian' ? 'dark' : (preferences.theme || 'dark');
  const themePalette = {
    light: { page: '#ffffff', text: '#111317', wrapper: '#f3eee7', border: '#e2e8f0' },
    sepia: { page: '#f4ecd8', text: '#2b2117', wrapper: '#221c16', border: '#e4d7be' },
    dark: { page: '#11131a', text: '#f4f6fb', wrapper: '#09090d', border: '#27272a' }
  } as const;

  const activePalette = themePalette[resolvedTheme as keyof typeof themePalette] || themePalette.dark;
  const customPageColor = preferences.pageColor || activePalette.page;
  const customTextColor = preferences.textColor || activePalette.text;
  const customWrapperBg = activePalette.wrapper;

  return (
    <div
      className="min-h-screen transition-colors duration-300 relative flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-200"
      style={{ backgroundColor: customWrapperBg, color: customTextColor }}
    >
      {/* Scroll Progress Bar at Top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-teal-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Minimalist Back Button (Top Left) */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={onBackToBook}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-white border border-white/10 shadow-lg text-xs font-semibold transition-all active:scale-95"
          aria-label="Back to book"
          title="Back to Book Overview"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Floating Minimalist Comments Toggle (Top Right) */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setShowComments(true)}
          className="p-2.5 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-white border border-white/10 shadow-lg transition-all active:scale-95"
          aria-label="Chapter comments"
          title="Chapter Comments"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>

      {/* Reading Controls Modal / Popover */}
      {showControls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative">
            <ReadingControls
              preferences={preferences}
              onChangePreferences={handleUpdatePreferences}
              onClose={() => setShowControls(false)}
            />
          </div>
        </div>
      )}

      {/* Full Viewport Reading Canvas (Clean, Distraction-Free Manuscript) */}
      <main
        ref={contentRef}
        className="w-full flex-1 px-0 py-0"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleReaderTouchStart}
        onTouchMove={handleReaderTouchMove}
        onTouchEnd={handleReaderTouchEnd}
      >
        <div
          className="w-full min-h-screen px-5 pt-16 pb-32 sm:px-10 sm:pt-20 lg:px-16 transition-colors duration-300"
          style={{
            backgroundColor: customPageColor,
            color: customTextColor
          }}
        >
          {/* Chapter Narrative Body */}
          <article
            className="reader-content-font prose mx-auto w-full max-w-[80ch]"
            style={{
              color: customTextColor,
              fontFamily: currentFontFamilyStyle,
              fontSize: activeTypography.size,
              lineHeight: activeTypography.lineHeight,
              ['--reader-font-family' as string]: currentFontFamilyStyle,
              ['--reader-font-size' as string]: activeTypography.size,
              ['--reader-line-height' as string]: activeTypography.lineHeight,
              ['--reader-text-color' as string]: customTextColor
            } as React.CSSProperties}
          >
            <div
              className={isLocked ? 'relative' : 'drop-cap'}
              style={{ color: customTextColor, '--reader-text-color': customTextColor } as React.CSSProperties}
            >
              <div dangerouslySetInnerHTML={{ __html: isLocked ? previewContent : chapter.content }} />

              {/* Locked Chapter Preview for Chapter 11+ */}
              {isLocked && (
                <div className="relative mt-0 -mx-1">
                  <div
                    className="pointer-events-none h-32 -mt-24 relative z-10"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, ${customPageColor} 88%, ${customPageColor} 100%)`
                    }}
                  />
                  <div className="relative z-20 -mt-6 rounded-3xl border border-amber-500/30 bg-[#12131c] px-6 py-8 sm:px-10 sm:py-9 text-center shadow-2xl backdrop-blur-md">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xl shadow-md">
                      🔒
                    </div>
                    <p className="font-mono-space text-xs uppercase tracking-widest text-amber-300 font-semibold">
                      Chapter {chapter.chapterNumber} is locked
                    </p>
                    <h2 className="mt-2 font-sans-clean text-xl sm:text-2xl font-bold text-zinc-100">
                      Continue reading
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-zinc-400 font-sans-clean">
                      You're reading the public preview. Sign in with Google to unlock the complete chapter and all serialized chapters from Chapter 11 onward.
                    </p>
                    <button
                      onClick={onLoginWithGoogle}
                      className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-xs font-bold tracking-wider text-zinc-950 hover:bg-zinc-100 transition-all active:scale-95 shadow-xl cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>SIGN IN WITH GOOGLE</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Author's Thoughts */}
          {!isLocked && preferences.showAuthorsThoughts && chapter.authorsThoughts && (
            <div className="max-w-[80ch] mx-auto mt-12 mb-8">
              <AuthorsThoughts
                content={chapter.authorsThoughts}
                authorName={book.author}
                mode="sidebar"
              />
            </div>
          )}

          {/* End of Chapter Flourish */}
          <div className="my-10 text-center">
            <span className="text-sm tracking-[0.3em] opacity-40">
              — ❦ —
            </span>
          </div>

          {/* Bottom Spacing so content is not obscured by the floating island */}
          <div className="h-28" />
        </div>
      </main>

      {/* Floating Reader Navigation Island at Bottom */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto pointer-events-none">
        <div className="pointer-events-auto bg-[#0e0f17]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-2.5 shadow-2xl space-y-1.5">
          
          {/* Top Row: < Previous | Chapter Name & % Progress Bar | Next > */}
          <div className="flex items-center justify-between px-2 py-1 bg-[#151622] rounded-2xl border border-white/5">
            <button
              onClick={() => prevChapter && onNavigateChapter(prevChapter.chapterNumber)}
              disabled={!prevChapter}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                prevChapter ? 'text-zinc-200 hover:text-white' : 'text-zinc-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Center Chapter & Progress */}
            <div className="flex flex-col items-center min-w-0 px-2">
              <span className="text-[11px] font-bold text-zinc-200 font-sans-clean truncate">
                Chapter {chapter.chapterNumber}
              </span>
              <div className="flex items-center gap-1.5 w-24 sm:w-28 mt-0.5">
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono-space text-zinc-400">
                  {scrollProgress}%
                </span>
              </div>
            </div>

            <button
              onClick={() => nextChapter && onNavigateChapter(nextChapter.chapterNumber)}
              disabled={!nextChapter}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                nextChapter ? 'text-zinc-200 hover:text-white' : 'text-zinc-600 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Row: Bookmark & Settings Controls */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleToggleBookmark}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-[#151622] hover:bg-[#1c1d2c] text-zinc-300 border border-white/5'
              }`}
            >
              <BookmarkIcon className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={() => setShowControls(true)}
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#151622] hover:bg-[#1c1d2c] text-zinc-300 border border-white/5 text-xs font-medium transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

        </div>
      </div>

      {/* Chapter Comments Drawer */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowComments(false)} />
          <div className="relative w-full max-w-md bg-[#0f1017] h-full p-6 shadow-2xl border-l border-white/10 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-bold text-base text-zinc-100 font-sans-clean">
                Chapter Comments
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1.5 rounded-lg bg-[#181926] text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ChapterComments
              chapterId={chapter.id}
              bookId={book.id}
              chapterNumber={chapter.chapterNumber}
              currentUser={currentUser}
              onLoginWithGoogle={onLoginWithGoogle}
              onShowToast={onShowToast}
            />
          </div>
        </div>
      )}

    </div>
  );
};

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
  Sliders,
  MessageSquare,
  X,
  Menu,
  Search,
  Check,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  Clock,
  BookOpen
} from 'lucide-react';
import {
  saveReadingProgress,
  getReaderPreferences,
  saveReaderPreferences,
  getReadChaptersForBook,
  toggleChapterMarkedAsRead,
  isChapterUnlocked,
  unlockChapterWithCode
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
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readChapters, setReadChapters] = useState<number[]>(() => getReadChaptersForBook(userId, book.id));
  
  // Access Code State
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocallyUnlocked, setIsLocallyUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);
  const chapterListRef = useRef<HTMLDivElement>(null);
  const currentChapterItemRef = useRef<HTMLDivElement>(null);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartFontSizeRef = useRef<ReaderPreferences['fontSize']>('base');
  const pinchLastIndexRef = useRef<number>(1);

  // Sync read chapters and unlock state when chapter changes
  useEffect(() => {
    setReadChapters(getReadChaptersForBook(userId, book.id));
    setIsLocallyUnlocked(isChapterUnlocked(userId, chapter.id));
    setAccessCodeInput('');
    setUnlockError('');
  }, [userId, book.id, chapter.id]);

  // Sort published chapters in order
  const publishedChapters = [...allChapters]
    .filter((c) => c.status === 'published')
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const prevChapter = publishedChapters.find((c) => c.chapterNumber === chapter.chapterNumber - 1);
  const nextChapter = publishedChapters.find((c) => c.chapterNumber === chapter.chapterNumber + 1);

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.email === 'johnrufai242@gmail.com' || (currentUser as any)?.role === 'admin';
  
  // Determine if chapter is locked by author or default
  const isLockedByAuthor = chapter.isLocked !== undefined 
    ? chapter.isLocked 
    : (chapter.chapterNumber >= 11);
  
  const isUnlocked = isLocallyUnlocked || isChapterUnlocked(userId, chapter.id);
  const isLocked = isLockedByAuthor && !isAdmin && !isUnlocked;

  // Generate clean preview teaser for locked chapter
  const generateTeaser = (fullHtml: string): string => {
    if (!fullHtml) return '<p>A glimpse into this chapter...</p>';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(fullHtml, 'text/html');
      const paragraphs = Array.from(doc.body.querySelectorAll('p'));
      if (paragraphs.length > 0) {
        const firstTwo = paragraphs.slice(0, 2).map((p) => p.outerHTML).join('');
        return firstTwo || fullHtml.slice(0, 320);
      }
    } catch (_) {}
    return fullHtml.slice(0, 320) + '...';
  };

  const previewContent = chapter.teaserContent || generateTeaser(chapter.content);

  // Auto-scroll chapter dropdown to current item when opened
  useEffect(() => {
    if (showChapterMenu && currentChapterItemRef.current) {
      setTimeout(() => {
        currentChapterItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showChapterMenu]);

  // Track scroll depth and save reading progress
  useEffect(() => {
    // Immediately save that this chapter was opened & is being read
    if (!isLocked) {
      saveReadingProgress(userId, book, chapter, 0, 0);
    }

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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [book, chapter, userId, isLocked]);

  // Handle preference updates
  const handleUpdatePreferences = (updated: Partial<ReaderPreferences>) => {
    const newPrefs = { ...preferences, ...updated };
    setPreferences(newPrefs);
    saveReaderPreferences(newPrefs);
  };

  // Handle access code unlock submission
  const handleUnlockWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) {
      setUnlockError('Please enter the access code');
      return;
    }

    setIsUnlocking(true);
    setUnlockError('');

    setTimeout(() => {
      const result = unlockChapterWithCode(
        userId,
        chapter.id,
        accessCodeInput,
        chapter.accessCode
      );

      if (result.success) {
        setIsLocallyUnlocked(true);
        onShowToast(`Chapter ${chapter.chapterNumber} unlocked! Happy reading.`, 'success');
        saveReadingProgress(userId, book, chapter, 0, 0);
      } else {
        setUnlockError(result.message);
      }
      setIsUnlocking(false);
    }, 250);
  };

  // Typography scale with decent manuscript line spacing
  const readerFontSizes: Record<ReaderPreferences['fontSize'], { size: string }> = {
    sm: { size: '16px' },
    base: { size: '18px' },
    lg: { size: '21px' },
    xl: { size: '25px' },
    '2xl': { size: '30px' }
  };

  const lineHeightMultipliers: Record<'normal' | 'relaxed' | 'loose', number> = {
    normal: 1.55,
    relaxed: 1.7,
    loose: 1.85
  };

  const activeTypography = readerFontSizes[preferences.fontSize] || readerFontSizes.base;
  const activeFontSize = preferences.fontSizePx ? `${preferences.fontSizePx}px` : activeTypography.size;
  const activeLineHeight = lineHeightMultipliers[preferences.lineHeight || 'normal'] || 1.55;
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

  // Clean title for chapter page format (e.g. "Backstory" rather than repeating "Chapter 1:")
  const rawTitle = (chapter.title || '').trim();
  const cleanTitle = rawTitle.replace(/^Chapter\s+\d+\s*[:\-–—]\s*/i, '').trim() || rawTitle;

  // Clean manuscript HTML to remove hardcoded dark/black inline font colors from copy-pasted manuscripts
  const cleanManuscriptHtml = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/style\s*=\s*"([^"]*)"/gi, (match, styles) => {
        const cleaned = styles
          .replace(/(?:color|background|background-color)\s*:\s*[^;"]+;?/gi, '')
          .trim();
        return cleaned ? `style="${cleaned}"` : '';
      })
      .replace(/<font[^>]*color=[^>]*>/gi, '<font>');
  };

  const formattedContent = cleanManuscriptHtml(isLocked ? previewContent : chapter.content);

  // Filtered chapters for the dropdown menu
  const filteredChapters = publishedChapters.filter((ch) => {
    if (!chapterSearch.trim()) return true;
    const query = chapterSearch.toLowerCase();
    return (
      ch.title.toLowerCase().includes(query) ||
      (ch.subtitle && ch.subtitle.toLowerCase().includes(query)) ||
      `chapter ${ch.chapterNumber}`.includes(query)
    );
  });

  const selectChapterAndClose = (chapterNum: number) => {
    onNavigateChapter(chapterNum);
    setShowChapterMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleRead = (chapterNum: number) => {
    const isNowRead = toggleChapterMarkedAsRead(userId, book, chapterNum, publishedChapters.length);
    setReadChapters(getReadChaptersForBook(userId, book.id));
    onShowToast(
      isNowRead ? `Marked Chapter ${chapterNum} as read ✓` : `Marked Chapter ${chapterNum} as unread`,
      'info'
    );
  };

  const readPercent = publishedChapters.length > 0
    ? Math.round((readChapters.length / publishedChapters.length) * 100)
    : 0;

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
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-white border border-white/10 shadow-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
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
          className="p-2.5 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-white border border-white/10 shadow-lg transition-all active:scale-95 cursor-pointer"
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

      {/* CHAPTERS DROPDOWN LIST / MENU MODAL */}
      {showChapterMenu && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setShowChapterMenu(false)} />
          <div className="relative w-full max-w-lg bg-[#11121c] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-6 duration-200">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#151624]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-100 truncate max-w-xs sm:max-w-sm">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-zinc-400">
                      {publishedChapters.length} Chapters
                    </span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[11px] text-teal-400 font-semibold">
                      {readChapters.length} of {publishedChapters.length} Read ({readPercent}%)
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowChapterMenu(false)}
                className="p-2 rounded-xl bg-[#1f2030] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="px-4 py-2.5 border-b border-white/5 bg-[#12131e]">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter chapters by title, subtitle, or number..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#1b1c2b] border border-white/10 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Scrollable Chapter List */}
            <div ref={chapterListRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredChapters.map((ch) => {
                const isCurrent = ch.chapterNumber === chapter.chapterNumber;
                const isRead = readChapters.includes(ch.chapterNumber);
                const isChLockedByAuthor = ch.isLocked !== undefined ? ch.isLocked : (ch.chapterNumber >= 11);
                const isChUnlocked = isChapterUnlocked(userId, ch.id);
                const chLocked = isChLockedByAuthor && !isAuthenticated && !isAdmin && !isChUnlocked;
                const cleanChTitle = ch.title.replace(/^Chapter\s+\d+\s*[:\-–—]\s*/i, '').trim() || ch.title;

                return (
                  <div
                    key={ch.id}
                    ref={isCurrent ? currentChapterItemRef : null}
                    className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between gap-3 group border ${
                      isCurrent
                        ? 'bg-teal-500/15 border-teal-500/30 text-white shadow-sm'
                        : isRead
                        ? 'bg-[#141620] hover:bg-[#191b28] border-white/5 text-zinc-300'
                        : 'bg-[#12131e] hover:bg-[#181928] border-transparent text-zinc-300'
                    }`}
                  >
                    {/* Chapter Title & Number (Clicking jumps to chapter) */}
                    <button
                      type="button"
                      onClick={() => selectChapterAndClose(ch.chapterNumber)}
                      className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono-space text-xs font-bold shrink-0 transition-colors ${
                          isCurrent
                            ? 'bg-teal-500 text-zinc-950 shadow-md'
                            : isRead
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#1e1f30] text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      >
                        {ch.chapterNumber}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold text-xs sm:text-sm truncate ${isRead ? 'text-zinc-300' : 'text-zinc-100'}`}>
                            {cleanChTitle}
                          </h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-teal-400/20 text-teal-300 border border-teal-400/30">
                              Current
                            </span>
                          )}
                          {chLocked && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <Lock className="w-2.5 h-2.5" />
                              Locked
                            </span>
                          )}
                        </div>

                        {ch.subtitle && (
                          <p className="text-[11px] text-zinc-400 italic truncate mt-0.5">
                            {ch.subtitle}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1 font-mono-space">
                          <span>{ch.wordCount || 700} words</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ch.readingTimeMinutes || 4} min read
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Manual "Mark as Read" Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRead(ch.chapterNumber);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 ${
                        isRead
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-[#1e1f30] hover:bg-[#282a40] text-zinc-400 hover:text-white border border-white/5'
                      }`}
                      title={isRead ? 'Click to mark as unread' : 'Mark this chapter as read'}
                    >
                      {isRead ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Read</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Mark Read</span>
                        </>
                      )}
                    </button>

                  </div>
                );
              })}

              {filteredChapters.length === 0 && (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No chapters found matching "{chapterSearch}".
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Full Viewport Reading Canvas */}
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
            className="reader-content-font mx-auto w-full max-w-[76ch]"
            style={{
              color: customTextColor,
              fontFamily: currentFontFamilyStyle,
              fontSize: activeFontSize,
              lineHeight: activeLineHeight,
              ['--reader-font-family' as string]: currentFontFamilyStyle,
              ['--reader-font-size' as string]: activeFontSize,
              ['--reader-line-height' as string]: activeLineHeight,
              ['--reader-text-color' as string]: customTextColor
            } as React.CSSProperties}
          >
            {/* Chapter Heading */}
            <header className="mb-8 text-center">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-inherit mb-2 leading-tight"
                style={{ fontFamily: currentFontFamilyStyle, color: customTextColor }}
              >
                {cleanTitle}
              </h1>
              {chapter.subtitle && (
                <p
                  className="text-base sm:text-lg opacity-85 font-normal italic max-w-xl mx-auto leading-relaxed"
                  style={{ fontFamily: currentFontFamilyStyle, color: customTextColor }}
                >
                  {chapter.subtitle}
                </p>
              )}
            </header>

            {/* Manuscript Content */}
            <div
              className={isLocked ? 'relative' : 'drop-cap'}
              style={{ 
                color: customTextColor, 
                lineHeight: activeLineHeight,
                '--reader-text-color': customTextColor,
                '--reader-line-height': activeLineHeight
              } as React.CSSProperties}
            >
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />

              {/* Locked Chapter Preview Card with Access Code & Sign-In */}
              {isLocked && (
                <div className="relative mt-0 -mx-1">
                  {/* Visual Fade to Blur Content */}
                  <div
                    className="pointer-events-none h-32 -mt-24 relative z-10"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, ${customPageColor} 88%, ${customPageColor} 100%)`
                    }}
                  />

                  {/* Dark Floating Lock Card matching Reference Design */}
                  <div className="relative z-20 -mt-6 rounded-3xl border border-white/10 bg-[#12131e] px-6 py-8 sm:px-10 sm:py-9 text-center shadow-2xl backdrop-blur-xl max-w-md mx-auto">
                    
                    {/* Glowing Lock Icon */}
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-300 text-2xl shadow-xl">
                      <Lock className="w-6 h-6 text-teal-400" />
                    </div>

                    <h2 className="font-sans-clean text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-100">
                      CHAPTER {chapter.chapterNumber} IS LOCKED
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-400 font-sans-clean">
                      You're reading the public preview. Enter the author's access code or sign in to unlock and continue reading the complete chapter.
                    </p>

                    {/* Access Code Input Form */}
                    <form onSubmit={handleUnlockWithCode} className="mt-5 space-y-2.5">
                      <div className="relative flex items-center">
                        <KeyRound className="w-4 h-4 absolute left-3.5 text-zinc-500" />
                        <input
                          type="text"
                          value={accessCodeInput}
                          onChange={(e) => {
                            setAccessCodeInput(e.target.value);
                            setUnlockError('');
                          }}
                          placeholder="Enter access code (e.g. VIP2026)..."
                          className="w-full pl-10 pr-4 py-3 bg-[#191a28] border border-white/10 rounded-2xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 font-mono-space tracking-wider transition-colors"
                        />
                      </div>

                      {unlockError && (
                        <p className="text-[11px] text-rose-400 font-medium text-left px-1 animate-in fade-in">
                          {unlockError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isUnlocking}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold font-sans-clean uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{isUnlocking ? 'Unlocking...' : 'Unlock Chapter'}</span>
                      </button>
                    </form>

                    {/* Google Sign-In Alternative */}
                    <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                      <p className="text-[11px] text-zinc-500 font-sans-clean">
                        Or sign in to sync your unlocked chapters across devices:
                      </p>
                      <button
                        type="button"
                        onClick={onLoginWithGoogle}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-zinc-100 px-6 py-2.5 text-xs font-bold text-zinc-950 transition-all active:scale-95 shadow-md cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                        <span>Sign In with Google</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Author's Thoughts */}
          {!isLocked && preferences.showAuthorsThoughts && chapter.authorsThoughts && (
            <div className="max-w-[76ch] mx-auto mt-12 mb-8">
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
          
          {/* Top Row: < Previous | Clickable Chapter Dropdown Opener & % Progress | Next > */}
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

            {/* Center Chapter Clickable Dropdown Trigger & Progress */}
            <button
              type="button"
              onClick={() => setShowChapterMenu(true)}
              className="flex flex-col items-center min-w-0 px-3 py-0.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              title="Click to view all chapters"
            >
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-zinc-200 font-sans-clean truncate group-hover:text-teal-400 transition-colors">
                  Chapter {chapter.chapterNumber}
                </span>
                <Menu className="w-3 h-3 text-zinc-500 group-hover:text-teal-400 transition-colors" />
              </div>
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
            </button>

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

          {/* Bottom Row: Chapters Menu & Settings Controls */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setShowChapterMenu(true)}
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#151622] hover:bg-[#1c1d2c] text-zinc-300 border border-white/5 text-xs font-medium transition-colors cursor-pointer active:scale-95"
            >
              <Menu className="w-3.5 h-3.5 text-teal-400" />
              <span>Chapters Menu</span>
            </button>

            <button
              onClick={() => setShowControls(true)}
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#151622] hover:bg-[#1c1d2c] text-zinc-300 border border-white/5 text-xs font-medium transition-colors cursor-pointer active:scale-95"
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

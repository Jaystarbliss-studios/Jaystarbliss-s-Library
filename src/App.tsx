import React, { useState, useEffect, useCallback } from 'react';
import { Book, Chapter, Bookmark, ReadingProgress, UserProfile, LibraryFont } from './types';
import {
  getBooks,
  getChapters,
  getBookBySlug,
  getChapter,
  getBookmarks,
  getReadingProgressList,
  getReadingProgress,
  getLatestUpdates,
  checkAndPublishScheduled,
  saveChapter,
  saveBook,
  deleteChapter,
  publishScheduledNow,
  cancelScheduledRelease,
  toggleBookmark,
  updateBookmarkNotification,
  LatestUpdateItem
} from './lib/storage';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { AdminSidebar } from './components/AdminSidebar';

import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { GenresView } from './views/GenresView';
import { LatestUpdatesView } from './views/LatestUpdatesView';
import { SearchView } from './views/SearchView';
import { MyLibraryView } from './views/MyLibraryView';
import { BookDetailView } from './views/BookDetailView';
import { ReaderView } from './views/ReaderView';

import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminBooksListView } from './views/AdminBooksListView';
import { AdminBookEditorView } from './views/AdminBookEditorView';
import { AdminChaptersListView } from './views/AdminChaptersListView';
import { AdminChapterEditorView } from './views/AdminChapterEditorView';
import { AdminScheduledView } from './views/AdminScheduledView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { Shield } from 'lucide-react';

import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  isUserAdmin,
  seedInitialFirestoreData,
  fetchBooksFromFirestore,
  fetchChaptersFromFirestore,
  fetchUserBookmarksFromFirestore,
  fetchUserReadingProgressFromFirestore,
  fetchSubscribersForBook,
  syncUserProfileToFirestore
} from './lib/firebase';
import { syncBookmarksWithFirestore, syncProgressWithFirestore, saveBooks, saveChapters } from './lib/storage';

const DEFAULT_USER_ID = 'library-x-reader';

export default function App() {
  // Navigation & Routing state
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedBookSlug, setSelectedBookSlug] = useState<string>('two-decades');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(1);
  const [userRole, setUserRole] = useState<'reader' | 'author'>('reader');

  // Reader Library Font state (persisted across library)
  const [libraryFont, setLibraryFont] = useState<LibraryFont>(() => {
    return (localStorage.getItem('library_x_font') as LibraryFont) || 'serif';
  });

  // Firebase auth & cloud status state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // Admin studio state
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Core Data
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [readingProgressList, setReadingProgressList] = useState<ReadingProgress[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<LatestUpdateItem[]>([]);

  // Feedback Notification Toast Queue
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const activeUserId = firebaseUser ? firebaseUser.uid : DEFAULT_USER_ID;

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectLibraryFont = (font: LibraryFont) => {
    setLibraryFont(font);
    localStorage.setItem('library_x_font', font);
    showToast(`Library font updated to ${font.toUpperCase()}`, 'info');
  };

  // Refresh data from storage
  const refreshData = useCallback(() => {
    // 1. Evaluate scheduled daily releases
    const newlyPublished = checkAndPublishScheduled();
    if (newlyPublished) {
      showToast('Scheduled daily chapters evaluated and published to readers!', 'success');
    }

    // 2. Fetch fresh snapshots
    const loadedBooks = getBooks();
    const loadedChapters = getChapters();
    const loadedBookmarks = getBookmarks(activeUserId);
    const loadedProgress = getReadingProgressList(activeUserId);
    const loadedUpdates = getLatestUpdates();

    setBooks(loadedBooks);
    setChapters(loadedChapters);
    setBookmarks(loadedBookmarks);
    setReadingProgressList(loadedProgress);
    setLatestUpdates(loadedUpdates);
  }, [showToast, activeUserId]);

  // Sync with Firestore on mount and listen to Auth state changes
  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const admin = isUserAdmin(user);
        setUserRole(admin ? 'author' : 'reader');

        // Automatically initialize/sync user account in Firestore
        try {
          const profile = await syncUserProfileToFirestore(user);
          if (admin) {
            showToast(`Welcome back, Author! Signed in as ${user.email}`, 'success');
            // Seed canonical data to Firestore if needed
            seedInitialFirestoreData().catch((err) =>
              console.warn('Admin Firestore seed check:', err)
            );
          } else {
            showToast(`Welcome, ${profile.displayName}! Reader account created & ready for reading.`, 'info');
          }
        } catch (err) {
          console.warn('User profile sync notice:', err);
        }

        // Fetch user's bookmarks from Cloud Firestore
        try {
          const cloudBms = await fetchUserBookmarksFromFirestore(user.uid);
          if (cloudBms && cloudBms.length > 0) {
            syncBookmarksWithFirestore(cloudBms);
            refreshData();
          }
        } catch (err) {
          console.warn('Could not sync bookmarks from Firestore:', err);
        }

        // Fetch user's reading progress from Cloud Firestore
        try {
          const cloudProgress = await fetchUserReadingProgressFromFirestore(user.uid);
          if (cloudProgress && cloudProgress.length > 0) {
            syncProgressWithFirestore(cloudProgress);
            refreshData();
          }
        } catch (err) {
          console.warn('Could not sync reading progress from Firestore:', err);
        }
      } else {
        setUserRole('reader');
      }
    });

    // Cloud seed & fetch initial canonical catalog
    async function initFirestoreCatalog() {
      try {
        await seedInitialFirestoreData();
        const cloudBooks = await fetchBooksFromFirestore();
        const cloudChapters = await fetchChaptersFromFirestore();
        if (cloudBooks && cloudBooks.length > 0) {
          saveBooks(cloudBooks);
        }
        if (cloudChapters && cloudChapters.length > 0) {
          saveChapters(cloudChapters);
        }
        refreshData();
        setIsCloudConnected(true);
      } catch (err) {
        console.warn('Using local canon fallback:', err);
      }
    }

    initFirestoreCatalog();

    return () => unsubscribeAuth();
  }, [refreshData, showToast]);

  // Initial load and periodic autonomous publishing evaluator (every 30s)
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Handle URL hash navigation for deep linking with strict admin route protection
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      if (hash.startsWith('book/')) {
        const slug = hash.replace('book/', '');
        setSelectedBookSlug(slug);
        setCurrentRoute('book');
      } else if (hash.startsWith('reader/')) {
        const parts = hash.replace('reader/', '').split('/');
        if (parts[0]) setSelectedBookSlug(parts[0]);
        if (parts[1]) setSelectedChapterNumber(parseInt(parts[1]) || 1);
        setCurrentRoute('reader');
      } else if (hash === 'admin') {
        // Enforce admin restriction on URL hash change
        if (!isUserAdmin(auth.currentUser)) {
          setCurrentRoute('home');
          window.location.hash = 'home';
          showToast('Author Studio is strictly restricted to the authorized admin (general5242@gmail.com). You are in Reader mode.', 'info');
          return;
        }
        setCurrentRoute('admin');
      } else if (['home', 'library', 'genres', 'latest', 'search', 'my-library'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [showToast]);

  const navigateTo = (route: string) => {
    if (route.startsWith('admin') && !isUserAdmin(firebaseUser)) {
      showToast('Author Studio is restricted to the verified author account (general5242@gmail.com). Welcome to Reader Library!', 'info');
      setCurrentRoute('home');
      window.location.hash = 'home';
      return;
    }
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBook = (slug: string) => {
    setSelectedBookSlug(slug);
    setCurrentRoute('book');
    window.location.hash = `book/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReader = (bookSlug: string, chapterNumber: number) => {
    setSelectedBookSlug(bookSlug);
    setSelectedChapterNumber(chapterNumber);
    setCurrentRoute('reader');
    window.location.hash = `reader/${bookSlug}/${chapterNumber}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Google Auth actions
  const handleLoginWithGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      showToast(`Welcome, ${user.displayName || user.email}! Your Google account is connected.`, 'success');
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      if (errObj?.code !== 'auth/popup-closed-by-user') {
        showToast(`Sign in notice: ${errObj?.message || 'Authentication unsuccessful'}`, 'info');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserRole('reader');
      showToast('Signed out of Google account', 'info');
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      showToast(`Sign out notice: ${errObj?.message || 'Failed to sign out'}`, 'error');
    }
  };

  // Bookmark handlers
  const handleToggleBookmark = (targetBook: Book) => {
    const isNow = toggleBookmark(activeUserId, targetBook, firebaseUser?.email || undefined);
    refreshData();
    showToast(
      isNow
        ? `Added "${targetBook.title}" to My Shelf • Email notifications enabled`
        : `Removed "${targetBook.title}" from My Shelf`,
      'info'
    );
  };

  // Chapter editing & admin actions
  const handleSaveChapter = async (ch: Chapter) => {
    const isNewPublish = ch.status === 'published';
    saveChapter(ch);
    refreshData();

    // Check for subscribers to send Google email alert notification
    if (isNewPublish) {
      try {
        const subscribers = await fetchSubscribersForBook(ch.bookId);
        if (subscribers.length > 0) {
          showToast(`Published Ch. ${ch.chapterNumber}! Notified ${subscribers.length} reader subscriber(s) via Google email.`, 'success');
        }
      } catch (err) {
        console.warn('Subscriber lookup warning:', err);
      }
    }
  };

  const handleSaveBook = (b: Book) => {
    saveBook(b);
    refreshData();
    setAdminTab('books');
  };

  const handleDeleteChapter = (chId: string) => {
    deleteChapter(chId);
    refreshData();
  };

  const handlePublishNow = async (chId: string) => {
    publishScheduledNow(chId);
    refreshData();
    showToast('Chapter published immediately to all readers', 'success');

    const ch = chapters.find((c) => c.id === chId);
    if (ch) {
      try {
        const subscribers = await fetchSubscribersForBook(ch.bookId);
        if (subscribers.length > 0) {
          showToast(`Dispatched new chapter notification to ${subscribers.length} reader(s) with Google email alerts active.`, 'info');
        }
      } catch (err) {
        console.warn('Subscriber lookup warning:', err);
      }
    }
  };

  const handleCancelSchedule = (chId: string) => {
    cancelScheduledRelease(chId);
    refreshData();
  };

  // Current entity lookups
  const activeBook = books.find((b) => b.slug === selectedBookSlug) || books[0];
  const activeBookChapters = activeBook ? chapters.filter((c) => c.bookId === activeBook.id) : [];
  const activeChapter = activeBookChapters.find((c) => c.chapterNumber === selectedChapterNumber) || activeBookChapters[0];

  // Bookmarks map
  const bookmarksMap = bookmarks.reduce((acc, bm) => {
    acc[bm.bookId] = true;
    return acc;
  }, {} as Record<string, boolean>);

  // Reading progress map
  const progressMap = readingProgressList.reduce((acc, p) => {
    acc[p.bookId] = p;
    return acc;
  }, {} as Record<string, ReadingProgress>);

  const scheduledPendingCount = chapters.filter((c) => c.status === 'scheduled').length;

  const isAdmin = isUserAdmin(firebaseUser);

  const currentUserProfile: UserProfile = {
    id: activeUserId,
    email: firebaseUser?.email || (isAdmin ? 'author@libraryx.com' : 'reader@libraryx.com'),
    displayName: firebaseUser?.displayName || (isAdmin ? 'Author' : 'Reader'),
    role: isAdmin ? 'admin' : 'reader',
    avatarUrl: firebaseUser?.photoURL || undefined,
    createdAt: '2026-08-01T00:00:00.000Z'
  };

  // Global library font class
  const globalFontClass = {
    serif: 'font-garamond',
    newsreader: 'font-newsreader',
    sans: 'font-sans-clean',
    mono: 'font-mono-space'
  }[libraryFont] || 'font-garamond';

  return (
    <div className={`min-h-screen bg-[#09090d] text-zinc-100 flex flex-col ${globalFontClass} selection:bg-amber-400/20 selection:text-amber-200 transition-colors`}>
      
      {/* Top Main Navigation Header (Hidden inside Reader for pure immersive manuscript focus) */}
      {currentRoute !== 'reader' && (
        <Header
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          currentUser={currentUserProfile}
          firebaseUser={firebaseUser}
          bookmarkCount={bookmarks.length}
          onLoginWithGoogle={handleLoginWithGoogle}
          onLogout={handleLogout}
        />
      )}

      {/* Main App Content Router */}
      <div className="flex-1">
        {/* 1. READER VIEW (Full-Screen Immersive Literary Canvas with Comments & Soft Corners) */}
        {currentRoute === 'reader' && activeBook && activeChapter && (
          <ReaderView
            book={activeBook}
            chapter={activeChapter}
            allChapters={activeBookChapters}
            userId={activeUserId}
            currentUser={firebaseUser}
            onNavigateChapter={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onBackToBook={() => handleOpenBook(activeBook.slug)}
            onLoginWithGoogle={handleLoginWithGoogle}
            onShowToast={showToast}
          />
        )}

        {/* 2. PUBLIC HOMEPAGE */}
        {currentRoute === 'home' && (
          <HomeView
            allBooks={books}
            latestUpdates={latestUpdates}
            progressMap={progressMap}
            bookmarksMap={bookmarksMap}
            onToggleBookmark={handleToggleBookmark}
            onViewBook={handleOpenBook}
            onSelectChapter={handleOpenReader}
            onNavigate={navigateTo}
            firebaseUser={firebaseUser}
            onLoginWithGoogle={handleLoginWithGoogle}
            isAdmin={isAdmin}
          />
        )}

        {/* 3. PUBLIC LIBRARY CATALOGUE */}
        {currentRoute === 'library' && (
          <LibraryView
            books={books}
            progressMap={progressMap}
            bookmarksMap={bookmarksMap}
            onToggleBookmark={handleToggleBookmark}
            onSelectBook={handleOpenBook}
            onNavigate={navigateTo}
          />
        )}

        {/* 4. GENRES & THEMATIC TAGS */}
        {currentRoute === 'genres' && (
          <GenresView
            books={books}
            onSelectBook={handleOpenBook}
            onFilterGenre={(genre) => {
              navigateTo('library');
            }}
          />
        )}

        {/* 5. LATEST RELEASES STREAM */}
        {currentRoute === 'latest' && (
          <LatestUpdatesView
            updates={latestUpdates}
            onSelectChapter={handleOpenReader}
            onSelectBook={handleOpenBook}
          />
        )}

        {/* 6. SEARCH VIEW */}
        {currentRoute === 'search' && (
          <SearchView
            onSelectBook={handleOpenBook}
            onSelectChapter={handleOpenReader}
          />
        )}

        {/* 7. MY PERSONAL LIBRARY */}
        {currentRoute === 'my-library' && (
          <MyLibraryView
            bookmarks={bookmarks}
            readingProgressList={readingProgressList}
            firebaseUser={firebaseUser}
            onLoginWithGoogle={handleLoginWithGoogle}
            onSelectBook={handleOpenBook}
            onSelectChapter={handleOpenReader}
            onRemoveBookmark={(bId) => {
              const b = books.find((x) => x.id === bId);
              if (b) handleToggleBookmark(b);
            }}
            onToggleNotification={(bId, enabled) => {
              updateBookmarkNotification(activeUserId, bId, enabled);
              refreshData();
              showToast(
                enabled
                  ? 'Google email notifications active for new chapters'
                  : 'Google email alerts muted for this book',
                'info'
              );
            }}
            onExploreLibrary={() => navigateTo('library')}
          />
        )}

        {/* 8. BOOK / NOVEL DETAIL PAGE */}
        {currentRoute === 'book' && activeBook && (
          <BookDetailView
            book={activeBook}
            chapters={activeBookChapters}
            progress={progressMap[activeBook.id]}
            userId={activeUserId}
            currentUser={firebaseUser}
            onSelectChapter={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onStartReading={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onShowToast={showToast}
            isAdmin={isAdmin}
            onEditBook={(bId) => {
              setEditingBookId(bId);
              setAdminTab('book-editor');
              navigateTo('admin');
            }}
          />
        )}

        {/* 9. AUTHOR PUBLISHING STUDIO (ADMIN - strictly gated to general5242@gmail.com) */}
        {currentRoute === 'admin' && (
          isAdmin ? (
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-4.5rem)]">
              <AdminSidebar
                currentTab={adminTab}
                onSelectTab={(tab) => {
                  if (tab === 'chapter-editor-new') {
                    setEditingChapterId(null);
                  } else if (tab === 'book-editor-new') {
                    setEditingBookId(null);
                  }
                  setAdminTab(tab);
                }}
                onExitAdmin={() => navigateTo('home')}
                pendingScheduledCount={scheduledPendingCount}
              />

              <main className="flex-1 bg-[#09090b] overflow-y-auto">
                {adminTab === 'dashboard' && (
                  <AdminDashboardView
                    books={books}
                    chapters={chapters}
                    onSelectTab={(tab) => {
                      if (tab === 'chapter-editor-new') setEditingChapterId(null);
                      setAdminTab(tab);
                    }}
                    onEditChapter={(chId) => {
                      setEditingChapterId(chId);
                      setAdminTab('chapter-editor');
                    }}
                    onPreviewChapter={handleOpenReader}
                    onPublishScheduledNow={handlePublishNow}
                  />
                )}

                {adminTab === 'books' && (
                  <AdminBooksListView
                    books={books}
                    onAddNewBook={() => {
                      setEditingBookId(null);
                      setAdminTab('book-editor-new');
                    }}
                    onEditBook={(bId: string) => {
                      setEditingBookId(bId);
                      setAdminTab('book-editor');
                    }}
                    onViewBookPublic={handleOpenBook}
                  />
                )}

                {(adminTab === 'book-editor' || adminTab === 'book-editor-new') && (
                  <AdminBookEditorView
                    book={editingBookId ? books.find((b) => b.id === editingBookId) : null}
                    onSaveBook={handleSaveBook}
                    onCancel={() => setAdminTab('books')}
                    onShowToast={showToast}
                  />
                )}

                {adminTab === 'chapters' && (
                  <AdminChaptersListView
                    books={books}
                    chapters={chapters}
                    onAddNewChapter={() => {
                      setEditingChapterId(null);
                      setAdminTab('chapter-editor-new');
                    }}
                    onEditChapter={(chId) => {
                      setEditingChapterId(chId);
                      setAdminTab('chapter-editor');
                    }}
                    onPreviewChapter={handleOpenReader}
                    onDeleteChapter={handleDeleteChapter}
                    onPublishNow={handlePublishNow}
                    onShowToast={showToast}
                  />
                )}

                {(adminTab === 'chapter-editor' || adminTab === 'chapter-editor-new') && (
                  <AdminChapterEditorView
                    books={books}
                    chapter={editingChapterId ? chapters.find((c) => c.id === editingChapterId) : null}
                    defaultBookId={activeBook?.id}
                    onSaveChapter={handleSaveChapter}
                    onCancel={() => setAdminTab('chapters')}
                    onShowToast={showToast}
                  />
                )}

                {adminTab === 'scheduled' && (
                  <AdminScheduledView
                    books={books}
                    chapters={chapters}
                    onEditChapter={(chId) => {
                      setEditingChapterId(chId);
                      setAdminTab('chapter-editor');
                    }}
                    onPublishNow={handlePublishNow}
                    onCancelSchedule={handleCancelSchedule}
                    onRunAutoPublishCheck={refreshData}
                    onShowToast={showToast}
                  />
                )}

                {adminTab === 'settings' && (
                  <AdminSettingsView
                    onShowToast={showToast}
                    onDataReset={refreshData}
                  />
                )}
              </main>
            </div>
          ) : (
            <div className="max-w-xl mx-auto my-16 p-8 bg-[#131318] border border-zinc-800 rounded-2xl text-center space-y-4 shadow-xl">
              <Shield className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="font-cinzel text-xl font-bold uppercase text-white tracking-wide">
                AUTHOR STUDIO ACCESS RESTRICTED
              </h2>
              <p className="font-mono-space text-xs text-zinc-400 leading-relaxed">
                The Author Studio is strictly reserved for the authorized administrator (<span className="text-zinc-200 font-semibold">general5242@gmail.com</span>). Readers do not have publishing privileges.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                RETURN TO READER LIBRARY
              </button>
            </div>
          )
        )}
      </div>

      {/* Global Literary Footer (Shown on public pages, hidden in Reader & Admin Studio) */}
      {currentRoute !== 'reader' && currentRoute !== 'admin' && (
        <Footer onNavigate={navigateTo} isAdmin={isAdmin} />
      )}

      {/* Sleek Mobile Bottom Navigation Bar with Soft Styling */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        bookmarkCount={bookmarks.length}
        isAdmin={isAdmin}
        isLoggedIn={!!firebaseUser}
      />

      {/* Ephemeral Feedback Toast Queue */}
      <NotificationToast
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

    </div>
  );
}

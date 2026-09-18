import React, { useState, useEffect, useCallback } from 'react';
import { Book, Chapter, Bookmark, ReadingProgress, UserProfile } from './types';
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
  LatestUpdateItem
} from './lib/storage';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
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
  fetchUserReadingProgressFromFirestore
} from './lib/firebase';
import { syncBookmarksWithFirestore, syncProgressWithFirestore, saveBooks, saveChapters } from './lib/storage';

const DEFAULT_USER_ID = 'jaystarbliss-reader-main';

export default function App() {
  // Navigation & Routing state
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedBookSlug, setSelectedBookSlug] = useState<string>('two-decades');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(1);
  const [userRole, setUserRole] = useState<'reader' | 'author'>('reader');

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
        const isAdmin = isUserAdmin(user);
        if (isAdmin) {
          setUserRole('author');
          showToast(`Welcome back, Author Jaystarbliss! Signed in as ${user.email}`, 'success');
          // Seed canonical data to Firestore if not already seeded
          seedInitialFirestoreData().catch((err) =>
            console.warn('Admin Firestore seed check:', err)
          );
        } else {
          showToast(`Welcome, ${user.displayName || user.email}! Cloud sync connected.`, 'info');
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

  // Handle URL hash navigation for deep linking
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
      } else if (['home', 'library', 'genres', 'latest', 'search', 'my-library', 'admin'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (route: string) => {
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
      showToast(`Welcome, ${user.displayName || user.email}!`, 'success');
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      if (errObj?.code !== 'auth/popup-closed-by-user') {
        showToast(`Sign in notice: ${errObj?.message || 'Authentication canceled or unsuccessful'}`, 'info');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserRole('reader');
      showToast('Signed out of Firebase account', 'info');
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      showToast(`Sign out notice: ${errObj?.message || 'Failed to sign out'}`, 'error');
    }
  };

  // Bookmark handlers
  const handleToggleBookmark = (targetBook: Book) => {
    const isNow = toggleBookmark(activeUserId, targetBook);
    refreshData();
    showToast(
      isNow ? `Added "${targetBook.title}" to My Library (Cloud Synced)` : `Removed "${targetBook.title}" from My Library`,
      'info'
    );
  };

  // Chapter editing & admin actions
  const handleSaveChapter = (ch: Chapter) => {
    saveChapter(ch);
    refreshData();
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

  const handlePublishNow = (chId: string) => {
    publishScheduledNow(chId);
    refreshData();
    showToast('Chapter published immediately to readers', 'success');
  };

  const handleCancelSchedule = (chId: string) => {
    cancelScheduledRelease(chId);
    refreshData();
  };

  // Current entity lookups
  const activeBook = books.find((b) => b.slug === selectedBookSlug) || books[0];
  const activeBookChapters = activeBook ? chapters.filter((c) => c.bookId === activeBook.id) : [];
  const activeChapter = activeBookChapters.find((c) => c.chapterNumber === selectedChapterNumber) || activeBookChapters[0];

  const featuredBook = books.find((b) => b.isFeatured) || books[0];
  const featuredProgress = featuredBook ? getReadingProgress(activeUserId, featuredBook.id) : undefined;
  const isFeaturedBookmarked = featuredBook ? bookmarks.some((bm) => bm.bookId === featuredBook.id) : false;

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

  const currentUserProfile: UserProfile = {
    id: activeUserId,
    email: firebaseUser?.email || (userRole === 'author' ? 'johnrufai242@gmail.com' : 'reader@jaystarbliss.com'),
    displayName: firebaseUser?.displayName || (userRole === 'author' ? 'Jaystarbliss (Author)' : 'Reader'),
    role: userRole === 'author' ? 'admin' : 'reader',
    avatarUrl: firebaseUser?.photoURL || undefined,
    createdAt: '2026-08-01T00:00:00.000Z'
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-zinc-100 flex flex-col font-calibri selection:bg-zinc-700 selection:text-white">
      
      {/* Top Main Navigation Header (Hidden inside Reader for pure immersive manuscript focus) */}
      {currentRoute !== 'reader' && (
        <Header
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          currentUser={currentUserProfile}
          firebaseUser={firebaseUser}
          onToggleUserRole={() => {
            const nextRole = userRole === 'reader' ? 'author' : 'reader';
            setUserRole(nextRole);
            if (nextRole === 'author') {
              navigateTo('admin');
            } else if (currentRoute === 'admin') {
              navigateTo('home');
            }
            showToast(`Switched view to ${nextRole.toUpperCase()} mode`, 'info');
          }}
          bookmarkCount={bookmarks.length}
          onLoginWithGoogle={handleLoginWithGoogle}
          onLogout={handleLogout}
          isCloudConnected={isCloudConnected}
        />
      )}

      {/* Main App Content Router */}
      <div className="flex-1">
        {/* 1. READER VIEW (Full-Screen Immersive Literary Canvas) */}
        {currentRoute === 'reader' && activeBook && activeChapter && (
          <ReaderView
            book={activeBook}
            chapter={activeChapter}
            allChapters={activeBookChapters}
            userId={activeUserId}
            onNavigateChapter={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onBackToBook={() => handleOpenBook(activeBook.slug)}
            onShowToast={showToast}
          />
        )}

        {/* 2. PUBLIC HOMEPAGE */}
        {currentRoute === 'home' && featuredBook && (
          <HomeView
            featuredBook={featuredBook}
            allBooks={books}
            latestUpdates={latestUpdates}
            progress={featuredProgress}
            isBookmarked={isFeaturedBookmarked}
            onToggleBookmark={() => handleToggleBookmark(featuredBook)}
            onStartReading={(chNum) => handleOpenReader(featuredBook.slug, chNum)}
            onViewBook={handleOpenBook}
            onSelectChapter={handleOpenReader}
            onNavigate={navigateTo}
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
            onSelectBook={handleOpenBook}
            onSelectChapter={handleOpenReader}
            onRemoveBookmark={(bId) => {
              const b = books.find((x) => x.id === bId);
              if (b) handleToggleBookmark(b);
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
            onSelectChapter={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onStartReading={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onShowToast={showToast}
            isAdmin={userRole === 'author'}
            onEditBook={(bId) => {
              setEditingBookId(bId);
              setAdminTab('book-editor');
              navigateTo('admin');
            }}
          />
        )}

        {/* 9. AUTHOR PUBLISHING STUDIO (ADMIN) */}
        {currentRoute === 'admin' && (
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
        )}
      </div>

      {/* Global Literary Footer (Shown on public pages, hidden in Reader & Admin Studio) */}
      {currentRoute !== 'reader' && currentRoute !== 'admin' && (
        <Footer onNavigate={navigateTo} isAdmin={userRole === 'author'} />
      )}

      {/* Ephemeral Feedback Toast Queue */}
      <NotificationToast
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

    </div>
  );
}

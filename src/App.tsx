import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Book, Chapter, Bookmark, ReadingProgress, UserProfile, LibraryFont } from './types';
import {
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
import { AuthModal } from './components/AuthModal';

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
  SimpleAuthUser,
  loginWithGoogle,
  logoutUser,
  isUserAdmin,
  seedInitialFirestoreData,
  fetchUserBookmarksFromFirestore,
  fetchUserReadingProgressFromFirestore,
  sendChapterNotification,
  syncUserProfileToFirestore,
  checkRedirectResult,
  listenToBooks,
  listenToChapters,
  reconcileBookChapterCounts
} from './lib/firebase';
import { syncBookmarksWithFirestore, syncProgressWithFirestore, syncLocalBookmarksToFirestore } from './lib/storage';

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
  const [firebaseUser, setFirebaseUser] = useState<User | SimpleAuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
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

  // Refresh user-specific state only.
  // Books and chapters are canonical Firestore data and are owned by the realtime
  // listeners below. Never overwrite them from localStorage after a login or refresh,
  // otherwise a reader can briefly see the cloud catalogue and then lose it.
  const refreshData = useCallback(() => {
    const loadedBookmarks = getBookmarks(activeUserId);
    const loadedProgress = getReadingProgressList(activeUserId);

    setBookmarks(loadedBookmarks);
    setReadingProgressList(loadedProgress);
  }, [activeUserId]);

  // Keep the Latest Updates stream derived from the same canonical books/chapters
  // shown everywhere else in the public app.
  useEffect(() => {
    const bookMap = new Map(books.map((book) => [book.id, book]));
    const updates = chapters
      .filter((chapter) => chapter.status === 'published' && chapter.publishedAt)
      .map((chapter) => {
        const book = bookMap.get(chapter.bookId);
        return book ? {
          chapter,
          book,
          releaseDate: chapter.publishedAt as string
        } : null;
      })
      .filter((item): item is LatestUpdateItem => Boolean(item))
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 20);

    setLatestUpdates(updates);
  }, [books, chapters]);

  // Sync with Firestore on mount and listen to Auth state changes
  useEffect(() => {
    // 1. Check if user arrived via Google sign-in redirect
    checkRedirectResult().then((user) => {
      if (user) {
        setFirebaseUser(user);
        const admin = isUserAdmin(user);
        setUserRole(admin ? 'author' : 'reader');
        showToast(`Welcome back, ${user.displayName || user.email}! Google account connected.`, 'success');
      }
    });

    // 2. Firebase Auth is the only session source. Never restore a local/fake account.
    // 3. Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
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

        // Firestore is the source of truth for subscriptions. First recover any
        // older local shelf bookmarks that were created before cloud sync was
        // reliable, then fetch the cloud shelf again so the notification state
        // shown in the UI exactly matches what the server can see.
        try {
          const cloudBms = await fetchUserBookmarksFromFirestore(user.uid);
          if (cloudBms && cloudBms.length > 0) {
            syncBookmarksWithFirestore(cloudBms);
          }

          await syncLocalBookmarksToFirestore(user.uid, cloudBms || []);

          const syncedCloudBms = await fetchUserBookmarksFromFirestore(user.uid);
          if (syncedCloudBms && syncedCloudBms.length > 0) {
            syncBookmarksWithFirestore(syncedCloudBms);
          }

          refreshData();
        } catch (err) {
          console.warn('Could not sync bookmarks/subscriptions with Firestore:', err);
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
        setFirebaseUser(null);
        setUserRole('reader');
        if (currentRoute === 'admin' || currentRoute.startsWith('admin')) {
          setCurrentRoute('home');
          window.location.hash = 'home';
        }
      }
    });

    // Firestore is the canonical source for books and chapters.
    // Real-time listeners keep every public view synchronized across browsers/devices.
    let unsubscribeBooks = () => {};
    let unsubscribeChapters = () => {};

    try {
      unsubscribeBooks = listenToBooks((cloudBooks) => {
        const publicBooks = cloudBooks.filter((book) => book.visibility === 'published');
        setBooks(isUserAdmin(auth.currentUser) ? cloudBooks : publicBooks);
        setIsCloudConnected(true);
      }, (error) => {
        console.error('Books realtime sync failed:', error);
        setIsCloudConnected(false);
      });

      unsubscribeChapters = listenToChapters((cloudChapters) => {
        const publicChapters = cloudChapters.filter((chapter) => chapter.status === 'published');
        setChapters(isUserAdmin(auth.currentUser) ? cloudChapters : publicChapters);
        setIsCloudConnected(true);
      }, (error) => {
        console.error('Chapters realtime sync failed:', error);
        setIsCloudConnected(false);
      });
    } catch (err) {
      console.error('Could not initialize Firestore catalog listeners:', err);
      setIsCloudConnected(false);
    }

    return () => {
      unsubscribeAuth();
      unsubscribeBooks();
      unsubscribeChapters();
    };
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
        if (!isUserAdmin(firebaseUser)) {
          setCurrentRoute('home');
          window.location.hash = 'home';
          showToast('Author Studio is strictly reserved for verified author accounts. You are in Reader mode.', 'info');
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
  }, [showToast, firebaseUser]);

  const navigateTo = (route: string) => {
    if (route.startsWith('admin') && !isUserAdmin(firebaseUser)) {
      showToast('Author Studio is restricted to verified author accounts. Welcome to Reader Library!', 'info');
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

  // Google Auth actions & Modal controller
  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleLoginWithGoogle = handleOpenAuthModal;

  const executeGoogleLogin = async () => {
    const user = await loginWithGoogle();
    setFirebaseUser(user);
    const admin = isUserAdmin(user);
    setUserRole(admin ? 'author' : 'reader');
    showToast(`Welcome, ${user.displayName || user.email}! Your Google account is connected.`, 'success');
    refreshData();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err: unknown) {
      console.warn('Firebase logout notice:', err);
    }
    setFirebaseUser(null);
    setUserRole('reader');
    if (currentRoute === 'admin' || currentRoute.startsWith('admin')) {
      setCurrentRoute('home');
      window.location.hash = 'home';
    }
    showToast('Signed out successfully.', 'info');
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
    try {
      await saveChapter(ch);
      refreshData();

      // Send transactional email notifications only after the published chapter
      // has been confirmed in Firestore. The Vercel API verifies the admin's
      // Firebase ID token and uses Resend server-side, so the Resend API key
      // never reaches the browser.
      if (isNewPublish) {
        try {
          const result = await sendChapterNotification(ch.id);
          if (result.sent > 0) {
            showToast(
              `Published Ch. ${ch.chapterNumber}! Email notification sent to ${result.sent} reader(s).${result.failed ? ` ${result.failed} could not be sent.` : ''}`,
              result.failed ? 'info' : 'success'
            );
          } else {
            showToast(
              'Chapter published. No readers currently have email notifications enabled for this book.',
              'info'
            );
          }
        } catch (err) {
          console.error('Chapter email notification failed:', err);
          showToast(
            'Chapter was published, but the reader email notifications could not be sent. Check the Resend/Vercel email configuration.',
            'error'
          );
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const handleSaveBook = async (b: Book) => {
    try {
      await saveBook(b);
      refreshData();
      setAdminTab('books');
      showToast(`Manuscript "${b.title}" saved successfully to the cloud library.`, 'success');
    } catch (err) {
      showToast('Book could not be saved. The cloud database did not confirm the change.', 'error');
      throw err;
    }
  };

  const handleDeleteChapter = async (chId: string) => {
    await deleteChapter(chId);
    refreshData();
  };

  const handlePublishNow = async (chId: string) => {
    await publishScheduledNow(chId);
    refreshData();
    showToast('Chapter published immediately to all readers', 'success');

    const ch = chapters.find((c) => c.id === chId);
    if (ch) {
      try {
        const result = await sendChapterNotification(ch.id);
        if (result.sent > 0) {
          showToast(
            `Dispatched new chapter email to ${result.sent} reader(s).${result.failed ? ` ${result.failed} failed.` : ''}`,
            result.failed ? 'info' : 'success'
          );
        }
      } catch (err) {
        console.error('Scheduled chapter email notification failed:', err);
        showToast('Chapter was published, but its email notifications could not be sent.', 'error');
      }
    }
  };

  const handleCancelSchedule = async (chId: string) => {
    await cancelScheduledRelease(chId);
    refreshData();
  };

  const scheduledPendingCount = chapters.filter((c) => c.status === 'scheduled').length;

  const isAdmin = isUserAdmin(firebaseUser);

  // Public chapter counts are derived from the same live Firestore chapter
  // listener used to render readable chapters. This prevents stale book
  // metadata from making shelves display an old published count.
  const displayBooks = useMemo(() => {
    return books.map((book) => {
      const bookChapters = chapters.filter((chapter) => chapter.bookId === book.id);
      const publishedCount = bookChapters.filter((chapter) => chapter.status === 'published').length;

      return {
        ...book,
        publishedChapterCount: publishedCount,
        scheduledChapterCount: isAdmin
          ? bookChapters.filter((chapter) => chapter.status === 'scheduled').length
          : (book.scheduledChapterCount || 0)
      };
    });
  }, [books, chapters, isAdmin]);

  // Current entity lookups
  const activeBook = displayBooks.find((b) => b.slug === selectedBookSlug) || displayBooks[0];
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

  // Repair legacy/stale denormalized counters while an authorized author is
  // online. Readers continue to receive only published chapter documents.
  useEffect(() => {
    if (!isAdmin || books.length === 0) return;
    reconcileBookChapterCounts(books, chapters).catch((error) => {
      console.warn('Could not reconcile live book chapter counts:', error);
    });
  }, [books, chapters, isAdmin]);

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
            allBooks={displayBooks}
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
            books={displayBooks}
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
                The Author Studio is strictly reserved for the authorized author accounts (<span className="text-zinc-200 font-semibold">johnrufai242@gmail.com</span> / <span className="text-zinc-200 font-semibold">general5242@gmail.com</span>). Readers do not have publishing privileges.
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

      {/* Authentication Modal with Google Login, Popup Fallbacks & Fast Access */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleLogin={executeGoogleLogin}
        onShowToast={showToast}
      />

    </div>
  );
}

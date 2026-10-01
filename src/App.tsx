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
import { ProfileModal } from './components/ProfileModal';
import { ReadingSettingsModal } from './components/ReadingSettingsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { HelpSupportModal } from './components/HelpSupportModal';
import { SplashLoading } from './components/SplashLoading';
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
  listenToPublicChapters,
  reconcileLockedChapterIndex,
  reconcileBookChapterCounts
} from './lib/firebase';
import { syncBookmarksWithFirestore, syncProgressWithFirestore, syncLocalBookmarksToFirestore } from './lib/storage';

const DEFAULT_USER_ID = 'library-x-reader';

export default function App() {
  // Splash loading state
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Navigation & Routing state
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [previousRoute, setPreviousRoute] = useState<string>('home');
  const [selectedBookSlug, setSelectedBookSlug] = useState<string>('the-whisper-of-shadows');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(1);

  // Aux Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isReadingSettingsModalOpen, setIsReadingSettingsModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Reader Library Font state
  const [libraryFont, setLibraryFont] = useState<LibraryFont>(() => {
    return (localStorage.getItem('library_x_font') as LibraryFont) || 'serif';
  });

  // Firebase auth state
  const [firebaseUser, setFirebaseUser] = useState<User | SimpleAuthUser | null>(null);

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

  // Refresh Local Data
  const refreshData = useCallback(() => {
    const loadedBookmarks = getBookmarks(activeUserId);
    setBookmarks(loadedBookmarks);

    const loadedProgress = getReadingProgressList(activeUserId);
    setReadingProgressList(loadedProgress);

    const updates = getLatestUpdates();
    setLatestUpdates(updates);

    checkAndPublishScheduled();
  }, [activeUserId]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        syncUserProfileToFirestore(user).catch((err) =>
          console.warn('Could not sync user profile to cloud:', err)
        );

        try {
          const cloudBookmarks = await fetchUserBookmarksFromFirestore(user.uid);
          syncBookmarksWithFirestore(cloudBookmarks);

          const cloudProgress = await fetchUserReadingProgressFromFirestore(user.uid);
          syncProgressWithFirestore(cloudProgress);

          await syncLocalBookmarksToFirestore(user.uid, cloudBookmarks);
        } catch (err) {
          console.warn('Cloud sync error on auth state change:', err);
        }
      }
      refreshData();
    });

    checkRedirectResult().then((user) => {
      if (user) {
        setFirebaseUser(user);
        refreshData();
      }
    });

    return () => unsubscribe();
  }, [refreshData]);

  // Live Firestore Listeners for Books & Chapters
  useEffect(() => {
    let unsubBooks: () => void = () => {};
    let unsubChapters: () => void = () => {};

    try {
      unsubBooks = listenToBooks((liveBooks) => {
        if (liveBooks.length > 0) {
          setBooks(liveBooks);
        }
      });

      const userIsAdmin = isUserAdmin(firebaseUser);
      if (userIsAdmin) {
        unsubChapters = listenToChapters((liveChapters) => {
          if (liveChapters.length > 0) {
            setChapters(liveChapters);
          }
        });
      } else {
        unsubChapters = listenToPublicChapters((liveChapters) => {
          if (liveChapters.length > 0) {
            setChapters(liveChapters);
          }
        });
      }
    } catch (err) {
      console.warn('Live listener attachment error:', err);
    }

    return () => {
      unsubBooks();
      unsubChapters();
    };
  }, [firebaseUser]);

  // Initial Data Seed & Schedule Check
  useEffect(() => {
    seedInitialFirestoreData().catch((err) => console.warn('Seed error:', err));
    refreshData();
  }, [refreshData]);

  // Routing Handler
  const navigateTo = (route: string) => {
    if (currentRoute !== route && currentRoute !== 'book' && currentRoute !== 'reader') {
      setPreviousRoute(currentRoute);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenBook = (slug: string) => {
    setSelectedBookSlug(slug);
    navigateTo('book');
  };

  const handleOpenReader = (slug: string, chapterNumber: number = 1) => {
    setSelectedBookSlug(slug);
    setSelectedChapterNumber(chapterNumber);
    navigateTo('reader');
  };

  const handleToggleBookmark = async (b: Book) => {
    const added = await toggleBookmark(activeUserId, b);
    refreshData();
    showToast(added ? `Saved "${b.title}" to My Library` : `Removed "${b.title}" from My Library`, 'info');
  };

  const handleLoginWithGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      setFirebaseUser(user);
      refreshData();
      showToast(`Welcome back, ${user.displayName || 'Reader'}!`, 'success');
    } catch (error) {
      console.error('Google Sign-in error:', error);
      showToast('Could not complete Google Sign-in. Please try again.', 'error');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setFirebaseUser(null);
    refreshData();
    showToast('Signed out successfully', 'info');
  };

  const handleSaveChapter = async (ch: Chapter) => {
    try {
      await saveChapter(ch);
      refreshData();
      setAdminTab('chapters');
      showToast(`Chapter ${ch.chapterNumber} saved successfully.`, 'success');
      if (ch.status === 'published') {
        try {
          const result = await sendChapterNotification(ch.id);
          if (result.sent > 0) {
            showToast(`Published Ch. ${ch.chapterNumber}! Email sent to ${result.sent} reader(s).`, 'success');
          }
        } catch (e) {
          console.error('Notification dispatch error:', e);
        }
      }
    } catch (err) {
      showToast('Chapter could not be saved to cloud.', 'error');
      throw err;
    }
  };

  const handleSaveBook = async (b: Book) => {
    try {
      await saveBook(b);
      refreshData();
      setAdminTab('books');
      showToast(`Book "${b.title}" saved successfully.`, 'success');
    } catch (err) {
      showToast('Book could not be saved to cloud.', 'error');
      throw err;
    }
  };

  const handleDeleteChapter = async (chId: string) => {
    await deleteChapter(chId);
    refreshData();
    showToast('Chapter deleted', 'info');
  };

  const handlePublishNow = async (chId: string) => {
    await publishScheduledNow(chId);
    refreshData();
    showToast('Chapter published immediately', 'success');
  };

  const handleCancelSchedule = async (chId: string) => {
    await cancelScheduledRelease(chId);
    refreshData();
    showToast('Scheduled release cancelled', 'info');
  };

  const isAdmin = isUserAdmin(firebaseUser);
  const scheduledPendingCount = chapters.filter((c) => c.status === 'scheduled').length;

  const displayBooks = useMemo(() => {
    return books.map((book) => {
      const bookChapters = chapters.filter((chapter) => chapter.bookId === book.id);
      const publishedCount = bookChapters.filter((chapter) => chapter.status === 'published').length;

      return {
        ...book,
        publishedChapterCount: publishedCount || book.publishedChapterCount,
        scheduledChapterCount: isAdmin
          ? bookChapters.filter((chapter) => chapter.status === 'scheduled').length
          : (book.scheduledChapterCount || 0)
      };
    });
  }, [books, chapters, isAdmin]);

  const activeBook = displayBooks.find((b) => b.slug === selectedBookSlug) || displayBooks[0];
  const activeBookChapters = activeBook ? chapters.filter((c) => c.bookId === activeBook.id) : [];
  const activeChapter = activeBookChapters.find((c) => c.chapterNumber === selectedChapterNumber) || activeBookChapters[0];

  const bookmarksMap = useMemo(() => {
    return bookmarks.reduce((acc, bm) => {
      acc[bm.bookId] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }, [bookmarks]);

  const progressMap = useMemo(() => {
    return readingProgressList.reduce((acc, p) => {
      acc[p.bookId] = p;
      return acc;
    }, {} as Record<string, ReadingProgress>);
  }, [readingProgressList]);

  const currentUserProfile: UserProfile = {
    id: activeUserId,
    email: firebaseUser?.email || (isAdmin ? 'author@jaystarbliss.com' : 'reader@jaystarbliss.com'),
    displayName: firebaseUser?.displayName || (isAdmin ? 'Jaystarbliss Author' : 'Reader'),
    role: isAdmin ? 'admin' : 'reader',
    avatarUrl: firebaseUser?.photoURL || undefined,
    createdAt: '2024-01-01T00:00:00.000Z'
  };

  return (
    <div className="min-h-screen bg-[#09090d] text-zinc-100 flex flex-col font-sans-clean selection:bg-teal-500/20 selection:text-teal-200 transition-colors">
      
      {/* 0. SPLASH LOADING SCREEN (On Initial Mount) */}
      {showSplash && (
        <SplashLoading onComplete={() => setShowSplash(false)} minDurationMs={900} />
      )}

      {/* 1. TOP NAVIGATION HEADER (Hidden in Reader View) */}
      {currentRoute !== 'reader' && (
        <Header
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          currentUser={currentUserProfile}
          firebaseUser={firebaseUser}
          bookmarkCount={bookmarks.length}
          onLoginWithGoogle={handleLoginWithGoogle}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        />
      )}

      {/* 2. MAIN APPLICATION CONTENT ROUTER */}
      <div className="flex-1 pb-20 md:pb-0">
        
        {/* READER VIEW */}
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

        {/* HOME / DISCOVER */}
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

        {/* BOOKS / COMPLETE CATALOGUE */}
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

        {/* BROWSE / GENRES */}
        {currentRoute === 'genres' && (
          <GenresView
            books={displayBooks}
            onSelectBook={handleOpenBook}
            onFilterGenre={() => navigateTo('library')}
          />
        )}

        {/* LATEST RELEASES */}
        {currentRoute === 'latest' && (
          <LatestUpdatesView
            updates={latestUpdates}
            onSelectChapter={handleOpenReader}
            onSelectBook={handleOpenBook}
          />
        )}

        {/* SEARCH ARCHIVE */}
        {currentRoute === 'search' && (
          <SearchView
            onSelectBook={handleOpenBook}
            onSelectChapter={handleOpenReader}
          />
        )}

        {/* MY LIBRARY & SHELF */}
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
            onToggleNotification={async (bId, enabled) => {
              try {
                await updateBookmarkNotification(activeUserId, bId, enabled);
                refreshData();
                showToast(enabled ? 'Email alerts active for new chapters' : 'Email alerts muted for this book', 'info');
              } catch (e) {
                showToast('Could not save notification preference', 'error');
              }
            }}
            onExploreLibrary={() => navigateTo('library')}
          />
        )}

        {/* BOOK DETAIL PAGE */}
        {currentRoute === 'book' && activeBook && (
          <BookDetailView
            book={activeBook}
            chapters={activeBookChapters}
            progress={progressMap[activeBook.id]}
            userId={activeUserId}
            currentUser={firebaseUser}
            onSelectChapter={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onStartReading={(chNum) => handleOpenReader(activeBook.slug, chNum)}
            onBack={() => {
              const target = (previousRoute === 'book' || previousRoute === 'reader') ? 'home' : previousRoute;
              navigateTo(target);
            }}
            onShowToast={showToast}
            isAdmin={isAdmin}
            onEditBook={(bId) => {
              setEditingBookId(bId);
              setAdminTab('book-editor');
              navigateTo('admin');
            }}
          />
        )}

        {/* AUTHOR STUDIO (ADMIN) */}
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

              <main className="flex-1 bg-[#09090d] overflow-y-auto">
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
            <div className="max-w-xl mx-auto my-16 p-8 bg-[#12131c] border border-white/10 rounded-3xl text-center space-y-4 shadow-xl">
              <Shield className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-xl font-bold uppercase text-white tracking-wide font-sans-clean">
                Author Studio Access Restricted
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans-clean">
                The Author Studio is strictly reserved for authorized author accounts (johnrufai242@gmail.com).
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-2xl transition-all shadow-md active:scale-95"
              >
                RETURN TO READER LIBRARY
              </button>
            </div>
          )
        )}
      </div>

      {/* 3. FOOTER (Hidden inside Reader & Admin) */}
      {currentRoute !== 'reader' && currentRoute !== 'admin' && (
        <Footer onNavigate={navigateTo} isAdmin={isAdmin} />
      )}

      {/* 4. MOBILE FLOATING BOTTOM NAV BAR */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        firebaseUser={firebaseUser}
        currentUser={currentUserProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 5. PROFILE MODAL */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUserProfile}
        firebaseUser={firebaseUser}
        onNavigate={navigateTo}
        onLoginWithGoogle={handleLoginWithGoogle}
        onLogout={handleLogout}
        onOpenSettings={() => setIsReadingSettingsModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* 7. READING SETTINGS MODAL */}
      <ReadingSettingsModal
        isOpen={isReadingSettingsModalOpen}
        onClose={() => setIsReadingSettingsModalOpen(false)}
      />

      {/* 8. NOTIFICATIONS MODAL */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        bookmarks={bookmarks}
        books={books}
        onToggleBookNotification={async (bId, enabled) => {
          try {
            await updateBookmarkNotification(activeUserId, bId, enabled);
            refreshData();
            showToast(enabled ? 'Notifications enabled' : 'Notifications muted', 'info');
          } catch (e) {
            showToast('Could not save preference', 'error');
          }
        }}
        onShowToast={showToast}
      />

      {/* 9. HELP & SUPPORT MODAL */}
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* 10. AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginWithGoogle={handleLoginWithGoogle}
        onShowToast={showToast}
      />

      {/* 11. FEEDBACK NOTIFICATION TOASTS */}
      <NotificationToast
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

    </div>
  );
}

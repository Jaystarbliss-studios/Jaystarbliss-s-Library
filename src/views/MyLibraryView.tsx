import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Bookmark, ReadingProgress, Book } from '../types';
import {
  Bookmark as BookmarkIcon,
  History,
  BookOpen,
  Clock,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Bell,
  BellOff,
  LogIn,
  ShieldCheck
} from 'lucide-react';

interface MyLibraryViewProps {
  bookmarks: Bookmark[];
  readingProgressList: ReadingProgress[];
  firebaseUser: User | null;
  onLoginWithGoogle: () => void;
  onSelectBook: (slug: string) => void;
  onSelectChapter: (slug: string, chapterNumber: number) => void;
  onRemoveBookmark: (bookId: string) => void;
  onToggleNotification: (bookId: string, enabled: boolean) => void;
  onExploreLibrary: () => void;
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({
  bookmarks,
  readingProgressList,
  firebaseUser,
  onLoginWithGoogle,
  onSelectBook,
  onSelectChapter,
  onRemoveBookmark,
  onToggleNotification,
  onExploreLibrary
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'reading'>('bookmarks');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-calibri">
      
      {/* Header & User Cloud Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <BookmarkIcon className="w-5 h-5 fill-amber-400/20" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
              MY PERSONAL SHELF
            </h1>
          </div>
          <p className="font-mono-space text-xs sm:text-sm text-zinc-400">
            SAVED MANUSCRIPTS, READING PROGRESS, AND CHAPTER EMAIL NOTIFICATIONS
          </p>
        </div>

        {/* Account Sync Pill */}
        {firebaseUser ? (
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono-space self-start md:self-auto shadow-md">
            {firebaseUser.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={firebaseUser.displayName || 'Reader'}
                className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{firebaseUser.displayName || firebaseUser.email}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block truncate max-w-[200px]">
                {firebaseUser.email}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onLoginWithGoogle}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-wider transition-all shadow-md active:scale-95 self-start md:self-auto"
          >
            <LogIn className="w-4 h-4 text-zinc-950" />
            <span>SIGN IN</span>
          </button>
        )}
      </div>

      {/* Cloud Account Notice if Not Signed In */}
      {!firebaseUser && (
        <div className="p-5 rounded-2xl bg-[#14141e] border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-cinzel text-sm font-bold text-zinc-100 flex items-center gap-2">
              <BookmarkIcon className="w-4 h-4 text-zinc-400" />
              <span>Connect Your Google Account</span>
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-xl">
              Sign in directly with your Google account to automatically assign books to your own library profile, receive email alerts when new chapters are published, and sync reading progress across all your devices.
            </p>
          </div>
          <button
            onClick={onLoginWithGoogle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-wider transition-all shadow-sm active:scale-95 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
        </div>
      )}

      {/* Tabs Switcher with Softer Rounded Pills */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 w-fit">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono-space tracking-widest uppercase transition-all rounded-xl ${
            activeTab === 'bookmarks'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookmarkIcon className="w-3.5 h-3.5" />
          <span>MY SAVED BOOKS ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono-space tracking-widest uppercase transition-all rounded-xl ${
            activeTab === 'reading'
              ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>READING PROGRESS ({readingProgressList.length})</span>
        </button>
      </div>

      {/* Bookmarks Tab Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((bm) => {
                const isNotificationsActive = bm.emailNotificationsEnabled !== false;

                return (
                  <div
                    key={bm.id}
                    className="p-5 bg-[#131319]/90 border border-zinc-800/80 rounded-2xl space-y-4 hover:border-zinc-700/80 transition-all shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={bm.bookCoverUrl}
                          alt={bm.bookTitle}
                          className="w-18 h-26 object-cover rounded-xl border border-zinc-700/80 shrink-0 cursor-pointer shadow-md hover:scale-102 transition-transform"
                          onClick={() => onSelectBook(bm.bookSlug)}
                        />

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <span className="text-[10px] font-mono-space text-amber-400 uppercase tracking-wider block font-bold">
                            {bm.bookStatus === 'ongoing' ? 'Serializing' : bm.bookStatus}
                          </span>
                          <h3
                            onClick={() => onSelectBook(bm.bookSlug)}
                            className="font-cinzel text-base font-bold text-white hover:text-zinc-200 cursor-pointer line-clamp-2 leading-snug"
                          >
                            {bm.bookTitle}
                          </h3>
                          <span className="text-[11px] font-mono-space text-zinc-500 block">
                            Added {new Date(bm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Google Email Notification Toggle for this Book */}
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isNotificationsActive ? (
                            <Bell className="w-4 h-4 text-amber-400" />
                          ) : (
                            <BellOff className="w-4 h-4 text-zinc-500" />
                          )}
                          <div>
                            <span className="text-xs font-mono-space text-zinc-200 block font-semibold">
                              New Chapter Alerts
                            </span>
                            <span className="text-[10px] text-zinc-400 font-sans block">
                              {firebaseUser?.email ? `To ${firebaseUser.email}` : 'Google email alerts'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleNotification(bm.bookId, !isNotificationsActive)}
                          className={`px-3 py-1 text-xs font-mono-space rounded-full border transition-all ${
                            isNotificationsActive
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {isNotificationsActive ? 'ACTIVE' : 'MUTED'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                      <button
                        onClick={() => onRemoveBookmark(bm.bookId)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove from My Shelf"
                        aria-label="Remove Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectBook(bm.bookSlug)}
                        className="px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs font-mono-space tracking-wider border border-zinc-700/80 rounded-xl transition-colors shadow-sm"
                      >
                        OPEN BOOK
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#131319]/80 border border-zinc-800/80 rounded-2xl space-y-4 max-w-md mx-auto shadow-xl">
              <BookmarkIcon className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="space-y-1.5">
                <h3 className="font-cinzel text-lg font-bold text-white uppercase">
                  NO SAVED BOOKS IN YOUR SHELF
                </h3>
                <p className="font-cambria text-sm text-zinc-400 leading-relaxed">
                  Browse the library catalog and tap the bookmark ribbon to assign books to your account and receive instant Google email chapter notifications.
                </p>
              </div>
              <button
                onClick={onExploreLibrary}
                className="px-5 py-2.5 bg-zinc-100 text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-xl hover:bg-white transition-all shadow-md active:scale-95"
              >
                BROWSE ARCHIVE
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reading Progress Tab Content */}
      {activeTab === 'reading' && (
        <div className="space-y-6">
          {readingProgressList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {readingProgressList.map((prog) => (
                <div
                  key={prog.id}
                  className="p-5 bg-[#131319]/90 border border-zinc-800/80 rounded-2xl space-y-4 hover:border-zinc-700/80 transition-colors shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={prog.bookCoverUrl}
                      alt={prog.bookTitle}
                      className="w-18 h-26 object-cover rounded-xl border border-zinc-700/80 shrink-0 cursor-pointer shadow-md"
                      onClick={() => onSelectBook(prog.bookSlug)}
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-mono-space text-zinc-400 tracking-wider uppercase block">
                        LAST READ: {new Date(prog.lastReadAt).toLocaleDateString()}
                      </span>

                      <h3
                        onClick={() => onSelectBook(prog.bookSlug)}
                        className="font-cinzel text-lg font-bold text-white hover:text-zinc-200 cursor-pointer truncate"
                      >
                        {prog.bookTitle}
                      </h3>

                      <p className="font-mono-space text-xs text-amber-400 font-semibold truncate">
                        Chapter {prog.lastChapterNumber} — {prog.lastChapterTitle}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-mono-space text-zinc-400">
                          <span>Reading Depth</span>
                          <span>{prog.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all"
                            style={{ width: `${prog.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onSelectBook(prog.bookSlug)}
                      className="text-xs font-mono-space text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
                    >
                      Table of Contents
                    </button>

                    <button
                      onClick={() => onSelectChapter(prog.bookSlug, prog.lastChapterNumber)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space tracking-wider font-bold rounded-xl shadow-md transition-all active:scale-95"
                    >
                      <span>RESUME CH. {prog.lastChapterNumber}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#131319]/80 border border-zinc-800/80 rounded-2xl space-y-4 max-w-md mx-auto shadow-xl">
              <History className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="space-y-1.5">
                <h3 className="font-cinzel text-lg font-bold text-white uppercase">
                  NO READING HISTORY RECORDED
                </h3>
                <p className="font-cambria text-sm text-zinc-400 leading-relaxed">
                  Start reading any chapter in Library X, and your scroll depth and bookmark position will automatically be saved to your profile.
                </p>
              </div>
              <button
                onClick={onExploreLibrary}
                className="px-5 py-2.5 bg-zinc-100 text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-xl hover:bg-white transition-all shadow-md active:scale-95"
              >
                START READING
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

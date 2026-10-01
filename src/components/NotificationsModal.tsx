import React, { useState } from 'react';
import { X, Bell, Mail, CheckCircle2, BookOpen } from 'lucide-react';
import { Bookmark, Book } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks?: Bookmark[];
  books?: Book[];
  onToggleBookNotification?: (bookId: string, enabled: boolean) => Promise<void>;
  onShowToast?: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  bookmarks = [],
  books = [],
  onToggleBookNotification,
  onShowToast
}) => {
  const [masterEmail, setMasterEmail] = useState(true);
  const [newChapters, setNewChapters] = useState(true);
  const [bookUpdates, setBookUpdates] = useState(true);
  const [specialAnnouncements, setSpecialAnnouncements] = useState(true);

  if (!isOpen) return null;

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean, label: string) => {
    setter(!val);
    onShowToast?.(`${label} preference updated`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Container */}
      <div className="relative w-full max-w-md bg-[#12131b] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-100 font-sans-clean">
              Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1b26] text-zinc-400 hover:text-white border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Master Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-[#171824] rounded-2xl border border-white/5">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">Email Notifications</p>
                <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                  Get notified when new chapters are available for your subscribed books.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(setMasterEmail, masterEmail, 'Email Notifications')}
              className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                masterEmail ? 'bg-teal-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  masterEmail ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Granular Notification Categories */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono-space text-zinc-500 uppercase tracking-wider px-1">
              Notify me for:
            </p>

            <div className="bg-[#171824] rounded-2xl border border-white/5 divide-y divide-white/5">
              {/* New Chapters */}
              <div className="flex items-center justify-between p-3.5">
                <span className="text-sm text-zinc-200">New Chapters</span>
                <button
                  onClick={() => handleToggle(setNewChapters, newChapters, 'New Chapters')}
                  className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    newChapters ? 'bg-teal-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      newChapters ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Book Updates */}
              <div className="flex items-center justify-between p-3.5">
                <span className="text-sm text-zinc-200">Book Updates</span>
                <button
                  onClick={() => handleToggle(setBookUpdates, bookUpdates, 'Book Updates')}
                  className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    bookUpdates ? 'bg-teal-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      bookUpdates ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Special Announcements */}
              <div className="flex items-center justify-between p-3.5">
                <span className="text-sm text-zinc-200">Special Announcements</span>
                <button
                  onClick={() => handleToggle(setSpecialAnnouncements, specialAnnouncements, 'Special Announcements')}
                  className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    specialAnnouncements ? 'bg-teal-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      specialAnnouncements ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Subscribed Books Section */}
          {bookmarks.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-mono-space text-zinc-500 uppercase tracking-wider px-1">
                Subscribed Books ({bookmarks.length})
              </p>
              <div className="space-y-2">
                {bookmarks.map((bm) => {
                  const isSubscribed = bm.emailNotificationsEnabled !== false;
                  return (
                    <div
                      key={bm.bookId}
                      className="flex items-center justify-between p-3 bg-[#171824] rounded-2xl border border-white/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={bm.bookCoverUrl}
                          alt={bm.bookTitle}
                          className="w-8 h-11 object-cover rounded-lg shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">
                            {bm.bookTitle}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {isSubscribed ? 'Alerts active' : 'Alerts muted'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleBookNotification?.(bm.bookId, !isSubscribed)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          isSubscribed
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isSubscribed ? 'Active' : 'Muted'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[11px] text-zinc-500 text-center font-mono-space pt-2">
            You can update these anytime in your notification settings.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wider transition-colors shrink-0"
        >
          SAVE PREFERENCES
        </button>
      </div>
    </div>
  );
};

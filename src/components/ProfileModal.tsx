import React from 'react';
import { 
  X, 
  Bookmark, 
  Bell, 
  Settings, 
  HelpCircle, 
  Shield, 
  LogOut, 
  LogIn, 
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { UserProfile } from '../types';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  firebaseUser?: User | SimpleAuthUser | null;
  onNavigate: (route: string) => void;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  firebaseUser,
  onNavigate,
  onLoginWithGoogle,
  onLogout,
  onOpenSettings,
  onOpenNotifications,
  onOpenHelp
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Container */}
      <div className="relative w-full max-w-md bg-[#12131b] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="font-semibold text-lg text-zinc-100 font-sans-clean">
            Reader Profile
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1b26] text-zinc-400 hover:text-white border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="my-5 p-4 bg-[#171824] rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg overflow-hidden shrink-0 border border-white/10">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : firebaseUser ? (
              (currentUser?.displayName || 'U')[0].toUpperCase()
            ) : (
              <UserIcon className="w-7 h-7 text-white/80" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-zinc-100 truncate font-sans-clean">
              {currentUser?.displayName || (firebaseUser ? 'Reader' : 'Guest Reader')}
            </h4>
            <p className="text-xs text-zinc-400 truncate">
              {currentUser?.email || (firebaseUser ? '' : 'Sign in to sync your library across devices')}
            </p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono-space font-semibold uppercase tracking-wider">
                Author & Publisher
              </span>
            )}
          </div>
        </div>

        {/* Action List Items */}
        <div className="space-y-2">
          {/* My Library */}
          <div
            onClick={() => {
              onClose();
              onNavigate('my-library');
            }}
            className="flex items-center justify-between p-3.5 bg-[#171824] hover:bg-[#1c1e2d] rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <Bookmark className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">My Library</p>
                <p className="text-[11px] text-zinc-500">Your books and reading progress</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>

          {/* Notifications */}
          <div
            onClick={() => {
              onClose();
              onOpenNotifications();
            }}
            className="flex items-center justify-between p-3.5 bg-[#171824] hover:bg-[#1c1e2d] rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Notifications</p>
                <p className="text-[11px] text-zinc-500">Get notified about new chapters</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>

          {/* Settings */}
          <div
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center justify-between p-3.5 bg-[#171824] hover:bg-[#1c1e2d] rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <Settings className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Settings</p>
                <p className="text-[11px] text-zinc-500">Appearance, reading preferences</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>

          {/* Help & Support */}
          <div
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="flex items-center justify-between p-3.5 bg-[#171824] hover:bg-[#1c1e2d] rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Help & Support</p>
                <p className="text-[11px] text-zinc-500">FAQs and contact us</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>

          {/* Admin Author Studio */}
          {isAdmin && (
            <div
              onClick={() => {
                onClose();
                onNavigate('admin');
              }}
              className="flex items-center justify-between p-3.5 bg-amber-500/10 hover:bg-amber-500/15 rounded-2xl border border-amber-500/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-200">Author Studio</p>
                  <p className="text-[11px] text-amber-400/80">Manage books and chapters</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </div>
          )}
        </div>

        {/* Footer Authentication Action */}
        <div className="mt-6 pt-4 border-t border-white/10">
          {firebaseUser ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-bold tracking-wider transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onLoginWithGoogle();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wider transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

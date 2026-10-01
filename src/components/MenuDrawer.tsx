import React from 'react';
import { 
  BookOpen, 
  Home, 
  Layers, 
  Bookmark, 
  Settings, 
  HelpCircle, 
  X, 
  Shield, 
  LogIn, 
  LogOut,
  Bell
} from 'lucide-react';
import { UserProfile } from '../types';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser?: UserProfile;
  firebaseUser?: User | SimpleAuthUser | null;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
  currentUser,
  firebaseUser,
  onLoginWithGoogle,
  onLogout,
  onOpenSettings,
  onOpenNotifications,
  onOpenHelp
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleNav = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#0f1017] text-zinc-100 h-full flex flex-col justify-between p-6 shadow-2xl border-r border-white/10 z-10 animate-in slide-in-from-left duration-200">
        <div className="space-y-6">
          {/* Header & Close */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#181926] border border-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-zinc-100" />
              </div>
              <div>
                <span className="font-sans-clean font-bold tracking-wide text-zinc-100 text-base block">
                  Jaystarbliss
                </span>
                <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-mono-space block">
                  Library
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#181926] text-zinc-400 hover:text-white border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Snippet if logged in */}
          {firebaseUser && (
            <div className="flex items-center gap-3 p-3 bg-[#151622] rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white overflow-hidden shrink-0">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (currentUser?.displayName || 'U')[0].toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-100 truncate">
                  {currentUser?.displayName || 'Reader'}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {currentUser?.email || ''}
                </p>
              </div>
            </div>
          )}

          {/* Primary Navigation */}
          <div className="bg-[#141520] p-2 rounded-2xl border border-white/5 space-y-1">
            <button
              onClick={() => handleNav('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'home'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNav('library')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'library'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Books</span>
            </button>

            <button
              onClick={() => handleNav('genres')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'genres'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Genres</span>
            </button>

            <button
              onClick={() => handleNav('my-library')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'my-library'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>My Library</span>
            </button>
          </div>

          {/* Secondary Options */}
          <div className="bg-[#141520] p-2 rounded-2xl border border-white/5 space-y-1">
            <button
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenHelp();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Author Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {firebaseUser ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold tracking-wider hover:bg-red-500/20 transition-colors"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-bold tracking-wider hover:bg-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          )}

          <p className="text-center text-[10px] text-zinc-500 font-mono-space">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

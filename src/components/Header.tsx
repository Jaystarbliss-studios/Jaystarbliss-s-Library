import React from 'react';
import { 
  BookOpen, 
  Search, 
  Bell, 
  Menu, 
  Bookmark, 
  LogIn
} from 'lucide-react';
import { UserProfile } from '../types';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser?: UserProfile;
  firebaseUser?: User | SimpleAuthUser | null;
  bookmarkCount?: number;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  onOpenMenuDrawer?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  firebaseUser,
  bookmarkCount = 0,
  onLoginWithGoogle,
  onLogout,
  onOpenMenuDrawer,
  onOpenProfile,
  onOpenNotifications
}) => {
  const navLinks = [
    { label: 'Home', route: 'home' },
    { label: 'Books', route: 'library' },
    { label: 'Genres', route: 'genres' },
    { label: 'My Library', route: 'my-library' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090d]/90 backdrop-blur-xl border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Left: Brand Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            onClick={onOpenMenuDrawer}
            className="md:hidden p-2 rounded-xl bg-[#141520] text-zinc-400 hover:text-white border border-white/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & Name */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#141522] border border-white/10 flex items-center justify-center shadow-md group-hover:border-teal-500/40 transition-colors">
              <BookOpen className="w-4.5 h-4.5 text-zinc-100 group-hover:text-teal-400 transition-colors" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col">
              <span className="font-sans-clean text-base sm:text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                Jaystarbliss Library
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route || 
              (link.route === 'library' && currentRoute === 'latest');

            return (
              <button
                key={link.route}
                onClick={() => onNavigate(link.route)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => onNavigate('search')}
            className={`p-2.5 rounded-xl border transition-all ${
              currentRoute === 'search'
                ? 'bg-white/10 text-white border-white/20 shadow-sm'
                : 'bg-[#141520] hover:bg-[#1a1c2a] text-zinc-400 hover:text-white border-white/5'
            }`}
            title="Search catalog"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="p-2.5 rounded-xl bg-[#141520] hover:bg-[#1a1c2a] text-zinc-400 hover:text-white border border-white/5 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </button>

          {/* User Profile Avatar / Sign In */}
          {firebaseUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-[#141520] hover:bg-[#1a1c2a] border border-white/5 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  (currentUser?.displayName || 'U')[0].toUpperCase()
                )}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-zinc-300 group-hover:text-white truncate max-w-[100px]">
                {currentUser?.displayName?.split(' ')[0] || 'Profile'}
              </span>
            </button>
          ) : (
            <button
              onClick={onLoginWithGoogle}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wide transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIGN IN</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

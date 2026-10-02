import React from 'react';
import { 
  Search, 
  Bell, 
  LogIn
} from 'lucide-react';
import { UserProfile } from '../types';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';
import { InstallAppButton } from './InstallAppButton';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser?: UserProfile;
  firebaseUser?: User | SimpleAuthUser | null;
  bookmarkCount?: number;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  firebaseUser,
  onLoginWithGoogle,
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
    <header className="sticky top-0 z-40 w-full bg-[#09090d]/95 backdrop-blur-xl border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 md:h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group text-left min-w-0"
            aria-label="Library X Home"
          >
            {/* Library X Official Logo Icon */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 aspect-square shrink-0 rounded-xl bg-[#141522] border border-white/10 flex items-center justify-center shadow-md group-hover:border-teal-500/40 transition-all overflow-hidden p-0.5">
              <img
                src="/library-x.png"
                alt="Library X"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            
            <span className="font-sans-clean text-sm sm:text-base md:text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors truncate">
              Library X
            </span>
          </button>
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
                className={`px-3.5 lg:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
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

        {/* Right: Search, Notifications, Install App & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* PWA Install Button */}
          <InstallAppButton />

          {/* Search Trigger */}
          <button
            onClick={() => onNavigate('search')}
            className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 aspect-square shrink-0 rounded-xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
              currentRoute === 'search'
                ? 'bg-white/10 text-white border-white/20 shadow-sm'
                : 'bg-[#141520] hover:bg-[#1a1c2a] text-zinc-400 hover:text-white border-white/5'
            }`}
            title="Search catalog"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 aspect-square shrink-0 rounded-xl bg-[#141520] hover:bg-[#1a1c2a] text-zinc-400 hover:text-white border border-white/5 transition-all relative flex items-center justify-center cursor-pointer active:scale-95"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-400 animate-pulse" />
          </button>

          {/* User Profile Avatar / Sign In */}
          {firebaseUser ? (
            <button
              onClick={onOpenProfile}
              className="h-8 sm:h-9 md:h-10 flex items-center gap-1.5 sm:gap-2 p-0.5 sm:p-1 lg:pl-1 lg:pr-2.5 rounded-xl bg-[#141520] hover:bg-[#1a1c2a] border border-white/5 transition-all group cursor-pointer active:scale-95 shrink-0"
              aria-label="Profile settings"
            >
              <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-8 md:h-8 aspect-square shrink-0 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm">
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
              className="h-8 sm:h-9 md:h-10 aspect-square sm:aspect-auto w-8 sm:w-auto sm:px-3.5 md:px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              title="Sign In with Google"
              aria-label="Sign In"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">SIGN IN</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

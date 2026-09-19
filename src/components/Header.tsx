import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Compass,
  Bookmark,
  Search,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';
import { InstallAppButton } from './InstallAppButton';
import libraryXDarkLogo from '../library x - dark theme.png';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  currentUser: UserProfile | null;
  firebaseUser: User | SimpleAuthUser | null;
  onToggleUserRole?: () => void;
  bookmarkCount: number;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  firebaseUser,
  bookmarkCount,
  onLoginWithGoogle,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation links with icons for Library, Latest, Genres, Search, and My Shelf
  const navLinks = [
    { label: 'LIBRARY', route: 'library', icon: BookOpen },
    { label: 'LATEST', route: 'latest', icon: Clock },
    { label: 'GENRES', route: 'genres', icon: Compass },
    ...(firebaseUser ? [{ label: 'MY SHELF', route: 'my-library', icon: Bookmark, badge: bookmarkCount > 0 ? bookmarkCount : null }] : []),
    { label: 'SEARCH', route: 'search', icon: Search }
  ];

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0d12]/95 backdrop-blur-xl border-b border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('home')}
          className="cursor-pointer group flex items-center select-none"
          aria-label="Library X home"
        >
          <img
            src={libraryXDarkLogo}
            alt="Library X"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </div>

        {/* Desktop Navigation Links with dedicated icons */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            const Icon = link.icon;
            return (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className={`px-3.5 py-2 text-xs font-mono-space font-medium tracking-widest rounded-xl transition-all relative flex items-center gap-2 group cursor-pointer ${
                  isActive
                    ? 'text-zinc-100 bg-zinc-800/90 border border-zinc-700/70 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                <span>{link.label}</span>
                {link.badge !== null && link.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Utility: Install, Google Auth & Studio */}
        <div className="hidden lg:flex items-center gap-3">\n          <InstallAppButton />
          
          {/* User Account / Auth */}
          {firebaseUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono-space shadow-sm">
              {firebaseUser.photoURL ? (
                <img 
                  src={firebaseUser.photoURL} 
                  alt={firebaseUser.displayName || 'User'} 
                  className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center text-[10px] font-bold">
                  {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-zinc-200 max-w-[120px] truncate" title={firebaseUser.email || ''}>
                {firebaseUser.displayName?.split(' ')[0] || firebaseUser.email?.split('@')[0]}
              </span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full tracking-wider uppercase ${isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-zinc-800 text-zinc-300'}`}>
                {isAdmin ? 'Author' : 'Reader'}
              </span>
              <button
                onClick={onLogout}
                title="Sign out"
                className="ml-1 text-zinc-500 hover:text-rose-400 transition-colors p-1"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginWithGoogle}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono-space tracking-wider border rounded-xl transition-all text-zinc-100 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 hover:text-white shadow-sm active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5 text-zinc-300" />
              <span>SIGN IN</span>
            </button>
          )}

          {/* Author Studio Navigation (Strictly restricted to verified admin) */}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono-space tracking-widest border rounded-xl transition-all active:scale-95 ${
                currentRoute.startsWith('admin')
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-semibold shadow-md'
                  : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>AUTHOR STUDIO</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className="p-2 text-xs font-mono-space bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl"
              aria-label="Author Studio"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/50 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121218] border-b border-zinc-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4">\n          <InstallAppButton className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 text-xs font-mono-space tracking-wider" />
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            const Icon = link.icon;
            return (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-mono-space tracking-wider transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge !== null && link.badge !== undefined && (
                  <span className="px-2 py-0.5 bg-zinc-700 text-zinc-200 text-[10px] rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Auth Button */}
          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            {firebaseUser ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2">
                  {firebaseUser.photoURL ? (
                    <img 
                      src={firebaseUser.photoURL} 
                      alt={firebaseUser.displayName || 'User'} 
                      className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-center">
                      {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-zinc-300 truncate max-w-[160px]">
                    {firebaseUser.displayName || firebaseUser.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs font-mono-space text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-500/10"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginWithGoogle}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-mono-space text-xs font-bold tracking-wider"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

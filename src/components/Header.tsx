import React, { useState } from 'react';
import { BookOpen, Search, Bookmark, Clock, Compass, Shield, Menu, X, Feather, UserCheck, LogIn, LogOut, Cloud, CloudCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  onToggleUserRole: () => void;
  bookmarkCount: number;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  firebaseUser,
  onToggleUserRole,
  bookmarkCount,
  onLoginWithGoogle,
  onLogout,
  isCloudConnected = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'LIBRARY', route: 'library', icon: BookOpen },
    { label: 'LATEST', route: 'latest', icon: Clock },
    { label: 'GENRES', route: 'genres', icon: Compass },
    { label: 'MY LIBRARY', route: 'my-library', icon: Bookmark, badge: bookmarkCount > 0 ? bookmarkCount : null },
    { label: 'SEARCH', route: 'search', icon: Search }
  ];

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Literary Identity */}
        <div 
          onClick={() => handleNav('home')} 
          className="cursor-pointer group flex items-center gap-3 select-none"
        >
          <div className="w-10 h-10 rounded-sm bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition-colors shadow-sm">
            <Feather className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-cinzel text-lg sm:text-xl font-bold tracking-widest text-zinc-100 block group-hover:text-white transition-colors">
              LIBRARY X
            </span>
            <span className="font-mono-space text-[10px] tracking-widest text-zinc-400 block uppercase">
              SOVEREIGN LITERARY ARCHIVE & PUBLISHING
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            const Icon = link.icon;
            return (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono-space font-medium tracking-widest rounded-sm transition-colors relative ${
                  isActive
                    ? 'text-zinc-100 bg-zinc-800/80 border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge !== null && (
                  <span className="ml-1 px-1.5 py-0.2 bg-zinc-700 text-zinc-100 text-[10px] rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Utility: Cloud Status, Auth & Author Studio */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Cloud Firestore Status Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono-space tracking-wider rounded-sm bg-zinc-900/90 border border-zinc-800 text-zinc-400 select-none"
            title="Cloud Firestore Real-Time Sync Active"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-zinc-300">FIRESTORE</span>
          </div>

          {/* User Account / Google Auth */}
          {firebaseUser ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-xs font-mono-space">
              {firebaseUser.photoURL ? (
                <img 
                  src={firebaseUser.photoURL} 
                  alt={firebaseUser.displayName || 'User'} 
                  className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200">
                  {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-zinc-300 max-w-[120px] truncate" title={firebaseUser.email || ''}>
                {firebaseUser.displayName?.split(' ')[0] || firebaseUser.email?.split('@')[0]}
              </span>
              <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-xs tracking-wider uppercase ${isAdmin ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-400'}`}>
                {isAdmin ? 'Author' : 'Reader'}
              </span>
              <button
                onClick={onLogout}
                title="Sign out of Firebase"
                className="ml-1 text-zinc-500 hover:text-rose-400 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginWithGoogle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono-space tracking-wider border rounded-sm transition-colors text-zinc-300 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 hover:text-white shadow-xs"
              title="Sign in with Google to sync bookmarks & progress to Cloud Firestore"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>SIGN IN</span>
            </button>
          )}

          {/* Fast Toggle between Author Studio and Reader Mode for Testing */}
          <button
            onClick={onToggleUserRole}
            title={isAdmin ? "Switch to Reader Mode" : "Switch to Author / Admin Mode"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono-space tracking-wider border rounded-sm transition-colors text-zinc-400 border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:text-zinc-200"
          >
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Mode: <strong className={isAdmin ? "text-emerald-400" : "text-amber-400"}>{isAdmin ? "Author" : "Reader"}</strong></span>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono-space tracking-widest border rounded-sm transition-colors ${
                currentRoute.startsWith('admin')
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-semibold'
                  : 'bg-zinc-800/90 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>AUTHOR STUDIO</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className="p-2 text-xs font-mono-space bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-sm"
              aria-label="Author Studio"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121215] border-b border-zinc-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            const Icon = link.icon;
            return (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded text-sm font-mono-space tracking-widest ${
                  isActive
                    ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== null && (
                  <span className="px-2 py-0.5 bg-zinc-700 text-zinc-200 text-xs rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            {/* Mobile Auth Button */}
            {firebaseUser ? (
              <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded">
                <div className="flex items-center gap-2">
                  {firebaseUser.photoURL ? (
                    <img 
                      src={firebaseUser.photoURL} 
                      alt="" 
                      className="w-6 h-6 rounded-full" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                      {(firebaseUser.displayName || 'U')[0]}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-200 font-mono-space truncate max-w-[150px]">
                      {firebaseUser.displayName || firebaseUser.email}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono-space">
                      {isAdmin ? 'Author & Publisher' : 'Reader'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 text-xs font-mono-space text-rose-400 hover:text-rose-300 border border-rose-900/50 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-xs font-mono-space text-zinc-200 tracking-wider"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>SIGN IN WITH GOOGLE</span>
              </button>
            )}

            <button
              onClick={onToggleUserRole}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded text-xs font-mono-space tracking-wider text-zinc-300 bg-zinc-900 border border-zinc-800"
            >
              <span>Current Identity Mode:</span>
              <span className={`font-bold ${isAdmin ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAdmin ? 'Author / Admin' : 'Reader'} (Tap to toggle)
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 text-zinc-900 text-xs font-mono-space tracking-widest font-bold rounded-sm shadow-md"
              >
                <Shield className="w-4 h-4" />
                <span>OPEN AUTHOR PUBLISHING STUDIO</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

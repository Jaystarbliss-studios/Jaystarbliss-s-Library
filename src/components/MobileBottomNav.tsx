import React from 'react';
import { BookOpen, Clock, Compass, Search, Bookmark, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  bookmarkCount: number;
  isAdmin: boolean;
  isLoggedIn?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  bookmarkCount,
  isAdmin,
  isLoggedIn = false
}) => {
  // Hide in distraction-free reader mode
  if (currentRoute === 'reader') return null;

  const items = [
    {
      id: 'home',
      label: 'Library',
      icon: BookOpen,
      isActive: currentRoute === 'home' || currentRoute === 'library'
    },
    {
      id: 'latest',
      label: 'Latest',
      icon: Clock,
      isActive: currentRoute === 'latest'
    },
    {
      id: 'genres',
      label: 'Genres',
      icon: Compass,
      isActive: currentRoute === 'genres'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      isActive: currentRoute === 'search'
    },
    ...(isLoggedIn ? [{
      id: 'my-library',
      label: 'My Shelf',
      icon: Bookmark,
      badge: bookmarkCount > 0 ? bookmarkCount : null,
      isActive: currentRoute === 'my-library'
    }] : []),
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Studio',
      icon: Shield,
      isActive: currentRoute.startsWith('admin')
    }] : [])
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d11]/95 backdrop-blur-xl border-t border-zinc-800/90 px-2 py-1.5 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                item.isActive
                  ? 'text-white bg-zinc-800/80 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-105 text-zinc-100' : ''}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-zinc-700 text-zinc-100 font-mono-space text-[9px] font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-mono-space tracking-wider mt-1 ${
                item.isActive ? 'font-bold text-white' : 'text-zinc-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

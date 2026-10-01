import React from 'react';
import { Home, BookOpen, Layers, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { SimpleAuthUser } from '../lib/firebase';
import { UserProfile } from '../types';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  firebaseUser?: User | SimpleAuthUser | null;
  currentUser?: UserProfile;
  onOpenProfile?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  firebaseUser,
  currentUser,
  onOpenProfile
}) => {
  // Hide in Reader View for full immersion
  if (currentRoute === 'reader') return null;

  const items = [
    { label: 'Home', route: 'home', icon: Home },
    { label: 'Library', route: 'my-library', icon: BookOpen },
    { label: 'Genres', route: 'genres', icon: Layers },
    { label: 'Profile', route: 'profile', icon: UserIcon, isProfile: true }
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto pointer-events-none">
      <nav 
        aria-label="Mobile Navigation"
        className="pointer-events-auto bg-[#0e0f17]/95 backdrop-blur-2xl border border-white/10 rounded-full px-3 py-2 shadow-2xl flex items-center justify-around"
      >
        {items.map((item) => {
          const isActive = !item.isProfile && (
            currentRoute === item.route ||
            (item.route === 'my-library' && currentRoute === 'library')
          );

          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.isProfile) {
                  onOpenProfile?.();
                } else {
                  onNavigate(item.route);
                }
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white scale-105 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.7} />
              <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

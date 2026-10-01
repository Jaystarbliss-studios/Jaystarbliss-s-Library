import React from 'react';
import { BookOpen, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, isAdmin }) => {
  return (
    <footer className="border-t border-white/5 bg-[#08090d] text-zinc-400 font-sans-clean pt-12 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#141522] border border-white/10 flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-zinc-100" />
              </div>
              <span className="font-sans-clean font-bold tracking-tight text-zinc-100 text-base">
                Jaystarbliss Library
              </span>
            </div>
            
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
              A sovereign digital publishing platform and literary archive for serialized fiction, novels, and original literature.
            </p>
            
            <div className="pt-1 text-[11px] font-mono-space text-zinc-500">
              ORIGIN: LAGOS, NIGERIA • ALL RIGHTS RESERVED
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-2.5">
            <h4 className="font-mono-space text-[11px] font-bold uppercase tracking-wider text-zinc-200">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-zinc-200 transition-colors">
                  Discover Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('library')} className="hover:text-zinc-200 transition-colors">
                  Complete Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('genres')} className="hover:text-zinc-200 transition-colors">
                  Popular Genres
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-library')} className="hover:text-zinc-200 transition-colors">
                  My Library & Shelf
                </button>
              </li>
            </ul>
          </div>

          {/* Studio */}
          <div className="space-y-2.5">
            <h4 className="font-mono-space text-[11px] font-bold uppercase tracking-wider text-zinc-200">
              STUDIO
            </h4>
            <ul className="space-y-2 text-xs">
              {isAdmin ? (
                <li>
                  <button 
                    onClick={() => onNavigate('admin')} 
                    className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-medium transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Author Studio</span>
                  </button>
                </li>
              ) : (
                <li>
                  <span className="text-zinc-400">
                    Serialized Fiction & Releases
                  </span>
                </li>
              )}
              <li>
                <span className="text-zinc-500 font-mono-space text-[11px]">
                  Chapters 1–10 Free • 11+ Authenticated
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono-space text-zinc-500">
          <div>
            © {new Date().getFullYear()} JAYSTARBLISS STUDIOS. ALL WRITTEN WORKS COPYRIGHTED.
          </div>
          <div>
            GOOD BOOKS. GREATER MINDS.
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Feather, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, isAdmin }) => {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#0a0a0c] text-zinc-400 font-calibri pt-14 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <span className="font-cinzel text-lg font-bold tracking-widest text-zinc-100 block">
                  JAYSTARBLISS'S LIBRARY
                </span>
                <span className="font-mono-space text-[10px] tracking-widest text-zinc-400 block uppercase">
                  A DIGITAL PUBLISHING PLATFORM BY JAYSTARBLISS STUDIOS
                </span>
              </div>
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed max-w-lg font-cambria italic">
              "7305 days of living on an earthly definition of hell. An authentic digital archive for serialized memoirs, novels, and literature crafted with unfiltered honesty and architectural restraint."
            </p>
            
            <div className="pt-2 text-xs font-mono-space text-zinc-400">
              ORIGIN: LAGOS, NIGERIA • ALL WRITTEN WORKS COPYRIGHTED
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-mono-space text-xs font-bold uppercase tracking-widest text-zinc-200">
              EXPLORE ARCHIVE
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('library')} className="hover:text-zinc-200 transition-colors">
                  Complete Library
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('latest')} className="hover:text-zinc-200 transition-colors">
                  Latest Chapter Releases
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('genres')} className="hover:text-zinc-200 transition-colors">
                  Genres & Classifications
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-zinc-200 transition-colors">
                  Search Archive
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-library')} className="hover:text-zinc-200 transition-colors">
                  Bookmarks & History
                </button>
              </li>
            </ul>
          </div>

          {/* Publishing & Administration */}
          <div className="space-y-3">
            <h4 className="font-mono-space text-xs font-bold uppercase tracking-widest text-zinc-200">
              PUBLISHING STUDIO
            </h4>
            <ul className="space-y-2 text-sm">
              {isAdmin ? (
                <>
                  <li>
                    <button 
                      onClick={() => onNavigate('admin')} 
                      className="flex items-center gap-1.5 text-zinc-300 hover:text-white font-medium transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Author Publishing Studio</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('admin/books')} className="hover:text-zinc-200 transition-colors">
                      Book Management
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('admin/scheduled')} className="hover:text-zinc-200 transition-colors">
                      Scheduled Daily Releases
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('admin/settings')} className="hover:text-zinc-200 transition-colors">
                      Publishing Settings
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button 
                    onClick={() => onNavigate('admin')} 
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Author Login / Access</span>
                  </button>
                </li>
              )}
              <li className="pt-2">
                <span className="text-xs text-zinc-400 block font-mono-space">
                  Primary Publication:
                </span>
                <span className="text-xs text-zinc-300 font-semibold font-mono-space">
                  TWO DECADES (Vol. 1)
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-space text-zinc-400">
          <div>
            © {new Date().getFullYear()} JAYSTARBLISS STUDIOS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4">
            <span>TYPESET IN CAMBRIA & CALIBRI</span>
            <span>•</span>
            <span className="text-zinc-400">SERIALIZED DAILY RELEASES</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

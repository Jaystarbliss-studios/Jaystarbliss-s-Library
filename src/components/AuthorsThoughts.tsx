import React, { useState } from 'react';
import { Feather, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

interface AuthorsThoughtsProps {
  content?: string;
  authorName?: string;
  mode?: 'sidebar' | 'banner' | 'standalone';
}

export const AuthorsThoughts: React.FC<AuthorsThoughtsProps> = ({
  content,
  authorName = 'JAYSTARBLISS',
  mode = 'sidebar'
}) => {
  const [isExpandedMobile, setIsExpandedMobile] = useState(true);

  if (!content || !content.trim()) return null;

  return (
    <div className="w-full">
      
      {/* Mobile Accordion View (< lg screens) */}
      <div className="block lg:hidden my-6 bg-[#16161a] border-l-4 border-zinc-400 border-y border-r border-zinc-800 rounded-sm overflow-hidden shadow-md">
        <button
          onClick={() => setIsExpandedMobile(!isExpandedMobile)}
          className="w-full px-4 py-3 bg-[#131316] flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-zinc-300" />
            <span className="font-cinzel text-xs font-bold tracking-widest text-zinc-200 uppercase">
              AUTHOR'S THOUGHTS...
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono-space text-zinc-400">
            <span>{isExpandedMobile ? 'COLLAPSE' : 'EXPAND'}</span>
            {isExpandedMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isExpandedMobile && (
          <div className="p-4 sm:p-5 text-sm text-zinc-300 font-cambria italic leading-relaxed border-t border-zinc-800/80 bg-[#151518]">
            <p className="whitespace-pre-line">{content}</p>
            <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono-space text-zinc-400 not-italic">
              <span>COMMENTARY BY {authorName}</span>
              <span>JAYSTARBLISS STUDIOS</span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar / Editorial Box (>= lg screens) */}
      <aside className="hidden lg:block my-6 bg-[#151519] border-l-4 border-zinc-300 border-y border-r border-zinc-800/90 rounded-sm p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-zinc-800 flex items-center justify-center text-zinc-200">
              <Feather className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-cinzel text-xs font-bold tracking-widest text-zinc-100 uppercase">
                AUTHOR'S THOUGHTS...
              </h4>
              <span className="font-mono-space text-[10px] text-zinc-400 tracking-wider block">
                EDITORIAL ARCHIVE NOTES
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono-space px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-sm border border-zinc-700">
            {authorName}
          </span>
        </div>

        <div className="font-cambria text-sm text-zinc-300 italic leading-relaxed whitespace-pre-line">
          "{content}"
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono-space text-zinc-400 not-italic">
          <span>MANUSCRIPT COMMENTARY</span>
          <span>OFFICIAL AUTHOR REFLECTION</span>
        </div>
      </aside>

    </div>
  );
};

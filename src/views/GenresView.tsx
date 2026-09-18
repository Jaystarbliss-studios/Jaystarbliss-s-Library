import React from 'react';
import { Book } from '../types';
import { Compass, BookOpen, Tag, ArrowRight } from 'lucide-react';

interface GenresViewProps {
  books: Book[];
  onSelectBook: (slug: string) => void;
  onFilterGenre: (genre: string) => void;
}

export const GenresView: React.FC<GenresViewProps> = ({
  books,
  onSelectBook,
  onFilterGenre
}) => {
  // Collect genres and their count
  const genreCountMap: Record<string, number> = {};
  const tagCountMap: Record<string, number> = {};

  books.forEach((b) => {
    b.genres.forEach((g) => {
      genreCountMap[g] = (genreCountMap[g] || 0) + 1;
    });
    b.tags.forEach((t) => {
      tagCountMap[t] = (tagCountMap[t] || 0) + 1;
    });
  });

  const genres = Object.entries(genreCountMap).sort((a, b) => b[1] - a[1]);
  const tags = Object.entries(tagCountMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 font-calibri">
      
      {/* Header */}
      <div className="relative overflow-hidden bg-[#131319]/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-2 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-luminosity filter blur-xs"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=2000&q=80')` }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-zinc-300" />
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            GENRES & CLASSIFICATIONS
          </h1>
        </div>
        <p className="relative z-10 font-mono-space text-xs sm:text-sm text-zinc-400">
          DISCOVER MANUSCRIPTS BY LITERARY GENRE, NARRATIVE FORM, AND THEMATIC TAG
        </p>
      </div>

      {/* Genres Grid */}
      <div className="space-y-4">
        <h2 className="font-cinzel text-lg font-bold tracking-widest text-zinc-200 uppercase">
          LITERARY GENRES
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map(([genre, count]) => (
            <div
              key={genre}
              onClick={() => onFilterGenre(genre)}
              className="p-5 bg-[#121215] border border-zinc-800 hover:border-zinc-600 rounded-sm cursor-pointer transition-colors space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between text-xs font-mono-space text-zinc-400">
                <span>GENRE</span>
                <span className="px-2 py-0.5 bg-zinc-900 text-zinc-300 rounded border border-zinc-800">
                  {count} {count === 1 ? 'Work' : 'Works'}
                </span>
              </div>

              <h3 className="font-cinzel text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                {genre}
              </h3>

              <div className="pt-2 flex items-center justify-between text-xs font-mono-space text-zinc-400 group-hover:text-white">
                <span>View Publications</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thematic Tags Section */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-zinc-400" />
          <h2 className="font-cinzel text-lg font-bold tracking-widest text-zinc-200 uppercase">
            THEMATIC TAGS & MOTIFS
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {tags.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => onFilterGenre(tag)}
              className="px-3 py-1.5 bg-[#121215] hover:bg-zinc-800 text-zinc-300 text-xs font-mono-space border border-zinc-800 hover:border-zinc-600 rounded-sm transition-colors flex items-center gap-2"
            >
              <span>#{tag}</span>
              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

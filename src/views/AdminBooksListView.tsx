import React from 'react';
import { Book } from '../types';
import { BookOpen, PlusCircle, Edit, ExternalLink, Star } from 'lucide-react';

interface AdminBooksListViewProps {
  books: Book[];
  onAddNewBook: () => void;
  onEditBook: (bookId: string) => void;
  onViewBookPublic: (slug: string) => void;
}

export const AdminBooksListView: React.FC<AdminBooksListViewProps> = ({
  books,
  onAddNewBook,
  onEditBook,
  onViewBookPublic
}) => {
  return (
    <div className="p-6 sm:p-10 space-y-8 font-calibri text-zinc-100 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-zinc-300" />
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide uppercase">
              MANUSCRIPTS & BOOKS
            </h1>
          </div>
          <p className="font-mono-space text-xs text-zinc-400">
            CATALOGUE OF SERIALIZED VOLUMES AND PUBLISHING MANUSCRIPTS
          </p>
        </div>

        <button
          onClick={onAddNewBook}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-wider rounded-sm shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>NEW MANUSCRIPT</span>
        </button>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-4 hover:border-zinc-700 transition-colors shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-sm border border-zinc-700 shrink-0"
              />

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.2 text-[10px] font-mono-space tracking-wider uppercase font-bold rounded-sm border ${
                    book.status === 'ongoing'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  }`}>
                    {book.status}
                  </span>

                  {book.isFeatured && (
                    <span className="flex items-center gap-1 text-[10px] font-mono-space text-amber-400 bg-amber-950/60 border border-amber-800 px-1.5 py-0.2 rounded">
                      <Star className="w-3 h-3 fill-current" />
                      <span>FEATURED</span>
                    </span>
                  )}
                </div>

                <h3 className="font-cinzel text-lg font-bold text-white truncate">
                  {book.title}
                </h3>

                <p className="font-mono-space text-xs text-rose-400 font-bold uppercase truncate">
                  {book.tagline}
                </p>

                <p className="font-cambria text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono-space">
              <span className="text-zinc-400">
                {book.publishedChapterCount} Chapters • Updated {new Date(book.lastUpdatedAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewBookPublic(book.slug)}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm"
                  title="View Public Page"
                  aria-label="View Public Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onEditBook(book.id)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-mono-space tracking-wider font-semibold rounded-sm transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>EDIT METADATA</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

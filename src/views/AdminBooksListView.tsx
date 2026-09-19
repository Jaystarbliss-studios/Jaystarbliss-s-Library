import React, { useState } from 'react';
import { Book } from '../types';
import { BookOpen, PlusCircle, Edit, ExternalLink, Star, Feather, Image } from 'lucide-react';

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
    <div className="p-4 sm:p-10 space-y-8 font-calibri text-zinc-100 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-zinc-300" />
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide uppercase text-white">
              MANUSCRIPTS & BOOKS
            </h1>
          </div>
          <p className="font-mono-space text-xs text-zinc-400">
            CATALOGUE OF SERIALIZED VOLUMES AND PUBLISHING MANUSCRIPTS
          </p>
        </div>

        <button
          onClick={onAddNewBook}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-wider rounded-sm shadow-md transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>NEW MANUSCRIPT</span>
        </button>
      </div>

      {/* Book Grid or Empty Wireframe State */}
      {books.length === 0 ? (
        <div className="p-10 sm:p-16 bg-[#121216] border border-dashed border-zinc-700 rounded-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
            <BookOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-cinzel text-lg font-bold text-white uppercase">
              NO MANUSCRIPTS CREATED YET
            </h3>
            <p className="font-mono-space text-xs text-zinc-400 leading-relaxed">
              Your library is currently a clean wireframe. Create your first book, upload high-resolution cover art hosted on ImgBB, and start publishing serialized chapters.
            </p>
          </div>
          <button
            onClick={onAddNewBook}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-sm transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE FIRST BOOK MANUSCRIPT</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((book) => (
            <AdminBookCard
              key={book.id}
              book={book}
              onEditBook={() => onEditBook(book.id)}
              onViewBookPublic={() => onViewBookPublic(book.slug)}
            />
          ))}
        </div>
      )}

    </div>
  );
};

const AdminBookCard: React.FC<{
  book: Book;
  onEditBook: () => void;
  onViewBookPublic: () => void;
}> = ({ book, onEditBook, onViewBookPublic }) => {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="p-5 sm:p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-4 hover:border-zinc-700 transition-colors shadow-lg flex flex-col justify-between">
      <div className="flex items-start gap-4">
        {book.coverUrl && !imgErr ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
            className="w-20 h-28 object-cover rounded-sm border border-zinc-700 shrink-0 bg-zinc-950"
          />
        ) : (
          <div className="w-20 h-28 bg-zinc-950 border border-zinc-800 rounded-sm flex flex-col items-center justify-center p-2 text-center shrink-0">
            <Feather className="w-5 h-5 text-zinc-600 mb-1" />
            <span className="font-mono-space text-[8px] text-zinc-500 uppercase line-clamp-2">
              {book.title}
            </span>
          </div>
        )}

        <div className="space-y-1.5 min-w-0 flex-1">
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

          <h3 className="font-cinzel text-base sm:text-lg font-bold text-white truncate">
            {book.title}
          </h3>

          {book.tagline && (
            <p className="font-mono-space text-xs text-rose-400 font-bold uppercase truncate">
              {book.tagline}
            </p>
          )}

          <p className="font-cambria text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {book.description || 'No synopsis provided.'}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-space">
        <span className="text-zinc-400 text-[11px]">
          {book.publishedChapterCount} Published{book.scheduledChapterCount > 0 ? ` • ${book.scheduledChapterCount} Scheduled` : ''} • Updated {new Date(book.lastUpdatedAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewBookPublic}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm transition-colors"
            title="View Public Page"
            aria-label="View Public Page"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={onEditBook}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-mono-space tracking-wider font-semibold rounded-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>EDIT METADATA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

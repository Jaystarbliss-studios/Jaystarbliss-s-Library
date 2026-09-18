import React from 'react';
import { Book, Chapter } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Clock,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  Edit,
  Feather
} from 'lucide-react';

interface AdminDashboardViewProps {
  books: Book[];
  chapters: Chapter[];
  onSelectTab: (tab: string) => void;
  onEditChapter: (chapterId: string) => void;
  onPreviewChapter: (bookSlug: string, chapterNumber: number) => void;
  onPublishScheduledNow: (chapterId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  books,
  chapters,
  onSelectTab,
  onEditChapter,
  onPreviewChapter,
  onPublishScheduledNow
}) => {
  const publishedCount = chapters.filter((c) => c.status === 'published').length;
  const draftCount = chapters.filter((c) => c.status === 'draft').length;
  const scheduledCount = chapters.filter((c) => c.status === 'scheduled').length;
  const totalWords = chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);

  const bookMap = new Map(books.map((b) => [b.id, b]));

  // Recent chapters
  const recentChapters = [...chapters]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  // Scheduled chapters
  const scheduledChapters = chapters
    .filter((c) => c.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor || 0).getTime() - new Date(b.scheduledFor || 0).getTime());

  return (
    <div className="p-6 sm:p-10 space-y-10 font-calibri text-zinc-100">
      
      {/* Studio Header & Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-emerald-400" />
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide uppercase">
              AUTHOR PUBLISHING STUDIO
            </h1>
          </div>
          <p className="font-mono-space text-xs text-zinc-400">
            JAYSTARBLISS STUDIOS • SERIALIZED DIGITAL ARCHIVE DISK ENGINE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('chapter-editor-new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-wider rounded-sm shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>WRITE CHAPTER</span>
          </button>

          <button
            onClick={() => onSelectTab('book-editor-new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>NEW BOOK</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 bg-[#121216] border border-zinc-800 rounded-sm space-y-2">
          <span className="font-mono-space text-[11px] text-zinc-400 tracking-wider uppercase block">
            TOTAL BOOKS
          </span>
          <span className="font-cinzel text-3xl font-bold text-white block">
            {books.length}
          </span>
          <span className="text-xs font-mono-space text-zinc-400 block">
            Featuring TWO DECADES
          </span>
        </div>

        <div className="p-5 bg-[#121216] border border-zinc-800 rounded-sm space-y-2">
          <span className="font-mono-space text-[11px] text-zinc-400 tracking-wider uppercase block">
            PUBLISHED CHAPTERS
          </span>
          <span className="font-cinzel text-3xl font-bold text-emerald-400 block">
            {publishedCount}
          </span>
          <span className="text-xs font-mono-space text-zinc-400 block">
            Live in reader
          </span>
        </div>

        <div className="p-5 bg-[#121216] border border-zinc-800 rounded-sm space-y-2">
          <span className="font-mono-space text-[11px] text-zinc-400 tracking-wider uppercase block">
            SCHEDULED DAILY
          </span>
          <span className="font-cinzel text-3xl font-bold text-amber-400 block">
            {scheduledCount}
          </span>
          <span className="text-xs font-mono-space text-zinc-400 block">
            Queue active
          </span>
        </div>

        <div className="p-5 bg-[#121216] border border-zinc-800 rounded-sm space-y-2">
          <span className="font-mono-space text-[11px] text-zinc-400 tracking-wider uppercase block">
            WORKING DRAFTS
          </span>
          <span className="font-cinzel text-3xl font-bold text-zinc-300 block">
            {draftCount}
          </span>
          <span className="text-xs font-mono-space text-zinc-400 block">
            Private to author
          </span>
        </div>

        <div className="p-5 bg-[#121216] border border-zinc-800 rounded-sm space-y-2 col-span-2 sm:col-span-1">
          <span className="font-mono-space text-[11px] text-zinc-400 tracking-wider uppercase block">
            TOTAL WORDS
          </span>
          <span className="font-cinzel text-3xl font-bold text-zinc-100 block">
            {totalWords.toLocaleString()}
          </span>
          <span className="text-xs font-mono-space text-zinc-400 block">
            Written manuscript text
          </span>
        </div>

      </div>

      {/* Scheduled Releases Watchlist */}
      {scheduledChapters.length > 0 && (
        <section className="p-6 bg-[#16161c] border border-amber-900/60 rounded-sm space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <h2 className="font-cinzel text-sm sm:text-base font-bold tracking-widest uppercase">
                SCHEDULED DAILY RELEASES PENDING ({scheduledChapters.length})
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('scheduled')}
              className="text-xs font-mono-space text-amber-300 hover:text-white"
            >
              MANAGE SCHEDULE →
            </button>
          </div>

          <div className="divide-y divide-zinc-800 bg-[#121216] border border-zinc-800 rounded-sm">
            {scheduledChapters.map((ch) => {
              const book = bookMap.get(ch.bookId);
              return (
                <div key={ch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono-space text-zinc-400 uppercase tracking-wider block">
                      {book?.title} • CHAPTER {ch.chapterNumber}
                    </span>
                    <h4 className="font-cinzel text-sm font-bold text-white">
                      {ch.title}
                    </h4>
                    <span className="text-xs font-mono-space text-amber-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>Releasing: {new Date(ch.scheduledFor!).toLocaleString()} (WAT)</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditChapter(ch.id)}
                      className="px-3 py-1.5 bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono-space rounded-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onPublishScheduledNow(ch.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono-space text-xs font-bold rounded-sm shadow-sm"
                    >
                      Publish Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Activity Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h2 className="font-cinzel text-base sm:text-lg font-bold tracking-widest text-zinc-200 uppercase">
            RECENT MANUSCRIPT ACTIVITY
          </h2>
          <button
            onClick={() => onSelectTab('chapters')}
            className="text-xs font-mono-space text-zinc-400 hover:text-white"
          >
            VIEW ALL CHAPTERS →
          </button>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-sm divide-y divide-zinc-800 overflow-hidden shadow-md">
          {recentChapters.map((ch) => {
            const book = bookMap.get(ch.bookId);
            return (
              <div key={ch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.2 text-[10px] font-mono-space tracking-wider uppercase font-bold rounded-sm ${
                      ch.status === 'published'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : ch.status === 'scheduled'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {ch.status}
                    </span>
                    <span className="text-xs font-mono-space text-zinc-400 truncate">
                      {book?.title}
                    </span>
                  </div>

                  <h4 className="font-cinzel text-sm sm:text-base font-bold text-white truncate">
                    Chapter {ch.chapterNumber}: {ch.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[11px] font-mono-space text-zinc-400">
                    <span>{ch.wordCount} words</span>
                    <span>•</span>
                    <span>Updated {new Date(ch.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {book && ch.status === 'published' && (
                    <button
                      onClick={() => onPreviewChapter(book.slug, ch.chapterNumber)}
                      className="p-2 bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700 rounded-sm"
                      title="View Reader"
                      aria-label="View in Reader"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditChapter(ch.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>EDIT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

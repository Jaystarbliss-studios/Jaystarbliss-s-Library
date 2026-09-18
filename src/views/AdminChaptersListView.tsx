import React, { useState } from 'react';
import { Book, Chapter } from '../types';
import {
  FileText,
  PlusCircle,
  Edit,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface AdminChaptersListViewProps {
  books: Book[];
  chapters: Chapter[];
  onAddNewChapter: () => void;
  onEditChapter: (chapterId: string) => void;
  onPreviewChapter: (bookSlug: string, chapterNumber: number) => void;
  onDeleteChapter: (chapterId: string) => void;
  onPublishNow: (chapterId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminChaptersListView: React.FC<AdminChaptersListViewProps> = ({
  books,
  chapters,
  onAddNewChapter,
  onEditChapter,
  onPreviewChapter,
  onDeleteChapter,
  onPublishNow,
  onShowToast
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const bookMap = new Map(books.map((b) => [b.id, b]));

  let filtered = chapters.filter((c) => {
    if (selectedBookId !== 'all' && c.bookId !== selectedBookId) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  // Sort by chapter number
  filtered.sort((a, b) => a.chapterNumber - b.chapterNumber);

  const handleDeleteConfirm = () => {
    if (deleteCandidateId) {
      onDeleteChapter(deleteCandidateId);
      onShowToast('Chapter deleted from manuscript archive', 'info');
      setDeleteCandidateId(null);
    }
  };

  const deleteTarget = chapters.find((c) => c.id === deleteCandidateId);

  return (
    <div className="p-6 sm:p-10 space-y-8 font-calibri text-zinc-100 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-300" />
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide uppercase">
              CHAPTERS & WRITING
            </h1>
          </div>
          <p className="font-mono-space text-xs text-zinc-400">
            TOTAL CHAPTERS ARCHIVED: {chapters.length} • MANUSCRIPT CONTROL
          </p>
        </div>

        <button
          onClick={onAddNewChapter}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-wider rounded-sm shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>WRITE CHAPTER</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#121216] border border-zinc-800 rounded-sm">
        
        {/* Book selector filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-space text-zinc-400">BOOK:</span>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space py-1.5 px-3 rounded-sm focus:outline-none"
          >
            <option value="all">All Books ({chapters.length})</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-sm self-start sm:self-auto">
          {['all', 'published', 'scheduled', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-mono-space tracking-wider uppercase rounded-sm transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Chapters Table */}
      <div className="bg-[#121215] border border-zinc-800 rounded-sm divide-y divide-zinc-800 shadow-xl overflow-hidden">
        {filtered.map((ch) => {
          const book = bookMap.get(ch.bookId);

          return (
            <div
              key={ch.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-2 py-0.2 text-[10px] font-mono-space tracking-wider uppercase font-bold rounded-sm border ${
                    ch.status === 'published'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : ch.status === 'scheduled'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}>
                    {ch.status}
                  </span>

                  <span className="text-xs font-mono-space text-zinc-400">
                    {book?.title || 'Unknown Book'}
                  </span>
                </div>

                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white truncate">
                  Chapter {ch.chapterNumber}: {ch.title}
                </h3>

                {ch.subtitle && (
                  <p className="font-cambria text-xs text-zinc-400 italic truncate">
                    {ch.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[11px] font-mono-space text-zinc-500 pt-1">
                  <span>{ch.wordCount} words</span>
                  <span>•</span>
                  <span>{ch.readingTimeMinutes} min read</span>
                  {ch.authorsThoughts && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-400">Includes Author's Thoughts</span>
                    </>
                  )}
                  {ch.scheduledFor && ch.status === 'scheduled' && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Releasing: {new Date(ch.scheduledFor).toLocaleString()} (WAT)</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {book && ch.status === 'published' && (
                  <button
                    onClick={() => onPreviewChapter(book.slug, ch.chapterNumber)}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm"
                    title="Read in Public Reader"
                    aria-label="Read in Public Reader"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                {ch.status !== 'published' && (
                  <button
                    onClick={() => onPublishNow(ch.id)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono-space text-xs font-bold rounded-sm shadow-sm"
                  >
                    Publish
                  </button>
                )}

                <button
                  onClick={() => onEditChapter(ch.id)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-mono-space tracking-wider rounded-sm transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>EDIT</span>
                </button>

                <button
                  onClick={() => setDeleteCandidateId(ch.id)}
                  className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Delete Chapter"
                  aria-label="Delete Chapter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center text-zinc-400 font-mono-space text-xs">
            No chapters match current filter criteria.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteCandidateId}
        title="Delete Chapter Permanently?"
        message={`Are you sure you want to delete Chapter ${deleteTarget?.chapterNumber} ("${deleteTarget?.title}")? This destructive action cannot be undone.`}
        confirmLabel="Delete Chapter"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidateId(null)}
      />

    </div>
  );
};

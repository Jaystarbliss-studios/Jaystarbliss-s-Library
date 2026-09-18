import React, { useState } from 'react';
import { Book, BookStatus, BookVisibility } from '../types';
import { BookOpen, ArrowLeft, Save, Sparkles, Image, CheckCircle2 } from 'lucide-react';

interface AdminBookEditorViewProps {
  book?: Book | null;
  onSaveBook: (book: Book) => void;
  onCancel: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminBookEditorView: React.FC<AdminBookEditorViewProps> = ({
  book,
  onSaveBook,
  onCancel,
  onShowToast
}) => {
  const [title, setTitle] = useState(book?.title || '');
  const [slug, setSlug] = useState(book?.slug || '');
  const [tagline, setTagline] = useState(book?.tagline || '');
  const [description, setDescription] = useState(book?.description || '');
  const [coverUrl, setCoverUrl] = useState(book?.coverUrl || '/cover-two-decades.svg');
  const [author, setAuthor] = useState(book?.author || 'Jaystarbliss');
  const [publisher, setPublisher] = useState(book?.publisher || 'JAYSTARBLISS STUDIOS');
  const [status, setStatus] = useState<BookStatus>(book?.status || 'ongoing');
  const [visibility, setVisibility] = useState<BookVisibility>(book?.visibility || 'published');
  const [genresInput, setGenresInput] = useState(book?.genres.join(', ') || 'Autobiography, Memoir, Literary Non-Fiction');
  const [tagsInput, setTagsInput] = useState(book?.tags.join(', ') || 'Memoir, Nigeria, Coming of Age, Survival, Youth');
  const [isFeatured, setIsFeatured] = useState(book?.isFeatured ?? true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!book) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('Book title is required', 'error');
      return;
    }

    const genres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    const finalBook: Book = {
      id: book?.id || `book-${Date.now()}`,
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: tagline.trim(),
      description: description.trim(),
      coverUrl: coverUrl.trim() || '/cover-two-decades.svg',
      author: author.trim(),
      publisher: publisher.trim(),
      status,
      visibility,
      genres,
      tags,
      isFeatured,
      totalChapters: book?.totalChapters || 0,
      publishedChapterCount: book?.publishedChapterCount || 0,
      latestChapterNumber: book?.latestChapterNumber || 0,
      latestChapterTitle: book?.latestChapterTitle || '',
      createdAt: book?.createdAt || now,
      updatedAt: now,
      firstPublishedAt: book?.firstPublishedAt || now,
      lastUpdatedAt: now
    };

    onSaveBook(finalBook);
    onShowToast(`Manuscript "${title}" saved successfully`, 'success');
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 font-calibri text-zinc-100 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-sm text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wide">
              {book ? `EDIT: ${book.title}` : 'CREATE NEW MANUSCRIPT / BOOK'}
            </h1>
            <p className="font-mono-space text-xs text-zinc-400">
              EDITORIAL RECORD & METADATA CONFIGURATION
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-sm shadow-md transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>SAVE BOOK</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        <div className="p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Book Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. TWO DECADES"
                className="w-full bg-zinc-950 border border-zinc-700 text-white font-cinzel text-base p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. 7305 DAYS OF LIVING ON AN EARTHLY DEFINITION OF HELL"
                className="w-full bg-zinc-950 border border-zinc-700 text-rose-400 font-mono-space font-bold text-xs p-2.5 rounded-sm focus:outline-none focus:border-zinc-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="two-decades"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-300 font-mono-space text-xs p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Author Name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Jaystarbliss"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Publisher
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="JAYSTARBLISS STUDIOS"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="/cover-two-decades.svg"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Synopsis / Archival Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the full synopsis and narrative premise..."
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 font-cambria text-sm p-3 rounded-sm focus:outline-none focus:border-zinc-500 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500 uppercase"
              >
                <option value="ongoing">ONGOING (Daily Serialized)</option>
                <option value="completed">COMPLETED</option>
                <option value="hiatus">HIATUS</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as BookVisibility)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500 uppercase"
              >
                <option value="published">PUBLIC / PUBLISHED</option>
                <option value="draft">PRIVATE DRAFT</option>
                <option value="unlisted">UNLISTED</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Genres (Comma-separated)
              </label>
              <input
                type="text"
                value={genresInput}
                onChange={(e) => setGenresInput(e.target.value)}
                placeholder="Autobiography, Memoir, Literary Non-Fiction"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Thematic Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Memoir, Nigeria, Coming of Age, Survival, Youth"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs font-mono-space text-zinc-200">
                  Feature prominently on Homepage Hero section
                </span>
              </label>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
};

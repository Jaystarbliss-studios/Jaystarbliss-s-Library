import React, { useState, useEffect, useRef } from 'react';
import { Book, Chapter, ChapterStatus } from '../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { AuthorsThoughts } from '../components/AuthorsThoughts';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Save,
  Clock,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Layers,
  Feather
} from 'lucide-react';

interface AdminChapterEditorViewProps {
  books: Book[];
  chapter?: Chapter | null;
  defaultBookId?: string;
  onSaveChapter: (chapter: Chapter) => Promise<void>;
  onCancel: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

type AutosaveState = 'saved' | 'saving' | 'unsaved' | 'error';

export const AdminChapterEditorView: React.FC<AdminChapterEditorViewProps> = ({
  books,
  chapter,
  defaultBookId,
  onSaveChapter,
  onCancel,
  onShowToast
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(
    chapter?.bookId || defaultBookId || books[0]?.id || ''
  );
  const [chapterNumber, setChapterNumber] = useState<number>(chapter?.chapterNumber || 1);
  const [title, setTitle] = useState<string>(chapter?.title || '');
  const [subtitle, setSubtitle] = useState<string>(chapter?.subtitle || '');
  const [content, setContent] = useState<string>(chapter?.content || '');
  const [authorsThoughts, setAuthorsThoughts] = useState<string>(chapter?.authorsThoughts || '');
  const [status, setStatus] = useState<ChapterStatus>(chapter?.status || 'draft');
  const [scheduledDate, setScheduledDate] = useState<string>(
    chapter?.scheduledFor ? new Date(chapter.scheduledFor).toISOString().slice(0, 16) : ''
  );
  
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>('saved');
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'publish' | 'schedule' | null>(null);

  const selectedBook = books.find((b) => b.id === selectedBookId);

  // Autosave timer
  const isFirstMount = useRef(true);
  const autosaveTimeoutRef = useRef<any>(null);

  // A new chapter must keep ONE stable Firestore document ID for the entire
  // editing session. Previously, every autosave generated a fresh ID, which
  // created a new draft document for every round of typing.
  const draftIdRef = useRef(
    chapter?.id || `ch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const createdAtRef = useRef(chapter?.createdAt || new Date().toISOString());

  const publishedDraftKey = chapter?.id
    ? `jsb_published_chapter_draft_${chapter.id}`
    : null;

  const savePublishedDraftLocally = () => {
    if (!publishedDraftKey) return;
    try {
      localStorage.setItem(
        publishedDraftKey,
        JSON.stringify({
          bookId: selectedBookId,
          chapterNumber,
          title,
          subtitle,
          content,
          authorsThoughts,
          scheduledDate,
          savedAt: new Date().toISOString()
        })
      );
    } catch (error) {
      console.warn('Could not autosave local published-chapter draft:', error);
    }
  };

  const clearPublishedDraftLocally = () => {
    if (!publishedDraftKey) return;
    try {
      localStorage.removeItem(publishedDraftKey);
    } catch (error) {
      console.warn('Could not clear local published-chapter draft:', error);
    }
  };

  useEffect(() => {
    if (!chapter?.id || chapter.status !== 'published') return;

    try {
      const raw = localStorage.getItem(`jsb_published_chapter_draft_${chapter.id}`);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        bookId?: string;
        chapterNumber?: number;
        title?: string;
        subtitle?: string;
        content?: string;
        authorsThoughts?: string;
        scheduledDate?: string;
      };

      if (draft.bookId) setSelectedBookId(draft.bookId);
      if (typeof draft.chapterNumber === 'number') setChapterNumber(draft.chapterNumber);
      if (typeof draft.title === 'string') setTitle(draft.title);
      if (typeof draft.subtitle === 'string') setSubtitle(draft.subtitle);
      if (typeof draft.content === 'string') setContent(draft.content);
      if (typeof draft.authorsThoughts === 'string') setAuthorsThoughts(draft.authorsThoughts);
      if (typeof draft.scheduledDate === 'string') setScheduledDate(draft.scheduledDate);

      onShowToast('Unpublished local draft restored. Readers still see the last published version until you publish.', 'info');
    } catch (error) {
      console.warn('Could not restore local published-chapter draft:', error);
    }
  }, [chapter?.id, chapter?.status]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setAutosaveState('unsaved');
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(() => {
      handleAutosave();
    }, 2500);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [title, subtitle, content, authorsThoughts, chapterNumber, selectedBookId, scheduledDate]);

  const handleAutosave = async (): Promise<boolean> => {
    // Published chapters use a private browser draft while being edited.
    // Their live Firestore document is not touched until PUBLISH NOW is confirmed.
    if (chapter?.status === 'published') {
      setAutosaveState('saving');
      savePublishedDraftLocally();
      setAutosaveState('saved');
      return true;
    }

    if (!title.trim() && !content.trim()) return false;
    setAutosaveState('saving');

    const cleanText = (content || '').replace(/<[^>]*>?/gm, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const updatedChapter: Chapter = {
      id: draftIdRef.current,
      bookId: selectedBookId,
      chapterNumber,
      title: title.trim() || `Chapter ${chapterNumber}`,
      subtitle: subtitle.trim() || undefined,
      content,
      authorsThoughts: authorsThoughts.trim() || undefined,
      status: status === 'published' ? 'published' : 'draft',
      scheduledFor: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      publishedAt: chapter?.publishedAt,
      wordCount: words,
      readingTimeMinutes: readingTime,
      createdAt: createdAtRef.current,
      updatedAt: new Date().toISOString()
    };

    try {
      await onSaveChapter(updatedChapter);
      setAutosaveState('saved');
      return true;
    } catch (error) {
      console.error('Chapter autosave failed:', error);
      setAutosaveState('error');
      return false;
    }
  };

  const handleManualSaveDraft = async () => {
    const saved = await handleAutosave();
    onShowToast(
      saved
        ? chapter?.status === 'published'
          ? 'Unpublished edits saved locally. The live chapter is unchanged until you publish.'
          : 'Draft saved successfully to library database'
        : 'Draft could not be saved to the cloud database.',
      saved ? 'success' : 'error'
    );
  };

  const handleInitiatePublish = () => {
    if (!title.trim()) {
      onShowToast('Please provide a chapter title before publishing', 'error');
      return;
    }
    setPendingAction('publish');
    setShowPublishModal(true);
  };

  const handleInitiateSchedule = () => {
    if (!title.trim()) {
      onShowToast('Please provide a chapter title before scheduling', 'error');
      return;
    }
    if (!scheduledDate) {
      onShowToast('Please choose a release date & time to schedule', 'error');
      return;
    }
    setPendingAction('schedule');
    setShowPublishModal(true);
  };

  const handleConfirmPublishOrSchedule = async () => {
    setShowPublishModal(false);

    const cleanText = (content || '').replace(/<[^>]*>?/gm, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const now = new Date().toISOString();

    const isScheduling = pendingAction === 'schedule';

    const finalChapter: Chapter = {
      id: draftIdRef.current,
      bookId: selectedBookId,
      chapterNumber,
      title: title.trim() || `Chapter ${chapterNumber}`,
      subtitle: subtitle.trim() || undefined,
      content,
      authorsThoughts: authorsThoughts.trim() || undefined,
      status: isScheduling ? 'scheduled' : 'published',
      scheduledFor: isScheduling && scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      publishedAt: isScheduling ? undefined : (chapter?.publishedAt || now),
      wordCount: words,
      readingTimeMinutes: readingTime,
      createdAt: createdAtRef.current,
      updatedAt: now
    };

    try {
      await onSaveChapter(finalChapter);
      if (pendingAction === 'publish') {
        clearPublishedDraftLocally();
      }
      setStatus(finalChapter.status);
      onShowToast(
        isScheduling
          ? `Chapter ${chapterNumber} scheduled for daily release on ${new Date(scheduledDate).toLocaleString()} (WAT)`
          : `Chapter ${chapterNumber} — "${title}" published to the public library after cloud confirmation.`,
        'success'
      );
    } catch (error) {
      console.error('Chapter publication failed:', error);
      onShowToast('Chapter was not published because the cloud database did not confirm the save.', 'error');
    }
  };

  // Word count & estimate
  const cleanText = (content || '').replace(/<[^>]*>?/gm, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 font-calibri text-zinc-100">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-sm text-zinc-300 hover:text-white transition-colors"
            title="Back to Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wide">
              {chapter ? `EDIT CHAPTER ${chapter.chapterNumber}` : 'WRITE NEW CHAPTER'}
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono-space text-zinc-400">
              <span>BOOK: {selectedBook?.title || 'SELECT BOOK'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  autosaveState === 'saved' ? 'bg-emerald-500' : autosaveState === 'saving' ? 'bg-amber-500 animate-pulse' : autosaveState === 'error' ? 'bg-red-500' : 'bg-zinc-500'
                }`} />
                <span>
                  {autosaveState === 'saved' && (chapter?.status === 'published' ? 'Draft Saved Locally' : 'Draft Saved')}
                  {autosaveState === 'saving' && 'Saving...'}
                  {autosaveState === 'unsaved' && 'Unsaved changes'}\n                  {autosaveState === 'error' && 'Cloud save failed'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono-space tracking-wider rounded-sm border transition-colors ${
              previewMode
                ? 'bg-zinc-100 text-zinc-900 border-white font-bold'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'BACK TO EDITOR' : 'READER PREVIEW'}</span>
          </button>

          <button
            onClick={handleManualSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE DRAFT</span>
          </button>

          <button
            onClick={handleInitiateSchedule}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-mono-space tracking-wider font-semibold rounded-sm transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>SCHEDULE</span>
          </button>

          <button
            onClick={handleInitiatePublish}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono-space tracking-widest font-bold rounded-sm shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{chapter?.status === 'published' ? 'PUBLISH CHANGES' : 'PUBLISH NOW'}</span>
          </button>
        </div>
      </div>

      {/* Preview Mode Rendering */}
      {previewMode ? (
        <div className="space-y-6">
          <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-sm flex items-center justify-between text-xs font-mono-space text-zinc-300">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>PREVIEWING EXACT READER RENDERING (MANUSCRIPT LAYOUT)</span>
            </span>
            <button
              onClick={() => setPreviewMode(false)}
              className="px-3 py-1 bg-zinc-100 text-zinc-950 font-bold rounded-sm"
            >
              CLOSE PREVIEW
            </button>
          </div>

          <div className="bg-[#ffffff] text-[#18181b] p-8 sm:p-14 rounded-sm border border-zinc-300 shadow-2xl space-y-6 max-w-3xl mx-auto">
            <div className="text-center pb-6 border-b border-zinc-300 space-y-2">
              <span className="font-mono-space text-xs text-zinc-500 uppercase tracking-widest block">
                {selectedBook?.title || 'TWO DECADES'} • MANUSCRIPT PREVIEW
              </span>
              <span className="inline-block px-3 py-1 font-mono-space text-xs font-bold uppercase bg-zinc-100 border border-zinc-300 rounded-sm">
                CHAPTER {chapterNumber}
              </span>
              <h2 className="font-cinzel text-3xl font-bold uppercase text-zinc-900">
                {title || 'UNTITLED CHAPTER'}
              </h2>
              {subtitle && (
                <p className="font-cambria text-base italic text-zinc-600">
                  {subtitle}
                </p>
              )}
            </div>

            {authorsThoughts && (
              <AuthorsThoughts
                content={authorsThoughts}
                authorName={selectedBook?.author || 'JAYSTARBLISS'}
                mode="sidebar"
              />
            )}

            <div
              className="drop-cap font-cambria text-lg leading-relaxed text-zinc-900 space-y-4 pt-4"
              dangerouslySetInnerHTML={{ __html: content || '<p>No content written yet.</p>' }}
            />
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          
          {/* Metadata Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-5 bg-[#121215] border border-zinc-800 rounded-sm">
            
            {/* Book Selector */}
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-400 block uppercase">
                Select Book / Manuscript
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.publishedChapterCount} published chapters)
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Number */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-400 block uppercase">
                Chapter #
              </label>
              <input
                type="number"
                min="1"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Status Pill */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-400 block uppercase">
                Current Status
              </label>
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm text-xs font-mono-space uppercase font-bold text-center">
                <span className={status === 'published' ? 'text-emerald-400' : status === 'scheduled' ? 'text-amber-400' : 'text-zinc-400'}>
                  {status}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="sm:col-span-7 space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-400 block uppercase">
                Chapter Title (e.g. BACKSTORY, NIGERIA, FIRST RUBBISH)
              </label>
              <input
                type="text"
                placeholder="e.g. BACKSTORY"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-white font-cinzel text-base p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Subtitle */}
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-400 block uppercase">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. The Roots and the Ground"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 font-cambria italic text-sm p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Schedule Date & Time Picker */}
            <div className="sm:col-span-12 pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono-space text-zinc-300 block">
                  Daily Chapter Release Schedule (WAT / Africa/Lagos)
                </span>
                <span className="text-[11px] font-mono-space text-zinc-400 block">
                  Select publication date & time to automatically release this chapter to readers.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2 rounded-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

          </div>

          {chapter?.status === 'published' && (
            <div className="flex items-start gap-3 rounded-sm border border-blue-900/60 bg-blue-950/30 px-4 py-3 text-xs text-blue-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
              <div>
                <p className="font-semibold">You are editing a published chapter.</p>
                <p className="mt-1 text-blue-200/80">
                  Your changes are being autosaved privately on this device. Readers continue to see the current published version until you choose <strong>PUBLISH CHANGES</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Dedicated "Author's Thoughts..." Editorial Commentary Section */}
          <div className="p-5 bg-[#141418] border-l-4 border-zinc-300 border-y border-r border-zinc-800 rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-zinc-300" />
                <label className="font-cinzel text-xs font-bold tracking-widest text-zinc-200 uppercase">
                  AUTHOR'S THOUGHTS... (EDITORIAL COMMENTARY)
                </label>
              </div>
              <span className="text-[10px] font-mono-space text-zinc-400">
                SEPARATE CONTENT LAYER • OPTIONAL
              </span>
            </div>
            <p className="text-xs font-cambria text-zinc-400 italic">
              Share behind-the-scenes context, emotional reflections, and publishing notes. This appears in the reader as a distinct literary sidebar.
            </p>
            <textarea
              rows={3}
              value={authorsThoughts}
              onChange={(e) => setAuthorsThoughts(e.target.value)}
              placeholder="e.g. Looking back at twenty years (7,305 days) requires stepping back into shoes you spent a lifetime trying to outgrow..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-sm p-3 text-sm font-cambria italic text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 leading-relaxed"
            />
          </div>

          {/* Story Narrative Rich Text Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-cinzel text-xs font-bold tracking-widest text-zinc-200 uppercase">
                MANUSCRIPT STORY CONTENT
              </label>
              <div className="flex items-center gap-3 text-xs font-mono-space text-zinc-400">
                <span>{words} Words</span>
                <span>•</span>
                <span>~{readingTime} Min Read</span>
              </div>
            </div>

            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Begin writing your manuscript chapter narrative here. Use formatting buttons above for headings, quotes, and lists..."
              minHeight="420px"
            />
          </div>

        </div>
      )}

      {/* Safety Confirmation Modal */}
      <ConfirmationModal
        isOpen={showPublishModal}
        title={pendingAction === 'schedule' ? 'Schedule Daily Chapter Release?' : `Publish Chapter ${chapterNumber}?`}
        message={
          pendingAction === 'schedule'
            ? `Chapter ${chapterNumber} ("${title}") will be queued and automatically published to all public readers on ${scheduledDate ? new Date(scheduledDate).toLocaleString() : 'the scheduled time'} (WAT).`
            : `Publish Chapter ${chapterNumber} ("${title}") immediately? It will become visible across the public library, latest updates stream, and chapter index.`
        }
        confirmLabel={pendingAction === 'schedule' ? 'Confirm Schedule' : 'Publish Immediately'}
        onConfirm={handleConfirmPublishOrSchedule}
        onCancel={() => setShowPublishModal(false)}
      />

    </div>
  );
};

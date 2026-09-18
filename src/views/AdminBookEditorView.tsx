import React, { useState, useRef, useEffect } from 'react';
import { Book, BookStatus, BookVisibility } from '../types';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Key,
  X
} from 'lucide-react';
import { uploadToImgbb, getImgbbApiKey, saveImgbbApiKey } from '../lib/imageUpload';

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
  const [coverUrl, setCoverUrl] = useState(book?.coverUrl || '');
  const [author, setAuthor] = useState(book?.author || 'Jaystarbliss');
  const [publisher, setPublisher] = useState(book?.publisher || 'JAYSTARBLISS STUDIOS');
  const [status, setStatus] = useState<BookStatus>(book?.status || 'ongoing');
  const [visibility, setVisibility] = useState<BookVisibility>(book?.visibility || 'published');
  const [genresInput, setGenresInput] = useState(book?.genres ? book.genres.join(', ') : '');
  const [tagsInput, setTagsInput] = useState(book?.tags ? book.tags.join(', ') : '');
  const [isFeatured, setIsFeatured] = useState(book?.isFeatured ?? false);

  // ImgBB Upload States
  const [imgbbKey, setImgbbKey] = useState(getImgbbApiKey());
  const [keyInput, setKeyInput] = useState(getImgbbApiKey());
  const [showKeyField, setShowKeyField] = useState(!getImgbbApiKey());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = getImgbbApiKey();
    setImgbbKey(current);
    if (!current) {
      setShowKeyField(true);
    }
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file (JPG, PNG, WEBP, etc.)');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImgbbKey = () => {
    if (!keyInput.trim()) {
      saveImgbbApiKey('');
      setImgbbKey('');
      onShowToast('ImgBB API key cleared', 'info');
      return;
    }
    saveImgbbApiKey(keyInput.trim());
    setImgbbKey(keyInput.trim());
    setShowKeyField(false);
    onShowToast('ImgBB API key saved for this studio', 'success');
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      setUploadError('Please choose an image file first.');
      return;
    }

    const keyToUse = imgbbKey || keyInput.trim();
    if (!keyToUse) {
      setShowKeyField(true);
      setUploadError('ImgBB API key required. Please enter your free API key from https://api.imgbb.com/');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await uploadToImgbb(selectedFile, keyToUse);
      if (result.success && result.url) {
        setCoverUrl(result.url);
        setUploadSuccess(true);
        setSelectedFile(null);
        setFilePreview(null);
        onShowToast('Cover image successfully uploaded to imgbb.com and linked!', 'success');
      } else {
        setUploadError(result.error || 'Upload failed. Please check your ImgBB API key.');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Network error during image upload.');
    } finally {
      setIsUploading(false);
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
      coverUrl: coverUrl.trim(),
      author: author.trim() || 'Jaystarbliss',
      publisher: publisher.trim() || 'JAYSTARBLISS STUDIOS',
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
    onShowToast(`Manuscript "${title}" saved successfully to library`, 'success');
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 font-calibri text-zinc-100 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-sm text-zinc-300 hover:text-white transition-colors"
            title="Return to Books List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wide text-white">
              {book ? `EDIT: ${book.title}` : 'CREATE NEW BOOK MANUSCRIPT'}
            </h1>
            <p className="font-mono-space text-xs text-zinc-400">
              EDITORIAL METADATA & IMGBB COVER ART CONFIGURATION
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-sm shadow-md transition-all active:scale-95 w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          <span>SAVE BOOK</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* IMGBB COVER ART UPLOADER SECTION */}
        <div className="p-5 sm:p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <h2 className="font-cinzel text-sm font-bold tracking-wider text-zinc-100 uppercase">
                  BOOK COVER ART (HOSTED ON IMGBB.COM)
                </h2>
              </div>
              <p className="font-mono-space text-[11px] text-zinc-400 mt-0.5">
                Direct high-resolution cloud upload to imgbb.com. Displayed across the entire library.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyField(!showKeyField)}
              className="flex items-center gap-1.5 text-[11px] font-mono-space text-zinc-400 hover:text-white transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{imgbbKey ? 'API Key Configured' : 'Set ImgBB API Key'}</span>
            </button>
          </div>

          {/* Optional ImgBB API Key Panel */}
          {showKeyField && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono-space text-amber-400 uppercase font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>ImgBB.com API Key</span>
                </label>
                <a
                  href="https://api.imgbb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono-space text-zinc-400 hover:text-emerald-400 flex items-center gap-1"
                >
                  <span>Get Free Key at api.imgbb.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste your 32-character ImgBB API key here..."
                  className="flex-1 bg-[#121216] border border-zinc-700 text-white font-mono-space text-xs p-2 rounded-sm focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleSaveImgbbKey}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono-space text-xs tracking-wider rounded-sm transition-colors"
                >
                  SAVE KEY
                </button>
              </div>
              <p className="text-[10px] font-mono-space text-zinc-500">
                You can also configure <code className="text-zinc-400">VITE_IMGBB_API_KEY</code> in environment variables.
              </p>
            </div>
          )}

          {/* Upload Dropzone & Live Cover Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Upload Action Area */}
            <div className="md:col-span-8 space-y-4">
              
              {/* File Selector */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-sm p-6 text-center cursor-pointer bg-zinc-950/60 hover:bg-zinc-950 transition-colors flex flex-col items-center justify-center space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <Upload className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-mono-space font-medium text-zinc-200 uppercase tracking-wider">
                    {selectedFile ? selectedFile.name : 'Click or Drag & Drop Cover Image'}
                  </p>
                  <p className="text-[11px] font-mono-space text-zinc-500 mt-1">
                    Supports JPG, PNG, WEBP, SVG (Max 32MB)
                  </p>
                </div>
                {selectedFile && (
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono-space text-zinc-300 rounded-sm">
                    {(selectedFile.size / 1024).toFixed(1)} KB selected
                  </span>
                )}
              </div>

              {/* Upload Trigger Button */}
              {selectedFile && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono-space font-bold tracking-widest rounded-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>UPLOADING TO IMGBB.COM...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>CONFIRM UPLOAD TO IMGBB</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-sm text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Status Feedback */}
              {uploadError && (
                <div className="p-3 bg-rose-950/50 border border-rose-900/80 rounded-sm flex items-center gap-2 text-rose-300 text-xs font-mono-space">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-900/80 rounded-sm flex items-center gap-2 text-emerald-300 text-xs font-mono-space">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Uploaded to ImgBB and applied to manuscript cover!</span>
                </div>
              )}

              {/* Manual Direct URL fallback */}
              <div className="space-y-1 pt-2">
                <label className="text-[11px] font-mono-space text-zinc-400 uppercase block">
                  Or Direct Image URL (Auto-filled on upload)
                </label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://i.ibb.co/... or any web image link"
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

            </div>

            {/* Live Cover Preview Column */}
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <span className="text-[10px] font-mono-space text-zinc-400 uppercase tracking-wider mb-2 block">
                COVER PREVIEW
              </span>
              <div className="w-36 sm:w-40 aspect-[2/3] bg-zinc-950 border border-zinc-700 rounded-sm overflow-hidden flex items-center justify-center shadow-lg relative">
                {filePreview || coverUrl ? (
                  <img
                    src={filePreview || coverUrl}
                    alt="Book Cover Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center text-zinc-600">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-[10px] font-mono-space uppercase">No Cover Art Yet</span>
                  </div>
                )}
              </div>
              {coverUrl && (
                <span className="text-[9px] font-mono-space text-emerald-400 mt-2 truncate max-w-full px-2">
                  ✓ Active Cover URL
                </span>
              )}
            </div>

          </div>
        </div>

        {/* METADATA FORM SECTION */}
        <div className="p-5 sm:p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-5">
          <h2 className="font-cinzel text-sm font-bold tracking-wider text-zinc-200 uppercase pb-2 border-b border-zinc-800">
            MANUSCRIPT METADATA & DETAILS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Book Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. TWO DECADES, SHADOW REALM, BEYOND HORIZONS"
                className="w-full bg-zinc-950 border border-zinc-700 text-white font-cinzel text-base p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Tagline / Subtitle
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

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Synopsis / Narrative Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the full synopsis, premise, and introduction..."
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 font-cambria text-sm p-3 rounded-sm focus:outline-none focus:border-zinc-500 leading-relaxed"
              />
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

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Genres (Comma-separated)
              </label>
              <input
                type="text"
                value={genresInput}
                onChange={(e) => setGenresInput(e.target.value)}
                placeholder="e.g. Fantasy, Thriller, Autobiography, Memoir"
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
                placeholder="e.g. Epic, Dark Fantasy, Survival, Mystery"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs font-mono-space text-zinc-200">
                  Feature prominently as a Hot / Top Novel in the library showcase
                </span>
              </label>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
};

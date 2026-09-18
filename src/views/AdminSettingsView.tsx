import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Shield, CheckCircle2, Globe, Feather, Image, Key, ExternalLink, Trash2 } from 'lucide-react';
import { saveBooks, saveChapters } from '../lib/storage';
import { clearAllFirestoreBooksAndChapters } from '../lib/firebase';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { getImgbbApiKey, saveImgbbApiKey } from '../lib/imageUpload';

interface AdminSettingsViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onDataReset: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  onShowToast,
  onDataReset
}) => {
  const [siteTitle, setSiteTitle] = useState("Library X");
  const [publisher, setPublisher] = useState('JAYSTARBLISS STUDIOS');
  const [defaultAuthor, setDefaultAuthor] = useState('Jaystarbliss');
  const [timezone, setTimezone] = useState('Africa/Lagos (WAT / UTC+1)');
  const [contactEmail, setContactEmail] = useState('johnrufai242@gmail.com');
  const [manifesto, setManifesto] = useState(
    'A sovereign digital archive and literary salon where serialized memoirs, original novels, and written works are typeset with classical discipline and shared directly with readers.'
  );

  // ImgBB API Key
  const [imgbbKey, setImgbbKey] = useState(getImgbbApiKey());
  const [keyInput, setKeyInput] = useState(getImgbbApiKey());

  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim() !== imgbbKey) {
      saveImgbbApiKey(keyInput.trim());
      setImgbbKey(keyInput.trim());
    }
    onShowToast('Studio publishing settings updated successfully', 'success');
  };

  const handleSaveImgbbOnly = () => {
    saveImgbbApiKey(keyInput.trim());
    setImgbbKey(keyInput.trim());
    onShowToast('ImgBB API key saved successfully', 'success');
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      // Clear localStorage
      saveBooks([]);
      saveChapters([]);
      
      // Clear Cloud Firestore if authenticated
      try {
        await clearAllFirestoreBooksAndChapters();
      } catch (err) {
        console.warn('Firestore clear warning (local wiped):', err);
      }

      onDataReset();
      setShowClearModal(false);
      onShowToast('All books and chapters have been purged. Library is now in clean wireframe state.', 'success');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Error clearing data', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-4 sm:p-10 space-y-8 font-calibri text-zinc-100 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-300" />
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide uppercase text-white">
              STUDIO & PUBLISHING SETTINGS
            </h1>
          </div>
          <p className="font-mono-space text-xs text-zinc-400">
            JAYSTARBLISS STUDIOS PLATFORM & IMGBB INTEGRATION
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-sm shadow-md transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>SAVE SETTINGS</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* ImgBB.com Configuration Card */}
        <div className="p-5 sm:p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-emerald-400" />
              <h2 className="font-cinzel text-sm font-bold tracking-wider text-zinc-200 uppercase">
                IMGBB.COM IMAGE HOSTING INTEGRATION
              </h2>
            </div>
            <a
              href="https://api.imgbb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono-space text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Get Free API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono-space text-zinc-300 uppercase block">
              ImgBB API Key (For Book Cover Uploads)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your 32-character ImgBB API key..."
                className="flex-1 bg-zinc-950 border border-zinc-700 text-white font-mono-space text-xs p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={handleSaveImgbbOnly}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono-space text-xs tracking-wider rounded-sm shrink-0"
              >
                SAVE KEY
              </button>
            </div>
            <p className="text-[11px] font-mono-space text-zinc-500 leading-relaxed">
              When configured, the book creator in Author Studio can directly upload high-res covers to imgbb.com, and the resulting links are stored in Firebase.
            </p>
          </div>
        </div>

        {/* General Publishing Identity Card */}
        <div className="p-5 sm:p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-5">
          <h2 className="font-cinzel text-sm font-bold tracking-wider text-zinc-200 uppercase pb-2 border-b border-zinc-800">
            GENERAL PUBLISHING IDENTITY
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Site Title
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-white font-cinzel text-sm p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Publisher Name
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-white font-mono-space text-sm p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Default Author
              </label>
              <input
                type="text"
                value={defaultAuthor}
                onChange={(e) => setDefaultAuthor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Publishing Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Contact & Archival Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm font-mono-space p-2.5 rounded-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono-space text-zinc-300 block uppercase">
                Publishing Manifesto / Philosophy
              </label>
              <textarea
                rows={3}
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 font-cambria italic text-sm p-3 rounded-sm focus:outline-none focus:border-zinc-500 leading-relaxed"
              />
            </div>

          </div>
        </div>

        {/* Database Management & Purge Card */}
        <div className="p-5 sm:p-6 bg-[#161418] border border-rose-900/60 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-cinzel text-sm font-bold tracking-wider uppercase">
              LIBRARY PURGE & WIREFRAME RESET
            </h3>
          </div>

          <p className="font-calibri text-xs text-zinc-300 leading-relaxed">
            Wipe all books and chapters from local cache and Cloud Firestore to return the library to a clean wireframe state. Any new books created in the Author Studio will be published with pristine live data.
          </p>

          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-mono-space tracking-wider rounded-sm transition-colors active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>PURGE ALL BOOKS & CHAPTERS (CLEAN SLATE)</span>
          </button>
        </div>

      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        title="Purge All Books & Chapters?"
        message="This will remove all books and chapters from both local storage and Cloud Firestore, restoring the library to an empty wireframe catalog awaiting your own uploaded manuscripts."
        confirmLabel="Purge Everything"
        isDestructive={true}
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearModal(false)}
      />

    </div>
  );
};

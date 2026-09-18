import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Shield, CheckCircle2, Globe, Feather } from 'lucide-react';
import { INITIAL_BOOKS, INITIAL_CHAPTERS } from '../data/initialData';
import { saveBooks, saveChapters } from '../lib/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface AdminSettingsViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onDataReset: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  onShowToast,
  onDataReset
}) => {
  const [siteTitle, setSiteTitle] = useState('Jaystarbliss’s Library');
  const [publisher, setPublisher] = useState('JAYSTARBLISS STUDIOS');
  const [defaultAuthor, setDefaultAuthor] = useState('Jaystarbliss');
  const [timezone, setTimezone] = useState('Africa/Lagos (WAT / UTC+1)');
  const [contactEmail, setContactEmail] = useState('contact@jaystarbliss.com');
  const [manifesto, setManifesto] = useState(
    'A sovereign digital archive and literary salon where serialized memoirs, autobiographies, and written works are typeset with classical discipline and shared with readers worldwide.'
  );

  const [showResetModal, setShowResetModal] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Studio publishing settings updated successfully', 'success');
  };

  const handleResetToCanon = () => {
    setShowResetModal(false);
    saveBooks(INITIAL_BOOKS);
    saveChapters(INITIAL_CHAPTERS);
    onDataReset();
    onShowToast('Library database reset to canonical 15 chapters of Two Decades', 'success');
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 font-calibri text-zinc-100 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-300" />
            <h1 className="font-cinzel text-2xl font-bold tracking-wide uppercase">
              STUDIO & PUBLISHING SETTINGS
            </h1>
          </div>
          <p className="font-mono-space text-xs text-zinc-400">
            JAYSTARBLISS STUDIOS ARCHIVAL & PLATFORM CONFIGURATION
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space font-bold tracking-widest rounded-sm shadow-md transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>SAVE SETTINGS</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        <div className="p-6 bg-[#121216] border border-zinc-800 rounded-sm space-y-5">
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

        {/* Database Management Card */}
        <div className="p-6 bg-[#161418] border border-rose-900/60 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-cinzel text-sm font-bold tracking-wider uppercase">
              ARCHIVAL DATABASE CONTROL & RE-SEEDING
            </h3>
          </div>

          <p className="font-calibri text-xs text-zinc-300 leading-relaxed">
            Reset the local library storage to the authentic, complete 15-chapter canonical manuscript of <strong>TWO DECADES</strong> (including chapters 1 to 15, drop caps, Author's Thoughts commentary, and the initial daily scheduled timeline).
          </p>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DATABASE TO CANONICAL MANUSCRIPT</span>
          </button>
        </div>

      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Library to Canonical Manuscript?"
        message="This will overwrite local edits and reload the original 15 canonical chapters of Two Decades with their full narrative texts and scheduled daily timestamps."
        confirmLabel="Reset Library"
        isDestructive={true}
        onConfirm={handleResetToCanon}
        onCancel={() => setShowResetModal(false)}
      />

    </div>
  );
};

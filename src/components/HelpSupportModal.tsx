import React from 'react';
import { X, HelpCircle, Mail, BookOpen, ShieldCheck, ExternalLink } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Container */}
      <div className="relative w-full max-w-md bg-[#12131b] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-100 font-sans-clean">
              Help & Support
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1b26] text-zinc-400 hover:text-white border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* FAQ 1: Free Chapters */}
          <div className="p-4 bg-[#171824] rounded-2xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-medium text-sm">
              <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />
              <span>How do public & locked chapters work?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pl-6">
              Chapters 1 through 10 of every serialized book are freely readable without signing in. Chapters 11 and onward require a free Google sign-in to unlock the full manuscript.
            </p>
          </div>

          {/* FAQ 2: Reading Progress */}
          <div className="p-4 bg-[#171824] rounded-2xl border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-medium text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Is my reading progress saved?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pl-6">
              Yes! Your chapter position and scroll percentage are saved locally and synced across devices in real time whenever you are signed in.
            </p>
          </div>

          {/* Contact Support */}
          <div className="p-4 bg-[#171824] rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 font-medium text-sm">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Contact Author & Support</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pl-6">
              Have questions, feedback, or need help with your account? Reach out directly to Jaystarbliss Studios.
            </p>
            <div className="pl-6 pt-1">
              <a
                href="mailto:johnrufai242@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs font-mono-space text-teal-400 hover:text-teal-300 underline"
              >
                <span>johnrufai242@gmail.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wider transition-colors shrink-0"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};

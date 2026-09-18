import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#18181c] border border-zinc-700/80 rounded-sm max-w-md w-full p-6 space-y-5 shadow-2xl">
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-sm flex items-center justify-center ${
              isDestructive ? 'bg-rose-950/80 text-rose-400 border border-rose-800' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-white p-1"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="font-calibri text-sm text-zinc-300 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-mono-space tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-mono-space tracking-widest font-bold rounded-sm shadow-md transition-colors ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-zinc-100 hover:bg-white text-zinc-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

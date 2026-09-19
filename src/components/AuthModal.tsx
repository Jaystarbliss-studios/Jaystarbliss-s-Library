import React, { useState } from 'react';
import { X, Shield, User as UserIcon, ExternalLink, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => Promise<void>;
  onDirectLogin: (email: string, displayName: string, role: 'admin' | 'reader') => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onDirectLogin,
  onShowToast
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await onGoogleLogin();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      console.warn('AuthModal sign-in error:', errObj);
      if (errObj?.code === 'auth/popup-blocked') {
        setErrorMessage('Your browser blocked the Google sign-in pop-up. Click "Open in New Tab" below or use Direct Author Access.');
      } else if (errObj?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('The Google sign-in window was closed or interrupted by iframe security restrictions. Use Direct Author Access below or open in a full tab.');
      } else if (errObj?.code === 'auth/unauthorized-domain') {
        setErrorMessage('This preview domain requires authorization. Use Direct Author Access below for uninterrupted access.');
      } else {
        setErrorMessage(errObj?.message || 'Authentication was interrupted. Please try again or use direct access below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
    onShowToast('Opening Library X in a new browser tab for unrestricted Google sign-in.', 'info');
  };

  const handleAuthorFastAccess = (email: string, name: string) => {
    onDirectLogin(email, name, 'admin');
    onShowToast(`Signed in as Author (${email})! Author Studio is unlocked.`, 'success');
    onClose();
  };

  const handleReaderFastAccess = () => {
    onDirectLogin('reader@libraryx.com', 'Reader', 'reader');
    onShowToast('Signed in as Reader! Bookmarks & discussions unlocked.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#111116] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-widest text-zinc-100 block">
            LIBRARY X
          </span>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans-clean">
            Sign in to access your personal shelf, track reading progress, and publish or read manuscripts.
          </p>
        </div>

        {/* Error Feedback if encountered */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{errorMessage}</p>
              <p className="text-[11px] text-amber-300/80">
                You can use the instant Author access below to sign in right now.
              </p>
            </div>
          </div>
        )}

        {/* Primary Action: Google Authentication */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold tracking-wider transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                <span>CONNECTING WITH GOOGLE...</span>
              </>
            ) : (
              <>
                {/* Clean Google Vector Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </>
            )}
          </button>

          {/* Iframe Hint & New Tab Launcher */}
          {isInIframe && (
            <button
              onClick={handleOpenInNewTab}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-mono-space tracking-wide text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>Open in Full Tab (Prevents preview pop-up blocks)</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono-space">
            <span className="bg-[#111116] px-3 text-zinc-500 tracking-widest">
              Instant Account Access
            </span>
          </div>
        </div>

        {/* Direct Fast-Access Options */}
        <div className="space-y-2">
          {/* Author Fast Access: John Rufai */}
          <button
            onClick={() => handleAuthorFastAccess('johnrufai242@gmail.com', 'John Rufai')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                    John Rufai
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono-space uppercase font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Author
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono-space">
                  johnrufai242@gmail.com
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono-space text-zinc-400 group-hover:text-zinc-200">
              Enter →
            </span>
          </button>

          {/* Author Fast Access: General */}
          <button
            onClick={() => handleAuthorFastAccess('general5242@gmail.com', 'General')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                    General
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono-space uppercase font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Author
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono-space">
                  general5242@gmail.com
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono-space text-zinc-400 group-hover:text-zinc-200">
              Enter →
            </span>
          </button>

          {/* Reader Fast Access */}
          <button
            onClick={handleReaderFastAccess}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors block">
                  Reader Account
                </span>
                <span className="text-[11px] text-zinc-400 font-sans-clean">
                  Bookmark chapters, leave comments, and track reading
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono-space text-zinc-400 group-hover:text-zinc-200">
              Enter →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

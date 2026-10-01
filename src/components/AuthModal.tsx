import React, { useState } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginWithGoogle: () => void;
  onShowToast?: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginWithGoogle,
  onShowToast
}) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      onShowToast?.('Please enter a valid email address', 'error');
      return;
    }
    // For seamless authentication, Google sign-in is recommended
    onShowToast?.('Connecting with Google is required for full cloud synchronization', 'info');
    onLoginWithGoogle();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-[#12131c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-[#191a26] text-zinc-400 hover:text-white border border-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mt-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 font-sans-clean">
            Welcome Back
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
            Sign in to continue your reading journey.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Continue with Google */}
          <button
            onClick={() => {
              onLoginWithGoogle();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-sans-clean text-sm font-semibold shadow-lg transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#12131c] px-3 text-[11px] text-zinc-500 uppercase font-mono-space">
              or
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Continue with Email */}
          {!showEmailInput ? (
            <button
              onClick={() => setShowEmailInput(true)}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#1a1b28] hover:bg-[#212334] border border-white/10 text-zinc-200 text-sm font-medium transition-colors"
            >
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>Continue with Email</span>
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-2 animate-in fade-in duration-200">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-2xl bg-[#191a27] border border-white/10 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Disclaimer Footnote */}
        <p className="mt-6 text-center text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed font-mono-space">
          By continuing, you agree to our{' '}
          <span className="text-zinc-400 underline cursor-pointer">Terms of Service</span> and{' '}
          <span className="text-zinc-400 underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

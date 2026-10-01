import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SplashLoadingProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const SplashLoading: React.FC<SplashLoadingProps> = ({
  onComplete,
  minDurationMs = 1200
}) => {
  const [progress, setProgress] = useState(15);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(65), 300);
    const timer2 = setTimeout(() => setProgress(100), 850);
    const timer3 = setTimeout(() => {
      setFadeOut(true);
      if (onComplete) {
        setTimeout(onComplete, 400);
      }
    }, minDurationMs);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [minDurationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#08090d] text-zinc-100 transition-opacity duration-500 overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Starry / Mountain Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08090d]/60 via-[#0d0e15]/80 to-[#08090d] z-0" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop')`
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top spacer */}
      <div className="pt-12 relative z-10" />

      {/* Center Branding & Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="relative mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141522]/90 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-100" strokeWidth={1.75} />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-zinc-100 font-sans-clean">
          Jaystarbliss
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium tracking-widest uppercase mt-0.5">
          Library
        </p>
      </div>

      {/* Bottom Tagline & Progress Bar */}
      <div className="relative z-10 pb-12 flex flex-col items-center w-full max-w-xs px-6">
        <p className="text-xs text-zinc-500 font-mono-space tracking-wider mb-6 italic">
          Good books. Greater minds.
        </p>

        {/* Minimal Progress Bar Line */}
        <div className="w-28 h-1 bg-zinc-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-indigo-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';
import { canPromptPwaInstall, isPwaInstalled, promptPwaInstall } from '../pwa';

export const InstallAppButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [available, setAvailable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = isPwaInstalled();
    setInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const sync = () => {
      const isApp = isPwaInstalled();
      setInstalled(isApp);
      setAvailable(!isApp && (canPromptPwaInstall() || isIOSDevice));
    };

    sync();
    window.addEventListener('library-x-install-available', sync);
    window.addEventListener('library-x-installed', sync);

    return () => {
      window.removeEventListener('library-x-install-available', sync);
      window.removeEventListener('library-x-installed', sync);
    };
  }, []);

  if (installed || !available) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (canPromptPwaInstall()) {
      const accepted = await promptPwaInstall();
      if (accepted) {
        setInstalled(true);
        setAvailable(false);
      }
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={
          className ||
          'hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm'
        }
        aria-label="Install Library X App"
        title="Install Library X to Home Screen"
      >
        <Smartphone className="w-3.5 h-3.5 text-teal-400" />
        <span>INSTALL APP</span>
      </button>

      {/* iOS / Mobile Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#12131e] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/library-x.png" alt="Library X" className="w-8 h-8 rounded-lg object-contain" />
                <h3 className="font-bold text-base text-zinc-100 font-sans-clean">
                  Install Library X
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-xl bg-[#1a1c2a] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Install Library X directly onto your home screen for full-screen offline reading and instant access:
            </p>

            <div className="space-y-2.5 bg-[#171827] border border-white/5 rounded-2xl p-3.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold font-mono-space text-xs shrink-0">
                  1
                </div>
                <span>
                  Tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-teal-400" /> in your browser.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold font-mono-space text-xs shrink-0">
                  2
                </div>
                <span>
                  Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold font-mono-space text-xs shrink-0">
                  3
                </div>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top-right corner to finish.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-sans-clean transition-colors cursor-pointer shadow-md"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
};

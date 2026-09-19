import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { canPromptPwaInstall, isPwaInstalled, promptPwaInstall } from '../pwa';

export const InstallAppButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const sync = () => setAvailable(!isPwaInstalled() && canPromptPwaInstall());

    sync();
    window.addEventListener('library-x-install-available', sync);
    window.addEventListener('library-x-installed', sync);

    return () => {
      window.removeEventListener('library-x-install-available', sync);
      window.removeEventListener('library-x-installed', sync);
    };
  }, []);

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await promptPwaInstall();
        setAvailable(false);
      }}
      className={className || 'flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 text-xs font-mono-space tracking-wider hover:bg-zinc-800 transition-colors'}
      aria-label="Install Library X"
    >
      <Download className="w-3.5 h-3.5" />
      <span>INSTALL APP</span>
    </button>
  );
};

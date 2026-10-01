import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Moon, Sun, Type, AlignJustify, Globe, Palette } from 'lucide-react';
import { ReaderPreferences } from '../types';

interface ReadingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences?: ReaderPreferences;
  onUpdatePreferences?: (prefs: Partial<ReaderPreferences>) => void;
}

export const ReadingSettingsModal: React.FC<ReadingSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences
}) => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('base');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('normal');
  const [readingTheme, setReadingTheme] = useState<string>('Default');
  const [language, setLanguage] = useState<string>('English');

  useEffect(() => {
    if (preferences) {
      if (preferences.theme) setTheme(preferences.theme as 'dark' | 'light' | 'sepia');
      if (preferences.fontSize) setFontSize(preferences.fontSize);
      if (preferences.lineHeight) setLineSpacing(preferences.lineHeight);
    }
  }, [preferences]);

  if (!isOpen) return null;

  const cycleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'sepia' : 'dark';
    setTheme(next);
    onUpdatePreferences?.({ theme: next });
  };

  const cycleFontSize = (step: number) => {
    const sizes: ('sm' | 'base' | 'lg' | 'xl' | '2xl')[] = ['sm', 'base', 'lg', 'xl', '2xl'];
    const idx = sizes.indexOf(fontSize);
    const nextIdx = Math.max(0, Math.min(sizes.length - 1, idx + step));
    setFontSize(sizes[nextIdx]);
    onUpdatePreferences?.({ fontSize: sizes[nextIdx] });
  };

  const cycleLineSpacing = () => {
    const next = lineSpacing === 'normal' ? 'relaxed' : lineSpacing === 'relaxed' ? 'loose' : 'normal';
    setLineSpacing(next);
    onUpdatePreferences?.({ lineHeight: next });
  };

  const cycleReadingTheme = () => {
    const themes = ['Default', 'Warm Amber', 'OLED Black', 'Parchment'];
    const next = themes[(themes.indexOf(readingTheme) + 1) % themes.length];
    setReadingTheme(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Container */}
      <div className="relative w-full max-w-md bg-[#12131b] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-zinc-100 font-sans-clean">
              Reading Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1b26] text-zinc-400 hover:text-white border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings List */}
        <div className="mt-4 space-y-3">
          {/* Appearance Row */}
          <div
            onClick={cycleTheme}
            className="flex items-center justify-between p-3.5 bg-[#171824] hover:bg-[#1c1e2d] rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Appearance</p>
                <p className="text-[11px] text-zinc-500">Light / Dark / Sepia</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-zinc-300 bg-white/5 px-2.5 py-1 rounded-lg">
                {theme}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Font Size Row */}
          <div className="flex items-center justify-between p-3.5 bg-[#171824] rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Font Size</p>
                <p className="text-[11px] text-zinc-500">Adjust reading text scale</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cycleFontSize(-1)}
                className="px-2.5 py-1 bg-[#222436] hover:bg-[#2c2e44] text-xs font-bold rounded-lg text-zinc-200 border border-white/5"
              >
                A-
              </button>
              <span className="text-xs font-mono-space text-zinc-400 w-8 text-center uppercase">
                {fontSize}
              </span>
              <button
                onClick={() => cycleFontSize(1)}
                className="px-2.5 py-1 bg-[#222436] hover:bg-[#2c2e44] text-xs font-bold rounded-lg text-zinc-200 border border-white/5"
              >
                A+
              </button>
            </div>
          </div>

          {/* Line Spacing Row */}
          <div
            onClick={cycleLineSpacing}
            className="flex items-center justify-between p-3.5 bg-[#171824] hover:bg-[#1c1e2d] rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <AlignJustify className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Line Spacing</p>
                <p className="text-[11px] text-zinc-500">Paragraph line height</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300 capitalize">{lineSpacing}</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Reading Theme Row */}
          <div
            onClick={cycleReadingTheme}
            className="flex items-center justify-between p-3.5 bg-[#171824] hover:bg-[#1c1e2d] rounded-2xl border border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Reading Theme</p>
                <p className="text-[11px] text-zinc-500">Color temperature</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300">{readingTheme}</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Language Row */}
          <div className="flex items-center justify-between p-3.5 bg-[#171824] rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Language</p>
                <p className="text-[11px] text-zinc-500">Interface localization</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300">{language}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wider transition-colors"
        >
          DONE
        </button>
      </div>
    </div>
  );
};

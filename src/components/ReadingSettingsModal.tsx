import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Type, AlignJustify, Palette, Check, Minus, Plus } from 'lucide-react';
import { ReaderPreferences, ReaderFontSize, ReaderFontFamily, ReaderTheme } from '../types';
import { getReaderPreferences, saveReaderPreferences } from '../lib/storage';

interface ReadingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences?: ReaderPreferences;
  onUpdatePreferences?: (prefs: Partial<ReaderPreferences>) => void;
}

const THEMES: {
  label: string;
  value: ReaderTheme;
  page: string;
  text: string;
  border: string;
}[] = [
  {
    label: 'Dark',
    value: 'dark',
    page: '#11131a',
    text: '#f4f6fb',
    border: '#303746'
  },
  {
    label: 'Sepia',
    value: 'sepia',
    page: '#f4ecd8',
    text: '#2b2117',
    border: '#d8c6a6'
  },
  {
    label: 'Light',
    value: 'light',
    page: '#ffffff',
    text: '#17181c',
    border: '#d8dee8'
  }
];

const FONTS: { label: string; value: ReaderFontFamily; className: string }[] = [
  { label: 'Merriweather', value: 'merriweather', className: 'font-merriweather' },
  { label: 'Lora', value: 'lora', className: 'font-lora' },
  { label: 'Inter', value: 'inter', className: 'font-inter' },
  { label: 'Roboto', value: 'roboto', className: 'font-roboto' }
];

export const ReadingSettingsModal: React.FC<ReadingSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences: propPreferences,
  onUpdatePreferences
}) => {
  // Read current saved preferences or prop preferences
  const currentPrefs = propPreferences || getReaderPreferences();
  
  const [theme, setTheme] = useState<ReaderTheme>(currentPrefs.theme || 'dark');
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>(currentPrefs.fontFamily || 'merriweather');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>(currentPrefs.lineHeight || 'normal');
  
  // Font size pixel state for slider
  const getInitialPx = (): number => {
    if (currentPrefs.fontSizePx) return currentPrefs.fontSizePx;
    switch (currentPrefs.fontSize) {
      case 'sm': return 16;
      case 'base': return 18;
      case 'lg': return 22;
      case 'xl': return 26;
      case '2xl': return 30;
      default: return 18;
    }
  };

  const [fontSizePx, setFontSizePx] = useState<number>(getInitialPx);

  useEffect(() => {
    if (isOpen) {
      const prefs = propPreferences || getReaderPreferences();
      setTheme(prefs.theme || 'dark');
      setFontFamily(prefs.fontFamily || 'merriweather');
      setLineSpacing(prefs.lineHeight || 'normal');
      
      let px = 18;
      if (prefs.fontSizePx) {
        px = prefs.fontSizePx;
      } else {
        switch (prefs.fontSize) {
          case 'sm': px = 16; break;
          case 'base': px = 18; break;
          case 'lg': px = 22; break;
          case 'xl': px = 26; break;
          case '2xl': px = 30; break;
        }
      }
      setFontSizePx(px);
      // Ensure CSS variable is synced on mount/open
      document.documentElement.style.setProperty('--reader-font-size', `${px}px`);
    }
  }, [isOpen, propPreferences]);

  if (!isOpen) return null;

  const mapPxToFontSize = (px: number): ReaderFontSize => {
    if (px <= 16) return 'sm';
    if (px <= 19) return 'base';
    if (px <= 23) return 'lg';
    if (px <= 27) return 'xl';
    return '2xl';
  };

  const handleFontSizeChange = (newPx: number) => {
    const clampedPx = Math.max(14, Math.min(36, newPx));
    setFontSizePx(clampedPx);
    
    // Dynamically update the CSS variable '--reader-font-size' on root
    document.documentElement.style.setProperty('--reader-font-size', `${clampedPx}px`);

    const mappedSize = mapPxToFontSize(clampedPx);
    const updated: Partial<ReaderPreferences> = {
      fontSize: mappedSize,
      fontSizePx: clampedPx
    };

    // Save to storage
    const stored = getReaderPreferences();
    saveReaderPreferences({ ...stored, ...updated });

    // Notify callback
    onUpdatePreferences?.(updated);
  };

  const handleThemeChange = (newTheme: ReaderTheme) => {
    setTheme(newTheme);
    const themeObj = THEMES.find((t) => t.value === newTheme);
    const updated: Partial<ReaderPreferences> = {
      theme: newTheme,
      pageColor: themeObj?.page,
      textColor: themeObj?.text
    };
    const stored = getReaderPreferences();
    saveReaderPreferences({ ...stored, ...updated });
    onUpdatePreferences?.(updated);
  };

  const handleFontFamilyChange = (newFont: ReaderFontFamily) => {
    setFontFamily(newFont);
    const updated: Partial<ReaderPreferences> = { fontFamily: newFont };
    const stored = getReaderPreferences();
    saveReaderPreferences({ ...stored, ...updated });
    onUpdatePreferences?.(updated);
  };

  const handleLineSpacingChange = (newSpacing: 'normal' | 'relaxed' | 'loose') => {
    setLineSpacing(newSpacing);
    const updated: Partial<ReaderPreferences> = { lineHeight: newSpacing };
    const stored = getReaderPreferences();
    saveReaderPreferences({ ...stored, ...updated });
    onUpdatePreferences?.(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Container */}
      <div className="relative w-full max-w-lg bg-[#11121c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-zinc-100 font-sans-clean">
                Reading Settings
              </h3>
              <p className="text-[11px] text-zinc-400">Customize typography & reader layout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reading settings"
            className="p-2 rounded-xl bg-[#1a1b28] hover:bg-[#222436] text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          
          {/* 1. DYNAMIC FONT SIZE SLIDER SECTION */}
          <section className="bg-[#171826] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Text Size (CSS --reader-font-size)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono-space text-xs font-bold">
                  {fontSizePx}px
                </span>
              </div>
            </div>

            {/* Slider Control with - / + Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleFontSizeChange(fontSizePx - 1)}
                disabled={fontSizePx <= 14}
                aria-label="Decrease font size"
                className="w-9 h-9 shrink-0 rounded-xl bg-[#202234] hover:bg-[#2a2c42] disabled:opacity-40 disabled:cursor-not-allowed border border-white/5 text-zinc-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min="14"
                  max="36"
                  step="1"
                  value={fontSizePx}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  aria-label="Font size slider"
                  className="w-full h-2 bg-[#26283d] rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleFontSizeChange(fontSizePx + 1)}
                disabled={fontSizePx >= 36}
                aria-label="Increase font size"
                className="w-9 h-9 shrink-0 rounded-xl bg-[#202234] hover:bg-[#2a2c42] disabled:opacity-40 disabled:cursor-not-allowed border border-white/5 text-zinc-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preset Tick Marks */}
            <div className="flex items-center justify-between text-[10px] font-mono-space text-zinc-500 px-1 mt-2">
              <button onClick={() => handleFontSizeChange(14)} className="hover:text-zinc-300 cursor-pointer">14px</button>
              <button onClick={() => handleFontSizeChange(18)} className="hover:text-zinc-300 cursor-pointer">18px (Default)</button>
              <button onClick={() => handleFontSizeChange(24)} className="hover:text-zinc-300 cursor-pointer">24px</button>
              <button onClick={() => handleFontSizeChange(30)} className="hover:text-zinc-300 cursor-pointer">30px</button>
              <button onClick={() => handleFontSizeChange(36)} className="hover:text-zinc-300 cursor-pointer">36px</button>
            </div>

            {/* Live Interactive Manuscript Text Preview */}
            <div className="mt-3 p-3 rounded-xl bg-[#0f1019] border border-white/5 overflow-hidden">
              <p className="text-[10px] uppercase font-mono-space text-zinc-500 mb-1">Live Text Scale Preview</p>
              <p
                className="transition-all duration-150 leading-relaxed truncate"
                style={{
                  fontSize: `${fontSizePx}px`,
                  fontFamily: fontFamily === 'lora' ? '"Lora", Georgia, serif' : fontFamily === 'inter' ? 'Inter, sans-serif' : fontFamily === 'roboto' ? 'Roboto, sans-serif' : '"Merriweather", Georgia, serif',
                  color: theme === 'light' ? '#18181b' : theme === 'sepia' ? '#3d2e1e' : '#f4f6fb'
                }}
              >
                "Good books. Greater minds." — Library X
              </p>
            </div>
          </section>

          {/* 2. THEME PALETTES */}
          <section className="bg-[#171826] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Theme Color
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {THEMES.map((t) => {
                const isSelected = theme === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleThemeChange(t.value)}
                    className="relative h-11 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    style={{
                      backgroundColor: t.page,
                      color: t.text,
                      borderColor: isSelected ? '#14b8a6' : t.border,
                      boxShadow: isSelected ? '0 0 0 2px #14b8a6' : 'none'
                    }}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. FONT FAMILY */}
          <section className="bg-[#171826] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Typeface
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {FONTS.map((font) => {
                const isSelected = fontFamily === font.value;
                return (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => handleFontFamilyChange(font.value)}
                    className={`h-11 rounded-xl border px-3 text-xs font-medium transition-all flex items-center justify-between cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'border-teal-500/80 bg-teal-500/10 text-white shadow-[0_0_0_1px_rgba(20,184,166,0.6)]'
                        : 'border-white/5 bg-[#202234] hover:bg-[#282a40] text-zinc-300'
                    }`}
                  >
                    <span className={font.className}>{font.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. LINE SPACING */}
          <section className="bg-[#171826] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <AlignJustify className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Line Spacing
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: 'normal' as const, label: 'Comfortable', mult: '1.78x' },
                { value: 'relaxed' as const, label: 'Relaxed', mult: '2.0x' },
                { value: 'loose' as const, label: 'Spacious', mult: '2.25x' }
              ].map((spacing) => {
                const isSelected = lineSpacing === spacing.value;
                return (
                  <button
                    key={spacing.value}
                    type="button"
                    onClick={() => handleLineSpacingChange(spacing.value)}
                    className={`h-11 rounded-xl border px-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center active:scale-95 ${
                      isSelected
                        ? 'border-teal-500/80 bg-teal-500/10 text-white shadow-[0_0_0_1px_rgba(20,184,166,0.6)]'
                        : 'border-white/5 bg-[#202234] hover:bg-[#282a40] text-zinc-300'
                    }`}
                  >
                    <span className="text-xs font-semibold leading-tight">{spacing.label}</span>
                    <span className="text-[10px] text-zinc-400">{spacing.mult}</span>
                  </button>
                );
              })}
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

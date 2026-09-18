import React from 'react';
import { ReaderPreferences, ReaderFontSize, ReaderFontFamily, ReaderWidth } from '../types';
import { Sliders, Eye, EyeOff, Check, Palette, Type } from 'lucide-react';
import {
  PRESET_PAGE_COLORS,
  PRESET_TEXT_COLORS,
  getContrastRatio,
  ensureReadableTextColor,
  isDarkColor
} from '../lib/colorUtils';

interface ReadingControlsProps {
  preferences: ReaderPreferences;
  onChangePreferences: (updated: Partial<ReaderPreferences>) => void;
  onClose?: () => void;
}

export const ReadingControls: React.FC<ReadingControlsProps> = ({
  preferences,
  onChangePreferences,
  onClose
}) => {
  const currentPageColor = preferences.pageColor || (
    preferences.theme === 'light' ? '#ffffff' :
    preferences.theme === 'sepia' ? '#f4ecd8' :
    preferences.theme === 'dark' ? '#14141b' : '#09090c'
  );

  const currentTextColor = preferences.textColor || (
    isDarkColor(currentPageColor) ? '#f4f4f5' : '#18181b'
  );

  const contrastRatio = getContrastRatio(currentPageColor, currentTextColor);
  const contrastFormatted = contrastRatio.toFixed(1);
  const isHighContrast = contrastRatio >= 4.5;

  const fontSizes: { label: string; value: ReaderFontSize }[] = [
    { label: 'A-', value: 'sm' },
    { label: 'A', value: 'base' },
    { label: 'A+', value: 'lg' },
    { label: 'A++', value: 'xl' },
    { label: 'Max', value: '2xl' }
  ];

  const widths: { label: string; value: ReaderWidth }[] = [
    { label: 'Compact', value: 'narrow' },
    { label: 'Standard', value: 'standard' },
    { label: 'Expanded', value: 'wide' }
  ];

  const fontOptions: { label: string; value: ReaderFontFamily; preview: string; fontClass: string }[] = [
    { label: 'EB Garamond', value: 'garamond', preview: 'Classical Novel Serif', fontClass: 'font-garamond' },
    { label: 'Newsreader', value: 'newsreader', preview: 'Editorial Literary Serif', fontClass: 'font-newsreader' },
    { label: 'Cambria', value: 'cambria', preview: 'Traditional Book Serif', fontClass: 'font-cambria' },
    { label: 'Jakarta Sans', value: 'sans', preview: 'Clean Modern Sans', fontClass: 'font-sans-clean' },
    { label: 'Space Mono', value: 'mono', preview: 'Archival Typeset', fontClass: 'font-mono-space' },
  ];

  // Handle changing page color with automatic contrast checking
  const handleSelectPageColor = (pageHex: string) => {
    // Automatically adjust text color if the current text color doesn't contrast well
    const autoContrastedTextColor = ensureReadableTextColor(pageHex, currentTextColor);
    
    // Map closest theme for backward compatibility
    const isDark = isDarkColor(pageHex);
    const themeName = isDark ? (pageHex === '#09090c' ? 'obsidian' : 'dark') : (pageHex === '#f4ecd8' ? 'sepia' : 'light');

    onChangePreferences({
      pageColor: pageHex,
      textColor: autoContrastedTextColor,
      theme: themeName
    });
  };

  // Handle changing text color with validation
  const handleSelectTextColor = (textHex: string) => {
    const ratio = getContrastRatio(currentPageColor, textHex);
    if (ratio < 3.0) {
      // If user chooses an unreadable color, automatically adjust to readable
      const safeColor = ensureReadableTextColor(currentPageColor);
      onChangePreferences({ textColor: safeColor });
    } else {
      onChangePreferences({ textColor: textHex });
    }
  };

  return (
    <div className="bg-[#18181f]/98 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-5 shadow-2xl space-y-5 text-zinc-200 w-80 sm:w-96 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <span className="font-mono-space text-xs font-bold tracking-widest uppercase text-zinc-100 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-zinc-300" />
          <span>Reader Aesthetics & Type</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-full text-xs font-mono-space text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            CLOSE
          </button>
        )}
      </div>

      {/* Contrast Status Pill */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono-space">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full border border-zinc-700"
            style={{ backgroundColor: currentPageColor }}
          />
          <span
            className="font-bold px-1.5 py-0.5 rounded text-[10px]"
            style={{ backgroundColor: currentPageColor, color: currentTextColor }}
          >
            Sample Text
          </span>
        </div>
        <span className={`text-[10px] font-semibold ${isHighContrast ? 'text-emerald-400' : 'text-amber-400'}`}>
          {contrastFormatted}:1 {isHighContrast ? '• Optimal Contrast' : '• Auto-adjusted'}
        </span>
      </div>

      {/* 1. Page Color Settings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-zinc-400" />
            <span>Page Color</span>
          </label>
          <span className="text-[10px] font-mono-space text-zinc-500 uppercase">
            Auto-contrast active
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_PAGE_COLORS.map((color) => {
            const isSelected = currentPageColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                onClick={() => handleSelectPageColor(color.hex)}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-white ring-2 ring-white/30 font-bold shadow-md scale-[1.02]'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
                style={{ backgroundColor: '#131318' }}
              >
                <span
                  className="w-5 h-5 rounded-lg border border-black/20 shrink-0 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="truncate">
                  <span className="text-[10px] block font-mono-space text-zinc-200 truncate">
                    {color.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Text Color Settings */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase flex items-center gap-1.5">
          <Type className="w-3 h-3 text-zinc-400" />
          <span>Text Color</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_TEXT_COLORS.map((color) => {
            const isSelected = currentTextColor.toLowerCase() === color.hex.toLowerCase();
            const ratio = getContrastRatio(currentPageColor, color.hex);
            const isCompatible = ratio >= 3.5;

            return (
              <button
                key={color.hex}
                onClick={() => handleSelectTextColor(color.hex)}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-white ring-2 ring-white/30 font-bold shadow-md scale-[1.02]'
                    : isCompatible
                    ? 'border-zinc-800 hover:border-zinc-600'
                    : 'border-zinc-900 opacity-40 hover:opacity-75'
                }`}
                style={{ backgroundColor: '#131318' }}
                title={isCompatible ? color.description : 'Low contrast with current page'}
              >
                <span
                  className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-inner flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <Check className={`w-3 h-3 ${color.isDark ? 'text-white' : 'text-zinc-900'}`} />
                  )}
                </span>
                <span className="text-[10px] block font-mono-space text-zinc-300 truncate">
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Typography Archetype Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase">
          Typography Selection
        </label>
        <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
          {fontOptions.map((font) => (
            <button
              key={font.value}
              onClick={() => onChangePreferences({ fontFamily: font.value })}
              className={`py-2 px-3 text-xs rounded-xl border transition-all flex items-center justify-between ${
                preferences.fontFamily === font.value
                  ? 'bg-zinc-100 text-zinc-950 border-white font-bold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
              }`}
            >
              <div className="text-left">
                <span className={`text-sm block ${font.fontClass}`}>{font.label}</span>
                <span className="text-[10px] opacity-70 block font-sans">{font.preview}</span>
              </div>
              {preferences.fontFamily === font.value && <Check className="w-4 h-4 text-zinc-950 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Font Size Step Buttons */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase">
          Font Scale
        </label>
        <div className="grid grid-cols-5 gap-1.5 bg-zinc-900 p-1.5 border border-zinc-800 rounded-xl">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => onChangePreferences({ fontSize: size.value })}
              className={`py-1.5 text-xs font-mono-space font-medium rounded-lg transition-all ${
                preferences.fontSize === size.value
                  ? 'bg-zinc-700 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Column Width */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase">
          Reading Width
        </label>
        <div className="grid grid-cols-3 gap-2">
          {widths.map((w) => (
            <button
              key={w.value}
              onClick={() => onChangePreferences({ readingWidth: w.value })}
              className={`py-2 text-xs font-mono-space rounded-xl border transition-all ${
                preferences.readingWidth === w.value
                  ? 'bg-zinc-100 text-zinc-950 border-white font-bold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Author's Thoughts Toggle */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-mono-space text-zinc-300">
          Author's Reflections Panel
        </span>
        <button
          onClick={() => onChangePreferences({ showAuthorsThoughts: !preferences.showAuthorsThoughts })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-space rounded-full border transition-all ${
            preferences.showAuthorsThoughts
              ? 'bg-zinc-800 text-white border-zinc-600'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
          }`}
        >
          {preferences.showAuthorsThoughts ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHOWN</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
              <span>HIDDEN</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

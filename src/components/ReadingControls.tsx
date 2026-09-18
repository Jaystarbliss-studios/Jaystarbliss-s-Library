import React from 'react';
import { ReaderPreferences, ReaderFontSize, ReaderFontFamily, ReaderWidth, ReaderTheme } from '../types';
import { Type, Sliders, Sun, Moon, Coffee, Eye, EyeOff, Layout, Check } from 'lucide-react';

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

  const themes: { label: string; value: ReaderTheme; icon: any; bg: string; text: string }[] = [
    { label: 'Manuscript', value: 'light', icon: Sun, bg: 'bg-[#fafafa]', text: 'text-[#18181b]' },
    { label: 'Sepia', value: 'sepia', icon: Coffee, bg: 'bg-[#f4ecd8]', text: 'text-[#3d3226]' },
    { label: 'Nocturne', value: 'dark', icon: Moon, bg: 'bg-[#121215]', text: 'text-[#f4f4f5]' }
  ];

  return (
    <div className="bg-[#18181b] border border-zinc-700/80 rounded-sm p-4 shadow-2xl space-y-5 text-zinc-200 w-72 sm:w-80 font-calibri">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-700/80">
        <span className="font-mono-space text-xs font-bold tracking-widest uppercase text-zinc-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>READING PREFERENCES</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-mono-space text-zinc-400 hover:text-white"
          >
            DONE
          </button>
        )}
      </div>

      {/* Font Family Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase">
          Typography Archetype
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChangePreferences({ fontFamily: 'cambria' })}
            className={`py-2 px-3 text-xs rounded-sm border transition-colors flex items-center justify-between ${
              preferences.fontFamily === 'cambria'
                ? 'bg-zinc-100 text-zinc-900 border-white font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span className="font-cambria text-sm">Cambria (Serif)</span>
            {preferences.fontFamily === 'cambria' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onChangePreferences({ fontFamily: 'calibri' })}
            className={`py-2 px-3 text-xs rounded-sm border transition-colors flex items-center justify-between ${
              preferences.fontFamily === 'calibri'
                ? 'bg-zinc-100 text-zinc-900 border-white font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span className="font-calibri text-sm">Calibri (Sans)</span>
            {preferences.fontFamily === 'calibri' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Font Size Step Buttons */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase">
          Text Scale
        </label>
        <div className="grid grid-cols-5 gap-1 bg-zinc-900 p-1 border border-zinc-800 rounded-sm">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => onChangePreferences({ fontSize: size.value })}
              className={`py-1.5 text-xs font-mono-space font-medium rounded-sm transition-colors ${
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

      {/* Reading Width */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase">
          Column Width
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {widths.map((w) => (
            <button
              key={w.value}
              onClick={() => onChangePreferences({ readingWidth: w.value })}
              className={`py-1.5 text-xs font-mono-space rounded-sm border transition-colors ${
                preferences.readingWidth === w.value
                  ? 'bg-zinc-800 text-white border-zinc-500 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Atmosphere / Themes */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono-space text-zinc-400 tracking-wider block uppercase">
          Atmosphere Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((th) => {
            const Icon = th.icon;
            const isSelected = preferences.theme === th.value;
            return (
              <button
                key={th.value}
                onClick={() => onChangePreferences({ theme: th.value })}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-sm border transition-all ${
                  isSelected ? 'border-zinc-300 ring-1 ring-zinc-300' : 'border-zinc-800 hover:border-zinc-700'
                } ${th.bg} ${th.text}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-mono-space uppercase tracking-wider font-bold">
                  {th.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Author's Thoughts Toggle */}
      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-mono-space text-zinc-300">
          Author's Thoughts Panel
        </span>
        <button
          onClick={() => onChangePreferences({ showAuthorsThoughts: !preferences.showAuthorsThoughts })}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-space rounded-sm border transition-colors ${
            preferences.showAuthorsThoughts
              ? 'bg-zinc-800 text-white border-zinc-600'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
          }`}
        >
          {preferences.showAuthorsThoughts ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>VISIBLE</span>
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

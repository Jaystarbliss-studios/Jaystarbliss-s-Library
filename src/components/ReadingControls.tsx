import React from 'react';
import { Check, X } from 'lucide-react';
import { ReaderPreferences, ReaderFontFamily, ReaderTheme } from '../types';

interface ReadingControlsProps {
  preferences: ReaderPreferences;
  onChangePreferences: (updated: Partial<ReaderPreferences>) => void;
  onClose?: () => void;
}

const THEMES: {
  label: string;
  value: ReaderTheme;
  page: string;
  text: string;
  panel: string;
  border: string;
}[] = [
  {
    label: 'Light',
    value: 'light',
    page: '#ffffff',
    text: '#17181c',
    panel: '#f8fafc',
    border: '#d8dee8'
  },
  {
    label: 'Sepia',
    value: 'sepia',
    page: '#f4ecd8',
    text: '#2b2117',
    panel: '#efe4cd',
    border: '#d8c6a6'
  },
  {
    label: 'Dark',
    value: 'dark',
    page: '#151922',
    text: '#f4f6fb',
    panel: '#0d1118',
    border: '#303746'
  }
];

const FONTS: { label: string; value: ReaderFontFamily; className: string }[] = [
  { label: 'Merriweather', value: 'merriweather', className: 'font-merriweather' },
  { label: 'Lora', value: 'lora', className: 'font-lora' },
  { label: 'Inter', value: 'inter', className: 'font-inter' },
  { label: 'Roboto', value: 'roboto', className: 'font-roboto' }
];

export const ReadingControls: React.FC<ReadingControlsProps> = ({
  preferences,
  onChangePreferences,
  onClose
}) => {
  const selectTheme = (theme: typeof THEMES[number]) => {
    onChangePreferences({
      theme: theme.value,
      pageColor: theme.page,
      textColor: theme.text
    });
  };

  return (
    <div
      role="dialog"
      aria-label="Reading Settings"
      className="w-[500px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[22px] border border-[#202632] bg-[#0d1118] text-[#f4f6fb] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-center justify-between border-b border-[#202632] px-5 py-5">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Reading Settings</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reading settings"
            className="rounded-lg p-1.5 text-[#aeb7c7] transition-colors hover:bg-[#18202c] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-6 px-6 py-6">
        <section>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.04em] text-[#7f8998]">
            Theme
          </div>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((theme) => {
              const selected = preferences.theme === theme.value;
              return (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => selectTheme(theme)}
                  aria-pressed={selected}
                  className="relative h-11 rounded-[11px] border text-[14px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#3f7cff]/50"
                  style={{
                    backgroundColor: theme.page,
                    color: theme.text,
                    borderColor: selected ? '#3f7cff' : theme.border,
                    boxShadow: selected ? '0 0 0 1px #3f7cff' : 'none'
                  }}
                >
                  {selected && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#3f7cff] p-0.5 text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                  {theme.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.04em] text-[#7f8998]">
            Font
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FONTS.map((font) => {
              const selected = preferences.fontFamily === font.value;
              return (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => onChangePreferences({ fontFamily: font.value })}
                  aria-pressed={selected}
                  className={`relative h-11 rounded-[11px] border bg-transparent px-3 text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#3f7cff]/50 ${
                    selected
                      ? 'border-[#3f7cff] text-[#f4f6fb] shadow-[0_0_0_1px_#3f7cff]'
                      : 'border-[#252d39] text-[#c5ccd8] hover:border-[#414b5c] hover:bg-[#121923]'
                  }`}
                >
                  {selected && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#3f7cff] p-0.5 text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <span className={font.className}>{font.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

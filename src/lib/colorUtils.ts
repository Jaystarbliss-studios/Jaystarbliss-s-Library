/**
 * Color and contrast calculation utilities for the in-book reading view.
 * Ensures WCAG AA compliance (contrast ratio >= 4.5:1) between page color and text color.
 */

export interface ColorSwatch {
  name: string;
  hex: string;
  description: string;
  isDark: boolean;
}

export const PRESET_PAGE_COLORS: ColorSwatch[] = [
  { name: 'Paper White', hex: '#ffffff', description: 'Crisp classic', isDark: false },
  { name: 'Warm Ivory', hex: '#faf8f5', description: 'Soft book paper', isDark: false },
  { name: 'Sepia Cream', hex: '#f4ecd8', description: 'Warm antique page', isDark: false },
  { name: 'Calm Sage', hex: '#e8ece6', description: 'Restful eye comfort', isDark: false },
  { name: 'Velvet Midnight', hex: '#14141b', description: 'Charcoal night', isDark: true },
  { name: 'Obsidian OLED', hex: '#09090c', description: 'Deep dark', isDark: true },
];

export const PRESET_TEXT_COLORS: ColorSwatch[] = [
  { name: 'Charcoal Ink', hex: '#18181b', description: 'Deep dark ink', isDark: true },
  { name: 'Espresso', hex: '#2e2318', description: 'Warm sepia ink', isDark: true },
  { name: 'Slate Blue', hex: '#1e293b', description: 'Literary blue-grey', isDark: true },
  { name: 'Off-White', hex: '#f4f4f5', description: 'Clean light text', isDark: false },
  { name: 'Warm Cream', hex: '#fef3c7', description: 'Soft night reading', isDark: false },
  { name: 'Silver Ash', hex: '#d4d4d8', description: 'Muted low-strain', isDark: false },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function isDarkColor(hex: string): boolean {
  try {
    const rgb = hexToRgb(hex);
    return getLuminance(rgb.r, rgb.g, rgb.b) < 0.35;
  } catch {
    return false;
  }
}

/**
 * Calculates WCAG contrast ratio between two hex colors.
 * Returns a number between 1 and 21.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 1;
  }
}

/**
 * Automatically adjusts text color to ensure sufficient contrast
 * whenever the page color changes.
 */
export function ensureReadableTextColor(pageHex: string, currentTextHex?: string): string {
  if (currentTextHex) {
    const ratio = getContrastRatio(pageHex, currentTextHex);
    // If current text color already satisfies WCAG AA (>= 4.5:1), keep user's chosen text color
    if (ratio >= 4.5) {
      return currentTextHex;
    }
  }

  // Automatic contrast fallback
  if (isDarkColor(pageHex)) {
    return '#f4f4f5'; // High-contrast clean off-white
  } else {
    // For sepia / ivory / paper, use deep ink
    if (pageHex.toLowerCase() === '#f4ecd8') {
      return '#2e2318'; // Espresso ink for sepia
    }
    return '#18181b'; // Charcoal ink for paper/ivory
  }
}

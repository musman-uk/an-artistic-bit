export const PALETTES = {
  night: ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f8fafc', '#020617'],
  day: ['#4f46e5', '#2563eb', '#0d9488', '#16a34a', '#d97706', '#e11d48', '#1c1917', '#faf8f5'],
  gbc: ['#e11d48', '#84cc16', '#65a30d', '#3f6212', '#1a2e05', '#ecfccb', '#06b6d4', '#ffffff'],
  arcade: ['#0284c7', '#e11d48', '#ea580c', '#ca8a04', '#16a34a', '#9333ea', '#0f172a', '#facc15'],
  office: ['#cbd5e1', '#2563eb', '#0d9488', '#d97706', '#e11d48', '#64748b', '#f8fafc', '#18181b'],
  psp: ['#38bdf8', '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#a1a1aa', '#ffffff', '#09090b'],
  pastel: ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc', '#f1f5f9', '#fda4af'],
  monochrome: ['#00ff66', '#00cc55', '#008833', '#004411', '#ffb000', '#00f0ff', '#020617', '#ffffff']
};

export const THEME_TITLES = {
  night: "Night",
  day: "Day",
  gbc: "Game Boy Color-Style",
  tv: '14" CRT Philips-Style',
  lenovo: '11" Lenovo-Style',
  psp: 'PSP-Style'
};

export const THEME_FAVICONS = {
  night: { bg: '#0c0e14', border: '#282e3f', cellA: '#6366f1', cellB: 'rgba(255, 255, 255, 0.22)' },
  day: { bg: '#e0dad0', border: '#cbc3b4', cellA: '#4f46e5', cellB: 'rgba(28, 25, 23, 0.18)' },
  gbc: { bg: '#0f1b09', border: '#4d7c0f', cellA: '#e11d48', cellB: 'rgba(255, 255, 255, 0.22)' },
  tv: { bg: '#141210', border: '#57534e', cellA: '#0284c7', cellB: 'rgba(255, 255, 255, 0.22)' },
  psp: { bg: '#08080a', border: '#32323a', cellA: '#38bdf8', cellB: 'rgba(255, 255, 255, 0.22)' },
  lenovo: { bg: '#1c1f24', border: '#4e5461', cellA: '#cbd5e1', cellB: 'rgba(255, 255, 255, 0.22)' }
};

export const SOUVENIR_THEMES = {
  night: {
    cardBg: '#13161f',
    wellBg: '#0c0e14',
    border: '#282e3f',
    screenBg: '#0f1219',
    screenBorder: '#282e3f',
    text: '#f1f5f9',
    muted: '#94a3b8',
    accent: '#818cf8',
    headerFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Space Grotesk", "Inter", sans-serif',
    fontLoadSpec: '700 24px "Fraunces"',
    bodyFontLoadSpec: '600 14px "Space Grotesk"',
    headerUppercase: false,
    headerLetterSpacing: '-0.01em',
    modalTitleClass: 'text-sm md:text-base font-bold tracking-tight',
    modalMetaClass: 'text-[11px] opacity-75',
    modalLabelClass: 'text-[10px] opacity-65 uppercase tracking-wider',
    modalValueClass: 'text-xs md:text-sm font-bold',
    pngTitleFont: 'bold 24px "Fraunces", Georgia, serif',
    pngDateFont: '500 12px "Space Grotesk", sans-serif',
    pngLabelFont: '600 10px "Space Grotesk", sans-serif',
    pngValueFont: 'bold 15px "Space Grotesk", sans-serif'
  },
  day: {
    cardBg: '#ebe6dd',
    wellBg: '#e0dad0',
    border: '#cbc3b4',
    screenBg: '#faf8f5',
    screenBorder: '#cbc3b4',
    text: '#1c1917',
    muted: '#57534e',
    accent: '#4f46e5',
    headerFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Space Grotesk", "Inter", sans-serif',
    fontLoadSpec: '700 24px "Fraunces"',
    bodyFontLoadSpec: '600 14px "Space Grotesk"',
    headerUppercase: false,
    headerLetterSpacing: '-0.01em',
    modalTitleClass: 'text-sm md:text-base font-bold tracking-tight',
    modalMetaClass: 'text-[11px] opacity-75',
    modalLabelClass: 'text-[10px] opacity-65 uppercase tracking-wider',
    modalValueClass: 'text-xs md:text-sm font-bold',
    pngTitleFont: 'bold 24px "Fraunces", Georgia, serif',
    pngDateFont: '500 12px "Space Grotesk", sans-serif',
    pngLabelFont: '600 10px "Space Grotesk", sans-serif',
    pngValueFont: 'bold 15px "Space Grotesk", sans-serif'
  },
  gbc: {
    cardBg: '#16260e',
    wellBg: '#0f1b09',
    border: '#4d7c0f',
    screenBg: '#1c1917',
    screenBorder: '#4d7c0f',
    text: '#ecfccb',
    muted: '#bef264',
    accent: '#a3e635',
    headerFont: '"Press Start 2P", monospace',
    bodyFont: '"Press Start 2P", monospace',
    fontLoadSpec: '400 14px "Press Start 2P"',
    bodyFontLoadSpec: '400 10px "Press Start 2P"',
    headerUppercase: false,
    headerLetterSpacing: '0.02em',
    modalTitleClass: 'text-[10px] md:text-xs leading-relaxed',
    modalMetaClass: 'text-[8px] md:text-[9px] opacity-80',
    modalLabelClass: 'text-[7px] md:text-[8px] opacity-75 uppercase',
    modalValueClass: 'text-[9px] md:text-[10px] mt-1 leading-snug',
    pngTitleFont: '13px "Press Start 2P", monospace',
    pngDateFont: '9px "Press Start 2P", monospace',
    pngLabelFont: '8px "Press Start 2P", monospace',
    pngValueFont: '10px "Press Start 2P", monospace'
  },
  tv: {
    cardBg: '#1c1917',
    wellBg: '#141210',
    border: '#57534e',
    screenBg: '#0c0a09',
    screenBorder: '#57534e',
    text: '#22c55e',
    muted: '#86efac',
    accent: '#38bdf8',
    headerFont: '"VT323", monospace',
    bodyFont: '"VT323", monospace',
    fontLoadSpec: '400 26px "VT323"',
    bodyFontLoadSpec: '400 18px "VT323"',
    headerUppercase: false,
    headerLetterSpacing: '0.05em',
    modalTitleClass: 'text-lg md:text-xl leading-none tracking-wider',
    modalMetaClass: 'text-sm md:text-base opacity-85',
    modalLabelClass: 'text-xs md:text-sm opacity-75 uppercase tracking-wider',
    modalValueClass: 'text-base md:text-lg leading-tight',
    pngTitleFont: '26px "VT323", monospace',
    pngDateFont: '17px "VT323", monospace',
    pngLabelFont: '15px "VT323", monospace',
    pngValueFont: '20px "VT323", monospace'
  },
  lenovo: {
    cardBg: '#272a30',
    wellBg: '#1c1f24',
    border: '#4e5461',
    screenBg: '#020617',
    screenBorder: '#4e5461',
    text: '#e2e8f0',
    muted: '#94a3b8',
    accent: '#cbd5e1',
    headerFont: '"Fira Code", monospace',
    bodyFont: '"Fira Code", monospace',
    fontLoadSpec: '700 18px "Fira Code"',
    bodyFontLoadSpec: '600 13px "Fira Code"',
    headerUppercase: false,
    headerLetterSpacing: '-0.02em',
    modalTitleClass: 'text-xs md:text-sm font-bold tracking-tight',
    modalMetaClass: 'text-[10px] md:text-[11px] opacity-75',
    modalLabelClass: 'text-[9px] opacity-65 uppercase tracking-wider',
    modalValueClass: 'text-xs font-bold',
    pngTitleFont: 'bold 18px "Fira Code", monospace',
    pngDateFont: '12px "Fira Code", monospace',
    pngLabelFont: '10px "Fira Code", monospace',
    pngValueFont: 'bold 13px "Fira Code", monospace'
  },
  psp: {
    cardBg: '#111114',
    wellBg: '#08080a',
    border: '#32323a',
    screenBg: '#000000',
    screenBorder: '#32323a',
    text: '#f4f4f5',
    muted: '#a1a1aa',
    accent: '#38bdf8',
    headerFont: '"Space Grotesk", "Inter", sans-serif',
    bodyFont: '"Space Grotesk", "Inter", sans-serif',
    fontLoadSpec: '700 20px "Space Grotesk"',
    bodyFontLoadSpec: '600 14px "Space Grotesk"',
    headerUppercase: false,
    headerLetterSpacing: '0.02em',
    modalTitleClass: 'text-xs md:text-sm font-bold tracking-wide',
    modalMetaClass: 'text-[11px] opacity-75',
    modalLabelClass: 'text-[10px] opacity-65 uppercase tracking-wider',
    modalValueClass: 'text-xs md:text-sm font-bold',
    pngTitleFont: 'bold 20px "Space Grotesk", sans-serif',
    pngDateFont: '500 12px "Space Grotesk", sans-serif',
    pngLabelFont: '600 10px "Space Grotesk", sans-serif',
    pngValueFont: 'bold 15px "Space Grotesk", sans-serif'
  }
};

export class ThemeManager {
  static getPreferredStudioTheme() {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'day';
    }
    return 'night';
  }

  static updateFavicon(themeKey) {
    if (typeof document === 'undefined') return;
    const fallback = THEME_FAVICONS[themeKey] || THEME_FAVICONS.night;
    let { bg, border, cellA, cellB } = fallback;

    const emblemEl = document.querySelector('.studio-emblem');
    const cellAEl = document.querySelector('.emblem-cell-a');
    const cellBEl = document.querySelector('.emblem-cell-b');

    if (emblemEl && cellAEl && cellBEl && typeof getComputedStyle === 'function') {
      const emblemStyle = getComputedStyle(emblemEl);
      const cellAStyle = getComputedStyle(cellAEl);
      const cellBStyle = getComputedStyle(cellBEl);

      if (emblemStyle.backgroundColor && emblemStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        bg = emblemStyle.backgroundColor;
      }
      if (emblemStyle.borderTopColor && emblemStyle.borderTopColor !== 'rgba(0, 0, 0, 0)') {
        border = emblemStyle.borderTopColor;
      }
      if (cellAStyle.backgroundColor && cellAStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        cellA = cellAStyle.backgroundColor;
      }
      if (cellBStyle.backgroundColor && cellBStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        cellB = cellBStyle.backgroundColor;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7" fill="${bg}" stroke="${border}" stroke-width="2"/><rect x="6" y="6" width="9" height="9" rx="2" fill="${cellA}"/><rect x="17" y="6" width="9" height="9" rx="2" fill="${cellB}"/><rect x="6" y="17" width="9" height="9" rx="2" fill="${cellB}"/><rect x="17" y="17" width="9" height="9" rx="2" fill="${cellA}"/></svg>`;
    const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  static applyTheme(themeKey, state) {
    if (themeKey === 'midnight') themeKey = 'night';
    if (themeKey === 'workstation') themeKey = 'lenovo';
    if (!THEME_TITLES[themeKey]) themeKey = ThemeManager.getPreferredStudioTheme();
    state.activeTheme = themeKey;

    // Remove existing theme classes without wiping structural utilities
    const classList = Array.from(document.body.classList).filter(c => !c.startsWith('theme-'));
    classList.push(`theme-${themeKey}`);
    document.body.className = classList.join(' ');

    ThemeManager.updateFavicon(themeKey);

    // Hide all hardware shell containers
    ['shell-studio', 'shell-gbc', 'shell-tv', 'shell-lenovo', 'shell-psp'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // Reveal target shell
    const shellId = (themeKey === 'night' || themeKey === 'day') ? 'shell-studio' : `shell-${themeKey}`;
    const activeShell = document.getElementById(shellId);
    if (activeShell) {
      activeShell.classList.remove('hidden');
    }

    // Keep dropdown selection synced in UI
    const selectEl = document.getElementById('select-theme');
    if (selectEl && selectEl.value !== themeKey) {
      selectEl.value = themeKey;
    }
  }
}

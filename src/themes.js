export const PALETTES = {
  night: ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f8fafc', '#020617'],
  day: ['#4f46e5', '#2563eb', '#0d9488', '#16a34a', '#d97706', '#e11d48', '#1c1917', '#faf8f5'],
  gbc: ['#84cc16', '#65a30d', '#3f6212', '#1a2e05', '#ecfccb', '#06b6d4', '#e11d48', '#ffffff'],
  arcade: ['#e11d48', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#9333ea', '#0f172a', '#facc15'],
  office: ['#e11d48', '#2563eb', '#0d9488', '#d97706', '#64748b', '#94a3b8', '#f8fafc', '#18181b'],
  psp: ['#38bdf8', '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#a1a1aa', '#ffffff', '#09090b'],
  pastel: ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc', '#f1f5f9', '#fda4af'],
  monochrome: ['#00ff66', '#00cc55', '#008833', '#004411', '#ffb000', '#00f0ff', '#020617', '#ffffff']
};

export const THEME_TITLES = {
  night: "Night Studio",
  day: "Day Studio",
  gbc: "Game Boy Color-Style",
  tv: '14" CRT Philips-Style',
  lenovo: '11" Lenovo-Style',
  psp: 'PSP-Style'
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

  static applyTheme(themeKey, state) {
    if (themeKey === 'midnight') themeKey = 'night';
    if (themeKey === 'workstation') themeKey = 'lenovo';
    if (!THEME_TITLES[themeKey]) themeKey = ThemeManager.getPreferredStudioTheme();
    state.activeTheme = themeKey;

    // Remove existing theme classes without wiping structural utilities
    const classList = Array.from(document.body.classList).filter(c => !c.startsWith('theme-'));
    classList.push(`theme-${themeKey}`);
    document.body.className = classList.join(' ');

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

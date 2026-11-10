export const PALETTES = {
  midnight: ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f8fafc', '#020617'],
  gbc: ['#84cc16', '#65a30d', '#3f6212', '#1a2e05', '#ecfccb', '#06b6d4', '#e11d48', '#ffffff'],
  arcade: ['#e11d48', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#9333ea', '#0f172a', '#facc15'],
  pastel: ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc', '#f1f5f9', '#fda4af'],
  monochrome: ['#00ff66', '#00cc55', '#008833', '#004411', '#ffb000', '#00f0ff', '#020617', '#ffffff']
};

export const THEME_TITLES = {
  midnight: "Midnight Studio",
  gbc: "Game Boy Color-Style",
  tv: '14" CRT Phillips-Style',
  workstation: '16" Workstation CRT'
};

export class ThemeManager {
  static applyTheme(themeKey, state) {
    if (!THEME_TITLES[themeKey]) themeKey = 'midnight';
    state.activeTheme = themeKey;

    // Remove existing theme classes without wiping structural utilities
    const classList = Array.from(document.body.classList).filter(c => !c.startsWith('theme-'));
    classList.push(`theme-${themeKey}`);
    document.body.className = classList.join(' ');

    // Hide all hardware shell containers
    ['shell-midnight', 'shell-gbc', 'shell-tv', 'shell-workstation'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // Reveal target shell
    const activeShell = document.getElementById(`shell-${themeKey}`);
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

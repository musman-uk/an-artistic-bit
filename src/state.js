const STORAGE_KEY = 'an_artistic_bit_state_v1';
export const FREEHAND_RESOLUTION = 256;

export class AppState {
  constructor() {
    this.gridSize = 32;
    this.lastGridResolution = 32;
    this.currentMode = 'studio';
    this.currentTool = 'pencil'; // 'pencil' | 'line' | 'bucket' | 'eraser' | 'picker'
    this.currentBehavior = 'off'; // 'off' | 'sand' | 'glitch' | 'bleed' | 'wave'
    this.symmetryMode = 'off'; // 'off' | 'x' | 'y' | 'quad'
    this.currentColor = '#6366f1';
    this.simSpeed = 1.0;
    this.showGridlines = true;
    this.crtEnabled = false;
    this.audioEnabled = true;
    this.activeTheme = 'night'; // 'night' | 'day' | 'gbc' | 'tv' | 'lenovo' | 'psp'
    this.activePalette = 'night';
    this.hasCustomTheme = false;
    this.focusMode = false;

    this.grid = [];
    this.actionLog = [];
    this.undoStack = [];

    this.lineStart = null;
    this.lineEnd = null;
    this.lastDrawCoord = null;

    this.isMouseDown = false;
    this.isReplaying = false;
    this.replayTimer = null;
    this.fps = 60;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
  }

  initGrid() {
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    this.actionLog = [];
    this.undoStack = [];
    this.saveUndoState();
  }

  resizeGrid(newSize) {
    if (this.gridSize === newSize) return;

    this.saveUndoState();

    const oldSize = this.gridSize;
    const oldGrid = this.grid;
    const newGrid = Array(newSize).fill(null).map(() => Array(newSize).fill(null));

    for (let newY = 0; newY < newSize; newY++) {
      for (let newX = 0; newX < newSize; newX++) {
        const oldX = Math.floor((newX / newSize) * oldSize);
        const oldY = Math.floor((newY / newSize) * oldSize);
        if (oldGrid[oldY] && oldGrid[oldY][oldX] !== undefined) {
          newGrid[newY][newX] = oldGrid[oldY][oldX];
        }
      }
    }

    this.gridSize = newSize;
    this.grid = newGrid;
    this.saveToStorage();
  }

  saveUndoState() {
    if (this.undoStack.length > 25) this.undoStack.shift();
    const copy = this.grid.map(row => [...row]);
    this.undoStack.push({
      grid: copy,
      gridSize: this.gridSize,
      showGridlines: this.showGridlines,
      logLength: this.actionLog.length
    });
  }

  undo() {
    if (this.undoStack.length > 0) {
      const state = this.undoStack.pop();
      this.grid = state.grid;
      if (state.gridSize) this.gridSize = state.gridSize;
      if (typeof state.showGridlines === 'boolean') this.showGridlines = state.showGridlines;
      this.actionLog = this.actionLog.slice(0, state.logLength);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  clearGrid() {
    this.saveUndoState();
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    this.actionLog = [];
    this.saveToStorage();
  }

  setPixel(x, y, color) {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
    if (this.grid[y][x] === color) return;
    this.grid[y][x] = color;
    this.actionLog.push({ x, y, color, mode: this.currentBehavior, timestamp: Date.now() });
  }

  saveToStorage() {
    try {
      const pixels = [];
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const color = this.grid[y]?.[x];
          if (color) {
            pixels.push([x, y, color]);
          }
        }
      }

      const payload = {
        gridSize: this.gridSize,
        lastGridResolution: this.lastGridResolution,
        showGridlines: this.showGridlines,
        activeTheme: this.activeTheme,
        activePalette: this.activePalette,
        hasCustomTheme: this.hasCustomTheme,
        currentColor: this.currentColor,
        symmetryMode: this.symmetryMode,
        crtEnabled: this.crtEnabled,
        audioEnabled: this.audioEnabled,
        pixels
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Unable to auto-save canvas state:', err);
    }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!data || typeof data.gridSize !== 'number' || data.gridSize < 8 || data.gridSize > 512) {
        return false;
      }

      this.gridSize = data.gridSize;
      this.lastGridResolution = [16, 32, 48].includes(data.lastGridResolution) ? data.lastGridResolution : 32;
      this.showGridlines = typeof data.showGridlines === 'boolean' ? data.showGridlines : true;

      let resolvedTheme = data.activeTheme || 'night';
      if (resolvedTheme === 'midnight') resolvedTheme = 'night';
      if (resolvedTheme === 'workstation') resolvedTheme = 'lenovo';
      this.activeTheme = resolvedTheme;

      let resolvedPalette = data.activePalette || this.activeTheme;
      if (resolvedPalette === 'midnight') resolvedPalette = 'night';
      this.activePalette = resolvedPalette;

      const legacyHardwareTheme = ['gbc', 'tv', 'lenovo', 'psp', 'workstation'].includes(data.activeTheme);
      this.hasCustomTheme = typeof data.hasCustomTheme === 'boolean'
        ? data.hasCustomTheme
        : legacyHardwareTheme;

      this.currentColor = data.currentColor || '#6366f1';
      this.symmetryMode = data.symmetryMode || 'off';
      this.crtEnabled = Boolean(data.crtEnabled);
      this.audioEnabled = typeof data.audioEnabled === 'boolean' ? data.audioEnabled : true;

      this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
      this.actionLog = [];
      this.undoStack = [];

      if (Array.isArray(data.pixels)) {
        for (const entry of data.pixels) {
          if (!Array.isArray(entry) || entry.length < 3) continue;
          const [x, y, color] = entry;
          if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize && typeof color === 'string') {
            this.grid[y][x] = color;
            this.actionLog.push({ x, y, color, mode: 'studio', timestamp: Date.now() });
          }
        }
      }

      this.saveUndoState();
      return true;
    } catch (err) {
      console.warn('Unable to restore saved canvas state:', err);
      return false;
    }
  }
}

export class AppState {
  constructor() {
    this.gridSize = 32;
    this.currentMode = 'studio'; // 'studio' | 'sandbox'
    this.currentTool = 'pencil'; // 'pencil' | 'line' | 'bucket' | 'eraser' | 'picker'
    this.currentBehavior = 'sand'; // 'sand' | 'glitch' | 'bleed' | 'wave'
    this.symmetryMode = 'off'; // 'off' | 'x' | 'y' | 'quad'
    this.currentColor = '#6366f1';
    this.simSpeed = 1.0;
    this.showGridlines = true;
    this.crtEnabled = false;
    this.audioEnabled = true;
    this.activeTheme = 'midnight'; // 'midnight' | 'gbc' | 'tv' | 'workstation'
    this.focusMode = false;

    this.grid = [];
    this.actionLog = [];
    this.undoStack = [];

    this.lineStart = null;
    this.lineEnd = null;

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

  saveUndoState() {
    if (this.undoStack.length > 25) this.undoStack.shift();
    const copy = this.grid.map(row => [...row]);
    this.undoStack.push({
      grid: copy,
      logLength: this.actionLog.length
    });
  }

  undo() {
    if (this.undoStack.length > 0) {
      const state = this.undoStack.pop();
      this.grid = state.grid;
      this.actionLog = this.actionLog.slice(0, state.logLength);
      return true;
    }
    return false;
  }

  clearGrid() {
    this.saveUndoState();
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    this.actionLog = [];
  }

  setPixel(x, y, color) {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
    this.grid[y][x] = color;
    this.actionLog.push({ x, y, color, mode: this.currentMode, timestamp: Date.now() });
  }
}

import { AppState, FREEHAND_RESOLUTION } from './state.js';
import { ThemeManager, PALETTES, THEME_TITLES, SOUVENIR_THEMES } from './themes.js';
import { SynthAudio } from './synth.js';
import { DrawingTools } from './tools.js';
import { PhysicsEngine } from './physics.js';
import { Exporter } from './exporter.js';

const FALLBACK_CURSORS = {
  pencil: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24'%3E%3Cpath d='M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' fill='%23ffffff' stroke='%230f172a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 2 20, auto`,
  line: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24'%3E%3Cline x1='4' y1='4' x2='20' y2='20' stroke='%230f172a' stroke-width='5' stroke-linecap='round'/%3E%3Cline x1='4' y1='4' x2='20' y2='20' stroke='%23ffffff' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E") 11 11, crosshair`,
  bucket: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24'%3E%3Cpath d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z' fill='%23ffffff' stroke='%230f172a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M21 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z' fill='%23ffffff' stroke='%230f172a' stroke-width='1.8'/%3E%3C/svg%3E") 19 20, auto`,
  eraser: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21Z' fill='%23ffffff' stroke='%230f172a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M22 21H7' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 4 19, auto`
};

const FA_GLYPH_SPECS = {
  pencil: { glyph: '\uf303', hx: 5, hy: 23, fallback: 'auto' },
  line: { glyph: '\uf715', hx: 14, hy: 14, fallback: 'crosshair' },
  bucket: { glyph: '\uf576', hx: 22, hy: 23, fallback: 'auto' },
  eraser: { glyph: '\uf12d', hx: 6, hy: 22, fallback: 'auto' }
};

class AnArtisticBitApp {
  constructor() {
    this.state = new AppState();
    this.synth = new SynthAudio();
    this.lastSandboxSave = 0;
    this.strokePoints = [];
    this.lastPaintSoundTime = 0;
    this.bufferCanvas = null;
    this.bufferCtx = null;
    this.toolCursors = { ...FALLBACK_CURSORS };

    const restored = this.state.loadFromStorage();
    if (!restored) {
      this.state.initGrid();
      const preferredTheme = ThemeManager.getPreferredStudioTheme();
      ThemeManager.applyTheme(preferredTheme, this.state);
      this.loadPalettePreset(preferredTheme, true, false);
    } else {
      const targetTheme = this.state.hasCustomTheme
        ? this.state.activeTheme
        : ThemeManager.getPreferredStudioTheme();
      ThemeManager.applyTheme(targetTheme, this.state);

      const presetMap = {
        night: 'night',
        day: 'day',
        gbc: 'gbc',
        tv: 'arcade',
        lenovo: 'office',
        psp: 'psp'
      };
      const initialPalette = this.state.hasCustomTheme
        ? (this.state.activePalette || presetMap[targetTheme] || 'night')
        : targetTheme;
      this.loadPalettePreset(initialPalette, !this.state.hasCustomTheme, false);
      if (this.state.hasCustomTheme) {
        this.setColor(this.state.currentColor, false);
      }
      this.syncRestoredUI();
    }

    this.setupSystemSchemeListener();
    this.setupActiveCanvas();
    this.setupEventListeners();
    this.updateGridResolutionUI();
    this.setTool(this.state.currentTool);
    this.initExactFontAwesomeCursors();

    this.mobileTab = 'draw';
    this.setMobileTab('draw');

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  async initExactFontAwesomeCursors() {
    if (!document.fonts) return;
    try {
      await document.fonts.load('900 18px "Font Awesome 6 Free"');
      await document.fonts.ready;
    } catch (_) {
      return;
    }

    if (!document.fonts.check('900 18px "Font Awesome 6 Free"')) return;

    const size = 28;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    Object.entries(FA_GLYPH_SPECS).forEach(([tool, spec]) => {
      ctx.clearRect(0, 0, size, size);
      ctx.font = '900 17px "Font Awesome 6 Free"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0f172a';
      ctx.strokeText(spec.glyph, size / 2, size / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(spec.glyph, size / 2, size / 2);

      const url = c.toDataURL('image/png');
      this.toolCursors[tool] = `url("${url}") ${spec.hx} ${spec.hy}, ${spec.fallback}`;
    });

    this.setTool(this.state.currentTool);
  }

  setupSystemSchemeListener() {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handleSchemeChange = (e) => {
      if (this.state.hasCustomTheme) return;
      const nextTheme = e.matches ? 'day' : 'night';
      ThemeManager.applyTheme(nextTheme, this.state);
      this.loadPalettePreset(nextTheme, true, false);
      this.setupActiveCanvas();
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', handleSchemeChange);
    }
  }

  syncRestoredUI() {
    this.setSymmetry(this.state.symmetryMode, false);
    this.setBehavior(this.state.currentBehavior);
    this.updateGridResolutionUI();

    const viewport = document.getElementById('hardware-viewport');
    if (viewport) {
      viewport.classList.toggle('crt-active', this.state.crtEnabled);
    }

    const icon = document.getElementById('icon-audio');
    if (icon) {
      icon.className = this.state.audioEnabled
        ? 'fa-solid fa-volume-high text-emerald-500'
        : 'fa-solid fa-volume-xmark opacity-50';
    }
  }

  setupActiveCanvas() {
    const canvasIds = {
      night: 'canvas-studio',
      day: 'canvas-studio',
      gbc: 'canvas-gbc',
      tv: 'canvas-tv',
      lenovo: 'canvas-lenovo',
      psp: 'canvas-psp'
    };

    const targetId = canvasIds[this.state.activeTheme] || 'canvas-studio';
    this.canvas = document.getElementById(targetId);

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.setTool(this.state.currentTool);
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (size > 0) {
      this.canvas.width = Math.round(size * dpr);
      this.canvas.height = Math.round(size * dpr);
      this.renderCanvas();
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());

    const handlePointerDown = (e) => {
      if (e.cancelable) e.preventDefault();
      this.state.isMouseDown = true;
      this.state.lastDrawCoord = null;
      this.strokePoints = [];
      this.lastPaintSoundTime = 0;
      this.state.saveUndoState();

      const coords = this.getGridCoords(e);
      if (coords && this.state.currentBehavior !== 'wave' && this.state.currentTool === 'line') {
        this.state.lineStart = coords;
        this.state.lineEnd = coords;
      } else {
        this.handlePointerAction(e);
      }
    };

    const handlePointerMove = (e) => {
      const coords = this.getGridCoords(e);
      if (coords) {
        const modeTag = this.state.showGridlines ? '' : ' (Freehand)';
        document.getElementById('status-coords').innerText = `X: ${coords.x}, Y: ${coords.y}${modeTag}`;
      }
      if (this.state.isMouseDown) {
        if (this.state.currentBehavior !== 'wave' && this.state.currentTool === 'line') {
          this.state.lineEnd = coords;
        } else {
          const events = (typeof e.getCoalescedEvents === 'function' && e.getCoalescedEvents().length)
            ? e.getCoalescedEvents()
            : [e];
          for (const ev of events) {
            this.handlePointerAction(ev);
          }
        }
      }
    };

    const handlePointerUp = (e) => {
      if (!this.state.isMouseDown) return;

      const freehandRadius = 2.2;

      if (!this.state.showGridlines && this.state.currentTool === 'pencil' && this.strokePoints.length >= 2) {
        const len = this.strokePoints.length;
        const p1 = this.strokePoints[len - 2];
        const p2 = this.strokePoints[len - 1];
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        DrawingTools.drawSmoothSegment(mid, p2, this.state.currentColor, this.state, freehandRadius);
      }

      if (this.state.currentBehavior !== 'wave' && this.state.currentTool === 'line' && this.state.lineStart) {
        const coords = this.getGridCoords(e) || this.state.lineEnd;
        if (coords) {
          const radius = this.state.showGridlines ? 0 : freehandRadius;
          DrawingTools.drawLine(
            this.state.lineStart.x,
            this.state.lineStart.y,
            coords.x,
            coords.y,
            this.state.currentColor,
            this.state,
            radius
          );
          this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled);
        }
        this.state.lineStart = null;
        this.state.lineEnd = null;
      }

      this.state.isMouseDown = false;
      this.state.lastDrawCoord = null;
      this.strokePoints = [];
      this.state.saveToStorage();
    };

    ['canvas-studio', 'canvas-gbc', 'canvas-tv', 'canvas-lenovo', 'canvas-psp'].forEach(id => {
      const cvs = document.getElementById(id);
      if (cvs) {
        cvs.addEventListener('pointerdown', handlePointerDown);
        cvs.addEventListener('pointermove', handlePointerMove);
        cvs.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
        cvs.addEventListener('touchmove', (e) => { e.preventDefault(); handlePointerMove(e); }, { passive: false });
      }
    });

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
  }

  getGridCoords(e) {
    if (!this.canvas) return null;
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    if (clientX === undefined || clientY === undefined) return null;

    const fx = ((clientX - rect.left) / rect.width) * this.state.gridSize;
    const fy = ((clientY - rect.top) / rect.height) * this.state.gridSize;
    const x = Math.floor(fx);
    const y = Math.floor(fy);

    if (x >= 0 && x < this.state.gridSize && y >= 0 && y < this.state.gridSize) {
      return { x, y, fx, fy };
    }
    return null;
  }

  handlePointerAction(e) {
    if (this.state.isReplaying) return;
    const coords = this.getGridCoords(e);
    if (!coords) {
      this.state.lastDrawCoord = null;
      return;
    }

    const { x, y, fx, fy } = coords;
    const isFreehand = !this.state.showGridlines;
    const freehandRadius = 2.2;
    const prev = this.state.lastDrawCoord || coords;

    if (this.state.currentBehavior === 'wave') {
      PhysicsEngine.triggerEnergyWave(x, y, this.state);
      this.synth.playSound('wave', this.state.activeTheme, this.state.audioEnabled);
      this.state.isMouseDown = false;
      return;
    }

    if (this.state.currentTool === 'pencil') {
      if (isFreehand) {
        const pts = this.strokePoints;
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(fx - last.x, fy - last.y) >= 0.75) {
          pts.push({ x: fx, y: fy });
          if (pts.length === 1) {
            DrawingTools.stampNib(x, y, this.state.currentColor, freehandRadius, this.state);
          } else if (pts.length === 2) {
            const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
            DrawingTools.drawSmoothSegment(pts[0], mid, this.state.currentColor, this.state, freehandRadius);
          } else {
            const p0 = pts[pts.length - 3];
            const p1 = pts[pts.length - 2];
            const p2 = pts[pts.length - 1];
            const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
            const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            DrawingTools.drawQuadraticCurve(mid1, p1, mid2, this.state.currentColor, this.state, freehandRadius);
          }
        }
      } else {
        DrawingTools.drawLine(prev.x, prev.y, x, y, this.state.currentColor, this.state, 0);
      }

      this.state.lastDrawCoord = coords;
      const now = performance.now();
      if (now - this.lastPaintSoundTime > 35) {
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled);
        this.lastPaintSoundTime = now;
      }
    } else if (this.state.currentTool === 'eraser') {
      const radius = isFreehand ? 4 : 0;
      DrawingTools.drawLine(prev.x, prev.y, x, y, null, this.state, radius);
      this.state.lastDrawCoord = coords;
      const now = performance.now();
      if (now - this.lastPaintSoundTime > 35) {
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 150);
        this.lastPaintSoundTime = now;
      }
    } else if (this.state.currentTool === 'bucket') {
      DrawingTools.floodFill(x, y, this.state.currentColor, this.state);
      this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 380);
      this.state.isMouseDown = false;
      this.state.saveToStorage();
    } else if (this.state.currentTool === 'picker') {
      const picked = this.state.grid[y][x];
      if (picked) this.setColor(picked);
      this.state.isMouseDown = false;
    }
  }

  undo() {
    if (this.state.undo()) {
      this.updateGridResolutionUI();
      this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 180);
    }
  }

  clearCanvas() {
    this.state.clearGrid();
    this.synth.playSound('clear', this.state.activeTheme, this.state.audioEnabled);
  }

  gameLoop(timestamp) {
    const dt = (timestamp - this.state.lastFrameTime) / 1000;
    this.state.lastFrameTime = timestamp;
    this.state.frameCount++;

    if (this.state.frameCount % 10 === 0 && dt > 0) {
      this.state.fps = Math.round(1 / dt);
      document.getElementById('status-fps').innerText = `FPS: ${this.state.fps}`;
    }

    if (this.state.currentBehavior !== 'off' && !this.state.isReplaying) {
      PhysicsEngine.update(this.state, this.synth);
      if (timestamp - this.lastSandboxSave > 1500) {
        this.state.saveToStorage();
        this.lastSandboxSave = timestamp;
      }
    }

    this.renderCanvas();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  renderCanvas() {
    if (!this.ctx || !this.canvas) return;
    const cellSize = this.canvas.width / this.state.gridSize;
    const isFreehand = !this.state.showGridlines;

    if (!this.bufferCanvas) {
      this.bufferCanvas = document.createElement('canvas');
      this.bufferCtx = this.bufferCanvas.getContext('2d');
    }

    if (this.bufferCanvas.width !== this.state.gridSize) {
      this.bufferCanvas.width = this.state.gridSize;
      this.bufferCanvas.height = this.state.gridSize;
    }

    this.bufferCtx.clearRect(0, 0, this.state.gridSize, this.state.gridSize);

    for (let y = 0; y < this.state.gridSize; y++) {
      for (let x = 0; x < this.state.gridSize; x++) {
        const color = this.state.grid[y][x];
        if (color) {
          this.bufferCtx.fillStyle = color;
          this.bufferCtx.fillRect(x, y, 1, 1);
        }
      }
    }

    this.canvas.style.imageRendering = isFreehand ? 'auto' : 'pixelated';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.imageSmoothingEnabled = isFreehand;
    this.ctx.drawImage(this.bufferCanvas, 0, 0, this.canvas.width, this.canvas.height);

    if (this.state.currentBehavior !== 'wave' && this.state.currentTool === 'line' && this.state.lineStart && this.state.lineEnd) {
      this.ctx.strokeStyle = this.state.currentColor;
      this.ctx.lineWidth = this.state.showGridlines ? Math.max(1, cellSize * 0.8) : Math.max(2, cellSize * 4.4);
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo((this.state.lineStart.x + 0.5) * cellSize, (this.state.lineStart.y + 0.5) * cellSize);
      this.ctx.lineTo((this.state.lineEnd.x + 0.5) * cellSize, (this.state.lineEnd.y + 0.5) * cellSize);
      this.ctx.stroke();
    }

    if (this.state.showGridlines) {
      this.ctx.strokeStyle = this.state.activeTheme === 'day'
        ? 'rgba(28, 25, 23, 0.1)'
        : 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 1;

      for (let i = 0; i <= this.state.gridSize; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(i * cellSize, 0);
        this.ctx.lineTo(i * cellSize, this.canvas.height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, i * cellSize);
        this.ctx.lineTo(this.canvas.width, i * cellSize);
        this.ctx.stroke();
      }
    }

    const stats = Exporter.calculateStats(this.state);
    document.getElementById('status-pixels').innerText = `Active Pixels: ${stats.activePixels}`;
    document.getElementById('status-entropy').innerText = `Entropy: ${stats.entropy.toFixed(2)} bits`;
  }

  startReplay() {
    if (this.state.actionLog.length === 0) return;
    this.state.isReplaying = true;
    document.getElementById('overlay-replay').classList.remove('hidden');

    this.state.grid = Array(this.state.gridSize).fill(null).map(() => Array(this.state.gridSize).fill(null));
    let index = 0;
    const stepStride = Math.max(1, Math.floor(this.state.actionLog.length / 450));
    this.synth.playSound('clear', this.state.activeTheme, this.state.audioEnabled);

    this.state.replayTimer = setInterval(() => {
      if (index >= this.state.actionLog.length) {
        this.stopReplay();
        return;
      }

      for (let s = 0; s < stepStride && index < this.state.actionLog.length; s++, index++) {
        const action = this.state.actionLog[index];
        if (this.state.grid[action.y]) {
          this.state.grid[action.y][action.x] = action.color;
        }
      }

      if (index % 3 === 0) {
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 280 + (index % 12) * 15);
      }
    }, 18);
  }

  stopReplay() {
    this.state.isReplaying = false;
    clearInterval(this.state.replayTimer);
    document.getElementById('overlay-replay').classList.add('hidden');
  }

  setTheme(themeKey) {
    this.state.hasCustomTheme = true;
    ThemeManager.applyTheme(themeKey, this.state);

    const paletteByTheme = {
      night: 'night',
      day: 'day',
      gbc: 'gbc',
      tv: 'arcade',
      lenovo: 'office',
      psp: 'psp'
    };
    this.loadPalettePreset(paletteByTheme[themeKey] || 'night', true, false);

    this.state.saveToStorage();
    setTimeout(() => this.setupActiveCanvas(), 50);
  }

  toggleFocusMode() {
    this.state.focusMode = !this.state.focusMode;
    const viewport = document.getElementById('hardware-viewport');
    const btnFocus = document.getElementById('btn-focus-toggle');
    const iconFocus = document.getElementById('icon-focus');

    if (this.state.focusMode) {
      viewport.classList.add('focus-mode');
      if (btnFocus) btnFocus.title = 'Switch to Hardware View';
      if (iconFocus) iconFocus.className = 'fa-solid fa-compress text-amber-500';
    } else {
      viewport.classList.remove('focus-mode');
      if (btnFocus) btnFocus.title = 'Switch to Focus View';
      if (iconFocus) iconFocus.className = 'fa-solid fa-expand text-amber-500';
    }
    setTimeout(() => this.resizeCanvas(), 50);
  }

  setTool(tool) {
    this.state.currentTool = tool;
    if (this.state.currentBehavior === 'wave') {
      this.setBehavior('off');
    }
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.className = 'tool-btn p-2 rounded-lg studio-well flex flex-col items-center justify-center space-y-1 transition';
    });
    const active = document.getElementById(`tool-${tool}`);
    if (active) {
      active.className = 'tool-btn p-2 rounded-lg studio-chip-active flex flex-col items-center justify-center space-y-1 transition';
    }
    const cursor = this.toolCursors[tool] || this.toolCursors.pencil;
    document.querySelectorAll('canvas').forEach(cvs => {
      cvs.style.cursor = cursor;
    });
  }

  setMobileTab(tab) {
    this.mobileTab = tab;

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.className = isActive
        ? 'mobile-tab-btn flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium studio-chip-active transition flex items-center justify-center space-x-1.5'
        : 'mobile-tab-btn flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium opacity-70 hover:opacity-100 transition flex items-center justify-center space-x-1.5';
    });

    document.querySelectorAll('[data-sidebar-section]').forEach(section => {
      const isMatch = section.dataset.sidebarSection === tab;
      section.classList.toggle('hidden', !isMatch);
      section.classList.add('md:block');
    });

    this.resizeCanvas();
  }

  setBehavior(behavior) {
    const nextBehavior = (behavior !== 'off' && this.state.currentBehavior === behavior)
      ? 'off'
      : behavior;

    this.state.currentBehavior = nextBehavior;

    document.querySelectorAll('.behavior-btn').forEach(btn => {
      btn.className = 'behavior-btn p-2 rounded-lg studio-well text-left transition flex items-center space-x-2';
    });

    if (nextBehavior !== 'off') {
      const active = document.getElementById(`behavior-${nextBehavior}`);
      if (active) {
        active.className = 'behavior-btn p-2 rounded-lg studio-chip-active text-left transition flex items-center space-x-2';
      }
    }
  }

  setSymmetry(mode, persist = true) {
    this.state.symmetryMode = mode;
    document.querySelectorAll('.sym-btn').forEach(btn => {
      btn.className = 'sym-btn py-1 rounded-md text-xs opacity-70 hover:opacity-100 transition';
    });
    const active = document.getElementById(`sym-${mode}`);
    if (active) {
      active.className = 'sym-btn py-1 rounded-md text-xs studio-chip-active transition';
    }
    if (persist) this.state.saveToStorage();
  }

  setColor(hex, persist = true) {
    this.state.currentColor = hex;
    document.getElementById('input-color-picker').value = hex;
    document.getElementById('label-hex-code').innerText = hex.toUpperCase();
    const mobileDot = document.getElementById('mobile-ink-dot');
    if (mobileDot) mobileDot.style.backgroundColor = hex;
    if (persist) this.state.saveToStorage();
  }

  loadPalettePreset(name, setDefaultColor = true, persist = true) {
    const resolvedName = PALETTES[name] ? name : 'night';
    const colors = PALETTES[resolvedName];
    this.state.activePalette = resolvedName;

    const container = document.getElementById('palette-swatches');
    container.innerHTML = '';

    const selectPreset = document.getElementById('select-preset-palette');
    if (selectPreset && selectPreset.value !== resolvedName) {
      selectPreset.value = resolvedName;
    }

    colors.forEach(hex => {
      const btn = document.createElement('button');
      btn.className = 'rounded palette-swatch hover:scale-110 transition shadow-sm';
      btn.style.backgroundColor = hex;
      btn.onclick = () => this.setColor(hex);
      container.appendChild(btn);
    });

    if (setDefaultColor) {
      this.setColor(colors[0], persist);
    } else if (persist) {
      this.state.saveToStorage();
    }
  }

  updateGridResolutionUI() {
    const isFreehand = !this.state.showGridlines;

    [16, 32, 48].forEach(s => {
      const btn = document.getElementById(`grid-size-${s}`);
      if (!btn) return;
      if (!isFreehand && s === this.state.gridSize) {
        btn.className = 'px-2 py-0.5 rounded text-xs studio-chip-active transition';
      } else {
        btn.className = 'px-2 py-0.5 rounded text-xs studio-well opacity-70 hover:opacity-100 transition';
      }
    });

    const gridBtn = document.getElementById('btn-toggle-gridlines');
    if (gridBtn) {
      gridBtn.innerText = isFreehand ? 'Off' : 'On';
    }
  }

  setGridSize(size) {
    this.state.lastGridResolution = size;
    this.state.showGridlines = true;
    this.state.resizeGrid(size);
    this.updateGridResolutionUI();
    this.resizeCanvas();
  }

  toggleGridlines() {
    this.state.showGridlines = !this.state.showGridlines;

    if (!this.state.showGridlines) {
      if ([16, 32, 48].includes(this.state.gridSize)) {
        this.state.lastGridResolution = this.state.gridSize;
      }
      this.state.resizeGrid(FREEHAND_RESOLUTION);
    } else {
      const targetGrid = this.state.lastGridResolution || 32;
      this.state.resizeGrid(targetGrid);
    }

    this.updateGridResolutionUI();
    this.resizeCanvas();
  }

  toggleCRT() {
    this.state.crtEnabled = !this.state.crtEnabled;
    const viewport = document.getElementById('hardware-viewport');
    if (this.state.crtEnabled) viewport.classList.add('crt-active');
    else viewport.classList.remove('crt-active');
    this.state.saveToStorage();
  }

  toggleAudio() {
    this.state.audioEnabled = !this.state.audioEnabled;
    const icon = document.getElementById('icon-audio');
    icon.className = this.state.audioEnabled ? 'fa-solid fa-volume-high text-emerald-500' : 'fa-solid fa-volume-xmark opacity-50';
    this.state.saveToStorage();
  }

  openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  openDevToolsModal() {
    const scaleSelect = document.getElementById('select-sprite-scale');
    if (scaleSelect) {
      const base = this.state.gridSize;
      const scales = [1, 4, 8, 16];
      Array.from(scaleSelect.options).forEach((opt, i) => {
        const mult = scales[i] || parseInt(opt.value, 10);
        opt.text = mult === 1 ? `1x (${base}px Native)` : `${mult}x (${base * mult}px)`;
      });
    }
    this.openModal('modal-devtools');
  }

  copyMatrixJSON() {
    Exporter.copyMatrixJSON(this.state.grid);
    const lbl = document.getElementById('label-copy-json');
    lbl.innerText = 'Copied!';
    setTimeout(() => lbl.innerText = 'Copy JSON', 2000);
  }

  downloadMatrixJSON() {
    Exporter.downloadMatrixJSON(this.state.grid);
  }

  downloadSpritePNG() {
    const scale = parseInt(document.getElementById('select-sprite-scale').value, 10) || 8;
    Exporter.downloadSpritePNG(this.state.grid, this.state.gridSize, scale);
  }

  openSouvenirModal() {
    const stats = Exporter.calculateStats(this.state);
    const housingTitle = THEME_TITLES[this.state.activeTheme] || 'Night';
    const themeStyle = SOUVENIR_THEMES[this.state.activeTheme] || SOUVENIR_THEMES.night;
    const modeLabel = this.state.showGridlines
      ? `${this.state.gridSize} x ${this.state.gridSize}`
      : `Freehand (${this.state.gridSize}x${this.state.gridSize})`;

    const cardContainer = document.getElementById('souvenir-card-container');
    if (cardContainer) {
      cardContainer.style.backgroundColor = themeStyle.cardBg;
      cardContainer.style.borderColor = themeStyle.border;
      cardContainer.style.color = themeStyle.text;
      cardContainer.style.fontFamily = themeStyle.bodyFont;
    }

    const headerBar = document.getElementById('souvenir-card-header');
    if (headerBar) {
      headerBar.style.borderColor = themeStyle.border;
    }

    const titleDot = document.getElementById('souvenir-title-dot');
    if (titleDot) {
      titleDot.style.backgroundColor = themeStyle.accent;
    }

    const cardTitle = document.getElementById('souvenir-card-title');
    if (cardTitle) {
      const displayHousing = themeStyle.headerUppercase ? housingTitle.toUpperCase() : housingTitle;
      const baseTitle = themeStyle.headerUppercase ? 'AN ARTISTIC BIT' : 'An Artistic Bit';
      cardTitle.innerText = `${baseTitle} • ${displayHousing}`;
      cardTitle.style.fontFamily = themeStyle.headerFont;
      cardTitle.style.letterSpacing = themeStyle.headerLetterSpacing;
      cardTitle.className = themeStyle.modalTitleClass;
    }

    const timestampEl = document.getElementById('souvenir-timestamp');
    if (timestampEl) {
      timestampEl.innerText = new Date().toISOString().split('T')[0].replace(/-/g, '.');
      timestampEl.style.color = themeStyle.muted;
      timestampEl.className = `${themeStyle.modalMetaClass} shrink-0`;
    }

    const previewBox = document.getElementById('souvenir-preview-box');
    if (previewBox) {
      previewBox.style.backgroundColor = themeStyle.screenBg;
      previewBox.style.borderColor = themeStyle.screenBorder;
    }

    document.querySelectorAll('#souvenir-card-container .souvenir-stat-box').forEach(box => {
      box.style.backgroundColor = themeStyle.wellBg;
      box.style.borderColor = themeStyle.border;
    });

    document.querySelectorAll('#souvenir-card-container .souvenir-stat-label').forEach(lbl => {
      lbl.style.color = themeStyle.muted;
      lbl.className = `souvenir-stat-label ${themeStyle.modalLabelClass}`;
    });

    document.querySelectorAll('#souvenir-card-container .souvenir-stat-value').forEach(val => {
      val.style.color = themeStyle.text;
      val.className = `souvenir-stat-value ${themeStyle.modalValueClass}`;
    });

    document.getElementById('souvenir-preview-img').src = this.canvas.toDataURL();
    document.getElementById('souvenir-pixels').innerText = stats.activePixels;
    document.getElementById('souvenir-entropy').innerText = `${stats.entropy.toFixed(2)} bits`;
    document.getElementById('souvenir-res').innerText = modeLabel;
    document.getElementById('souvenir-dominant-hex').innerText = stats.dominantColor.toUpperCase();
    document.getElementById('souvenir-dominant-swatch').style.backgroundColor = stats.dominantColor;

    this.openModal('modal-souvenir');
  }

  downloadSouvenirCard() {
    const stats = Exporter.calculateStats(this.state);
    const housingTitle = THEME_TITLES[this.state.activeTheme] || 'Night';
    Exporter.renderSouvenirCard(
      this.canvas,
      housingTitle,
      stats.activePixels,
      stats.entropy,
      stats.dominantColor,
      this.state.gridSize,
      this.state.showGridlines,
      this.state.activeTheme
    );
  }
}

// Global Binding
window.app = null;
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AnArtisticBitApp();
});

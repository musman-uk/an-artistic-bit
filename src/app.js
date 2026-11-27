import { AppState, FREEHAND_RESOLUTION } from './state.js';
import { ThemeManager, PALETTES, THEME_TITLES } from './themes.js';
import { SynthAudio } from './synth.js';
import { DrawingTools } from './tools.js';
import { PhysicsEngine } from './physics.js';
import { Exporter } from './exporter.js';

class AnArtisticBitApp {
  constructor() {
    this.state = new AppState();
    this.synth = new SynthAudio();
    this.lastSandboxSave = 0;

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

    this.mobileTab = 'draw';
    this.setMobileTab('draw');

    requestAnimationFrame((t) => this.gameLoop(t));
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
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));

    if (size > 0) {
      this.canvas.width = size;
      this.canvas.height = size;
      this.renderCanvas();
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());

    const handlePointerDown = (e) => {
      this.state.isMouseDown = true;
      this.state.lastDrawCoord = null;
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
          this.handlePointerAction(e);
        }
      }
    };

    const handlePointerUp = (e) => {
      if (!this.state.isMouseDown) return;

      if (this.state.currentBehavior !== 'wave' && this.state.currentTool === 'line' && this.state.lineStart) {
        const coords = this.getGridCoords(e) || this.state.lineEnd;
        if (coords) {
          const radius = this.state.showGridlines ? 0 : 1;
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

    const x = Math.floor(((clientX - rect.left) / rect.width) * this.state.gridSize);
    const y = Math.floor(((clientY - rect.top) / rect.height) * this.state.gridSize);

    if (x >= 0 && x < this.state.gridSize && y >= 0 && y < this.state.gridSize) {
      return { x, y };
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

    const { x, y } = coords;
    const isFreehand = !this.state.showGridlines;
    const prev = this.state.lastDrawCoord || coords;

    if (this.state.currentBehavior === 'wave') {
      PhysicsEngine.triggerEnergyWave(x, y, this.state);
      this.synth.playSound('wave', this.state.activeTheme, this.state.audioEnabled);
      this.state.isMouseDown = false;
      return;
    }

    if (this.state.currentTool === 'pencil') {
      const radius = isFreehand ? 1 : 0;
      DrawingTools.drawLine(prev.x, prev.y, x, y, this.state.currentColor, this.state, radius);
      this.state.lastDrawCoord = coords;
      this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled);
    } else if (this.state.currentTool === 'eraser') {
      const radius = isFreehand ? 4 : 0;
      DrawingTools.drawLine(prev.x, prev.y, x, y, null, this.state, radius);
      this.state.lastDrawCoord = coords;
      this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 150);
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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.state.gridSize; y++) {
      for (let x = 0; x < this.state.gridSize; x++) {
        const color = this.state.grid[y][x];
        if (color) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x * cellSize, y * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
        }
      }
    }

    if (this.state.currentBehavior !== 'wave' && this.state.currentTool === 'line' && this.state.lineStart && this.state.lineEnd) {
      this.ctx.strokeStyle = this.state.currentColor;
      this.ctx.lineWidth = this.state.showGridlines ? Math.max(1, cellSize * 0.8) : 2.5;
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
    const modeLabel = this.state.showGridlines
      ? `${this.state.gridSize} x ${this.state.gridSize}`
      : `Freehand (${this.state.gridSize}x${this.state.gridSize})`;

    const previewBox = document.getElementById('souvenir-preview-box');
    if (previewBox) {
      previewBox.className = this.state.activeTheme === 'day'
        ? 'p-3 bg-[#faf8f5] border border-slate-700 rounded-lg shadow-inner'
        : 'p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-inner';
    }

    document.getElementById('souvenir-preview-img').src = this.canvas.toDataURL();
    document.getElementById('souvenir-housing').innerText = housingTitle;
    document.getElementById('souvenir-card-title').innerText = `AN ARTISTIC BIT • ${housingTitle.toUpperCase()}`;
    document.getElementById('souvenir-pixels').innerText = stats.activePixels;
    document.getElementById('souvenir-entropy').innerText = `${stats.entropy.toFixed(2)} bits`;
    document.getElementById('souvenir-res').innerText = modeLabel;
    document.getElementById('souvenir-dominant-hex').innerText = stats.dominantColor.toUpperCase();
    document.getElementById('souvenir-dominant-swatch').style.backgroundColor = stats.dominantColor;
    document.getElementById('souvenir-timestamp').innerText = new Date().toISOString().split('T')[0].replace(/-/g, '.');

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

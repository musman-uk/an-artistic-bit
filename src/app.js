import { AppState } from './state.js';
import { ThemeManager, PALETTES, THEME_TITLES } from './themes.js';
import { SynthAudio } from './synth.js';
import { DrawingTools } from './tools.js';
import { PhysicsEngine } from './physics.js';
import { Exporter } from './exporter.js';

class BytesOnCanvasApp {
  constructor() {
    this.state = new AppState();
    this.synth = new SynthAudio();

    this.state.initGrid();
    this.setupActiveCanvas();
    this.setupEventListeners();
    this.loadPalettePreset('midnight');

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setupActiveCanvas() {
    const canvasIds = {
      midnight: 'canvas-midnight',
      gbc: 'canvas-gbc',
      tv: 'canvas-tv',
      workstation: 'canvas-workstation'
    };

    const targetId = canvasIds[this.state.activeTheme] || 'canvas-midnight';
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
      this.state.saveUndoState();

      const coords = this.getGridCoords(e);
      if (coords && this.state.currentMode === 'studio' && this.state.currentTool === 'line') {
        this.state.lineStart = coords;
      } else {
        this.handlePointerAction(e);
      }
    };

    const handlePointerMove = (e) => {
      const coords = this.getGridCoords(e);
      if (coords) {
        document.getElementById('status-coords').innerText = `X: ${coords.x}, Y: ${coords.y}`;
      }
      if (this.state.isMouseDown) {
        if (this.state.currentMode === 'studio' && this.state.currentTool === 'line') {
          this.state.lineEnd = coords;
        } else {
          this.handlePointerAction(e);
        }
      }
    };

    const handlePointerUp = (e) => {
      if (this.state.isMouseDown && this.state.currentMode === 'studio' && this.state.currentTool === 'line' && this.state.lineStart) {
        const coords = this.getGridCoords(e) || this.state.lineEnd;
        if (coords) {
          DrawingTools.drawLine(this.state.lineStart.x, this.state.lineStart.y, coords.x, coords.y, this.state.currentColor, this.state);
          this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled);
        }
        this.state.lineStart = null;
        this.state.lineEnd = null;
      }
      this.state.isMouseDown = false;
    };

    ['canvas-midnight', 'canvas-gbc', 'canvas-tv', 'canvas-workstation'].forEach(id => {
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
    if (!coords) return;

    const { x, y } = coords;

    if (this.state.currentMode === 'studio') {
      if (this.state.currentTool === 'pencil') {
        DrawingTools.applyPixelWithSymmetry(x, y, this.state.currentColor, this.state);
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled);
      } else if (this.state.currentTool === 'eraser') {
        DrawingTools.applyPixelWithSymmetry(x, y, null, this.state);
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 150);
      } else if (this.state.currentTool === 'bucket') {
        DrawingTools.floodFill(x, y, this.state.currentColor, this.state);
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 380);
        this.state.isMouseDown = false;
      } else if (this.state.currentTool === 'picker') {
        const picked = this.state.grid[y][x];
        if (picked) this.setColor(picked);
        this.state.isMouseDown = false;
      }
    } else if (this.state.currentMode === 'sandbox') {
      if (['sand', 'glitch', 'bleed'].includes(this.state.currentBehavior)) {
        DrawingTools.applyPixelWithSymmetry(x, y, this.state.currentColor, this.state);
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled);
      } else if (this.state.currentBehavior === 'wave') {
        PhysicsEngine.triggerEnergyWave(x, y, this.state);
        this.synth.playSound('wave', this.state.activeTheme, this.state.audioEnabled);
        this.state.isMouseDown = false;
      }
    }
  }

  undo() {
    if (this.state.undo()) {
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

    if (this.state.frameCount % 10 === 0) {
      this.state.fps = Math.round(1 / dt);
      document.getElementById('status-fps').innerText = `FPS: ${this.state.fps}`;
    }

    if (this.state.currentMode === 'sandbox' && !this.state.isReplaying) {
      PhysicsEngine.update(this.state, this.synth);
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
          this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    if (this.state.currentMode === 'studio' && this.state.currentTool === 'line' && this.state.lineStart && this.state.lineEnd) {
      this.ctx.strokeStyle = this.state.currentColor;
      this.ctx.lineWidth = Math.max(1, cellSize * 0.8);
      this.ctx.beginPath();
      this.ctx.moveTo((this.state.lineStart.x + 0.5) * cellSize, (this.state.lineStart.y + 0.5) * cellSize);
      this.ctx.lineTo((this.state.lineEnd.x + 0.5) * cellSize, (this.state.lineEnd.y + 0.5) * cellSize);
      this.ctx.stroke();
    }

    if (this.state.showGridlines) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
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
    this.synth.playSound('clear', this.state.activeTheme, this.state.audioEnabled);

    this.state.replayTimer = setInterval(() => {
      if (index >= this.state.actionLog.length) {
        this.stopReplay();
        return;
      }

      const action = this.state.actionLog[index];
      this.state.grid[action.y][action.x] = action.color;
      if (index % 3 === 0) {
        this.synth.playSound('paint', this.state.activeTheme, this.state.audioEnabled, 280 + (index % 12) * 15);
      }

      index++;
    }, 18);
  }

  stopReplay() {
    this.state.isReplaying = false;
    clearInterval(this.state.replayTimer);
    document.getElementById('overlay-replay').classList.add('hidden');
  }

  setTheme(themeKey) {
    ThemeManager.applyTheme(themeKey, this.state);

    if (themeKey === 'midnight') this.loadPalettePreset('midnight');
    else if (themeKey === 'gbc') this.loadPalettePreset('gbc');
    else if (themeKey === 'tv') this.loadPalettePreset('arcade');
    else if (themeKey === 'workstation') this.loadPalettePreset('monochrome');

    setTimeout(() => this.setupActiveCanvas(), 50);
  }

  toggleFocusMode() {
    this.state.focusMode = !this.state.focusMode;
    const viewport = document.getElementById('hardware-viewport');
    const btnLabel = document.getElementById('label-focus');

    if (this.state.focusMode) {
      viewport.classList.add('focus-mode');
      btnLabel.innerText = "Hardware View";
    } else {
      viewport.classList.remove('focus-mode');
      btnLabel.innerText = "Focus View";
    }
    setTimeout(() => this.resizeCanvas(), 50);
  }

  setMode(mode) {
    this.state.currentMode = mode;
    const btnStudio = document.getElementById('btn-mode-studio');
    const btnSandbox = document.getElementById('btn-mode-sandbox');
    const panelStudio = document.getElementById('panel-studio-tools');
    const panelSandbox = document.getElementById('panel-sandbox-tools');

    if (mode === 'studio') {
      btnStudio.className = "px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 sm:space-x-2 theme-btn-accent";
      btnSandbox.className = "px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-medium opacity-60 hover:opacity-100 transition flex items-center space-x-1.5 sm:space-x-2";
      panelStudio.classList.remove('hidden');
      panelSandbox.classList.add('hidden');
    } else {
      btnSandbox.className = "px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 sm:space-x-2 theme-btn-accent";
      btnStudio.className = "px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-medium opacity-60 hover:opacity-100 transition flex items-center space-x-1.5 sm:space-x-2";
      panelSandbox.classList.remove('hidden');
      panelStudio.classList.add('hidden');
    }
  }

  setTool(tool) {
    this.state.currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.className = "tool-btn p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center space-y-1 transition";
    });
    const active = document.getElementById(`tool-${tool}`);
    if (active) active.className = "tool-btn p-2 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center space-y-1 transition shadow-lg";
  }

  setBehavior(behavior) {
    this.state.currentBehavior = behavior;
    document.querySelectorAll('.behavior-btn').forEach(btn => {
      btn.classList.remove('border-lime-500/50', 'bg-white/10');
      btn.classList.add('border-white/10', 'bg-black/40');
    });
    const active = document.getElementById(`behavior-${behavior}`);
    if (active) {
      active.classList.remove('border-white/10', 'bg-black/40');
      active.classList.add('border-lime-500/50', 'bg-white/10');
    }
  }

  setSymmetry(mode) {
    this.state.symmetryMode = mode;
    document.querySelectorAll('.sym-btn').forEach(btn => {
      btn.className = "sym-btn py-1 rounded-lg text-xs opacity-70 hover:opacity-100";
    });
    document.getElementById(`sym-${mode}`).className = "sym-btn py-1 rounded-lg text-xs bg-indigo-600 text-white";
  }

  setColor(hex) {
    this.state.currentColor = hex;
    document.getElementById('input-color-picker').value = hex;
    document.getElementById('label-hex-code').innerText = hex.toUpperCase();
  }

  loadPalettePreset(name) {
    const colors = PALETTES[name] || PALETTES.midnight;
    const container = document.getElementById('palette-swatches');
    container.innerHTML = '';

    colors.forEach(hex => {
      const btn = document.createElement('button');
      btn.className = 'w-6 h-6 rounded-md border border-white/20 hover:scale-110 transition shadow-sm';
      btn.style.backgroundColor = hex;
      btn.onclick = () => this.setColor(hex);
      container.appendChild(btn);
    });

    this.setColor(colors[0]);
  }

  setGridSize(size) {
    this.state.gridSize = size;
    [16, 32, 48].forEach(s => {
      const btn = document.getElementById(`grid-size-${s}`);
      if (btn) btn.className = s === size ? "px-2 py-0.5 rounded text-xs bg-indigo-600 text-white" : "px-2 py-0.5 rounded text-xs bg-black/40 text-slate-400";
    });

    this.state.initGrid();
    this.resizeCanvas();
  }

  toggleGridlines() {
    this.state.showGridlines = !this.state.showGridlines;
    document.getElementById('btn-toggle-gridlines').innerText = this.state.showGridlines ? "ON" : "OFF";
  }

  toggleCRT() {
    this.state.crtEnabled = !this.state.crtEnabled;
    const viewport = document.getElementById('hardware-viewport');
    if (this.state.crtEnabled) viewport.classList.add('crt-active');
    else viewport.classList.remove('crt-active');
  }

  toggleAudio() {
    this.state.audioEnabled = !this.state.audioEnabled;
    const icon = document.getElementById('icon-audio');
    icon.className = this.state.audioEnabled ? "fa-solid fa-volume-high text-lime-400" : "fa-solid fa-volume-xmark opacity-50";
  }

  setSimSpeed(val) {
    this.state.simSpeed = parseFloat(val);
    document.getElementById('label-sim-speed').innerText = `${this.state.simSpeed.toFixed(1)}x`;
  }

  openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  copyMatrixJSON() {
    Exporter.copyMatrixJSON(this.state.grid);
    const lbl = document.getElementById('label-copy-json');
    lbl.innerText = "Copied!";
    setTimeout(() => lbl.innerText = "Copy JSON", 2000);
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
    const housingTitle = THEME_TITLES[this.state.activeTheme] || "Midnight Studio";

    document.getElementById('souvenir-preview-img').src = this.canvas.toDataURL();
    document.getElementById('souvenir-housing').innerText = housingTitle;
    document.getElementById('souvenir-card-title').innerText = `BYTES ON CANVAS • ${this.state.activeTheme.toUpperCase()}`;
    document.getElementById('souvenir-pixels').innerText = stats.activePixels;
    document.getElementById('souvenir-entropy').innerText = `${stats.entropy.toFixed(2)} bits`;
    document.getElementById('souvenir-res').innerText = `${this.state.gridSize} x ${this.state.gridSize}`;
    document.getElementById('souvenir-dominant-hex').innerText = stats.dominantColor.toUpperCase();
    document.getElementById('souvenir-dominant-swatch').style.backgroundColor = stats.dominantColor;
    document.getElementById('souvenir-timestamp').innerText = new Date().toISOString().split('T')[0].replace(/-/g, '.');

    this.openModal('modal-souvenir');
  }

  downloadSouvenirCard() {
    const stats = Exporter.calculateStats(this.state);
    const housingTitle = THEME_TITLES[this.state.activeTheme] || "Midnight Studio";
    Exporter.renderSouvenirCard(this.canvas, housingTitle, stats.activePixels, stats.entropy, this.state.gridSize);
  }
}

// Global Binding
window.app = null;
window.addEventListener('DOMContentLoaded', () => {
  window.app = new BytesOnCanvasApp();
});

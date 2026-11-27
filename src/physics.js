export class PhysicsEngine {
  static update(state, synth) {
    if (state.currentBehavior === 'off' || state.currentBehavior === 'wave') return;
    if (Math.random() > state.simSpeed * 0.8) return;

    if (state.currentBehavior === 'sand') {
      this.updateSand(state, synth);
    } else if (state.currentBehavior === 'glitch') {
      this.updateGlitch(state);
    } else if (state.currentBehavior === 'bleed') {
      this.updateBleed(state);
    }
  }

  static updateSand(state, synth) {
    let moved = false;

    // Bottom-up scan to prevent double-falling in a single tick
    for (let y = state.gridSize - 2; y >= 0; y--) {
      // Alternate scan direction per row to eliminate right-side piling bias
      const xIndices = Array.from({ length: state.gridSize }, (_, i) => i);
      if (Math.random() < 0.5) xIndices.reverse();

      for (const x of xIndices) {
        const current = state.grid[y][x];
        if (!current) continue;

        // 1. Direct fall
        if (!state.grid[y + 1][x]) {
          state.grid[y + 1][x] = current;
          state.grid[y][x] = null;
          moved = true;
        } else {
          // 2. Diagonal tumble
          const leftEmpty = x > 0 && !state.grid[y + 1][x - 1];
          const rightEmpty = x < state.gridSize - 1 && !state.grid[y + 1][x + 1];

          if (leftEmpty && rightEmpty) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            state.grid[y + 1][x + dir] = current;
            state.grid[y][x] = null;
            moved = true;
          } else if (leftEmpty) {
            state.grid[y + 1][x - 1] = current;
            state.grid[y][x] = null;
            moved = true;
          } else if (rightEmpty) {
            state.grid[y + 1][x + 1] = current;
            state.grid[y][x] = null;
            moved = true;
          }
        }
      }
    }

    if (moved && Math.random() < 0.15) {
      synth.playSound('sand', state.activeTheme, state.audioEnabled);
    }
  }

  static updateGlitch(state) {
    const count = Math.max(2, Math.floor((state.gridSize * state.gridSize) / 220));
    for (let i = 0; i < count; i++) {
      const rx = Math.floor(Math.random() * state.gridSize);
      const ry = Math.floor(Math.random() * state.gridSize);
      if (state.grid[ry][rx]) {
        state.grid[ry][rx] = PhysicsEngine.shiftColorHue(state.grid[ry][rx], 14);
      }
    }
  }

  static updateBleed(state) {
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0]
    ];
    const attempts = Math.max(2, Math.floor((state.gridSize * state.gridSize) / 360));

    for (let i = 0; i < attempts; i++) {
      const rx = Math.floor(Math.random() * state.gridSize);
      const ry = Math.floor(Math.random() * state.gridSize);
      const color = state.grid[ry][rx];
      if (!color) continue;

      const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
      const nx = rx + dx;
      const ny = ry + dy;

      if (nx >= 0 && nx < state.gridSize && ny >= 0 && ny < state.gridSize && !state.grid[ny][nx]) {
        state.grid[ny][nx] = color;
      }
    }
  }

  static triggerEnergyWave(centerX, centerY, state) {
    const waveColor = state.currentColor;
    const step = Math.max(1.5, state.gridSize / 22);
    const bandWidth = Math.max(0.8, state.gridSize / 40);
    let radius = step;

    if (!state.activeTimers) state.activeTimers = [];

    const interval = setInterval(() => {
      if (radius > state.gridSize * 1.5) {
        clearInterval(interval);
        state.activeTimers = state.activeTimers.filter(t => t !== interval);
        return;
      }

      for (let y = 0; y < state.gridSize; y++) {
        for (let x = 0; x < state.gridSize; x++) {
          const dist = Math.hypot(x - centerX, y - centerY);
          if (Math.abs(dist - radius) < bandWidth) {
            state.grid[y][x] = waveColor;
          }
        }
      }
      radius += step;
    }, 45);

    state.activeTimers.push(interval);
  }

  static shiftColorHue(hex, degree) {
    if (!hex || !hex.startsWith('#')) return hex;

    let fullHex = hex;
    if (hex.length === 4) {
      fullHex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }

    let r = parseInt(fullHex.slice(1, 3), 16) || 0;
    let g = parseInt(fullHex.slice(3, 5), 16) || 0;
    let b = parseInt(fullHex.slice(5, 7), 16) || 0;

    r = (r + degree) % 256;
    g = (g + Math.floor(degree / 2)) % 256;
    b = (b + degree * 2) % 256;

    const toHex = (val) => Math.floor(val).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

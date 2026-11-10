export class PhysicsEngine {
  static update(state, synth) {
    if (Math.random() > state.simSpeed * 0.8) return;

    if (state.currentBehavior === 'sand') {
      let moved = false;
      for (let y = state.gridSize - 2; y >= 0; y--) {
        for (let x = 0; x < state.gridSize; x++) {
          const current = state.grid[y][x];
          if (current) {
            if (!state.grid[y + 1][x]) {
              state.grid[y + 1][x] = current;
              state.grid[y][x] = null;
              moved = true;
            } else {
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
      }
      if (moved && Math.random() < 0.15) {
        synth.playSound('sand', state.activeTheme, state.audioEnabled);
      }
    } else if (state.currentBehavior === 'glitch') {
      for (let i = 0; i < 2; i++) {
        const rx = Math.floor(Math.random() * state.gridSize);
        const ry = Math.floor(Math.random() * state.gridSize);
        if (state.grid[ry][rx]) {
          state.grid[ry][rx] = PhysicsEngine.shiftColorHue(state.grid[ry][rx], 14);
        }
      }
    } else if (state.currentBehavior === 'bleed') {
      const rx = Math.floor(Math.random() * (state.gridSize - 2)) + 1;
      const ry = Math.floor(Math.random() * (state.gridSize - 2)) + 1;
      if (state.grid[ry][rx] && !state.grid[ry + 1][rx]) {
        state.grid[ry + 1][rx] = state.grid[ry][rx];
      }
    }
  }

  static triggerEnergyWave(centerX, centerY, state) {
    const waveColor = state.currentColor;
    let radius = 1;

    const interval = setInterval(() => {
      if (radius > state.gridSize) {
        clearInterval(interval);
        return;
      }

      for (let y = 0; y < state.gridSize; y++) {
        for (let x = 0; x < state.gridSize; x++) {
          const dist = Math.hypot(x - centerX, y - centerY);
          if (Math.abs(dist - radius) < 0.8) {
            state.grid[y][x] = waveColor;
          }
        }
      }
      radius += 1.5;
    }, 45);
  }

  static shiftColorHue(hex, degree) {
    if (!hex || !hex.startsWith('#')) return hex;
    let r = parseInt(hex.slice(1, 3), 16) || 0;
    let g = parseInt(hex.slice(3, 5), 16) || 0;
    let b = parseInt(hex.slice(5, 7), 16) || 0;

    r = (r + degree) % 255;
    g = (g + degree / 2) % 255;
    b = (b + degree * 2) % 255;

    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }
}

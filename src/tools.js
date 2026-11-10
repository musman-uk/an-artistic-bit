export class DrawingTools {
  static applyPixelWithSymmetry(x, y, color, state) {
    const targets = [{ x, y }];

    if (state.symmetryMode === 'x' || state.symmetryMode === 'quad') {
      targets.push({ x: state.gridSize - 1 - x, y });
    }
    if (state.symmetryMode === 'y' || state.symmetryMode === 'quad') {
      targets.push({ x, y: state.gridSize - 1 - y });
    }
    if (state.symmetryMode === 'quad') {
      targets.push({ x: state.gridSize - 1 - x, y: state.gridSize - 1 - y });
    }

    targets.forEach(pt => state.setPixel(pt.x, pt.y, color));
  }

  static drawLine(x0, y0, x1, y1, color, state) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      DrawingTools.applyPixelWithSymmetry(x0, y0, color, state);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  static floodFill(startX, startY, targetColor, state) {
    const startColor = state.grid[startY][startX];
    if (startColor === targetColor) return;

    const queue = [{ x: startX, y: startY }];
    const visited = new Set();

    while (queue.length > 0) {
      const { x, y } = queue.pop();
      const key = `${x},${y}`;

      if (x < 0 || x >= state.gridSize || y < 0 || y >= state.gridSize) continue;
      if (visited.has(key)) continue;
      visited.add(key);

      if (state.grid[y][x] === startColor) {
        state.setPixel(x, y, targetColor);
        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }
  }
}

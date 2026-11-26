export class DrawingTools {
  static applyPixelWithSymmetry(x, y, color, state) {
    const rawTargets = [{ x, y }];

    if (state.symmetryMode === 'x' || state.symmetryMode === 'quad') {
      rawTargets.push({ x: state.gridSize - 1 - x, y });
    }
    if (state.symmetryMode === 'y' || state.symmetryMode === 'quad') {
      rawTargets.push({ x, y: state.gridSize - 1 - y });
    }
    if (state.symmetryMode === 'quad') {
      rawTargets.push({ x: state.gridSize - 1 - x, y: state.gridSize - 1 - y });
    }

    // Deduplicate target coordinates (prevents double-writing on symmetry center lines)
    const uniqueTargets = new Map();
    rawTargets.forEach(pt => {
      const key = `${pt.x},${pt.y}`;
      if (!uniqueTargets.has(key)) {
        uniqueTargets.set(key, pt);
      }
    });

    uniqueTargets.forEach(pt => state.setPixel(pt.x, pt.y, color));
  }

  static stampNib(cx, cy, color, radius, state) {
    if (radius <= 0) {
      DrawingTools.applyPixelWithSymmetry(cx, cy, color, state);
      return;
    }

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius + 0.5) {
          DrawingTools.applyPixelWithSymmetry(cx + dx, cy + dy, color, state);
        }
      }
    }
  }

  static drawLine(x0, y0, x1, y1, color, state, radius = 0) {
    let currX = x0;
    let currY = y0;
    const dx = Math.abs(x1 - currX);
    const dy = Math.abs(y1 - currY);
    const sx = (currX < x1) ? 1 : -1;
    const sy = (currY < y1) ? 1 : -1;
    let err = dx - dy;

    let maxSteps = state.gridSize * 3; // Infinite loop safety bound

    while (maxSteps > 0) {
      DrawingTools.stampNib(currX, currY, color, radius, state);
      if (currX === x1 && currY === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currY += sy;
      }
      maxSteps--;
    }
  }

  static floodFill(startX, startY, targetColor, state) {
    if (startX < 0 || startX >= state.gridSize || startY < 0 || startY >= state.gridSize) return;

    const startColor = state.grid[startY][startX];
    if (startColor === targetColor) return;

    // Index-pointer BFS queue for fast O(n) execution even in 256x256 freehand mode
    const queue = [{ x: startX, y: startY }];
    const visited = new Uint8Array(state.gridSize * state.gridSize);
    let head = 0;

    while (head < queue.length) {
      const { x, y } = queue[head++];

      if (x < 0 || x >= state.gridSize || y < 0 || y >= state.gridSize) continue;
      const flatIdx = y * state.gridSize + x;
      if (visited[flatIdx]) continue;
      visited[flatIdx] = 1;

      if (state.grid[y][x] === startColor) {
        DrawingTools.applyPixelWithSymmetry(x, y, targetColor, state);

        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }
  }
}

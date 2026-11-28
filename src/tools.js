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

    const bound = Math.ceil(radius);
    const rSq = radius * radius;
    for (let dy = -bound; dy <= bound; dy++) {
      for (let dx = -bound; dx <= bound; dx++) {
        if (dx * dx + dy * dy <= rSq) {
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

  static drawSmoothSegment(p0, p1, color, state, radius = 2.2) {
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const steps = Math.max(1, Math.ceil(dist * 3));
    let lastX = -1;
    let lastY = -1;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(p0.x + (p1.x - p0.x) * t);
      const y = Math.round(p0.y + (p1.y - p0.y) * t);
      if (x !== lastX || y !== lastY) {
        DrawingTools.stampNib(x, y, color, radius, state);
        lastX = x;
        lastY = y;
      }
    }
  }

  static drawQuadraticCurve(p0, p1, p2, color, state, radius = 2.2) {
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(1, Math.ceil(dist * 3));
    let lastX = -1;
    let lastY = -1;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const inv = 1 - t;
      const x = Math.round(inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x);
      const y = Math.round(inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y);
      if (x !== lastX || y !== lastY) {
        DrawingTools.stampNib(x, y, color, radius, state);
        lastX = x;
        lastY = y;
      }
    }
  }

  static floodFill(startX, startY, targetColor, state) {
    if (startX < 0 || startX >= state.gridSize || startY < 0 || startY >= state.gridSize) return;

    const startColor = state.grid[startY][startX];
    if (startColor === targetColor) return;

    // Index-pointer BFS queue for fast O(n) execution even in 256x256 freehand mode
    const queue = [{ x: startX, y: startY }];
    const visited = new Uint8Array(state.gridSize * state.gridSize);
    const region = [];
    let head = 0;

    while (head < queue.length) {
      const { x, y } = queue[head++];

      if (x < 0 || x >= state.gridSize || y < 0 || y >= state.gridSize) continue;
      const flatIdx = y * state.gridSize + x;
      if (visited[flatIdx]) continue;
      visited[flatIdx] = 1;

      if (state.grid[y][x] === startColor) {
        region.push({ x, y });

        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }

    for (const pt of region) {
      DrawingTools.applyPixelWithSymmetry(pt.x, pt.y, targetColor, state);
    }
  }
}

export class Exporter {
  static calculateStats(state) {
    let activePixels = 0;
    const colorCounts = {};

    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        const color = state.grid[y][x];
        if (color) {
          activePixels++;
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        }
      }
    }

    let dominantColor = '#6366F1';
    let maxCount = 0;
    Object.entries(colorCounts).forEach(([color, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    });

    let entropy = 0;
    if (activePixels > 0) {
      Object.values(colorCounts).forEach(count => {
        const p = count / activePixels;
        entropy -= p * Math.log2(p);
      });
    }

    return { activePixels, dominantColor, entropy };
  }

  static copyMatrixJSON(grid) {
    const json = JSON.stringify(grid, null, 2);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(json);
    } else {
      const temp = document.createElement('textarea');
      temp.value = json;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
  }

  static downloadMatrixJSON(grid) {
    const json = JSON.stringify(grid, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas-matrix-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static downloadSpritePNG(grid, gridSize, scale) {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = gridSize * scale;
    exportCanvas.height = gridSize * scale;
    const ctx = exportCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const color = grid[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    const a = document.createElement('a');
    a.href = exportCanvas.toDataURL('image/png');
    a.download = `pixel-sprite-${gridSize}x${gridSize}-${Date.now()}.png`;
    a.click();
  }

  static renderSouvenirCard(sourceCanvas, housingTitle, activePixels, entropy, gridSize) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 600;
    offCanvas.height = 720;
    const ctx = offCanvas.getContext('2d');
    const w = offCanvas.width;
    const h = offCanvas.height;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#020617');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText('BYTES ON CANVAS', 40, 65);

    ctx.fillStyle = '#a855f7';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText(`HARDWARE THEME : ${housingTitle.toUpperCase()}`, 40, 92);

    const size = 360;
    const x = (w - size) / 2;
    const y = 120;

    ctx.fillStyle = '#020617';
    ctx.fillRect(x - 10, y - 10, size + 20, size + 20);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 10, y - 10, size + 20, size + 20);

    // Draw source canvas directly without HTMLImageElement overhead
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, x, y, size, size);

    ctx.fillStyle = '#a3e635';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText(`ACTIVE PIXELS : ${activePixels}`, 50, 530);
    ctx.fillText(`ENTROPY SCORE : ${entropy.toFixed(2)} bits`, 50, 560);
    ctx.fillText(`GRID RESOLUTION: ${gridSize} x ${gridSize}`, 50, 590);
    ctx.fillText(`TIMESTAMP     : ${new Date().toISOString().slice(0, 10)}`, 50, 620);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText("• BUILDER'S BYTE CERTIFIED HARDWARE ARTIFACT •", 110, 690);

    const a = document.createElement('a');
    a.download = `Bytes-On-Canvas-Souvenir-${Date.now()}.png`;
    a.href = offCanvas.toDataURL('image/png');
    a.click();
  }
}

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
    a.download = `an-artistic-bit-matrix-${Date.now()}.json`;
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
    a.download = `an-artistic-bit-sprite-${gridSize}x${gridSize}-${Date.now()}.png`;
    a.click();
  }

  static renderSouvenirCard(sourceCanvas, housingTitle, activePixels, entropy, gridSize, showGridlines = true, activeTheme = 'night') {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 600;
    offCanvas.height = 720;
    const ctx = offCanvas.getContext('2d');
    const w = offCanvas.width;
    const h = offCanvas.height;

    ctx.fillStyle = '#0e1117';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px "Fraunces", "Space Grotesk", serif';
    ctx.fillText('AN ARTISTIC BIT', 40, 65);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Fira Code", monospace';
    ctx.fillText(`HARDWARE THEME : ${housingTitle.toUpperCase()}`, 40, 92);

    const size = 360;
    const x = (w - size) / 2;
    const y = 120;

    ctx.fillStyle = activeTheme === 'day' ? '#faf8f5' : '#090d16';
    ctx.fillRect(x - 10, y - 10, size + 20, size + 20);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 10, y - 10, size + 20, size + 20);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, x, y, size, size);

    const resLabel = showGridlines ? `${gridSize} x ${gridSize} GRID` : `FREEHAND (${gridSize}x${gridSize})`;

    ctx.fillStyle = '#a3e635';
    ctx.font = '14px "Fira Code", monospace';
    ctx.fillText(`ACTIVE PIXELS  : ${activePixels}`, 50, 530);
    ctx.fillText(`ENTROPY SCORE  : ${entropy.toFixed(2)} bits`, 50, 560);
    ctx.fillText(`CANVAS MODE    : ${resLabel}`, 50, 590);
    ctx.fillText(`TIMESTAMP      : ${new Date().toISOString().slice(0, 10)}`, 50, 620);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Fira Code", monospace';
    ctx.fillText('• AN ARTISTIC BIT • HARDWARE ARTIFACT •', 148, 690);

    const a = document.createElement('a');
    a.download = `An-Artistic-Bit-Souvenir-${Date.now()}.png`;
    a.href = offCanvas.toDataURL('image/png');
    a.click();
  }
}

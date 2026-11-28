import { SOUVENIR_THEMES } from './themes.js';

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

  static formatMatrixJSON(grid) {
    const rows = grid.map((row) => '  ' + JSON.stringify(row));
    return `[\n${rows.join(',\n')}\n]`;
  }

  static copyMatrixJSON(grid) {
    const json = this.formatMatrixJSON(grid);
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
    const json = this.formatMatrixJSON(grid);
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

  static async renderSouvenirCard(
    sourceCanvas,
    housingTitle,
    activePixels,
    entropy,
    dominantColor = '#6366F1',
    gridSize = 256,
    showGridlines = false,
    activeTheme = 'night'
  ) {
    const themeStyle = SOUVENIR_THEMES[activeTheme] || SOUVENIR_THEMES.night;

    if (document.fonts) {
      await Promise.allSettled([
        document.fonts.load(themeStyle.fontLoadSpec),
        document.fonts.load(themeStyle.bodyFontLoadSpec)
      ]);
    }

    const offCanvas = document.createElement('canvas');
    offCanvas.width = 600;
    offCanvas.height = 700;
    const ctx = offCanvas.getContext('2d');
    const w = offCanvas.width;
    const h = offCanvas.height;

    // Outer theme card surface & border
    ctx.fillStyle = themeStyle.cardBg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = themeStyle.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Header bar
    const displayHousing = themeStyle.headerUppercase ? housingTitle.toUpperCase() : housingTitle;
    const baseTitle = themeStyle.headerUppercase ? 'AN ARTISTIC BIT' : 'An Artistic Bit';
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');

    ctx.fillStyle = themeStyle.accent;
    ctx.fillRect(42, 48, 10, 10);

    ctx.fillStyle = themeStyle.text;
    ctx.font = themeStyle.pngTitleFont;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${baseTitle} • ${displayHousing}`, 62, 54);

    ctx.fillStyle = themeStyle.muted;
    ctx.font = themeStyle.pngDateFont;
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, w - 42, 54);

    ctx.strokeStyle = themeStyle.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 82);
    ctx.lineTo(w - 40, 82);
    ctx.stroke();

    // Focus Mode screen box & artwork
    const screenSize = 350;
    const screenX = (w - screenSize) / 2;
    const screenY = 108;

    ctx.fillStyle = themeStyle.screenBg;
    ctx.fillRect(screenX, screenY, screenSize, screenSize);

    ctx.imageSmoothingEnabled = !showGridlines;
    ctx.drawImage(sourceCanvas, screenX, screenY, screenSize, screenSize);

    ctx.strokeStyle = themeStyle.screenBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY, screenSize, screenSize);

    // 2x2 Theme-matched stat grid
    const resLabel = showGridlines
      ? `${gridSize} x ${gridSize}`
      : `Freehand (${gridSize}x${gridSize})`;

    const cards = [
      { label: 'ACTIVE PIXELS', value: String(activePixels) },
      { label: 'CANVAS MODE', value: resLabel },
      { label: 'DOMINANT HUE', value: dominantColor.toUpperCase(), swatch: dominantColor },
      { label: 'ENTROPY SCORE', value: `${entropy.toFixed(2)} bits` }
    ];

    const gridX = 42;
    const gridY = 486;
    const gap = 14;
    const boxW = (w - gridX * 2 - gap) / 2;
    const boxH = 78;

    cards.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = gridX + col * (boxW + gap);
      const by = gridY + row * (boxH + gap);

      ctx.fillStyle = themeStyle.wellBg;
      ctx.fillRect(bx, by, boxW, boxH);

      ctx.strokeStyle = themeStyle.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = themeStyle.muted;
      ctx.font = themeStyle.pngLabelFont;
      ctx.fillText(item.label, bx + 16, by + 16);

      ctx.fillStyle = themeStyle.text;
      ctx.font = themeStyle.pngValueFont;
      if (item.swatch) {
        ctx.beginPath();
        ctx.arc(bx + 22, by + 48, 6, 0, Math.PI * 2);
        ctx.fillStyle = item.swatch;
        ctx.fill();
        ctx.fillStyle = themeStyle.text;
        ctx.fillText(item.value, bx + 36, by + 40);
      } else {
        ctx.fillText(item.value, bx + 16, by + 40);
      }
    });

    const a = document.createElement('a');
    a.download = `An-Artistic-Bit-Souvenir-${Date.now()}.png`;
    a.href = offCanvas.toDataURL('image/png');
    a.click();
  }
}

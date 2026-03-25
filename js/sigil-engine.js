// CREOSIGIL — Sigil Generation Engine
// Canvas-based sigil drawing with Traditional and Modern styles

class SigilEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = canvas.width;
    this.cx = this.size / 2;
    this.cy = this.size / 2;
    this.r = this.size * 0.42;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.size, this.size);
  }

  setSize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.size = Math.min(w, h);
    this.cx = w / 2;
    this.cy = h / 2;
    this.r = this.size * 0.42;
    this.ctx = this.canvas.getContext('2d');
  }

  // Draw background
  drawBackground(bgConfig, moodColors, w, h) {
    const ctx = this.ctx;
    ctx.save();
    if (bgConfig.gradient) {
      // Parse simple gradient types
      const gd = bgConfig.gradient;
      if (gd.startsWith('radial-gradient')) {
        const g = ctx.createRadialGradient(this.cx, this.cy * 0.7, 0, this.cx, this.cy, Math.max(w, h) * 0.7);
        g.addColorStop(0, this._lightenColor(bgConfig.color, 0.3));
        g.addColorStop(1, bgConfig.color);
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, this._lightenColor(bgConfig.color, 0.25));
        g.addColorStop(1, bgConfig.color);
        ctx.fillStyle = g;
      }
    } else {
      ctx.fillStyle = bgConfig.color;
    }
    ctx.fillRect(0, 0, w, h);

    // Mood ambient glow
    if (moodColors && moodColors.ambient) {
      const ag = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.r * 1.5);
      ag.addColorStop(0, moodColors.ambient);
      ag.addColorStop(1, 'transparent');
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  _lightenColor(hex, amount) {
    try {
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
      r = Math.min(255, Math.round(r + (255 - r) * amount));
      g = Math.min(255, Math.round(g + (255 - g) * amount));
      b = Math.min(255, Math.round(b + (255 - b) * amount));
      return `rgb(${r},${g},${b})`;
    } catch(e) { return hex; }
  }

  // ========== TRADITIONAL SIGIL ==========
  drawTraditional(options) {
    const { structure, symbol, density, lineStyle, symmetry, decoration, moodColors, progress } = options;
    const ctx = this.ctx;
    const cx = this.cx, cy = this.cy, r = this.r;

    ctx.save();
    this._setLineStyle(ctx, lineStyle, moodColors);

    // Base outer ring
    this._drawOuterRings(ctx, cx, cy, r, decoration, moodColors, lineStyle);

    // Structure-based core
    switch (structure) {
      case 'circle_seal': this._drawCircleSeal(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress); break;
      case 'magic_circle': this._drawMagicCircle(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress); break;
      case 'seal_gate': this._drawSealGate(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress); break;
      case 'rune_combo': this._drawRuneCombo(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress); break;
      case 'symmetric': this._drawSymmetric(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress); break;
      case 'moon_bind': this._drawMoonBind(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress); break;
      default: this._drawCircleSeal(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress);
    }

    ctx.restore();
  }

  _setLineStyle(ctx, lineStyle, moodColors) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    switch (lineStyle) {
      case 'thin_ink':
        ctx.lineWidth = Math.max(1, this.size * 0.0025);
        ctx.shadowBlur = 4;
        ctx.shadowColor = glow;
        break;
      case 'carved':
        ctx.lineWidth = Math.max(2, this.size * 0.005);
        ctx.shadowBlur = 2;
        ctx.shadowColor = glow;
        break;
      case 'rough':
        ctx.lineWidth = Math.max(1.5, this.size * 0.003);
        ctx.shadowBlur = 6;
        ctx.shadowColor = glow;
        break;
      case 'sharp':
        ctx.lineWidth = Math.max(1, this.size * 0.002);
        ctx.shadowBlur = 8;
        ctx.shadowColor = glow;
        break;
      default:
        ctx.lineWidth = Math.max(1, this.size * 0.003);
        ctx.shadowBlur = 4;
        ctx.shadowColor = glow;
    }
  }

  _drawGlow(ctx, fn, moodColors) {
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = glow;
    ctx.globalAlpha = 0.5;
    fn();
    ctx.restore();
    fn();
  }

  _drawOuterRings(ctx, cx, cy, r, decoration, moodColors, lineStyle) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, this.size * 0.002);
    ctx.shadowBlur = 12;
    ctx.shadowColor = glow;
    ctx.globalAlpha = 0.8;

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Decoration-based second ring
    if (decoration === 'outer_ring' || decoration === 'rune_dots') {
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dot ring for rune_dots / star_dots
    if (decoration === 'rune_dots' || decoration === 'star_dots') {
      const dotCount = decoration === 'star_dots' ? 12 : 8;
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2 - Math.PI / 2;
        const dx = cx + Math.cos(angle) * r * 0.975;
        const dy = cy + Math.sin(angle) * r * 0.975;
        ctx.beginPath();
        ctx.arc(dx, dy, this.size * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cross seal lines
    if (decoration === 'seal_cross') {
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([2, 8]);
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r * 0.97, cy + Math.sin(angle) * r * 0.97);
        ctx.lineTo(cx - Math.cos(angle) * r * 0.97, cy - Math.sin(angle) * r * 0.97);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  _drawCircleSeal(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    const p = progress || 1;
    ctx.save();

    // Inner circles based on density
    const rings = density === 'simple' ? 1 : density === 'medium' ? 2 : density === 'complex' ? 3 : 4;
    for (let i = 1; i <= rings; i++) {
      const ri = r * (0.75 - i * 0.12);
      if (ri <= 0) continue;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.4 + 0.15 * i;
      ctx.lineWidth = Math.max(0.5, this.size * 0.0015);
      ctx.shadowBlur = 6;
      ctx.shadowColor = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, ri, 0, Math.PI * 2 * Math.min(1, p * 1.5));
      ctx.stroke();
    }

    // Symbol at center
    this._drawSymbol(ctx, cx, cy, r * 0.4, symbol, symmetry, moodColors, p);

    // Connecting lines based on symmetry
    if (p > 0.3) {
      this._drawSealLines(ctx, cx, cy, r * 0.72, symbol, symmetry, moodColors, p);
    }
    ctx.restore();
  }

  _drawMagicCircle(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    const p = progress || 1;
    ctx.save();

    // Multiple concentric rings
    const ringCount = density === 'simple' ? 2 : density === 'medium' ? 3 : density === 'complex' ? 4 : 5;
    for (let i = 0; i < ringCount; i++) {
      const ri = r * (1 - i * 0.18);
      if (ri <= 10) continue;
      ctx.globalAlpha = 0.5 - i * 0.05;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(0.5, this.size * 0.002 * (1 - i * 0.1));
      ctx.shadowBlur = 8;
      ctx.shadowColor = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, ri, 0, Math.PI * 2 * Math.min(1, p * 1.8));
      ctx.stroke();
    }

    // Pentagram or hexagram
    if (p > 0.4) {
      const points = symmetry === 'full' ? 6 : symmetry === 'half' ? 5 : 4;
      this._drawPolygram(ctx, cx, cy, r * 0.6, points, moodColors, p * 0.8);
    }

    // Center symbol
    if (p > 0.7) {
      this._drawSymbol(ctx, cx, cy, r * 0.25, symbol, symmetry, moodColors, p);
    }
    ctx.restore();
  }

  _drawSealGate(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    const p = progress || 1;
    ctx.save();

    // Gate arch shape
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, this.size * 0.003);
    ctx.shadowBlur = 10;
    ctx.shadowColor = glow;

    // Main gate arc
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.8, -Math.PI, 0, false);
    ctx.stroke();

    // Vertical pillars
    if (p > 0.2) {
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy);
      ctx.lineTo(cx - r * 0.8, cy + r * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.8, cy);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.5);
      ctx.stroke();
    }

    // Base line
    if (p > 0.35) {
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy + r * 0.5);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.5);
      ctx.stroke();
    }

    // Seal symbol inside gate
    if (p > 0.5) {
      this._drawSymbol(ctx, cx, cy - r * 0.15, r * 0.35, symbol, symmetry, moodColors, p);
    }

    // Locking lines
    if (p > 0.65) {
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([3, 6]);
      for (let i = 0; i < 3; i++) {
        const ry = cy + r * 0.15 * i;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.4, ry);
        ctx.lineTo(cx + r * 0.4, ry);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  _drawRuneCombo(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    const p = progress || 1;
    ctx.save();

    // Rune-like angular shapes
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, this.size * 0.004);
    ctx.shadowBlur = 8;
    ctx.shadowColor = glow;

    const runeCount = density === 'simple' ? 3 : density === 'medium' ? 5 : density === 'complex' ? 7 : 9;

    for (let i = 0; i < runeCount && i / runeCount < p * 1.1; i++) {
      const angle = (i / runeCount) * Math.PI * 2 - Math.PI / 2;
      const rx = cx + Math.cos(angle) * r * 0.55;
      const ry = cy + Math.sin(angle) * r * 0.55;
      ctx.globalAlpha = 0.6 + 0.1 * (i % 3);
      this._drawRuneShape(ctx, rx, ry, r * 0.12, i, moodColors);
    }

    // Connecting lines from center
    if (p > 0.5) {
      ctx.globalAlpha = 0.25;
      ctx.setLineDash([2, 6]);
      for (let i = 0; i < runeCount && i / runeCount < p * 0.8; i++) {
        const angle = (i / runeCount) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * r * 0.5, cy + Math.sin(angle) * r * 0.5);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Center symbol
    if (p > 0.7) {
      this._drawSymbol(ctx, cx, cy, r * 0.22, symbol, symmetry, moodColors, p);
    }
    ctx.restore();
  }

  _drawSymmetric(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    const p = progress || 1;
    ctx.save();

    const points = symmetry === 'full' ? 8 : symmetry === 'half' ? 6 : 4;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, this.size * 0.0025);
    ctx.shadowBlur = 8;
    ctx.shadowColor = glow;

    // Symmetric petal-like structure
    for (let i = 0; i < points && (i / points) < p * 1.2; i++) {
      const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * r * 0.65;
      const y1 = cy + Math.sin(angle) * r * 0.65;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Connecting arcs
      if (p > 0.4) {
        const nextAngle = ((i + 1) / points) * Math.PI * 2 - Math.PI / 2;
        const x2 = cx + Math.cos(nextAngle) * r * 0.65;
        const y2 = cy + Math.sin(nextAngle) * r * 0.65;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Inner flower-like pattern
    if (p > 0.6) {
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        const ri = r * 0.35;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(angle) * ri * 0.8,
          cy + Math.sin(angle) * ri * 0.8,
          ri * 0.3,
          0, Math.PI * 2
        );
        ctx.stroke();
      }
    }

    // Center
    if (p > 0.8) {
      this._drawSymbol(ctx, cx, cy, r * 0.2, symbol, 'full', moodColors, p);
    }
    ctx.restore();
  }

  _drawMoonBind(ctx, cx, cy, r, density, symbol, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    const p = progress || 1;
    ctx.save();

    // Moon phases circle
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, this.size * 0.002);
    ctx.shadowBlur = 10;
    ctx.shadowColor = glow;

    // Full moon outline
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 0.55, 0, Math.PI * 2 * Math.min(1, p * 1.5));
    ctx.stroke();

    // Crescent
    if (p > 0.3) {
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(cx + r * 0.12, cy - r * 0.1, r * 0.48, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Stars around
    const starCount = density === 'simple' ? 3 : density === 'medium' ? 5 : 7;
    if (p > 0.4) {
      for (let i = 0; i < starCount && (i / starCount) < p * 0.8; i++) {
        const angle = (i / starCount) * Math.PI * 2 - Math.PI / 2;
        const sx = cx + Math.cos(angle) * r * 0.78;
        const sy = cy + Math.sin(angle) * r * 0.78;
        ctx.globalAlpha = 0.6;
        this._drawStar(ctx, sx, sy, r * 0.04, 4, moodColors);
      }
    }

    // Binding lines
    if (p > 0.6) {
      ctx.globalAlpha = 0.25;
      ctx.setLineDash([3, 8]);
      const bindCount = 5;
      for (let i = 0; i < bindCount; i++) {
        const a1 = (i / bindCount) * Math.PI * 2;
        const a2 = ((i + 2) / bindCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * r * 0.55, cy + Math.sin(a1) * r * 0.55);
        ctx.lineTo(cx + Math.cos(a2) * r * 0.55, cy + Math.sin(a2) * r * 0.55);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    if (p > 0.8) {
      this._drawSymbol(ctx, cx, cy - r * 0.1, r * 0.2, symbol, symmetry, moodColors, p);
    }
    ctx.restore();
  }

  // ========== SYMBOL DRAWING ==========
  _drawSymbol(ctx, cx, cy, size, symbol, symmetry, moodColors, p) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, size * 0.04);
    ctx.shadowBlur = 12;
    ctx.shadowColor = glow;
    ctx.globalAlpha = 0.85;

    switch (symbol) {
      case 'triangle':
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * size;
          const y = cy + Math.sin(a) * size;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, Math.PI * 2 * Math.min(1, p + 0.1));
        ctx.stroke();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'grid':
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + i * size * 0.5, cy - size);
          ctx.lineTo(cx + i * size * 0.5, cy + size);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - size, cy + i * size * 0.5);
          ctx.lineTo(cx + size, cy + i * size * 0.5);
          ctx.stroke();
        }
        break;
      case 'stars':
        this._drawStar(ctx, cx, cy, size, 6, moodColors);
        break;
      case 'crescent':
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(cx + size * 0.35, cy, size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'seal_line':
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size);
          ctx.lineTo(cx + Math.cos(a + Math.PI) * size, cy + Math.sin(a + Math.PI) * size);
          ctx.stroke();
        }
        break;
      default:
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
  }

  _drawStar(ctx, cx, cy, r, points, moodColors) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.4;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.restore();
  }

  _drawPolygram(ctx, cx, cy, r, points, moodColors, p) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.8, this.size * 0.002);
    ctx.shadowBlur = 10;
    ctx.shadowColor = glow;
    ctx.globalAlpha = 0.5;

    const verts = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2 - Math.PI / 2;
      verts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }

    const step = points === 5 ? 2 : points === 6 ? 2 : 2;
    const drawn = Math.floor(points * p);
    for (let i = 0; i < drawn; i++) {
      const j = (i * step) % points;
      const k = ((i + 1) * step) % points;
      ctx.beginPath();
      ctx.moveTo(verts[j].x, verts[j].y);
      ctx.lineTo(verts[k].x, verts[k].y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawSealLines(ctx, cx, cy, r, symbol, symmetry, moodColors, p) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    const glow = moodColors ? moodColors.glow : '#9B8FCC';
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.5, this.size * 0.0015);
    ctx.shadowBlur = 6;
    ctx.shadowColor = glow;
    ctx.globalAlpha = 0.3;

    const lineCount = symmetry === 'full' ? 12 : symmetry === 'half' ? 8 : 6;
    const drawn = Math.floor(lineCount * p);
    for (let i = 0; i < drawn; i++) {
      const a = (i / lineCount) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawRuneShape(ctx, cx, cy, size, seed, moodColors) {
    const color = moodColors ? moodColors.line : '#C8C0E8';
    ctx.save();
    ctx.strokeStyle = color;

    const shapes = [
      // Isa (vertical line + branches)
      () => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx, cy + size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + size * 0.6, cy - size * 0.5);
        ctx.stroke();
      },
      // Tiwaz (arrow up)
      () => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size * 0.7, cy + size * 0.5);
        ctx.lineTo(cx - size * 0.7, cy + size * 0.5);
        ctx.closePath();
        ctx.stroke();
      },
      // Algiz (fork)
      () => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + size);
        ctx.lineTo(cx, cy - size * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.2);
        ctx.lineTo(cx - size * 0.6, cy - size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.2);
        ctx.lineTo(cx + size * 0.6, cy - size);
        ctx.stroke();
      },
      // Othala (diamond with legs)
      () => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size * 0.8, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - size * 0.8, cy);
        ctx.closePath();
        ctx.stroke();
      },
      // Ingwaz (diamond)
      () => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.7);
        ctx.lineTo(cx + size * 0.7, cy);
        ctx.lineTo(cx, cy + size * 0.7);
        ctx.lineTo(cx - size * 0.7, cy);
        ctx.closePath();
        ctx.stroke();
      },
    ];

    const fn = shapes[seed % shapes.length];
    fn();
    ctx.restore();
  }

  // ========== MODERN SIGIL ==========
  drawModern(options) {
    const { style, lineStyle, complexity, symmetry, moodColors, progress } = options;
    const ctx = this.ctx;
    const cx = this.cx, cy = this.cy, r = this.r;

    ctx.save();
    this._setModernLineStyle(ctx, lineStyle, moodColors);

    switch (style) {
      case 'minimal_logo': this._drawMinimalLogo(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress); break;
      case 'geometric': this._drawGeometric(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress); break;
      case 'neon_symbol': this._drawNeonSymbol(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress); break;
      case 'emblem': this._drawEmblem(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress); break;
      case 'abstract': this._drawAbstract(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress); break;
      case 'crystal': this._drawCrystal(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress); break;
      default: this._drawMinimalLogo(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress);
    }
    ctx.restore();
  }

  _setModernLineStyle(ctx, lineStyle, moodColors) {
    const color = moodColors ? moodColors.line : '#D8D4EC';
    const glow = moodColors ? moodColors.glow : '#B0A8D0';

    switch (lineStyle) {
      case 'monoline':
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1.5, this.size * 0.003);
        ctx.shadowBlur = 4;
        ctx.shadowColor = glow;
        break;
      case 'double':
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, this.size * 0.004);
        ctx.shadowBlur = 6;
        ctx.shadowColor = glow;
        break;
      case 'glow_line':
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1.5, this.size * 0.003);
        ctx.shadowBlur = 20;
        ctx.shadowColor = glow;
        break;
      case 'chrome':
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, this.size * 0.005);
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FFFFFF';
        break;
      default:
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1.5, this.size * 0.003);
        ctx.shadowBlur = 4;
        ctx.shadowColor = glow;
    }
  }

  _drawMinimalLogo(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#D8D4EC';
    const glow = moodColors ? moodColors.glow : '#B0A8D0';
    const p = progress || 1;
    ctx.save();

    // Central circle
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = color;
    ctx.shadowColor = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2 * Math.min(1, p * 1.5));
    ctx.stroke();

    // Cross or plus
    if (p > 0.3) {
      ctx.globalAlpha = 0.5;
      const l = r * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx - l, cy);
      ctx.lineTo(cx + l, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - l);
      ctx.lineTo(cx, cy + l);
      ctx.stroke();
    }

    // Outer minimal ring
    if (p > 0.5) {
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = Math.max(0.8, this.size * 0.0015);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Corner dots
    if (complexity !== 'simple' && p > 0.6) {
      ctx.globalAlpha = 0.6;
      const dotR = r * 0.025;
      const dotDist = r * 0.75;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * dotDist, cy + Math.sin(a) * dotDist, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Double line effect
    if (lineStyle === 'double' && p > 0.4) {
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = Math.max(0.5, this.size * 0.001);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.47, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawGeometric(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#D8D4EC';
    const glow = moodColors ? moodColors.glow : '#B0A8D0';
    const p = progress || 1;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = glow;

    const sides = symmetry === 'full' ? 6 : symmetry === 'left_right' ? 4 : 3;

    // Main polygon
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * r * 0.6;
      const y = cy + Math.sin(a) * r * 0.6;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner polygon
    if (p > 0.35) {
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2 + Math.PI / sides;
        const x = cx + Math.cos(a) * r * 0.35;
        const y = cy + Math.sin(a) * r * 0.35;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Connecting lines (Star of David style)
    if (p > 0.55 && complexity !== 'simple') {
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < sides; i++) {
        const a1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + Math.floor(sides / 2)) / sides) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * r * 0.6, cy + Math.sin(a1) * r * 0.6);
        ctx.lineTo(cx + Math.cos(a2) * r * 0.6, cy + Math.sin(a2) * r * 0.6);
        ctx.stroke();
      }
    }

    // Outer ring
    if (p > 0.4) {
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = Math.max(0.8, this.size * 0.0015);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawNeonSymbol(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#90D0FF';
    const glow = moodColors ? moodColors.glow : '#60A8FF';
    const p = progress || 1;
    ctx.save();

    // Multiple glow passes
    for (let pass = 0; pass < 3; pass++) {
      ctx.strokeStyle = color;
      ctx.shadowBlur = 10 + pass * 15;
      ctx.shadowColor = glow;
      ctx.globalAlpha = 0.3 - pass * 0.05;
      ctx.lineWidth = Math.max(1, this.size * 0.003) * (1 + pass * 0.3);

      // Lightning bolt / energy shape
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.65);
      ctx.lineTo(cx - r * 0.25, cy);
      ctx.lineTo(cx + r * 0.1, cy);
      ctx.lineTo(cx - r * 0.1, cy + r * 0.65);
      if (p > 0.5) ctx.stroke();
    }

    // Main symbol
    ctx.strokeStyle = color;
    ctx.shadowBlur = 24;
    ctx.shadowColor = glow;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = Math.max(1.5, this.size * 0.003);
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.65);
    ctx.lineTo(cx - r * 0.25, cy);
    ctx.lineTo(cx + r * 0.1, cy);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.65);
    if (p > 0.3) ctx.stroke();

    // Outer energy ring
    if (p > 0.5) {
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = Math.max(1, this.size * 0.002);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawEmblem(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#D8D4EC';
    const glow = moodColors ? moodColors.glow : '#B0A8D0';
    const p = progress || 1;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = glow;

    // Shield shape
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.7);
    ctx.bezierCurveTo(cx + r * 0.6, cy - r * 0.7, cx + r * 0.6, cy + r * 0.2, cx, cy + r * 0.75);
    ctx.bezierCurveTo(cx - r * 0.6, cy + r * 0.2, cx - r * 0.6, cy - r * 0.7, cx, cy - r * 0.7);
    if (p > 0.2) ctx.stroke();

    // Inner divider
    if (p > 0.4) {
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.7);
      ctx.lineTo(cx, cy + r * 0.75);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy);
      ctx.lineTo(cx + r * 0.6, cy);
      ctx.stroke();
    }

    // Outer ring
    if (p > 0.5) {
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = Math.max(0.8, this.size * 0.0015);
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.1, r * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center symbol
    if (p > 0.7) {
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = Math.max(1, this.size * 0.003);
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.05, r * 0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawAbstract(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#D8D4EC';
    const glow = moodColors ? moodColors.glow : '#B0A8D0';
    const p = progress || 1;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = glow;

    // Random-ish but seeded curves
    const lineCount = complexity === 'simple' ? 4 : complexity === 'balance' ? 7 : complexity === 'detailed' ? 10 : 14;
    const drawn = Math.floor(lineCount * p);

    for (let i = 0; i < drawn; i++) {
      const seed = i * 137.5;
      const a1 = (seed % 360) * Math.PI / 180;
      const a2 = ((seed + 90 + i * 40) % 360) * Math.PI / 180;
      const d1 = 0.3 + (i % 3) * 0.2;
      const d2 = 0.4 + ((i + 1) % 3) * 0.2;

      ctx.globalAlpha = 0.4 + (i % 4) * 0.08;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * r * d1, cy + Math.sin(a1) * r * d1);
      ctx.bezierCurveTo(
        cx + Math.cos(a1 + 1) * r * 0.5, cy + Math.sin(a1 + 1) * r * 0.5,
        cx + Math.cos(a2 - 1) * r * 0.5, cy + Math.sin(a2 - 1) * r * 0.5,
        cx + Math.cos(a2) * r * d2, cy + Math.sin(a2) * r * d2
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawCrystal(ctx, cx, cy, r, complexity, symmetry, moodColors, lineStyle, progress) {
    const color = moodColors ? moodColors.line : '#D8D4EC';
    const glow = moodColors ? moodColors.glow : '#B0A8D0';
    const p = progress || 1;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = glow;

    const facets = symmetry === 'full' ? 6 : symmetry === 'left_right' ? 4 : 8;

    // Crystal facets
    for (let i = 0; i < facets && (i / facets) < p * 1.2; i++) {
      const a = (i / facets) * Math.PI * 2 - Math.PI / 2;
      const na = ((i + 1) / facets) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(a) * r * 0.65;
      const y1 = cy + Math.sin(a) * r * 0.65;
      const x2 = cx + Math.cos(na) * r * 0.65;
      const y2 = cy + Math.sin(na) * r * 0.65;
      const xm = cx + Math.cos((a + na) / 2) * r * 0.35;
      const ym = cy + Math.sin((a + na) / 2) * r * 0.35;

      ctx.globalAlpha = 0.5 + (i % 2) * 0.15;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(xm, ym);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(xm, ym);
      ctx.stroke();
    }

    // Highlight lines
    if (lineStyle === 'chrome' && p > 0.7) {
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(0.5, this.size * 0.001);
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFFFFF';
      const ha = -Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ha) * r * 0.3, cy + Math.sin(ha) * r * 0.3);
      ctx.lineTo(cx + Math.cos(ha) * r * 0.65, cy + Math.sin(ha) * r * 0.65);
      ctx.stroke();
    }
    ctx.restore();
  }
}

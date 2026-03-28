/**
 * CREOSIGIL - 시길 생성 엔진
 * Canvas 기반 전통형 / 현대형 시길 생성
 */

class SigilEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * 메인 시길 생성 함수 (비동기, 진행률 콜백 포함)
   */
  async generate(canvas, config, onProgress) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;

    try {
      // 진행률 0%
      if (onProgress) onProgress(0);
      await this._delay(30);

      // 배경 그리기
      this._drawBackground(config, width, height);
      if (onProgress) onProgress(15);
      await this._delay(40);

      // 타입에 따라 분기
      if (config.sigilType === 'traditional') {
        await this._drawTraditional(cx, cy, Math.min(width, height) * 0.38, config, onProgress);
      } else {
        await this._drawModern(cx, cy, Math.min(width, height) * 0.38, config, onProgress);
      }

      if (onProgress) onProgress(95);
      await this._delay(30);

      // 최종 마무리 글로우
      this._applyFinalGlow(cx, cy, Math.min(width, height) * 0.40, config);
      if (onProgress) onProgress(100);

    } catch (e) {
      console.error('Sigil generation error:', e);
      if (onProgress) onProgress(100);
    }
  }

  // ===== 배경 그리기 =====
  _drawBackground(config, width, height) {
    const ctx = this.ctx;
    const mood = config.mood;

    if (config.bgType === 'gradient') {
      const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/1.4);
      grad.addColorStop(0, mood.secondary || '#14141c');
      grad.addColorStop(1, mood.bg);
      ctx.fillStyle = grad;
    } else if (config.bgType === 'starfield') {
      ctx.fillStyle = mood.bg;
      ctx.fillRect(0, 0, width, height);
      this._drawStarfield(width, height, mood);
      return;
    } else if (config.bgType === 'fog') {
      ctx.fillStyle = mood.bg;
      ctx.fillRect(0, 0, width, height);
      this._drawFog(width, height, mood);
      return;
    } else {
      ctx.fillStyle = config.bgColor || mood.bg;
    }
    ctx.fillRect(0, 0, width, height);
  }

  _drawStarfield(width, height, mood) {
    const ctx = this.ctx;
    const rng = this._seededRng(42);
    ctx.fillStyle = mood.bg;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 120; i++) {
      const x = rng() * width;
      const y = rng() * height;
      const r = rng() * 1.5 + 0.3;
      const alpha = rng() * 0.7 + 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 190, 255, ${alpha})`;
      ctx.fill();
    }
  }

  _drawFog(width, height, mood) {
    const ctx = this.ctx;
    for (let i = 0; i < 5; i++) {
      const grad = ctx.createRadialGradient(
        width * (0.2 + i * 0.15), height * (0.3 + i * 0.1), 0,
        width * (0.2 + i * 0.15), height * (0.3 + i * 0.1), width * 0.4
      );
      grad.addColorStop(0, `${mood.glow}18`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // ===== 전통형 시길 =====
  async _drawTraditional(cx, cy, r, config, onProgress) {
    const ctx = this.ctx;
    const opts = config.traditionalOpts || {};
    const mood = config.mood;
    const lineColor = config.sigilColor || mood.line;
    const glowColor = mood.glow;
    const glowSize = config.glow || 8;
    const lineWidth = config.lineWidth || 2;

    // 1. 외곽 장식
    if (onProgress) onProgress(25);
    await this._delay(30);
    this._drawDecoration(cx, cy, r, opts, lineColor, glowColor, glowSize, lineWidth);

    // 2. 봉인 구조
    if (onProgress) onProgress(45);
    await this._delay(40);
    this._drawStructure(cx, cy, r * 0.82, opts, lineColor, glowColor, glowSize, lineWidth, config);

    // 3. 내부 심볼 (목적 기반)
    if (onProgress) onProgress(70);
    await this._delay(40);
    this._drawPurposeSymbol(cx, cy, r * 0.4, config.purposes, lineColor, glowColor, glowSize, lineWidth);

    // 4. 세부 장식
    if (onProgress) onProgress(85);
    await this._delay(30);
    this._drawTraditionalDetails(cx, cy, r, opts, lineColor, glowColor, glowSize, lineWidth);
  }

  _drawDecoration(cx, cy, r, opts, lineColor, glowColor, glowSize, lw) {
    const ctx = this.ctx;
    const deco = opts.decoration || 'single-ring';
    if (deco === 'no-deco') return;

    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw * 0.7;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;

    if (deco === 'single-ring' || deco === 'double-ring') {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      if (deco === 'double-ring') {
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (deco === 'dot-ring') {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = cx + (r + 8) * Math.cos(angle);
        const y = cy + (r + 8) * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, lw * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
      }
    } else if (deco === 'star-ring') {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        this._drawSmallStar(ctx, cx + (r + 10) * Math.cos(angle), cy + (r + 10) * Math.sin(angle), 5, lineColor, glowColor, glowSize);
      }
    }
    ctx.restore();
  }

  _drawSmallStar(ctx, x, y, size, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * 0.5;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 4 * Math.PI / 5) - Math.PI / 2;
      const a2 = ((i * 4 + 2) * Math.PI / 5) - Math.PI / 2;
      if (i === 0) ctx.moveTo(x + size * Math.cos(a1), y + size * Math.sin(a1));
      else ctx.lineTo(x + size * Math.cos(a1), y + size * Math.sin(a1));
      ctx.lineTo(x + size * 0.4 * Math.cos(a2), y + size * 0.4 * Math.sin(a2));
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  _drawStructure(cx, cy, r, opts, lineColor, glowColor, glowSize, lw, config) {
    const ctx = this.ctx;
    const structure = opts.structure || 'circle-seal';
    const symmetry = opts.symmetry || 'full-sym';
    const density = opts.density || 'medium';
    const lineStyle = opts.lineStyle || 'thin-ink';

    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;

    // 선 스타일 적용
    if (lineStyle === 'rough') ctx.setLineDash([3, 2]);
    else if (lineStyle === 'sharp') ctx.lineJoin = 'miter';

    if (structure === 'circle-seal') {
      this._drawCircleSeal(cx, cy, r, density, symmetry, lw, lineColor, glowColor, glowSize, config);
    } else if (structure === 'magic-circle') {
      this._drawMagicCircle(cx, cy, r, density, lw, lineColor, glowColor, glowSize);
    } else if (structure === 'seal-gate') {
      this._drawSealGate(cx, cy, r, symmetry, lw, lineColor, glowColor, glowSize, config);
    } else if (structure === 'rune-combo') {
      this._drawRuneCombo(cx, cy, r, density, lw, lineColor, glowColor, glowSize, config);
    } else if (structure === 'ritual-sym') {
      this._drawRitualSym(cx, cy, r, density, lw, lineColor, glowColor, glowSize);
    } else if (structure === 'moon-bond') {
      this._drawMoonBond(cx, cy, r, lw, lineColor, glowColor, glowSize);
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  _drawCircleSeal(cx, cy, r, density, symmetry, lw, lineColor, glowColor, glowSize, config) {
    const ctx = this.ctx;
    const layers = density === 'simple' ? 1 : density === 'medium' ? 2 : density === 'complex' ? 3 : 4;

    for (let i = 0; i < layers; i++) {
      const lr = r * (1 - i * 0.18);
      ctx.beginPath();
      ctx.arc(cx, cy, lr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 방사선
    const lines = density === 'simple' ? 4 : density === 'medium' ? 6 : 8;
    for (let i = 0; i < lines; i++) {
      const angle = (i / lines) * Math.PI * 2;
      const startR = r * 0.25;
      ctx.beginPath();
      ctx.moveTo(cx + startR * Math.cos(angle), cy + startR * Math.sin(angle));
      ctx.lineTo(cx + r * 0.92 * Math.cos(angle), cy + r * 0.92 * Math.sin(angle));
      ctx.stroke();
    }

    // 중간 교차점 삼각형
    if (density !== 'simple') {
      this._drawTriangle(cx, cy, r * 0.55, 0, ctx, lw, lineColor, glowColor, glowSize);
      if (density === 'complex' || density === 'multi') {
        this._drawTriangle(cx, cy, r * 0.55, Math.PI, ctx, lw, lineColor, glowColor, glowSize);
      }
    }
  }

  _drawTriangle(cx, cy, r, offsetAngle, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = offsetAngle + (i / 3) * Math.PI * 2 - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  _drawMagicCircle(cx, cy, r, density, lw, lineColor, glowColor, glowSize) {
    const ctx = this.ctx;
    const rings = density === 'simple' ? 2 : density === 'medium' ? 3 : 4;
    for (let i = 0; i < rings; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (1 - i * 0.15), 0, Math.PI * 2);
      ctx.stroke();
    }
    // 교차 별 패턴
    const points = density === 'simple' ? 5 : 6;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (i * 2 / points) * Math.PI * 2 - Math.PI / 2;
      const nx = i % 2 === 0 ? cx + r * 0.7 * Math.cos(angle) : cx + r * 0.35 * Math.cos(angle);
      const ny = i % 2 === 0 ? cy + r * 0.7 * Math.sin(angle) : cy + r * 0.35 * Math.sin(angle);
      if (i === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
    }
    ctx.closePath();
    ctx.stroke();
    // 사각형 교차
    if (density !== 'simple') {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-r * 0.45, -r * 0.45, r * 0.9, r * 0.9);
      ctx.restore();
    }
  }

  _drawSealGate(cx, cy, r, symmetry, lw, lineColor, glowColor, glowSize, config) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // 게이트 패턴
    const pts = 6;
    const innerR = r * 0.55;
    ctx.beginPath();
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2 - Math.PI / 2;
      const x = cx + innerR * Math.cos(a);
      const y = cy + innerR * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      // 방사선
      ctx.moveTo(x, y);
      ctx.lineTo(cx + r * 0.9 * Math.cos(a), cy + r * 0.9 * Math.sin(a));
    }
    ctx.closePath();
    ctx.stroke();
    // X 차단 기호
    const crossR = r * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx - crossR, cy - crossR); ctx.lineTo(cx + crossR, cy + crossR);
    ctx.moveTo(cx + crossR, cy - crossR); ctx.lineTo(cx - crossR, cy + crossR);
    ctx.stroke();
  }

  _drawRuneCombo(cx, cy, r, density, lw, lineColor, glowColor, glowSize, config) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
    ctx.stroke();
    // 룬 기호들
    const runeCount = density === 'simple' ? 3 : density === 'medium' ? 5 : 7;
    const runeR = r * 0.7;
    for (let i = 0; i < runeCount; i++) {
      const angle = (i / runeCount) * Math.PI * 2 - Math.PI / 2;
      const rx = cx + runeR * Math.cos(angle);
      const ry = cy + runeR * Math.sin(angle);
      this._drawSimpleRune(rx, ry, r * 0.12, i, ctx, lw, lineColor, glowColor, glowSize);
    }
    // 중심 원
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
    ctx.stroke();
  }

  _drawSimpleRune(x, y, size, type, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw * 0.9;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * 0.7;
    ctx.translate(x, y);
    const patterns = [
      () => { ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(0,size); ctx.moveTo(-size*0.5,-size*0.3); ctx.lineTo(0,0); ctx.moveTo(size*0.5,-size*0.3); ctx.lineTo(0,0); ctx.stroke(); },
      () => { ctx.beginPath(); ctx.moveTo(-size,0); ctx.lineTo(size,0); ctx.moveTo(0,-size); ctx.lineTo(0,size); ctx.stroke(); },
      () => { ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(size*0.7,size*0.5); ctx.lineTo(-size*0.7,size*0.5); ctx.closePath(); ctx.stroke(); },
      () => { ctx.beginPath(); ctx.arc(0,0,size,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(0,size); ctx.stroke(); },
      () => { ctx.beginPath(); ctx.moveTo(-size,-size); ctx.lineTo(size,size); ctx.moveTo(-size,size); ctx.lineTo(size,-size); ctx.stroke(); },
      () => { ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(size*0.5,0); ctx.lineTo(0,size); ctx.lineTo(-size*0.5,0); ctx.closePath(); ctx.stroke(); },
      () => { ctx.beginPath(); ctx.moveTo(-size,0); ctx.lineTo(0,-size); ctx.lineTo(size,0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-size,0); ctx.lineTo(0,size); ctx.lineTo(size,0); ctx.stroke(); }
    ];
    (patterns[type % patterns.length])();
    ctx.restore();
  }

  _drawRitualSym(cx, cy, r, density, lw, lineColor, glowColor, glowSize) {
    const ctx = this.ctx;
    // 완전 대칭 의식 패턴
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    const n = density === 'simple' ? 4 : density === 'medium' ? 6 : 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.3 * Math.cos(a), cy + r * 0.3 * Math.sin(a));
      ctx.lineTo(cx + r * 0.9 * Math.cos(a), cy + r * 0.9 * Math.sin(a));
      ctx.stroke();
      // 교차 라인
      const a2 = a + Math.PI / n;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.5 * Math.cos(a), cy + r * 0.5 * Math.sin(a));
      ctx.lineTo(cx + r * 0.5 * Math.cos(a2), cy + r * 0.5 * Math.sin(a2));
      ctx.stroke();
    }
  }

  _drawMoonBond(cx, cy, r, lw, lineColor, glowColor, glowSize) {
    const ctx = this.ctx;
    // 달 모양 + 결속 패턴
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // 초승달 형태
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy, r * 0.6, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + r * 0.1, cy, r * 0.55, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();
    // 결속선
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.7 * Math.cos(a), cy + r * 0.7 * Math.sin(a));
      ctx.lineTo(cx + r * 0.88 * Math.cos(a + 0.3), cy + r * 0.88 * Math.sin(a + 0.3));
      ctx.stroke();
    }
  }

  _drawPurposeSymbol(cx, cy, r, purposes, lineColor, glowColor, glowSize, lw) {
    const ctx = this.ctx;
    if (!purposes || purposes.length === 0) return;
    const mainPurpose = purposes[0];
    const symbolMap = {
      protection: () => this._drawTriangle(cx, cy, r, 0, ctx, lw * 1.2, lineColor, glowColor, glowSize * 1.5),
      purification: () => { ctx.save(); ctx.strokeStyle = lineColor; ctx.lineWidth = lw * 1.2; ctx.shadowColor = glowColor; ctx.shadowBlur = glowSize * 1.5; ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); },
      prosperity: () => this._drawStarShape(cx, cy, r, 5, ctx, lw, lineColor, glowColor, glowSize),
      focus: () => this._drawArrow(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize),
      healing: () => this._drawInfinity(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize),
      block: () => this._drawX(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize),
      love: () => this._drawHeart(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize),
      intuition: () => this._drawEye(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize)
    };
    if (symbolMap[mainPurpose]) symbolMap[mainPurpose]();
  }

  _drawStarShape(cx, cy, r, points, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.4;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  _drawArrow(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r * 0.4);
    ctx.moveTo(cx - r * 0.4, cy - r * 0.5); ctx.lineTo(cx, cy - r); ctx.lineTo(cx + r * 0.4, cy - r * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  _drawInfinity(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;
    const s = r * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx - s, cy - s, cx - s * 2, cy - s, cx - s, cy);
    ctx.bezierCurveTo(cx, cy + s * 0.3, cx + s, cy + s * 0.3, cx + s, cy);
    ctx.bezierCurveTo(cx + s * 2, cy - s, cx + s, cy - s, cx, cy);
    ctx.stroke();
    ctx.restore();
  }

  _drawX(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw * 1.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r);
    ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r);
    ctx.stroke();
    ctx.restore();
  }

  _drawHeart(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.6);
    ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.2, cx - r, cy - r, cx, cy - r * 0.4);
    ctx.bezierCurveTo(cx + r, cy - r, cx + r * 1.2, cy - r * 0.2, cx, cy + r * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  _drawEye(cx, cy, r, ctx, lw, lineColor, glowColor, glowSize) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.bezierCurveTo(cx - r * 0.5, cy - r * 0.6, cx + r * 0.5, cy - r * 0.6, cx + r, cy);
    ctx.bezierCurveTo(cx + r * 0.5, cy + r * 0.6, cx - r * 0.5, cy + r * 0.6, cx - r, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawTraditionalDetails(cx, cy, r, opts, lineColor, glowColor, glowSize, lw) {
    const ctx = this.ctx;
    const density = opts.density || 'medium';
    if (density === 'simple') return;
    // 미세 장식점
    ctx.save();
    ctx.fillStyle = lineColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * 0.5;
    const dotCount = density === 'medium' ? 4 : 8;
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2 - Math.PI / 4;
      const dotR = r * 0.65;
      ctx.beginPath();
      ctx.arc(cx + dotR * Math.cos(angle), cy + dotR * Math.sin(angle), lw * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ===== 현대형 시길 =====
  async _drawModern(cx, cy, r, config, onProgress) {
    const opts = config.modernOpts || {};
    const mood = config.mood;
    const lineColor = config.sigilColor || mood.line;
    const glowColor = mood.glow;
    const glowSize = config.glow || 8;
    const lineWidth = config.lineWidth || 2;

    if (onProgress) onProgress(25);
    await this._delay(30);

    const style = opts.style || 'minimal-logo';
    const form = opts.form || 'circle-center';
    const tone = opts.tone || 'clean-lux';
    const lineSt = opts.lineStyle || 'monoline';
    const complexity = opts.complexity || 'simple';

    if (style === 'minimal-logo') {
      this._drawMinimalLogo(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lineWidth, config);
    } else if (style === 'geometric') {
      this._drawGeometric(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lineWidth, config);
    } else if (style === 'neon-symbol') {
      this._drawNeonSymbol(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lineWidth, config);
    } else if (style === 'emblem') {
      this._drawEmblem(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lineWidth, config);
    } else if (style === 'abstract') {
      this._drawAbstract(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lineWidth, config);
    } else if (style === 'crystal') {
      this._drawCrystal(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lineWidth, config);
    }

    if (onProgress) onProgress(85);
    await this._delay(30);

    // 이중선 효과
    if (lineSt === 'double-line') {
      this._applyDoubleLineEffect(cx, cy, r, lineColor, glowColor, glowSize, lineWidth);
    } else if (lineSt === 'glow-line') {
      this._applyGlowLineEffect(cx, cy, r, lineColor, glowColor, glowSize * 2, lineWidth);
    }
  }

  _drawMinimalLogo(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lw, config) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;

    const purposes = config.purposes || [];
    const mainPurpose = purposes[0] || 'focus';
    const symbolData = PURPOSES.find(p => p.id === mainPurpose);
    const symbol = symbolData ? symbolData.symbol : '→';

    // 미니멀 원 + 심볼
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    if (complexity !== 'simple') {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      ctx.lineWidth = lw * 0.5;
      ctx.stroke();
    }

    // 중앙 텍스트 심볼
    ctx.shadowBlur = glowSize * 1.5;
    ctx.fillStyle = lineColor;
    ctx.font = `${r * 0.5}px Cinzel, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, cx, cy);

    ctx.restore();
  }

  _drawGeometric(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lw, config) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;

    const layers = complexity === 'simple' ? 1 : complexity === 'balance' ? 2 : 3;

    for (let i = 0; i < layers; i++) {
      const lr = r * (1 - i * 0.2);
      const sides = 6 - i;
      ctx.beginPath();
      for (let j = 0; j < sides; j++) {
        const angle = (j / sides) * Math.PI * 2 - Math.PI / 2 + (i * Math.PI / sides);
        const x = cx + lr * Math.cos(angle);
        const y = cy + lr * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 방사선
    if (complexity !== 'simple') {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * 0.8 * Math.cos(angle), cy + r * 0.8 * Math.sin(angle));
        ctx.lineWidth = lw * 0.6;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  _drawNeonSymbol(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lw, config) {
    const ctx = this.ctx;
    // 강한 글로우로 네온 효과
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * 2.5;

    // 원형 베이스
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // 번개 패턴
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.2, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.05, cy - r * 0.1);
    ctx.lineTo(cx - r * 0.1, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.2, cy + r * 0.6);
    ctx.stroke();

    if (complexity !== 'simple') {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + r * 0.85 * Math.cos(a), cy + r * 0.85 * Math.sin(a), lw * 2, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _drawEmblem(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lw, config) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;

    // 방패 형태
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.9);
    ctx.lineTo(cx + r * 0.75, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.75, cy + r * 0.1);
    ctx.lineTo(cx, cy + r * 0.9);
    ctx.lineTo(cx - r * 0.75, cy + r * 0.1);
    ctx.lineTo(cx - r * 0.75, cy - r * 0.5);
    ctx.closePath();
    ctx.stroke();

    // 내부 작은 방패
    if (complexity !== 'simple') {
      const s = 0.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.9 * s);
      ctx.lineTo(cx + r * 0.75 * s, cy - r * 0.5 * s);
      ctx.lineTo(cx + r * 0.75 * s, cy + r * 0.1 * s);
      ctx.lineTo(cx, cy + r * 0.9 * s);
      ctx.lineTo(cx - r * 0.75 * s, cy + r * 0.1 * s);
      ctx.lineTo(cx - r * 0.75 * s, cy - r * 0.5 * s);
      ctx.closePath();
      ctx.lineWidth = lw * 0.6;
      ctx.stroke();
    }

    // 중앙 별
    this._drawStarShape(cx, cy, r * 0.28, 5, ctx, lw, lineColor, glowColor, glowSize);

    ctx.restore();
  }

  _drawAbstract(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lw, config) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;

    const rng = this._seededRng(config.purposes ? config.purposes.join('').charCodeAt(0) : 33);
    const points = complexity === 'simple' ? 5 : complexity === 'balance' ? 7 : 9;

    // 랜덤한 점들 연결
    const pts = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2 - Math.PI / 2 + (rng() - 0.5) * 0.5;
      const dist = r * (0.4 + rng() * 0.5);
      pts.push({ x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) });
    }

    // 모든 점을 가로질러 연결
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= points; i++) {
      ctx.lineTo(pts[i % points].x, pts[i % points].y);
    }
    ctx.stroke();

    // 점 그리기
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, lw * 2, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
    });

    ctx.restore();
  }

  _drawCrystal(cx, cy, r, form, complexity, lineColor, glowColor, glowSize, lw, config) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lw;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize;

    // 결정체 다이아몬드 형태
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.6, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.6, cy + r * 0.2);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.6, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.6, cy - r * 0.1);
    ctx.closePath();
    ctx.stroke();

    // 내부 교차선
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.6, cy + r * 0.2);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx - r * 0.6, cy + r * 0.2);
    ctx.moveTo(cx + r * 0.6, cy - r * 0.1);
    ctx.lineTo(cx - r * 0.6, cy - r * 0.1);
    ctx.lineWidth = lw * 0.5;
    ctx.stroke();

    if (complexity !== 'simple') {
      // 상단 작은 결정체
      ctx.lineWidth = lw * 0.7;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.1);
      ctx.lineTo(cx, cy + r * 0.2);
      ctx.lineTo(cx - r * 0.3, cy - r * 0.1);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  _applyDoubleLineEffect(cx, cy, r, lineColor, glowColor, glowSize, lw) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = `${lineColor}60`;
    ctx.lineWidth = lw * 2.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _applyGlowLineEffect(cx, cy, r, lineColor, glowColor, glowSize, lw) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = lw * 3;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ===== 최종 글로우 =====
  _applyFinalGlow(cx, cy, r, config) {
    const ctx = this.ctx;
    const mood = config.mood;
    const glowColor = mood.glow;
    // 중앙 미세 빛
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.3);
    grad.addColorStop(0, `${glowColor}20`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ===== 캔버스에 설정 적용 (편집 반영) =====
  async redraw(canvas, config) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((config.rotation || 0) * Math.PI / 180);
    const scale = (config.scale || 100) / 100;
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);
    await this.generate(canvas, config, null);
    ctx.restore();
  }

  // ===== 유틸리티 =====
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _seededRng(seed) {
    let s = seed || 1;
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return ((s >>> 0) / 0xffffffff);
    };
  }
}

// 전역 인스턴스
const sigilEngine = new SigilEngine();

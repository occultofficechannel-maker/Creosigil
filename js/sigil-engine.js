// CREOSIGIL - 시길 생성 엔진
class SigilEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onProgress = null;
  }

  async generate(config) {
    const { mood, type, structure, density, lineStyle, symmetry, decoration, complexity } = config;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const moodData = APP_DATA.moods.find(m => m.id === mood) || APP_DATA.moods[0];

    // 배경 초기화
    this._setProgress(5);
    await this._delay(30);
    ctx.fillStyle = moodData.bg;
    ctx.fillRect(0, 0, W, H);

    // 미세 텍스처
    this._setProgress(10);
    await this._delay(30);
    this._drawBackground(ctx, W, H, moodData);

    // 기본 구조 계산
    const baseRadius = Math.min(W, H) * 0.32;
    const scaleFactor = density === 'simple' ? 0.85 : density === 'medium' ? 1.0 : density === 'complex' ? 1.15 : 1.3;
    const r = baseRadius * scaleFactor;

    this._setProgress(20);
    await this._delay(30);

    if (type === 'traditional') {
      await this._generateTraditional(config, ctx, W, H, cx, cy, r, moodData);
    } else {
      await this._generateModern(config, ctx, W, H, cx, cy, r, moodData);
    }

    this._setProgress(100);
    await this._delay(50);
  }

  async _generateTraditional(config, ctx, W, H, cx, cy, r, moodData) {
    const { structure, density, lineStyle, symmetry, decoration, purposes } = config;
    const lw = this._getLineWidth(lineStyle, W);
    const glowIntensity = config.glowIntensity || 0.7;

    this._setProgress(30);
    await this._delay(30);

    // 외곽 장식 원
    if (decoration && decoration.includes('outer_ring')) {
      this._drawGlowCircle(ctx, cx, cy, r + r * 0.08, lw * 0.6, moodData, glowIntensity * 0.5);
      this._drawGlowCircle(ctx, cx, cy, r + r * 0.14, lw * 0.3, moodData, glowIntensity * 0.3);
    }

    this._setProgress(40);
    await this._delay(30);

    // 메인 원
    this._drawGlowCircle(ctx, cx, cy, r, lw, moodData, glowIntensity);

    this._setProgress(50);
    await this._delay(30);

    // 구조별 내부 패턴
    switch (structure) {
      case 'circular_seal':
        await this._drawCircularSeal(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'magic_circle':
        await this._drawMagicCircle(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'seal_gate':
        await this._drawSealGate(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'rune_combo':
        await this._drawRuneCombo(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'ritual_symmetry':
        await this._drawRitualSymmetry(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'lunar_bond':
        await this._drawLunarBond(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      default:
        await this._drawCircularSeal(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
    }

    this._setProgress(70);
    await this._delay(30);

    // 의도 기반 중심 문양
    await this._drawIntentCenter(ctx, cx, cy, r, lw, moodData, glowIntensity, config.purposes || []);

    this._setProgress(80);
    await this._delay(30);

    // 추가 장식
    if (decoration) {
      if (decoration.includes('dot_stars')) {
        this._drawDotStars(ctx, cx, cy, r, moodData, glowIntensity);
      }
      if (decoration.includes('cross_axis')) {
        this._drawCrossAxis(ctx, cx, cy, r, lw * 0.5, moodData, glowIntensity * 0.6);
      }
    }

    this._setProgress(90);
    await this._delay(30);
  }

  async _generateModern(config, ctx, W, H, cx, cy, r, moodData) {
    const { style, lineStyle, symmetry, complexity } = config;
    const lw = this._getLineWidth(lineStyle, W);
    const glowIntensity = config.glowIntensity || 0.7;

    this._setProgress(30);
    await this._delay(30);

    switch (style) {
      case 'minimal_logo':
        await this._drawMinimalLogo(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'geometric':
        await this._drawGeometric(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'neon_symbol':
        await this._drawNeonSymbol(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'emblem':
        await this._drawEmblem(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'abstract':
        await this._drawAbstract(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      case 'crystal':
        await this._drawCrystal(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
        break;
      default:
        await this._drawMinimalLogo(ctx, cx, cy, r, lw, moodData, glowIntensity, symmetry);
    }

    this._setProgress(80);
    await this._delay(30);

    // 의도 기반 악센트
    await this._drawModernIntentAccent(ctx, cx, cy, r, lw, moodData, glowIntensity, config.purposes || []);

    this._setProgress(90);
    await this._delay(30);
  }

  // ============================================================
  // 전통형 패턴들
  // ============================================================

  async _drawCircularSeal(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 내부 소원
    this._drawGlowCircle(ctx, cx, cy, r * 0.65, lw * 0.8, moodData, gi * 0.8);
    await this._delay(20);

    // 중심 십자
    const arms = sym === 'intentional_imbalance' ? 3 : 4;
    for (let i = 0; i < arms; i++) {
      const angle = (i / arms) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * r * 0.15;
      const y1 = cy + Math.sin(angle) * r * 0.15;
      const x2 = cx + Math.cos(angle) * r * 0.6;
      const y2 = cy + Math.sin(angle) * r * 0.6;
      this._drawGlowLine(ctx, x1, y1, x2, y2, lw * 0.7, moodData, gi * 0.9);
    }
    await this._delay(20);

    // 봉인 점들
    const pts = sym === 'full' ? 8 : sym === 'partial' ? 6 : 5;
    for (let i = 0; i < pts; i++) {
      const angle = (i / pts) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * r * 0.65;
      const py = cy + Math.sin(angle) * r * 0.65;
      this._drawGlowDot(ctx, px, py, lw * 1.5, moodData, gi);
    }

    // 중심 소원
    this._drawGlowCircle(ctx, cx, cy, r * 0.15, lw * 0.9, moodData, gi);
  }

  async _drawMagicCircle(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 다중 원
    [0.85, 0.65, 0.45].forEach((ratio, i) => {
      this._drawGlowCircle(ctx, cx, cy, r * ratio, lw * (0.9 - i * 0.1), moodData, gi * (0.9 - i * 0.1));
    });

    // 삼각형
    const pts = sym === 'full' ? 3 : sym === 'partial' ? 3 : 4;
    const angles1 = Array.from({ length: pts }, (_, i) => (i / pts) * Math.PI * 2 - Math.PI / 2);
    const triangle1 = angles1.map(a => ({ x: cx + Math.cos(a) * r * 0.75, y: cy + Math.sin(a) * r * 0.75 }));
    this._drawGlowPolygon(ctx, triangle1, lw * 0.7, moodData, gi * 0.9);
    await this._delay(20);

    // 역삼각형
    const angles2 = angles1.map(a => a + Math.PI / pts);
    const triangle2 = angles2.map(a => ({ x: cx + Math.cos(a) * r * 0.75, y: cy + Math.sin(a) * r * 0.75 }));
    this._drawGlowPolygon(ctx, triangle2, lw * 0.7, moodData, gi * 0.8);
    await this._delay(20);

    this._drawGlowCircle(ctx, cx, cy, r * 0.15, lw, moodData, gi);
  }

  async _drawSealGate(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 게이트 구조
    const halfW = r * 0.55;
    const gateTop = cy - r * 0.7;
    const gateBot = cy + r * 0.7;

    // 좌우 기둥
    this._drawGlowLine(ctx, cx - halfW, gateTop, cx - halfW, gateBot, lw * 0.9, moodData, gi * 0.9);
    this._drawGlowLine(ctx, cx + halfW, gateTop, cx + halfW, gateBot, lw * 0.9, moodData, gi * 0.9);
    await this._delay(20);

    // 아치
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw * 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, halfW, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
    await this._delay(20);

    // 가로 봉인선들
    [-0.3, -0.05, 0.2].forEach(dy => {
      this._drawGlowLine(ctx, cx - halfW, cy + r * dy, cx + halfW, cy + r * dy, lw * 0.6, moodData, gi * 0.7);
    });

    // 중심 열쇠 구멍
    this._drawGlowCircle(ctx, cx, cy - r * 0.25, r * 0.1, lw * 0.8, moodData, gi);
    this._drawGlowLine(ctx, cx, cy - r * 0.15, cx, cy + r * 0.05, lw * 0.8, moodData, gi);
  }

  async _drawRuneCombo(ctx, cx, cy, r, lw, moodData, gi, sym) {
    const runeCount = sym === 'full' ? 6 : sym === 'partial' ? 4 : 5;
    const angles = Array.from({ length: runeCount }, (_, i) => (i / runeCount) * Math.PI * 2 - Math.PI / 2);

    // 연결선
    angles.forEach((a, i) => {
      const nextA = angles[(i + 1) % angles.length];
      const x1 = cx + Math.cos(a) * r * 0.6;
      const y1 = cy + Math.sin(a) * r * 0.6;
      const x2 = cx + Math.cos(nextA) * r * 0.6;
      const y2 = cy + Math.sin(nextA) * r * 0.6;
      this._drawGlowLine(ctx, x1, y1, x2, y2, lw * 0.5, moodData, gi * 0.6);
    });
    await this._delay(20);

    // 룬 기호들
    angles.forEach(a => {
      const rx = cx + Math.cos(a) * r * 0.6;
      const ry = cy + Math.sin(a) * r * 0.6;
      this._drawRuneGlyph(ctx, rx, ry, r * 0.12, a, lw * 0.7, moodData, gi);
    });
    await this._delay(20);

    // 중심 원
    this._drawGlowCircle(ctx, cx, cy, r * 0.2, lw * 0.8, moodData, gi);
    // 중심 별
    this._drawStar(ctx, cx, cy, r * 0.1, r * 0.05, 5, lw * 0.6, moodData, gi);
  }

  async _drawRitualSymmetry(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 중앙 다이아몬드
    const pts = [
      { x: cx, y: cy - r * 0.7 },
      { x: cx + r * 0.5, y: cy },
      { x: cx, y: cy + r * 0.7 },
      { x: cx - r * 0.5, y: cy }
    ];
    this._drawGlowPolygon(ctx, pts, lw * 0.9, moodData, gi);
    await this._delay(20);

    // 대각선
    if (sym !== 'intentional_imbalance') {
      this._drawGlowLine(ctx, cx - r * 0.35, cy - r * 0.5, cx + r * 0.35, cy - r * 0.5, lw * 0.6, moodData, gi * 0.7);
      this._drawGlowLine(ctx, cx - r * 0.35, cy + r * 0.5, cx + r * 0.35, cy + r * 0.5, lw * 0.6, moodData, gi * 0.7);
    }
    await this._delay(20);

    // 좌우 대칭 선
    [-1, 1].forEach(side => {
      const sx = cx + side * r * 0.5;
      [0.2, 0, -0.2].forEach(dy => {
        const ty = cy + r * dy;
        this._drawGlowLine(ctx, sx, ty, cx, ty, lw * 0.5, moodData, gi * 0.6);
      });
    });

    this._drawGlowCircle(ctx, cx, cy, r * 0.12, lw * 0.9, moodData, gi);
  }

  async _drawLunarBond(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 보름달 원
    this._drawGlowCircle(ctx, cx, cy, r * 0.7, lw * 0.9, moodData, gi);
    await this._delay(20);

    // 초승달 아치
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw * 0.8;
    ctx.beginPath();
    ctx.arc(cx - r * 0.15, cy, r * 0.7, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();
    ctx.restore();
    await this._delay(20);

    // 별자리 점
    const starCount = sym === 'full' ? 7 : 5;
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2;
      const rr = r * (0.3 + (i % 3) * 0.12);
      const sx = cx + Math.cos(angle) * rr;
      const sy = cy + Math.sin(angle) * rr;
      this._drawGlowDot(ctx, sx, sy, lw * 1.2, moodData, gi);
    }
    await this._delay(20);

    // 중심
    this._drawGlowCircle(ctx, cx, cy, r * 0.12, lw * 0.9, moodData, gi);
  }

  // ============================================================
  // 현대형 패턴들
  // ============================================================

  async _drawMinimalLogo(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 외곽 얇은 원
    this._drawGlowCircle(ctx, cx, cy, r, lw * 0.6, moodData, gi * 0.6);
    await this._delay(20);

    // C + S 모노그램 스타일 심볼
    const rr = r * 0.45;
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw * 1.1;
    ctx.lineCap = 'round';

    // 왼쪽 아치 (C)
    ctx.beginPath();
    ctx.arc(cx - rr * 0.2, cy, rr * 0.65, Math.PI * 0.3, Math.PI * 1.7);
    ctx.stroke();

    // 오른쪽 S 곡선
    ctx.beginPath();
    ctx.arc(cx + rr * 0.25, cy - rr * 0.3, rr * 0.4, Math.PI * 1.2, Math.PI * 2.2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + rr * 0.05, cy + rr * 0.3, rr * 0.4, Math.PI * 0.2, Math.PI * 1.2, false);
    ctx.stroke();
    ctx.restore();

    await this._delay(20);

    // 중앙 점
    this._drawGlowDot(ctx, cx, cy, lw * 2, moodData, gi);
  }

  async _drawGeometric(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 외곽 원
    this._drawGlowCircle(ctx, cx, cy, r, lw * 0.7, moodData, gi * 0.7);
    await this._delay(20);

    // 내부 다각형
    const sides = sym === 'full' ? 6 : sym === 'bilateral' ? 4 : sym === 'radial' ? 8 : 5;
    const angleOffset = -Math.PI / 2;
    const polyPts = Array.from({ length: sides }, (_, i) => ({
      x: cx + Math.cos(angleOffset + (i / sides) * Math.PI * 2) * r * 0.7,
      y: cy + Math.sin(angleOffset + (i / sides) * Math.PI * 2) * r * 0.7
    }));
    this._drawGlowPolygon(ctx, polyPts, lw * 0.9, moodData, gi);
    await this._delay(20);

    // 내부 다각형 2
    const innerPts = polyPts.map(p => ({
      x: cx + (p.x - cx) * 0.55,
      y: cy + (p.y - cy) * 0.55
    }));
    this._drawGlowPolygon(ctx, innerPts, lw * 0.6, moodData, gi * 0.8);
    await this._delay(20);

    // 꼭짓점 연결선 (별)
    if (sides <= 6) {
      for (let i = 0; i < sides; i++) {
        const skip = Math.floor(sides / 2);
        const j = (i + skip) % sides;
        this._drawGlowLine(ctx, polyPts[i].x, polyPts[i].y, polyPts[j].x, polyPts[j].y, lw * 0.4, moodData, gi * 0.5);
      }
    }

    this._drawGlowCircle(ctx, cx, cy, r * 0.1, lw * 0.9, moodData, gi);
  }

  async _drawNeonSymbol(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 강한 글로우 원
    this._drawGlowCircle(ctx, cx, cy, r, lw * 0.7, moodData, gi * 1.2);
    this._drawGlowCircle(ctx, cx, cy, r * 0.75, lw * 0.5, moodData, gi * 1.1);
    await this._delay(20);

    // 번개 심볼
    const bolt = [
      { x: cx + r * 0.1, y: cy - r * 0.6 },
      { x: cx - r * 0.15, y: cy - r * 0.05 },
      { x: cx + r * 0.08, y: cy - r * 0.05 },
      { x: cx - r * 0.1, y: cy + r * 0.6 },
      { x: cx + r * 0.15, y: cy + r * 0.05 },
      { x: cx - r * 0.08, y: cy + r * 0.05 }
    ];

    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw * 1.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    bolt.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    await this._delay(20);

    // 방사 선들
    const rayCount = sym === 'full' ? 8 : 6;
    for (let i = 0; i < rayCount; i++) {
      const a = (i / rayCount) * Math.PI * 2;
      const rx1 = cx + Math.cos(a) * r * 0.82;
      const ry1 = cy + Math.sin(a) * r * 0.82;
      const rx2 = cx + Math.cos(a) * r * 0.97;
      const ry2 = cy + Math.sin(a) * r * 0.97;
      this._drawGlowLine(ctx, rx1, ry1, rx2, ry2, lw * 0.5, moodData, gi * 0.8);
    }
  }

  async _drawEmblem(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 배지 외곽
    const shieldPts = this._getShieldPoints(cx, cy, r);
    this._drawGlowPolygon(ctx, shieldPts, lw, moodData, gi);
    await this._delay(20);

    // 내부 배지
    const innerShield = this._getShieldPoints(cx, cy, r * 0.72);
    this._drawGlowPolygon(ctx, innerShield, lw * 0.6, moodData, gi * 0.8);
    await this._delay(20);

    // 가로 분할선
    this._drawGlowLine(ctx, cx - r * 0.45, cy - r * 0.05, cx + r * 0.45, cy - r * 0.05, lw * 0.6, moodData, gi * 0.7);
    await this._delay(20);

    // 상단 문양 (소원)
    this._drawGlowCircle(ctx, cx, cy - r * 0.28, r * 0.15, lw * 0.8, moodData, gi * 0.9);

    // 하단 별
    this._drawStar(ctx, cx, cy + r * 0.22, r * 0.2, r * 0.1, 5, lw * 0.7, moodData, gi);
  }

  async _drawAbstract(ctx, cx, cy, r, lw, moodData, gi, sym) {
    // 자유로운 곡선들
    const curves = [
      { sx: cx - r * 0.6, sy: cy - r * 0.4, ex: cx + r * 0.6, ey: cy - r * 0.2, cpx: cx, cpy: cy - r * 0.8 },
      { sx: cx + r * 0.5, sy: cy - r * 0.5, ex: cx - r * 0.4, ey: cy + r * 0.5, cpx: cx + r * 0.8, cpy: cy },
      { sx: cx - r * 0.5, sy: cy + r * 0.3, ex: cx + r * 0.4, ey: cy - r * 0.3, cpx: cx - r * 0.8, cpy: cy - r * 0.1 }
    ];

    curves.forEach(c => {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = moodData.glow;
      ctx.strokeStyle = moodData.line;
      ctx.lineWidth = lw * 0.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(c.sx, c.sy);
      ctx.quadraticCurveTo(c.cpx, c.cpy, c.ex, c.ey);
      ctx.stroke();
      ctx.restore();
    });
    await this._delay(20);

    if (sym === 'full' || sym === 'bilateral') {
      curves.forEach(c => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = moodData.glow;
        ctx.strokeStyle = moodData.line;
        ctx.lineWidth = lw * 0.5;
        ctx.globalAlpha = 0.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(2 * cx - c.sx, c.sy);
        ctx.quadraticCurveTo(2 * cx - c.cpx, c.cpy, 2 * cx - c.ex, c.ey);
        ctx.stroke();
        ctx.restore();
      });
    }

    this._drawGlowCircle(ctx, cx, cy, r * 0.12, lw * 0.9, moodData, gi);
  }

  async _drawCrystal(ctx, cx, cy, r, lw, moodData, gi, sym) {
    const facets = sym === 'full' ? 8 : sym === 'radial' ? 6 : 7;
    const outer = Array.from({ length: facets }, (_, i) => ({
      x: cx + Math.cos(-Math.PI / 2 + (i / facets) * Math.PI * 2) * r * 0.85,
      y: cy + Math.sin(-Math.PI / 2 + (i / facets) * Math.PI * 2) * r * 0.85
    }));
    const inner = Array.from({ length: facets }, (_, i) => ({
      x: cx + Math.cos(-Math.PI / 2 + ((i + 0.5) / facets) * Math.PI * 2) * r * 0.5,
      y: cy + Math.sin(-Math.PI / 2 + ((i + 0.5) / facets) * Math.PI * 2) * r * 0.5
    }));

    this._drawGlowPolygon(ctx, outer, lw * 0.8, moodData, gi);
    await this._delay(20);
    this._drawGlowPolygon(ctx, inner, lw * 0.6, moodData, gi * 0.8);
    await this._delay(20);

    outer.forEach((op, i) => {
      const ip = inner[i];
      this._drawGlowLine(ctx, op.x, op.y, ip.x, ip.y, lw * 0.4, moodData, gi * 0.6);
      const prevIp = inner[(i + facets - 1) % facets];
      this._drawGlowLine(ctx, op.x, op.y, prevIp.x, prevIp.y, lw * 0.4, moodData, gi * 0.6);
    });
    await this._delay(20);

    this._drawGlowCircle(ctx, cx, cy, r * 0.15, lw * 0.9, moodData, gi);
  }

  // ============================================================
  // 의도 기반 중심 문양
  // ============================================================

  async _drawIntentCenter(ctx, cx, cy, r, lw, moodData, gi, purposes) {
    if (!purposes || purposes.length === 0) return;
    const p = purposes[0];
    const cr = r * 0.2;

    switch (p) {
      case 'protection':
        this._drawStar(ctx, cx, cy, cr, cr * 0.5, 6, lw * 0.8, moodData, gi);
        break;
      case 'purification':
        this._drawStar(ctx, cx, cy, cr, cr * 0.6, 8, lw * 0.7, moodData, gi);
        break;
      case 'prosperity':
        this._drawStar(ctx, cx, cy, cr, cr * 0.5, 4, lw * 0.8, moodData, gi);
        break;
      case 'focus':
        // 화살표 형태
        this._drawGlowLine(ctx, cx, cy - cr, cx, cy + cr * 0.3, lw * 0.9, moodData, gi);
        this._drawGlowLine(ctx, cx - cr * 0.4, cy - cr * 0.4, cx, cy - cr, lw * 0.9, moodData, gi);
        this._drawGlowLine(ctx, cx + cr * 0.4, cy - cr * 0.4, cx, cy - cr, lw * 0.9, moodData, gi);
        break;
      case 'recovery':
        this._drawStar(ctx, cx, cy, cr, cr * 0.5, 5, lw * 0.7, moodData, gi);
        break;
      case 'block':
        // X 형태
        this._drawGlowLine(ctx, cx - cr, cy - cr, cx + cr, cy + cr, lw * 0.9, moodData, gi);
        this._drawGlowLine(ctx, cx + cr, cy - cr, cx - cr, cy + cr, lw * 0.9, moodData, gi);
        break;
      case 'connection':
        // 무한대 형태
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = moodData.glow;
        ctx.strokeStyle = moodData.line;
        ctx.lineWidth = lw * 0.8;
        ctx.beginPath();
        ctx.ellipse(cx - cr * 0.4, cy, cr * 0.45, cr * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + cr * 0.4, cy, cr * 0.45, cr * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      case 'intuition':
        // 눈 형태
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = moodData.glow;
        ctx.strokeStyle = moodData.line;
        ctx.lineWidth = lw * 0.8;
        ctx.beginPath();
        ctx.moveTo(cx - cr, cy);
        ctx.quadraticCurveTo(cx, cy - cr * 0.6, cx + cr, cy);
        ctx.quadraticCurveTo(cx, cy + cr * 0.6, cx - cr, cy);
        ctx.stroke();
        ctx.restore();
        this._drawGlowDot(ctx, cx, cy, lw * 2, moodData, gi);
        break;
      default:
        this._drawGlowCircle(ctx, cx, cy, cr * 0.4, lw * 0.8, moodData, gi);
    }
  }

  async _drawModernIntentAccent(ctx, cx, cy, r, lw, moodData, gi, purposes) {
    if (!purposes || purposes.length === 0) return;
    const count = purposes.length;
    if (count <= 1) return;

    // 작은 점들로 다중 의도 표현
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(a) * r * 0.88;
      const py = cy + Math.sin(a) * r * 0.88;
      this._drawGlowDot(ctx, px, py, lw * 1.5, moodData, gi * 0.8);
    }
  }

  // ============================================================
  // 보조 드로잉 함수들
  // ============================================================

  _drawBackground(ctx, W, H, moodData) {
    // 미세 노이즈 텍스처
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;
    const bgR = parseInt(moodData.bg.slice(1, 3), 16);
    const bgG = parseInt(moodData.bg.slice(3, 5), 16);
    const bgB = parseInt(moodData.bg.slice(5, 7), 16);

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.max(0, Math.min(255, bgR + noise));
      data[i + 1] = Math.max(0, Math.min(255, bgG + noise));
      data[i + 2] = Math.max(0, Math.min(255, bgB + noise));
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // 중앙 안개 효과
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.6);
    const glowR = parseInt(moodData.glow.slice(1, 3), 16);
    const glowG = parseInt(moodData.glow.slice(3, 5), 16);
    const glowB = parseInt(moodData.glow.slice(5, 7), 16);
    grad.addColorStop(0, `rgba(${glowR},${glowG},${glowB},0.06)`);
    grad.addColorStop(1, `rgba(${glowR},${glowG},${glowB},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  _drawGlowCircle(ctx, cx, cy, r, lw, moodData, gi) {
    ctx.save();
    ctx.shadowBlur = Math.max(8, lw * gi * 15);
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawGlowLine(ctx, x1, y1, x2, y2, lw, moodData, gi) {
    ctx.save();
    ctx.shadowBlur = Math.max(6, lw * gi * 12);
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  _drawGlowPolygon(ctx, pts, lw, moodData, gi) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.shadowBlur = Math.max(8, lw * gi * 12);
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  _drawGlowDot(ctx, x, y, r, moodData, gi) {
    ctx.save();
    ctx.shadowBlur = r * gi * 8;
    ctx.shadowColor = moodData.glow;
    ctx.fillStyle = moodData.line;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawStar(ctx, cx, cy, outerR, innerR, points, lw, moodData, gi) {
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2;
      const rr = i % 2 === 0 ? outerR : innerR;
      pts.push({ x: cx + Math.cos(angle) * rr, y: cy + Math.sin(angle) * rr });
    }
    this._drawGlowPolygon(ctx, pts, lw, moodData, gi);
  }

  _drawRuneGlyph(ctx, cx, cy, size, rotation, lw, moodData, gi) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.shadowBlur = 12;
    ctx.shadowColor = moodData.glow;
    ctx.strokeStyle = moodData.line;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';

    // 기본 룬 구조
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.2);
    ctx.lineTo(size * 0.5, size * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  _drawDotStars(ctx, cx, cy, r, moodData, gi) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const rr = r * (0.82 + (i % 3) * 0.05);
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      this._drawGlowDot(ctx, px, py, 1.5, moodData, gi * 0.8);
    }
  }

  _drawCrossAxis(ctx, cx, cy, r, lw, moodData, gi) {
    [[0, -r], [0, r], [-r, 0], [r, 0]].forEach(([dx, dy]) => {
      this._drawGlowLine(ctx, cx, cy, cx + dx, cy + dy, lw, moodData, gi);
    });
  }

  _getShieldPoints(cx, cy, r) {
    return [
      { x: cx - r * 0.6, y: cy - r * 0.8 },
      { x: cx + r * 0.6, y: cy - r * 0.8 },
      { x: cx + r * 0.75, y: cy - r * 0.2 },
      { x: cx, y: cy + r * 0.85 },
      { x: cx - r * 0.75, y: cy - r * 0.2 }
    ];
  }

  _getLineWidth(lineStyle, W) {
    const base = W / 400;
    switch (lineStyle) {
      case 'thin_ink': return base * 1.0;
      case 'carved': return base * 1.8;
      case 'rough_script': return base * 1.4;
      case 'sharp_angle': return base * 1.6;
      case 'monoline': return base * 1.2;
      case 'double_line': return base * 2.0;
      case 'glow_line': return base * 1.3;
      case 'chrome_line': return base * 1.8;
      default: return base * 1.3;
    }
  }

  _setProgress(val) {
    if (this.onProgress) this.onProgress(val);
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

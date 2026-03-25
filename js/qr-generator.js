/**
 * CREOSIGIL QR Generator
 * 순수 JavaScript QR 코드 생성기 (외부 라이브러리 없음)
 * QR Code Version 3 (29x29), ECC Level M 기반
 */
window.CreoQR = (function () {
  'use strict';

  /* ─── GF(256) ─── */
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  !function () {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if (x & 256) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  }();
  const mul = (a, b) => (!a || !b) ? 0 : EXP[(LOG[a] + LOG[b]) % 255];

  function polyMul(p, q) {
    const r = new Uint8Array(p.length + q.length - 1);
    for (let i = 0; i < p.length; i++)
      for (let j = 0; j < q.length; j++)
        r[i + j] ^= mul(p[i], q[j]);
    return r;
  }

  function rsEncode(data, nec) {
    let gen = new Uint8Array([1]);
    for (let i = 0; i < nec; i++) gen = polyMul(gen, new Uint8Array([1, EXP[i]]));
    const msg = new Uint8Array(data.length + nec);
    msg.set(data);
    for (let i = 0; i < data.length; i++) {
      const c = msg[i];
      if (c) for (let j = 1; j < gen.length; j++) msg[i + j] ^= mul(gen[j], c);
    }
    return Array.from(msg.slice(data.length));
  }

  /* ─── 텍스트 → UTF-8 바이트 ─── */
  function toBytes(text) {
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const cp = text.codePointAt(i);
      if (cp < 0x80) out.push(cp);
      else if (cp < 0x800) out.push(0xC0 | cp >> 6, 0x80 | cp & 63);
      else if (cp < 0x10000) out.push(0xE0 | cp >> 12, 0x80 | (cp >> 6 & 63), 0x80 | cp & 63);
      else { out.push(0xF0 | cp >> 18, 0x80 | (cp >> 12 & 63), 0x80 | (cp >> 6 & 63), 0x80 | cp & 63); i++; }
    }
    return out;
  }

  /* ─── 버전 선택 (Byte mode, ECC M) ─── */
  // [version, size, data_codewords, ec_codewords]
  const CAPS = [
    [1, 21, 16, 10],
    [2, 25, 28, 16],
    [3, 29, 44, 26],
    [4, 33, 64, 36],
    [5, 37, 86, 48],
    [6, 41, 108, 64],
    [7, 45, 124, 72],
    [8, 49, 154, 88],
    [9, 53, 182, 110],
    [10, 57, 216, 130],
  ];

  function pickVersion(nbytes) {
    // overhead: 4 (mode) + 8 (length indicator for v<=9) + 4 (terminator) = 2 bytes overhead
    for (const v of CAPS) if (v[2] - 2 >= nbytes) return v;
    return CAPS[CAPS.length - 1];
  }

  /* ─── 비트 스트림 ─── */
  function buildBits(bytes, dataWords) {
    const bits = [];
    const push = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
    push(0b0100, 4);          // Byte mode
    push(bytes.length, 8);    // char count (version ≤ 9)
    for (const b of bytes) push(b, 8);
    // terminator
    for (let i = 0; i < 4 && bits.length < dataWords * 8; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    // pad codewords
    let pi = 0;
    while (bits.length < dataWords * 8) { push([0xEC, 0x11][pi++ & 1], 8); }
    return bits;
  }

  function bitsToBytes(bits) {
    const out = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] || 0);
      out.push(b);
    }
    return out;
  }

  /* ─── 매트릭스 ─── */
  function makeMatrix(size) {
    return {
      mod: Array.from({ length: size }, () => new Uint8Array(size)), // 0=white,1=dark
      fun: Array.from({ length: size }, () => new Uint8Array(size)), // 1=function module
      size,
      set(r, c, v, f) { this.mod[r][c] = v; if (f) this.fun[r][c] = 1; },
      isFun(r, c) { return !!this.fun[r][c]; },
    };
  }

  const ALIGN_POS = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 28, 46], [6, 32, 50]];

  function fillMatrix(m, codewords, version) {
    const N = m.size;

    /* Finder patterns */
    const finder = (tr, tc) => {
      for (let r = -1; r <= 7; r++)
        for (let c = -1; c <= 7; c++) {
          if (tr + r < 0 || tr + r >= N || tc + c < 0 || tc + c >= N) continue;
          const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
          const border = r === 0 || r === 6 || c === 0 || c === 6;
          const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          m.set(tr + r, tc + c, (inside && (border || center)) ? 1 : 0, true);
        }
    };
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);

    /* Timing patterns */
    for (let i = 8; i < N - 8; i++) {
      if (!m.isFun(6, i)) m.set(6, i, i % 2 === 0 ? 1 : 0, true);
      if (!m.isFun(i, 6)) m.set(i, 6, i % 2 === 0 ? 1 : 0, true);
    }

    /* Alignment patterns */
    const ap = ALIGN_POS[version] || [];
    for (const ar of ap) for (const ac of ap) {
      if (m.isFun(ar, ac)) continue;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++) {
          const v = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0;
          m.set(ar + dr, ac + dc, v, true);
        }
    }

    /* Dark module */
    m.set(N - 8, 8, 1, true);

    /* Reserve format areas */
    const reserveFormat = () => {
      for (let i = 0; i <= 8; i++) {
        if (!m.isFun(8, i)) m.set(8, i, 0, true);
        if (!m.isFun(i, 8)) m.set(i, 8, 0, true);
      }
      for (let i = N - 8; i < N; i++) {
        if (!m.isFun(8, i)) m.set(8, i, 0, true);
        if (!m.isFun(i, 8)) m.set(i, 8, 0, true);
      }
    };
    reserveFormat();

    /* Place data codewords */
    let idx = 0;
    const totalBits = codewords.length * 8;
    let up = true;
    for (let right = N - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < N; vert++) {
        const row = up ? N - 1 - vert : vert;
        for (let j = 0; j < 2; j++) {
          const col = right - j;
          if (!m.isFun(row, col) && idx < totalBits) {
            const b = codewords[idx >> 3];
            m.set(row, col, (b >> (7 - (idx & 7))) & 1);
            idx++;
          }
        }
      }
      up = !up;
    }

    /* Apply mask pattern 5: (row*col)%2 + (row*col)%3 == 0 */
    const MASK = 5;
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++)
        if (!m.isFun(r, c)) {
          let inv = false;
          switch (MASK) {
            case 0: inv = (r + c) % 2 === 0; break;
            case 1: inv = r % 2 === 0; break;
            case 2: inv = c % 3 === 0; break;
            case 3: inv = (r + c) % 3 === 0; break;
            case 4: inv = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
            case 5: inv = (r * c) % 2 + (r * c) % 3 === 0; break;
            case 6: inv = ((r * c) % 2 + (r * c) % 3) % 2 === 0; break;
            case 7: inv = ((r + c) % 2 + (r * c) % 3) % 2 === 0; break;
          }
          if (inv) m.mod[r][c] ^= 1;
        }

    /* Write format information (ECC M=01, Mask=MASK) */
    const writeFormat = () => {
      const data = (0b01 << 3) | MASK; // ECC level M = 01
      const poly = 0b10100110111;
      let fmt = data << 10;
      for (let i = 9; i >= 0; i--) if ((fmt >> (i + 10)) & 1) fmt ^= poly << i;
      const bits = ((data << 10) | (fmt & 0x3FF)) ^ 0b101010000010010;

      // Horizontal strip (row 8)
      const h = [0,1,2,3,4,5,7,8, N-8,N-7,N-6,N-5,N-4,N-3,N-2,N-1];
      // Vertical strip (col 8)
      const v = [0,1,2,3,4,5,7,8, N-7,N-6,N-5,N-4,N-3,N-2,N-1];

      for (let i = 0; i < 8; i++) {
        m.set(8, h[i], (bits >> i) & 1, true);
        m.set(v[i], 8, (bits >> i) & 1, true);
      }
      for (let i = 8; i < 15; i++) {
        m.set(8, h[i], (bits >> i) & 1, true);
        if (v[i] !== undefined) m.set(v[i], 8, (bits >> i) & 1, true);
      }
    };
    writeFormat();
  }

  /* ─── 공개 API ─── */
  function render(canvas, text, opts) {
    opts = Object.assign({ size: 200, margin: 8, darkColor: '#000', lightColor: '#fff' }, opts);

    const raw = toBytes(text || 'CREOSIGIL');
    const [version, qrSize, dataWords, ecWords] = pickVersion(raw.length);

    // 데이터 비트 → 바이트
    const bits = buildBits(raw, dataWords);
    const data = bitsToBytes(bits);

    // 에러 정정
    const ec = rsEncode(new Uint8Array(data), ecWords);
    const allBytes = data.concat(ec);

    // 매트릭스 생성
    const m = makeMatrix(qrSize);
    fillMatrix(m, allBytes, version);

    // Canvas 렌더링
    const cell = Math.floor((opts.size - opts.margin * 2) / qrSize);
    const total = cell * qrSize + opts.margin * 2;
    canvas.width = total;
    canvas.height = total;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = opts.lightColor;
    ctx.fillRect(0, 0, total, total);
    ctx.fillStyle = opts.darkColor;
    for (let r = 0; r < qrSize; r++)
      for (let c = 0; c < qrSize; c++)
        if (m.mod[r][c])
          ctx.fillRect(opts.margin + c * cell, opts.margin + r * cell, cell, cell);

    return true;
  }

  return { render };
}());

// CREOSIGIL — Main App Logic
'use strict';

// ========== STATE ==========
const state = {
  currentScreen: 'home',
  sigilType: null, // 'traditional' | 'modern'
  selectedPurposes: [],
  // Traditional selections
  trad: {
    structure: null,
    symbol: null,
    density: null,
    lineStyle: null,
    symmetry: null,
    decoration: null,
  },
  // Modern selections
  modern: {
    style: null,
    lineStyle: null,
    complexity: null,
    symmetry: null,
  },
  mood: null,
  // Edit settings
  edit: {
    scale: 0.75,
    lineWeight: 0.5,
    glow: 0.6,
    colorIdx: 0,
    bgIdx: 1,
    ratio: 'qhd',
    rotation: 0,
    posY: 0.5,
  },
  savedSigilData: null,
  resolutionIdx: 1, // QHD by default
  library: [],
};

// ========== DOM ==========
let sigilEngine = null;
let genCanvas = null;
let editCanvas = null;
let saveCanvas = null;
let genAnimId = null;

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  loadLibrary();
  setupScreens();
  setupHomeButtons();
  showScreen('home');
  renderRecentGrid();
  setupPWAInstall();
});

function setupScreens() {
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target || 'home';
      showScreen(target);
    });
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }
  state.currentScreen = screenId;
}

// ========== HOME ==========
function setupHomeButtons() {
  document.getElementById('btn-start-fast')?.addEventListener('click', startFastMode);
  document.getElementById('btn-start-precise')?.addEventListener('click', startPreciseMode);
  document.getElementById('btn-view-library')?.addEventListener('click', () => {
    renderLibraryScreen();
    showScreen('library');
  });

  // QR button
  document.getElementById('btn-qr')?.addEventListener('click', openQRModal);
}

function startFastMode() {
  state.sigilType = null;
  state.selectedPurposes = [];
  state.trad = { structure: null, symbol: null, density: null, lineStyle: null, symmetry: null, decoration: null };
  state.modern = { style: null, lineStyle: null, complexity: null, symmetry: null };
  state.mood = null;
  renderPurposeScreen();
  showScreen('purpose');
}

function startPreciseMode() {
  startFastMode();
}

// ========== PURPOSE SELECTION ==========
function renderPurposeScreen() {
  const container = document.getElementById('purpose-options');
  if (!container) return;
  container.innerHTML = '';
  PURPOSES.forEach(p => {
    const card = document.createElement('div');
    card.className = 'option-card' + (state.selectedPurposes.includes(p.id) ? ' selected' : '');
    card.dataset.id = p.id;
    card.innerHTML = `
      <span class="option-icon">${p.icon}</span>
      <div class="option-name">${p.name}</div>
      <div class="option-desc">${p.desc}</div>
    `;
    card.addEventListener('click', () => togglePurpose(p.id));
    container.appendChild(card);
  });
  updatePurposeAdvice();

  document.getElementById('btn-purpose-next')?.addEventListener('click', () => {
    if (state.selectedPurposes.length === 0) {
      showToast('목적을 하나 이상 선택해주세요');
      return;
    }
    renderTypeScreen();
    showScreen('type');
  });
}

function togglePurpose(id) {
  const idx = state.selectedPurposes.indexOf(id);
  if (idx >= 0) {
    state.selectedPurposes.splice(idx, 1);
  } else {
    state.selectedPurposes.push(id);
  }
  // Highlight selected
  document.querySelectorAll('#purpose-options .option-card').forEach(card => {
    card.classList.toggle('selected', state.selectedPurposes.includes(card.dataset.id));
  });
  updatePurposeAdvice();
}

function updatePurposeAdvice() {
  const box = document.getElementById('purpose-dynamic-advice');
  if (!box) return;
  const count = state.selectedPurposes.length;
  if (count === 0) {
    box.classList.remove('visible');
    return;
  }
  box.classList.add('visible');
  const t = ADVICE_TEXTS.purpose;
  if (count === 1) box.textContent = t.single;
  else if (count === 2) box.textContent = t.double;
  else box.textContent = t.triple;
}

// ========== TYPE SELECTION ==========
function renderTypeScreen() {
  // Re-attach click handlers (remove old ones by cloning)
  document.querySelectorAll('#type-options .type-card').forEach(card => {
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    newCard.classList.toggle('selected', state.sigilType === newCard.dataset.type);
    newCard.addEventListener('click', function() {
      state.sigilType = this.dataset.type;
      document.querySelectorAll('#type-options .type-card').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  const nextBtn = document.getElementById('btn-type-next');
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (!state.sigilType) {
        showToast('전통형 또는 현대형을 선택해주세요');
        return;
      }
      if (state.sigilType === 'traditional') {
        renderTradScreen();
        showScreen('trad-options');
      } else {
        renderModernScreen();
        showScreen('modern-options');
      }
    };
  }
}

// ========== TRADITIONAL OPTIONS ==========
function renderTradScreen() {
  // Structures
  renderOptionGroup('trad-structure', TRAD_STRUCTURES, 'structure', state.trad, 'trad');
  // Symbols
  renderOptionGroup('trad-symbol', TRAD_SYMBOLS, 'symbol', state.trad, 'trad');
  // Density
  renderOptionGroup('trad-density', TRAD_DENSITY, 'density', state.trad, 'trad');
  // Line styles
  renderOptionGroup('trad-line', TRAD_LINE_STYLES, 'lineStyle', state.trad, 'trad');
  // Symmetry
  renderOptionGroup('trad-symmetry', TRAD_SYMMETRY, 'symmetry', state.trad, 'trad');
  // Decorations
  renderOptionGroup('trad-decoration', TRAD_DECORATIONS, 'decoration', state.trad, 'trad');

  const nextBtn = document.getElementById('btn-trad-next');
  if (nextBtn) {
    nextBtn.onclick = () => validateAndProceed('trad');
  }
}

function renderOptionGroup(containerId, items, stateKey, stateObj, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'option-card' + (stateObj[stateKey] === item.id ? ' selected' : '');
    card.dataset.id = item.id;
    card.dataset.group = stateKey;

    const iconHtml = item.icon ? `<span class="option-icon">${item.icon}</span>` : '';
    const detailHtml = item.detail ? `
      <div class="more-expand" style="display:none; margin-top:6px; font-size:11px; color:var(--text-muted); line-height:1.6;">${item.detail}</div>
      <button class="btn-more" style="margin-top:4px;" data-expand="${containerId}_${item.id}">▼ 더 보기</button>
    ` : '';

    card.innerHTML = `
      ${iconHtml}
      <div class="option-name">${item.name}</div>
      <div class="option-desc">${item.desc}</div>
      ${detailHtml}
    `;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-more')) return;
      stateObj[stateKey] = item.id;
      container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected', 'required-error'));
      card.classList.add('selected');
    });

    // More button inside card
    const moreBtn = card.querySelector('.btn-more');
    if (moreBtn) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expandEl = card.querySelector('.more-expand');
        if (!expandEl) return;
        const isOpen = expandEl.style.display === 'block';
        expandEl.style.display = isOpen ? 'none' : 'block';
        moreBtn.textContent = isOpen ? '▼ 더 보기' : '▲ 간략히';
      });
    }
    container.appendChild(card);
  });
}

// ========== VALIDATION ==========
function validateAndProceed(type) {
  const errorEl = document.getElementById(`${type}-validation-error`);
  const requiredGroups = type === 'trad' ? TRAD_REQUIRED_GROUPS : MODERN_REQUIRED_GROUPS;
  const stateObj = type === 'trad' ? state.trad : state.modern;
  const containerMap = {
    trad: {
      structure: 'trad-structure',
      symbol: 'trad-symbol',
      density: 'trad-density',
      lineStyle: 'trad-line',
      symmetry: 'trad-symmetry',
    },
    modern: {
      style: 'modern-style',
      lineStyle: 'modern-line',
      complexity: 'modern-complexity',
      symmetry: 'modern-symmetry',
    }
  };

  const missing = requiredGroups.filter(key => !stateObj[key]);
  if (missing.length > 0) {
    if (errorEl) {
      const names = missing.map(k => {
        const nameMap = {
          structure: '봉인 구조',
          symbol: '중심 상징',
          density: '상징 밀도',
          lineStyle: '선 스타일',
          symmetry: '대칭 방식',
          style: '표현 스타일',
          complexity: '복잡도',
        };
        return nameMap[k] || k;
      });
      errorEl.textContent = `선택하지 않은 항목이 있습니다: ${names.join(', ')}`;
      errorEl.classList.add('visible');
    }

    // Shake missing groups and scroll to first
    let firstMissingEl = null;
    missing.forEach(key => {
      const cid = containerMap[type][key];
      if (!cid) return;
      const el = document.getElementById(cid);
      if (!el) return;
      el.querySelectorAll('.option-card').forEach(c => {
        c.classList.add('required-error');
        setTimeout(() => c.classList.remove('required-error'), 600);
      });
      if (!firstMissingEl) firstMissingEl = el;
    });

    if (firstMissingEl) {
      firstMissingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (errorEl) errorEl.classList.remove('visible');
  renderMoodScreen();
  showScreen('mood');
}

// ========== MODERN OPTIONS ==========
function renderModernScreen() {
  renderOptionGroup('modern-style', MODERN_STYLES, 'style', state.modern, 'modern');
  renderOptionGroup('modern-line', MODERN_LINE_STYLES, 'lineStyle', state.modern, 'modern');
  renderOptionGroup('modern-complexity', MODERN_COMPLEXITY, 'complexity', state.modern, 'modern');
  renderOptionGroup('modern-symmetry', MODERN_SYMMETRY, 'symmetry', state.modern, 'modern');

  const nextBtn = document.getElementById('btn-modern-next');
  if (nextBtn) {
    nextBtn.onclick = () => validateAndProceed('modern');
  }
}

// ========== MOOD SELECTION ==========
function renderMoodScreen() {
  const container = document.getElementById('mood-options');
  if (!container) return;
  container.innerHTML = '';
  MOODS.forEach(mood => {
    const card = document.createElement('div');
    card.className = 'mood-card' + (state.mood === mood.id ? ' selected' : '');
    card.dataset.id = mood.id;
    const bg = mood.colors.bg;
    const line = mood.colors.line;
    card.innerHTML = `
      <div class="mood-swatch" style="background: radial-gradient(circle, ${line}44 0%, ${bg} 100%); border-color: ${line}40;"></div>
      <div class="mood-name">${mood.name}</div>
      <div class="mood-desc">${mood.desc}</div>
    `;
    card.addEventListener('click', () => {
      state.mood = mood.id;
      container.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
    container.appendChild(card);
  });

  const nextBtn = document.getElementById('btn-mood-next');
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (!state.mood) {
        showToast('분위기를 선택해주세요');
        return;
      }
      startGeneration();
    };
  }
}

// ========== GENERATION ==========
function startGeneration() {
  showScreen('generation');

  genCanvas = document.getElementById('gen-canvas');
  if (!genCanvas) return;
  genCanvas.width = 600;
  genCanvas.height = 600;
  sigilEngine = new SigilEngine(genCanvas);

  const moodData = MOODS.find(m => m.id === state.mood) || MOODS[0];
  const bgData = BACKGROUNDS[1]; // dark gradient by default

  // Draw background
  sigilEngine.drawBackground(bgData, moodData.colors, 600, 600);

  let progress = 0;
  const progressBar = document.getElementById('gen-progress-bar');
  const progressText = document.getElementById('gen-progress-text');

  if (genAnimId) cancelAnimationFrame(genAnimId);

  function animate() {
    progress = Math.min(1, progress + 0.008);

    // Redraw
    sigilEngine.drawBackground(bgData, moodData.colors, 600, 600);
    if (state.sigilType === 'traditional') {
      sigilEngine.drawTraditional({
        structure: state.trad.structure || 'circle_seal',
        symbol: state.trad.symbol || 'circle',
        density: state.trad.density || 'medium',
        lineStyle: state.trad.lineStyle || 'thin_ink',
        symmetry: state.trad.symmetry || 'full',
        decoration: state.trad.decoration || 'outer_ring',
        moodColors: moodData.colors,
        progress,
      });
    } else {
      sigilEngine.drawModern({
        style: state.modern.style || 'minimal_logo',
        lineStyle: state.modern.lineStyle || 'monoline',
        complexity: state.modern.complexity || 'balance',
        symmetry: state.modern.symmetry || 'full',
        moodColors: moodData.colors,
        progress,
      });
    }

    const pct = Math.round(progress * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = pct + '%';

    if (progress < 1) {
      genAnimId = requestAnimationFrame(animate);
    } else {
      genAnimId = null;
      // Save final state
      state.savedSigilData = {
        type: state.sigilType,
        trad: { ...state.trad },
        modern: { ...state.modern },
        mood: state.mood,
        timestamp: Date.now(),
      };
      // Auto-proceed to edit after short delay
      setTimeout(() => {
        setupEditScreen();
        showScreen('edit');
      }, 500);
    }
  }

  genAnimId = requestAnimationFrame(animate);
}

// ========== EDIT SCREEN ==========
function setupEditScreen() {
  editCanvas = document.getElementById('edit-canvas');
  if (!editCanvas) return;
  editCanvas.width = 480;
  editCanvas.height = 854;

  renderEditCanvas();

  // Ratio buttons
  document.querySelectorAll('.ratio-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      state.edit.ratio = this.dataset.ratio;
      renderEditCanvas();
    });
  });

  // Sliders
  const makeSlider = (id, stateKey, min, max) => {
    const slider = document.getElementById(id);
    const valEl = document.getElementById(id + '-val');
    if (!slider) return;
    slider.value = Math.round(((state.edit[stateKey] - min) / (max - min)) * 100);
    if (valEl) valEl.textContent = Math.round(state.edit[stateKey] * 100);
    slider.addEventListener('input', () => {
      state.edit[stateKey] = min + (slider.value / 100) * (max - min);
      if (valEl) valEl.textContent = Math.round(state.edit[stateKey] * 100);
      renderEditCanvas();
    });
  };
  makeSlider('ctrl-scale', 'scale', 0.3, 1.0);
  makeSlider('ctrl-glow', 'glow', 0, 1);
  makeSlider('ctrl-lineweight', 'lineWeight', 0.3, 1.5);

  // Color swatches
  const sigilColors = ['#C8C0E8','#D4E0F0','#F0EEF8','#E8D890','#F0D0D8','#90D0FF','#D8D4EC','#8090D8'];
  const colorSwatchContainer = document.getElementById('sigil-colors');
  if (colorSwatchContainer) {
    colorSwatchContainer.innerHTML = '';
    sigilColors.forEach((c, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch' + (state.edit.colorIdx === i ? ' active' : '');
      swatch.style.background = c;
      swatch.addEventListener('click', () => {
        state.edit.colorIdx = i;
        document.querySelectorAll('.color-swatch').forEach((s, si) => s.classList.toggle('active', si === i));
        renderEditCanvas();
      });
      colorSwatchContainer.appendChild(swatch);
    });
  }

  // Background swatches
  const bgContainer = document.getElementById('bg-swatches');
  if (bgContainer) {
    bgContainer.innerHTML = '';
    BACKGROUNDS.forEach((bg, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'bg-swatch' + (state.edit.bgIdx === i ? ' active' : '');
      swatch.style.background = bg.gradient || bg.color;
      swatch.title = bg.name;
      swatch.addEventListener('click', () => {
        state.edit.bgIdx = i;
        document.querySelectorAll('.bg-swatch').forEach((s, si) => s.classList.toggle('active', si === i));
        renderEditCanvas();
      });
      bgContainer.appendChild(swatch);
    });
  }

  // Next to save
  const saveBtn = document.getElementById('btn-edit-save');
  if (saveBtn) {
    saveBtn.onclick = () => {
      setupSaveScreen();
      showScreen('save');
    };
  }
}

function renderEditCanvas() {
  if (!editCanvas) return;
  const engine = new SigilEngine(editCanvas);
  const moodData = MOODS.find(m => m.id === state.mood) || MOODS[0];
  const bgData = BACKGROUNDS[state.edit.bgIdx] || BACKGROUNDS[1];
  const sigilColors = ['#C8C0E8','#D4E0F0','#F0EEF8','#E8D890','#F0D0D8','#90D0FF','#D8D4EC','#8090D8'];

  const customMood = {
    ...moodData.colors,
    line: sigilColors[state.edit.colorIdx] || moodData.colors.line,
    glow: sigilColors[state.edit.colorIdx] || moodData.colors.glow,
  };

  engine.drawBackground(bgData, customMood, editCanvas.width, editCanvas.height);

  const scale = state.edit.scale;
  const savedTransform = editCanvas.getContext('2d');
  const ctx = editCanvas.getContext('2d');
  ctx.save();
  ctx.translate(editCanvas.width / 2, editCanvas.height / 2 + (state.edit.posY - 0.5) * editCanvas.height * 0.2);
  ctx.scale(scale, scale);
  ctx.translate(-engine.cx, -engine.cy);

  engine.cx = editCanvas.width / 2;
  engine.cy = editCanvas.height / 2;
  engine.r = Math.min(editCanvas.width, editCanvas.height) * 0.42;

  const glowMultiplier = state.edit.glow;
  const lineMultiplier = state.edit.lineWeight;

  const adjustedMood = {
    ...customMood,
  };

  ctx.restore();

  // Simple redraw with scale applied via canvas transform
  const tCtx = editCanvas.getContext('2d');
  tCtx.save();
  tCtx.translate(editCanvas.width / 2, editCanvas.height / 2 + (state.edit.posY - 0.5) * editCanvas.height * 0.2);
  tCtx.scale(scale, scale);
  tCtx.translate(-editCanvas.width / 2, -editCanvas.height / 2);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = editCanvas.width;
  tempCanvas.height = editCanvas.height;
  const tempEngine = new SigilEngine(tempCanvas);

  if (state.sigilType === 'traditional') {
    tempEngine.drawTraditional({
      structure: state.trad.structure || 'circle_seal',
      symbol: state.trad.symbol || 'circle',
      density: state.trad.density || 'medium',
      lineStyle: state.trad.lineStyle || 'thin_ink',
      symmetry: state.trad.symmetry || 'full',
      decoration: state.trad.decoration || 'outer_ring',
      moodColors: adjustedMood,
      progress: 1,
    });
  } else {
    tempEngine.drawModern({
      style: state.modern.style || 'minimal_logo',
      lineStyle: state.modern.lineStyle || 'monoline',
      complexity: state.modern.complexity || 'balance',
      symmetry: state.modern.symmetry || 'full',
      moodColors: adjustedMood,
      progress: 1,
    });
  }
  tCtx.drawImage(tempCanvas, 0, 0);
  tCtx.restore();
}

// ========== SAVE SCREEN ==========
function setupSaveScreen() {
  saveCanvas = document.getElementById('save-canvas');
  if (!saveCanvas) return;
  saveCanvas.width = 480;
  saveCanvas.height = 854;

  renderSaveCanvas(saveCanvas);

  // Resolution presets
  document.querySelectorAll('.res-preset').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.res-preset').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const idx = parseInt(this.dataset.idx);
      state.resolutionIdx = idx;
    });
  });
  // Default active
  document.querySelector(`.res-preset[data-idx="${state.resolutionIdx}"]`)?.classList.add('active');

  // Save buttons
  document.getElementById('btn-save-wallpaper')?.addEventListener('click', () => saveAsWallpaper());
  document.getElementById('btn-save-transparent')?.addEventListener('click', () => saveAsTransparent());
  document.getElementById('btn-save-svg')?.addEventListener('click', () => saveAsSVG());
  document.getElementById('btn-share')?.addEventListener('click', () => shareImage());
  document.getElementById('btn-save-new')?.addEventListener('click', () => {
    // Save to library and reset
    saveToLibrary();
    startFastMode();
  });
  document.getElementById('btn-go-archive')?.addEventListener('click', () => {
    renderLibraryScreen();
    showScreen('library');
  });

  // Wallpaper guide tabs
  document.querySelectorAll('.guide-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.guide-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.guide-steps').forEach(s => s.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('guide-' + this.dataset.os)?.classList.add('active');
    });
  });
}

function renderSaveCanvas(canvas) {
  const engine = new SigilEngine(canvas);
  const moodData = MOODS.find(m => m.id === state.mood) || MOODS[0];
  const bgData = BACKGROUNDS[state.edit.bgIdx] || BACKGROUNDS[1];
  const sigilColors = ['#C8C0E8','#D4E0F0','#F0EEF8','#E8D890','#F0D0D8','#90D0FF','#D8D4EC','#8090D8'];
  const customMood = {
    ...moodData.colors,
    line: sigilColors[state.edit.colorIdx] || moodData.colors.line,
    glow: sigilColors[state.edit.colorIdx] || moodData.colors.glow,
  };

  engine.drawBackground(bgData, customMood, canvas.width, canvas.height);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempEngine = new SigilEngine(tempCanvas);

  if (state.sigilType === 'traditional') {
    tempEngine.drawTraditional({
      structure: state.trad.structure || 'circle_seal',
      symbol: state.trad.symbol || 'circle',
      density: state.trad.density || 'medium',
      lineStyle: state.trad.lineStyle || 'thin_ink',
      symmetry: state.trad.symmetry || 'full',
      decoration: state.trad.decoration || 'outer_ring',
      moodColors: customMood,
      progress: 1,
    });
  } else {
    tempEngine.drawModern({
      style: state.modern.style || 'minimal_logo',
      lineStyle: state.modern.lineStyle || 'monoline',
      complexity: state.modern.complexity || 'balance',
      symmetry: state.modern.symmetry || 'full',
      moodColors: customMood,
      progress: 1,
    });
  }

  canvas.getContext('2d').drawImage(tempCanvas, 0, 0);
}

// ========== EXPORT FUNCTIONS ==========
async function getHighResCanvas() {
  const res = RESOLUTIONS[state.resolutionIdx] || RESOLUTIONS[1];
  const canvas = document.createElement('canvas');
  canvas.width = res.width;
  canvas.height = res.height;

  const engine = new SigilEngine(canvas);
  const moodData = MOODS.find(m => m.id === state.mood) || MOODS[0];
  const bgData = BACKGROUNDS[state.edit.bgIdx] || BACKGROUNDS[1];
  const sigilColors = ['#C8C0E8','#D4E0F0','#F0EEF8','#E8D890','#F0D0D8','#90D0FF','#D8D4EC','#8090D8'];
  const customMood = {
    ...moodData.colors,
    line: sigilColors[state.edit.colorIdx] || moodData.colors.line,
    glow: sigilColors[state.edit.colorIdx] || moodData.colors.glow,
  };

  engine.drawBackground(bgData, customMood, res.width, res.height);

  if (state.sigilType === 'traditional') {
    engine.drawTraditional({
      structure: state.trad.structure || 'circle_seal',
      symbol: state.trad.symbol || 'circle',
      density: state.trad.density || 'medium',
      lineStyle: state.trad.lineStyle || 'thin_ink',
      symmetry: state.trad.symmetry || 'full',
      decoration: state.trad.decoration || 'outer_ring',
      moodColors: customMood,
      progress: 1,
    });
  } else {
    engine.drawModern({
      style: state.modern.style || 'minimal_logo',
      lineStyle: state.modern.lineStyle || 'monoline',
      complexity: state.modern.complexity || 'balance',
      symmetry: state.modern.symmetry || 'full',
      moodColors: customMood,
      progress: 1,
    });
  }
  return canvas;
}

async function saveAsWallpaper() {
  const canvas = await getHighResCanvas();
  const res = RESOLUTIONS[state.resolutionIdx] || RESOLUTIONS[1];
  const link = document.createElement('a');
  link.download = `creosigil-wallpaper-${res.label.toLowerCase()}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('배경화면 PNG 저장 완료');
  saveToLibrary();
}

async function saveAsTransparent() {
  const res = RESOLUTIONS[state.resolutionIdx] || RESOLUTIONS[1];
  const canvas = document.createElement('canvas');
  canvas.width = res.width;
  canvas.height = res.height;

  const engine = new SigilEngine(canvas);
  const moodData = MOODS.find(m => m.id === state.mood) || MOODS[0];
  const sigilColors = ['#C8C0E8','#D4E0F0','#F0EEF8','#E8D890','#F0D0D8','#90D0FF','#D8D4EC','#8090D8'];
  const customMood = {
    ...moodData.colors,
    line: sigilColors[state.edit.colorIdx] || moodData.colors.line,
    glow: sigilColors[state.edit.colorIdx] || moodData.colors.glow,
  };

  // No background — transparent
  if (state.sigilType === 'traditional') {
    engine.drawTraditional({
      structure: state.trad.structure || 'circle_seal',
      symbol: state.trad.symbol || 'circle',
      density: state.trad.density || 'medium',
      lineStyle: state.trad.lineStyle || 'thin_ink',
      symmetry: state.trad.symmetry || 'full',
      decoration: state.trad.decoration || 'outer_ring',
      moodColors: customMood,
      progress: 1,
    });
  } else {
    engine.drawModern({
      style: state.modern.style || 'minimal_logo',
      lineStyle: state.modern.lineStyle || 'monoline',
      complexity: state.modern.complexity || 'balance',
      symmetry: state.modern.symmetry || 'full',
      moodColors: customMood,
      progress: 1,
    });
  }

  const link = document.createElement('a');
  link.download = `creosigil-transparent-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('투명 PNG 저장 완료');
}

async function shareImage() {
  const canvas = await getHighResCanvas();
  canvas.toBlob(async blob => {
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'creosigil.png', { type: 'image/png' })] })) {
      try {
        await navigator.share({
          files: [new File([blob], 'creosigil.png', { type: 'image/png' })],
          title: 'CREOSIGIL',
          text: '나만의 시길',
        });
      } catch(e) { console.log(e); }
    } else {
      // Fallback: download
      saveAsWallpaper();
    }
  }, 'image/png');
}

function saveAsSVG() {
  // Generate SVG approximation
  const moodData = MOODS.find(m => m.id === state.mood) || MOODS[0];
  const sigilColors = ['#C8C0E8','#D4E0F0','#F0EEF8','#E8D890','#F0D0D8','#90D0FF','#D8D4EC','#8090D8'];
  const lineColor = sigilColors[state.edit.colorIdx] || moodData.colors.line;
  const bgData = BACKGROUNDS[state.edit.bgIdx] || BACKGROUNDS[1];
  const size = 1440;
  const cx = size / 2, cy = size / 2, r = size * 0.42;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${bgData.color}"/>
  <g stroke="${lineColor}" fill="none" stroke-width="${size * 0.002}" opacity="0.8">
    <circle cx="${cx}" cy="${cy}" r="${r}" opacity="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.75}" opacity="0.4"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.45}" opacity="0.5"/>
    <line x1="${cx}" y1="${cy - r * 0.4}" x2="${cx}" y2="${cy + r * 0.4}" opacity="0.3"/>
    <line x1="${cx - r * 0.4}" y1="${cy}" x2="${cx + r * 0.4}" y2="${cy}" opacity="0.3"/>
  </g>
  <text x="${cx}" y="${size - 60}" font-family="serif" font-size="28" fill="${lineColor}" text-anchor="middle" opacity="0.4">CREOSIGIL</text>
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = `creosigil-${Date.now()}.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  showToast('SVG 저장 완료');
}

// ========== LIBRARY ==========
function loadLibrary() {
  try {
    const saved = localStorage.getItem('creosigil_library');
    state.library = saved ? JSON.parse(saved) : [];
  } catch(e) { state.library = []; }
}

function saveToLibrary() {
  if (!saveCanvas) return;
  const thumbnail = saveCanvas.toDataURL('image/jpeg', 0.5);
  const item = {
    id: Date.now(),
    thumbnail,
    type: state.sigilType,
    mood: state.mood,
    trad: { ...state.trad },
    modern: { ...state.modern },
    edit: { ...state.edit },
    date: new Date().toLocaleDateString('ko-KR'),
  };
  state.library.unshift(item);
  if (state.library.length > 20) state.library = state.library.slice(0, 20);
  try {
    localStorage.setItem('creosigil_library', JSON.stringify(state.library));
  } catch(e) {}
  renderRecentGrid();
}

function renderRecentGrid() {
  const grid = document.getElementById('recent-grid');
  if (!grid) return;
  if (state.library.length === 0) {
    grid.innerHTML = `<div class="recent-empty" style="grid-column:1/-1;"><div class="empty-icon">✦</div><p>아직 만든 시길이 없습니다.<br>첫 시길을 만들어보세요.</p></div>`;
    return;
  }
  grid.innerHTML = '';
  state.library.slice(0, 6).forEach(item => {
    const el = document.createElement('div');
    el.className = 'recent-item';
    el.innerHTML = `<img src="${item.thumbnail}" alt="시길" loading="lazy">`;
    el.addEventListener('click', () => {
      // Restore state and go to save
      state.sigilType = item.type;
      state.trad = { ...item.trad };
      state.modern = { ...item.modern };
      state.mood = item.mood;
      state.edit = { ...item.edit };
      setupSaveScreen();
      showScreen('save');
    });
    grid.appendChild(el);
  });
}

function renderLibraryScreen() {
  const grid = document.getElementById('library-grid');
  if (!grid) return;
  if (state.library.length === 0) {
    grid.innerHTML = `<div class="library-empty"><div class="library-empty-icon">✦</div><p class="library-empty-text">보관함이 비어 있습니다.<br>시길을 만들고 저장해보세요.</p></div>`;
    return;
  }
  grid.innerHTML = '';
  state.library.forEach(item => {
    const el = document.createElement('div');
    el.className = 'library-item';
    el.innerHTML = `
      <div class="library-item-img"><img src="${item.thumbnail}" alt="시길" loading="lazy"></div>
      <div class="library-item-info">
        <div class="library-item-title">${item.type === 'traditional' ? '전통형' : '현대형'} · ${MOODS.find(m=>m.id===item.mood)?.name || ''}</div>
        <div class="library-item-date">${item.date}</div>
      </div>
    `;
    el.addEventListener('click', () => {
      state.sigilType = item.type;
      state.trad = { ...item.trad };
      state.modern = { ...item.modern };
      state.mood = item.mood;
      state.edit = { ...item.edit };
      saveCanvas = document.getElementById('save-canvas');
      setupSaveScreen();
      showScreen('save');
    });
    grid.appendChild(el);
  });
}

// ========== QR GENERATOR ==========
// ========== QR GENERATOR (순수 JS, 외부 라이브러리 없음) ==========
function openQRModal() {
  document.getElementById('qr-modal')?.classList.add('open');
  const input = document.getElementById('qr-input');
  if (input && !input.value) input.value = window.location.href;
  generateQR();
}

function closeQRModal() {
  document.getElementById('qr-modal')?.classList.remove('open');
}

function generateQR() {
  const input = document.getElementById('qr-input');
  const wrap = document.getElementById('qr-canvas-wrap');
  if (!wrap) return;

  const text = (input && input.value.trim()) ? input.value.trim() : window.location.href;

  // 이전 QR 제거
  wrap.innerHTML = '';

  // CreoQR: js/qr-generator.js에서 로드된 순수 JS 구현
  if (typeof CreoQR !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    wrap.appendChild(canvas);

    const success = CreoQR.render(canvas, text, {
      size: 192,
      margin: 6,
      darkColor: '#1A0D2E',
      lightColor: '#FFFFFF',
    });

    if (!success) {
      wrap.innerHTML = '<div style="color:#999;font-size:11px;text-align:center;padding:20px;">QR 생성 실패<br>텍스트를 줄여보세요</div>';
    }
  } else {
    wrap.innerHTML = '<div style="color:#999;font-size:11px;text-align:center;padding:20px;">QR 모듈 로딩 중...</div>';
    // 재시도
    setTimeout(() => generateQR(), 300);
  }
}

function downloadQR() {
  const wrap = document.getElementById('qr-canvas-wrap');
  if (!wrap) return;
  const canvas = wrap.querySelector('canvas');
  if (!canvas) { showToast('QR 코드를 먼저 생성하세요'); return; }

  const link = document.createElement('a');
  link.download = 'creosigil-qr.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('QR 코드 저장 완료');
}

// ========== TOOLTIP (MORE INFO) ==========
function openTooltip(title, content) {
  const sheet = document.getElementById('tooltip-sheet');
  if (!sheet) return;
  document.getElementById('tooltip-title').textContent = title;
  document.getElementById('tooltip-body').innerHTML = content;
  sheet.classList.add('open');
}

function closeTooltip() {
  document.getElementById('tooltip-sheet')?.classList.remove('open');
}

// ========== TOAST ==========
let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ========== PWA INSTALL ==========
let deferredInstall = null;
function setupPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstall = e;
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('visible');
  });

  document.getElementById('btn-install')?.addEventListener('click', async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    deferredInstall = null;
    document.getElementById('install-banner')?.classList.remove('visible');
  });

  document.getElementById('btn-install-dismiss')?.addEventListener('click', () => {
    document.getElementById('install-banner')?.classList.remove('visible');
  });
}

// ========== GLOBAL EVENT BINDINGS ==========
// QR 입력 디바운스
let qrDebounceTimer = null;
document.getElementById('qr-input')?.addEventListener('input', () => {
  clearTimeout(qrDebounceTimer);
  qrDebounceTimer = setTimeout(generateQR, 500);
});
document.getElementById('btn-qr-gen')?.addEventListener('click', generateQR);
document.getElementById('btn-qr-download')?.addEventListener('click', downloadQR);
document.getElementById('btn-qr-close')?.addEventListener('click', closeQRModal);
document.getElementById('btn-tooltip-close')?.addEventListener('click', closeTooltip);

// Close modals on overlay click
document.getElementById('qr-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeQRModal();
});
document.getElementById('tooltip-sheet')?.addEventListener('click', function(e) {
  if (e.target === this) closeTooltip();
});

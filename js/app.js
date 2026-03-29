/**
 * CREOSIGIL - 앱 메인 로직
 * 화면 전환, 단계별 선택, 생성, 저장, 보관함
 */

// ===== 앱 상태 =====
const AppState = {
  currentScreen: 'screen-home',
  screenHistory: ['screen-home'],
  sigilType: null,          // 'traditional' | 'modern'
  purposes: [],             // 선택된 목적 IDs
  traditionalOpts: {},      // 전통형 옵션
  modernOpts: {},           // 현대형 옵션
  mood: null,               // 선택된 분위기 객체
  editConfig: {
    scale: 100,
    lineWidth: 2,
    glow: 8,
    rotation: 0,
    sigilColor: '#d9cfff',
    bgColor: '#0a0a0f',
    bgType: 'solid'
  },
  selectedResolution: '1080x1920',
  generatedSigilData: null, // canvas imageData
  quickMode: false
};

// ===== 화면 전환 =====
function goTo(screenId) {
  const current = document.getElementById(AppState.currentScreen);
  const next = document.getElementById(screenId);
  if (!next || AppState.currentScreen === screenId) return;

  // 현재 화면 숨기기
  current.classList.remove('active');
  current.classList.add('slide-out');
  setTimeout(() => {
    current.classList.remove('slide-out');
    current.style.visibility = 'hidden';
  }, 310);

  // 다음 화면 표시
  next.style.visibility = 'visible';
  next.classList.add('active');
  AppState.screenHistory.push(screenId);
  AppState.currentScreen = screenId;

  // 화면별 진입 처리
  onScreenEnter(screenId);
  updateNavBar(screenId);
}

function navTo(screenId) {
  goTo(screenId);
}

function goBack() {
  if (AppState.screenHistory.length <= 1) return;
  AppState.screenHistory.pop();
  const prev = AppState.screenHistory[AppState.screenHistory.length - 1];
  const current = document.getElementById(AppState.currentScreen);
  const prevScreen = document.getElementById(prev);
  if (!prevScreen) return;

  current.classList.remove('active');
  current.style.visibility = 'hidden';

  prevScreen.style.visibility = 'visible';
  prevScreen.classList.add('active');
  AppState.currentScreen = prev;
  updateNavBar(prev);
  onScreenEnter(prev);
}

function onScreenEnter(screenId) {
  switch (screenId) {
    case 'screen-home':    renderHomeRecent(); break;
    case 'screen-step1':   renderPurposeGrid(); break;
    case 'screen-step3':   renderStep3Options(); break;
    case 'screen-step4':   renderMoodGrid(); break;
    case 'screen-step5':   startGeneration(); break;
    case 'screen-step6':   renderEditScreen(); break;
    case 'screen-step7':   renderSaveScreen(); break;
    case 'screen-archive': renderArchive(); break;
  }
}

function updateNavBar(screenId) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  const homeScreens = ['screen-home'];
  const archiveScreens = ['screen-archive'];
  if (homeScreens.includes(screenId)) {
    document.querySelector('[data-screen="screen-home"]')?.classList.add('active');
  } else if (archiveScreens.includes(screenId)) {
    document.querySelector('[data-screen="screen-archive"]')?.classList.add('active');
  }
}

// ===== 시길 제작 시작 =====
function startCreation(mode) {
  AppState.quickMode = mode === 'quick';
  AppState.purposes = [];
  AppState.sigilType = null;
  AppState.traditionalOpts = {};
  AppState.modernOpts = {};
  AppState.mood = null;
  AppState.screenHistory = ['screen-home'];
  AppState.currentScreen = 'screen-home';
  goTo('screen-step1');
}

// ===== STEP 1: 목적 선택 =====
function renderPurposeGrid() {
  const grid = document.getElementById('purpose-grid');
  if (!grid) return;
  grid.innerHTML = PURPOSES.map(p => `
    <div class="option-item ${AppState.purposes.includes(p.id) ? 'selected' : ''}"
         data-id="${p.id}"
         onclick="togglePurpose('${p.id}')">
      <div class="option-name">${p.icon} ${p.name}</div>
      <div class="option-desc">${p.desc}</div>
    </div>
  `).join('');
}

function togglePurpose(id) {
  const idx = AppState.purposes.indexOf(id);
  if (idx > -1) {
    AppState.purposes.splice(idx, 1);
  } else {
    AppState.purposes.push(id);
  }
  renderPurposeGrid();
  updatePurposeAdvice();
}

function updatePurposeAdvice() {
  const el = document.getElementById('step1-dynamic-advice');
  if (!el) return;
  const count = AppState.purposes.length;
  if (count === 0) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const key = count >= 3 ? 'over' : String(count);
  el.textContent = PURPOSE_ADVICE[key] || '';
}

// ===== STEP 2: 타입 선택 =====
function selectType(type) {
  AppState.sigilType = type;
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.type === type);
  });
  // 목적 기반 기본값 자동 적용
  applyDefaultOptions();
}

function applyDefaultOptions() {
  if (!AppState.sigilType || AppState.purposes.length === 0) return;
  const mainPurpose = AppState.purposes[0];
  if (AppState.sigilType === 'traditional') {
    AppState.traditionalOpts = { ...PURPOSE_TRADITIONAL_DEFAULT[mainPurpose] } || {};
  } else {
    AppState.modernOpts = { ...PURPOSE_MODERN_DEFAULT[mainPurpose] } || {};
  }
  // 분위기 기본값
  const moodId = PURPOSE_MOOD_DEFAULT[mainPurpose] || 'obsidian';
  AppState.mood = MOODS.find(m => m.id === moodId) || MOODS[0];
}

// ===== STEP 3: 세부 옵션 =====
function renderStep3Options() {
  const container = document.getElementById('step3-options-container');
  if (!container) return;

  const options = AppState.sigilType === 'traditional' ? TRADITIONAL_OPTIONS : MODERN_OPTIONS;
  const currentOpts = AppState.sigilType === 'traditional' ? AppState.traditionalOpts : AppState.modernOpts;

  container.innerHTML = Object.entries(options).map(([key, group]) => `
    <div class="option-group" data-group-key="${key}" id="group-${key}">
      <div class="option-group-header">
        <span class="option-group-title">${group.title}</span>
        <span class="required-badge">필수</span>
      </div>
      <p class="option-group-advice">${group.advice}</p>
      <div class="option-grid">
        ${group.items.map(item => `
          <div class="option-item ${currentOpts[key] === item.id ? 'selected' : ''}"
               data-group="${key}"
               data-item="${item.id}"
               onclick="selectStep3Option('${key}','${item.id}')">
            <div class="option-name">${item.name}</div>
            <div class="option-desc">${item.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function selectStep3Option(groupKey, itemId) {
  if (AppState.sigilType === 'traditional') {
    AppState.traditionalOpts[groupKey] = itemId;
  } else {
    AppState.modernOpts[groupKey] = itemId;
  }

  // 선택된 항목 UI 업데이트
  document.querySelectorAll(`[data-group="${groupKey}"]`).forEach(el => {
    el.classList.toggle('selected', el.dataset.item === itemId);
    el.classList.remove('error-highlight');
  });

  // 그룹 에러 상태 해제
  const groupEl = document.getElementById(`group-${groupKey}`);
  if (groupEl) groupEl.classList.remove('error');
}

// ===== STEP 4: 분위기 =====
function renderMoodGrid() {
  const grid = document.getElementById('mood-grid');
  if (!grid) return;
  grid.innerHTML = MOODS.map(m => `
    <div class="mood-item ${AppState.mood && AppState.mood.id === m.id ? 'selected' : ''}"
         onclick="selectMood('${m.id}')">
      <div class="mood-dot" style="background: ${m.bg}; border-color: ${m.glow};
           box-shadow: 0 0 8px ${m.glow}50;"></div>
      <div class="mood-name">${m.name}</div>
      <div class="mood-desc">${m.desc}</div>
    </div>
  `).join('');
}

function selectMood(id) {
  AppState.mood = MOODS.find(m => m.id === id);
  renderMoodGrid();
  // 편집 색상도 자동 반영
  if (AppState.mood) {
    AppState.editConfig.sigilColor = AppState.mood.line;
    AppState.editConfig.bgColor = AppState.mood.bg;
  }
}

// ===== 단계 이동 검증 =====
function nextStep(step) {
  if (!validateStep(step)) return;

  const nextScreenMap = {
    1: 'screen-step2',
    2: 'screen-step3',
    3: 'screen-step4',
    4: 'screen-step5',
    5: 'screen-step6',
    6: 'screen-step7'
  };

  const next = nextScreenMap[step];
  if (next) goTo(next);
}

function validateStep(step) {
  if (step === 1) {
    if (AppState.purposes.length === 0) {
      showToast('목적을 하나 이상 선택해주세요');
      const grid = document.getElementById('purpose-grid');
      if (grid) { grid.classList.add('error-highlight'); setTimeout(() => grid.classList.remove('error-highlight'), 1000); }
      return false;
    }
    return true;
  }

  if (step === 2) {
    if (!AppState.sigilType) {
      showToast('전통형 또는 현대형을 선택해주세요');
      const cards = document.querySelectorAll('.type-card');
      cards.forEach(c => { c.classList.add('error-highlight'); setTimeout(() => c.classList.remove('error-highlight'), 1000); });
      return false;
    }
    return true;
  }

  if (step === 3) {
    const options = AppState.sigilType === 'traditional' ? TRADITIONAL_OPTIONS : MODERN_OPTIONS;
    const currentOpts = AppState.sigilType === 'traditional' ? AppState.traditionalOpts : AppState.modernOpts;
    const missing = [];

    Object.keys(options).forEach(key => {
      if (!currentOpts[key]) missing.push(key);
    });

    if (missing.length > 0) {
      // 미선택 항목 강조 + 첫 번째로 스크롤
      missing.forEach((key, idx) => {
        const groupEl = document.getElementById(`group-${key}`);
        if (groupEl) {
          groupEl.classList.add('error');
          const items = groupEl.querySelectorAll('.option-item');
          items.forEach(item => {
            item.classList.add('error-highlight');
            setTimeout(() => item.classList.remove('error-highlight'), 1200);
          });
          if (idx === 0) {
            groupEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
      showToast(`${missing.length}개 항목을 아직 선택하지 않았습니다`);
      return false;
    }
    return true;
  }

  if (step === 4) {
    if (!AppState.mood) {
      showToast('분위기를 선택해주세요');
      return false;
    }
    return true;
  }

  return true;
}

// ===== STEP 5: 시길 생성 =====
async function startGeneration() {
  const statusEl = document.getElementById('generation-status');
  const doneEl = document.getElementById('generation-done');
  const btnEdit = document.getElementById('btn-to-edit');
  const progressFill = document.getElementById('gen-progress-fill');
  const progressPct = document.getElementById('gen-progress-pct');

  if (!statusEl) return;

  statusEl.classList.remove('hidden');
  doneEl.classList.add('hidden');
  btnEdit.classList.add('hidden');

  const canvas = document.getElementById('sigil-preview-canvas');
  canvas.width = 440;
  canvas.height = 440;

  const config = buildConfig();

  try {
    await sigilEngine.generate(canvas, config, (pct) => {
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (progressPct) progressPct.textContent = `${Math.round(pct)}%`;
    });

    AppState.generatedSigilData = canvas.toDataURL('image/png');

    // 완료 표시
    statusEl.classList.add('hidden');
    doneEl.classList.remove('hidden');
    btnEdit.classList.remove('hidden');

  } catch (e) {
    console.error('Generation failed:', e);
    statusEl.classList.add('hidden');
    doneEl.classList.remove('hidden');
    btnEdit.classList.remove('hidden');
    showToast('생성 중 오류가 발생했습니다');
  }
}

function buildConfig() {
  const mood = AppState.mood || MOODS[0];
  return {
    sigilType: AppState.sigilType || 'traditional',
    purposes: AppState.purposes,
    traditionalOpts: AppState.sigilType === 'traditional' ? AppState.traditionalOpts : {},
    modernOpts: AppState.sigilType === 'modern' ? AppState.modernOpts : {},
    mood: mood,
    sigilColor: AppState.editConfig.sigilColor || mood.line,
    bgColor: AppState.editConfig.bgColor || mood.bg,
    bgType: AppState.editConfig.bgType || 'solid',
    lineWidth: AppState.editConfig.lineWidth || 2,
    glow: AppState.editConfig.glow || 8,
    scale: AppState.editConfig.scale || 100,
    rotation: AppState.editConfig.rotation || 0
  };
}

// ===== STEP 6: 편집 =====
function renderEditScreen() {
  const canvas = document.getElementById('edit-canvas');
  if (!canvas) return;
  canvas.width = 440;
  canvas.height = 440;
  drawEditCanvas();
}

async function drawEditCanvas() {
  const canvas = document.getElementById('edit-canvas');
  if (!canvas) return;
  const config = buildConfig();
  await sigilEngine.generate(canvas, config, null);
}

function updateEdit() {
  AppState.editConfig.scale = parseInt(document.getElementById('ctrl-size')?.value || 100);
  AppState.editConfig.lineWidth = parseFloat(document.getElementById('ctrl-linewidth')?.value || 2);
  AppState.editConfig.glow = parseInt(document.getElementById('ctrl-glow')?.value || 8);
  AppState.editConfig.rotation = parseInt(document.getElementById('ctrl-rotate')?.value || 0);
  AppState.editConfig.sigilColor = document.getElementById('ctrl-color')?.value || '#d9cfff';
  AppState.editConfig.bgColor = document.getElementById('ctrl-bg')?.value || '#0a0a0f';

  // 값 표시
  document.getElementById('size-val').textContent = AppState.editConfig.scale;
  document.getElementById('linewidth-val').textContent = AppState.editConfig.lineWidth;
  document.getElementById('glow-val').textContent = AppState.editConfig.glow;
  document.getElementById('rotate-val').textContent = AppState.editConfig.rotation;

  clearTimeout(AppState._editTimer);
  AppState._editTimer = setTimeout(drawEditCanvas, 100);
}

function setBgType(type) {
  AppState.editConfig.bgType = type;
  document.querySelectorAll('.btn-bg-type').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bg === type);
  });
  clearTimeout(AppState._editTimer);
  AppState._editTimer = setTimeout(drawEditCanvas, 100);
}

// ===== STEP 7: 저장 & 공유 =====
function renderSaveScreen() {
  const canvas = document.getElementById('save-preview');
  if (!canvas) return;
  canvas.width = 280;
  canvas.height = 500;
  const config = buildConfig();
  sigilEngine.generate(canvas, config, null);
}

function selectRes(btn, res) {
  AppState.selectedResolution = res;
  document.querySelectorAll('.btn-res').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function saveImage(type) {
  const [w, h] = AppState.selectedResolution.split('x').map(Number);
  const offCanvas = document.createElement('canvas');

  if (type === 'transparent-png') {
    offCanvas.width = h * 0.56;
    offCanvas.height = h * 0.56;
  } else {
    offCanvas.width = w;
    offCanvas.height = h;
  }

  const config = { ...buildConfig() };
  if (type === 'transparent-png') {
    config.bgType = 'transparent';
    config.bgColor = 'rgba(0,0,0,0)';
  }

  const ctx = offCanvas.getContext('2d');

  if (type === 'transparent-png') {
    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
  }

  await sigilEngine.generate(offCanvas, config, null);

  if (type === 'svg') {
    saveSVG(offCanvas, config);
    return;
  }

  const mimeType = 'image/png';
  offCanvas.toBlob(blob => {
    if (!blob) { showToast('저장 실패'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creosigil_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('💾 저장되었습니다');
    saveToArchive(offCanvas);
  }, mimeType, 0.95);
}

function saveSVG(canvas, config) {
  const w = canvas.width;
  const h = canvas.height;
  const dataUrl = canvas.toDataURL('image/png');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}">
  <image href="${dataUrl}" width="${w}" height="${h}"/>
</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `creosigil_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✦ SVG 저장되었습니다');
}

async function shareImage() {
  if (!navigator.share) {
    showToast('이 브라우저는 공유 기능을 지원하지 않습니다');
    return;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1920;
    const config = buildConfig();
    await sigilEngine.generate(canvas, config, null);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'creosigil.png', { type: 'image/png' });
      await navigator.share({ title: 'CREOSIGIL', files: [file] });
    }, 'image/png');
  } catch (e) {
    if (e.name !== 'AbortError') showToast('공유 실패');
  }
}

// ===== 보관함 =====
function saveToArchive(canvas) {
  const archive = getArchive();
  const data = {
    id: Date.now(),
    dataUrl: canvas.toDataURL('image/jpeg', 0.7),
    config: JSON.stringify(buildConfig()),
    label: `${AppState.purposes.join('+')} / ${AppState.sigilType}`
  };
  archive.unshift(data);
  if (archive.length > 20) archive.pop();
  localStorage.setItem('creosigil_archive', JSON.stringify(archive));
}

function getArchive() {
  try {
    return JSON.parse(localStorage.getItem('creosigil_archive') || '[]');
  } catch { return []; }
}

function renderArchive() {
  const list = document.getElementById('archive-list');
  const empty = document.getElementById('archive-empty');
  if (!list) return;

  const archive = getArchive();
  if (archive.length === 0) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }

  empty?.classList.add('hidden');
  list.innerHTML = archive.map(item => `
    <div class="archive-item" onclick="loadFromArchive(${item.id})">
      <img src="${item.dataUrl}" style="width:100%;aspect-ratio:1;border-radius:8px;border:1px solid rgba(160,140,230,0.2);display:block;">
      <div class="archive-item-label">${item.label || '시길'}</div>
    </div>
  `).join('');
}

function renderHomeRecent() {
  const archive = getArchive();
  const recentSection = document.getElementById('home-recent');
  const recentList = document.getElementById('home-recent-list');
  if (!recentSection || !recentList) return;

  if (archive.length === 0) {
    recentSection.classList.add('hidden');
    return;
  }

  recentSection.classList.remove('hidden');
  recentList.innerHTML = archive.slice(0, 5).map(item => `
    <div class="recent-item" onclick="loadFromArchive(${item.id})">
      <img src="${item.dataUrl}" style="width:80px;height:80px;border-radius:8px;border:1px solid rgba(160,140,230,0.2);">
    </div>
  `).join('');
}

function loadFromArchive(id) {
  const archive = getArchive();
  const item = archive.find(a => a.id === id);
  if (!item) return;
  try {
    const config = JSON.parse(item.config);
    AppState.sigilType = config.sigilType;
    AppState.purposes = config.purposes || [];
    AppState.traditionalOpts = config.traditionalOpts || {};
    AppState.modernOpts = config.modernOpts || {};
    AppState.mood = config.mood;
    AppState.editConfig = {
      scale: config.scale || 100,
      lineWidth: config.lineWidth || 2,
      glow: config.glow || 8,
      rotation: config.rotation || 0,
      sigilColor: config.sigilColor || '#d9cfff',
      bgColor: config.bgColor || '#0a0a0f',
      bgType: config.bgType || 'solid'
    };
    goTo('screen-step6');
  } catch (e) {
    showToast('불러오기 실패');
  }
}

// ===== QR 생성기 =====
function showQRGenerator() {
  const modal = document.getElementById('modal-qr');
  if (modal) {
    modal.classList.remove('hidden');
    // 기본값으로 유튜브 링크 미리 QR 생성
    setTimeout(() => {
      const input = document.getElementById('qr-input');
      if (input && input.value.trim()) generateQR();
    }, 100);
  }
}

function hideQRGenerator() {
  const modal = document.getElementById('modal-qr');
  if (modal) modal.classList.add('hidden');
}

function generateQR() {
  const input = document.getElementById('qr-input')?.value?.trim();
  if (!input) { showToast('URL 또는 텍스트를 입력해주세요'); return; }

  const resultDiv = document.getElementById('qr-result');
  const canvas = document.getElementById('qr-canvas');
  if (!canvas || !resultDiv) return;

  // qrcode 라이브러리 사용 (CDN에서 로드)
  if (typeof QRCode !== 'undefined') {
    try {
      QRCode.toCanvas(canvas, input, {
        width: 220,
        margin: 2,
        color: { dark: '#0a0a0f', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      }, (err) => {
        if (err) {
          showToast('QR 생성 실패: ' + err.message);
          return;
        }
        resultDiv.classList.remove('hidden');
        showToast('✅ QR 코드가 생성되었습니다');
      });
    } catch (e) {
      showToast('QR 생성 중 오류: ' + e.message);
    }
  } else {
    // 라이브러리 로드 안 됐을 경우 폴백: 구글 차트 API
    const encoded = encodeURIComponent(input);
    const imgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}&bgcolor=ffffff&color=0a0a0f`;
    const ctx = canvas.getContext('2d');
    canvas.width = 220;
    canvas.height = 220;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 220, 220);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 220, 220);
      resultDiv.classList.remove('hidden');
      showToast('✅ QR 코드가 생성되었습니다');
    };
    img.onerror = () => {
      showToast('QR 생성 실패. 인터넷 연결을 확인해주세요.');
    };
    img.src = imgUrl;
  }
}

function downloadQR() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  try {
    const a = document.createElement('a');
    a.download = 'creosigil_qr.png';
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('💾 QR 코드가 저장되었습니다');
  } catch (e) {
    showToast('저장 실패: ' + e.message);
  }
}

// ===== 유틸리티 =====
function toggleMore(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isHidden = el.classList.contains('hidden');
  el.classList.toggle('hidden', !isHidden);
  const btn = el.previousElementSibling;
  if (btn && btn.classList.contains('btn-more')) {
    btn.textContent = isHidden
      ? btn.textContent.replace('▾', '▴')
      : btn.textContent.replace('▴', '▾');
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(AppState._toastTimer);
  AppState._toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  renderHomeRecent();

  // 슬라이더 초기값 표시
  document.getElementById('size-val') && (document.getElementById('size-val').textContent = '100');
  document.getElementById('linewidth-val') && (document.getElementById('linewidth-val').textContent = '2');
  document.getElementById('glow-val') && (document.getElementById('glow-val').textContent = '5');
  document.getElementById('rotate-val') && (document.getElementById('rotate-val').textContent = '0');
});

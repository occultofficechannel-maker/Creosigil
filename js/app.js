// CREOSIGIL - 앱 메인 로직
class CreosigilApp {
  constructor() {
    this.state = {
      step: 0,
      purposes: [],
      type: null,           // 'traditional' | 'modern'
      structure: null,      // 전통형 봉인 구조
      style: null,          // 현대형 스타일
      density: null,        // 전통형 밀도
      lineStyle: null,
      symmetry: null,
      decoration: [],
      complexity: null,     // 현대형 복잡도
      mood: null,
      glowIntensity: 0.7,
      scale: 1.0,
      rotation: 0,
      resolution: 'qhd',
      isGenerating: false,
      generationDone: false,
      currentHistory: null
    };

    this.editCanvas = null;
    this.sigilEngine = null;
    this.historyList = this._loadHistory();
    this.lastSavedConfig = null;

    this._init();
  }

  _init() {
    this.editCanvas = document.getElementById('edit-canvas');
    if (this.editCanvas) {
      this.sigilEngine = new SigilEngine(this.editCanvas);
      this.sigilEngine.onProgress = (val) => this._updateProgress(val);
    }

    this._bindEvents();
    this._renderHistory();

    // 첫 방문 온보딩 확인
    const seen = localStorage.getItem('creosigil_onboarding');
    if (!seen) {
      this.showScreen('intro');
    } else {
      this.showScreen('home');
    }
  }

  _bindEvents() {
    // 인트로
    document.getElementById('btn-intro-start')?.addEventListener('click', () => {
      localStorage.setItem('creosigil_onboarding', '1');
      this.showScreen('home');
    });
    document.getElementById('btn-intro-more')?.addEventListener('click', () => {
      this._toggleMore('intro-more-content');
    });
    document.getElementById('btn-intro-example')?.addEventListener('click', () => {
      this._showExamples();
    });

    // 홈
    document.getElementById('btn-home-quick')?.addEventListener('click', () => {
      this._startCreation('quick');
    });
    document.getElementById('btn-home-detailed')?.addEventListener('click', () => {
      this._startCreation('detailed');
    });
    document.getElementById('btn-home-archive')?.addEventListener('click', () => {
      this.showScreen('archive');
    });
    document.getElementById('btn-home-sigil-info')?.addEventListener('click', () => {
      this.showScreen('intro');
    });

    // 제작 흐름 - 뒤로가기들
    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => this._goBack());
    });

    // 목적 선택
    document.getElementById('btn-purpose-next')?.addEventListener('click', () => {
      this._validateAndNext('purpose');
    });

    // 타입 선택
    document.getElementById('btn-type-trad')?.addEventListener('click', () => {
      this.state.type = 'traditional';
      this.showScreen('detail-traditional');
    });
    document.getElementById('btn-type-modern')?.addEventListener('click', () => {
      this.state.type = 'modern';
      this.showScreen('detail-modern');
    });

    // 전통형 다음
    document.getElementById('btn-trad-next')?.addEventListener('click', () => {
      this._validateAndNext('traditional');
    });

    // 현대형 다음
    document.getElementById('btn-modern-next')?.addEventListener('click', () => {
      this._validateAndNext('modern');
    });

    // 분위기 다음
    document.getElementById('btn-mood-next')?.addEventListener('click', () => {
      this._validateAndNext('mood');
    });

    // 편집 화면
    document.getElementById('btn-edit-generate')?.addEventListener('click', () => {
      this._generateSigil();
    });
    document.getElementById('btn-edit-save')?.addEventListener('click', () => {
      this._goToSave();
    });

    // 편집 컨트롤들
    const scaleSlider = document.getElementById('scale-slider');
    if (scaleSlider) {
      scaleSlider.addEventListener('input', (e) => {
        this.state.scale = parseFloat(e.target.value);
        document.getElementById('scale-value').textContent = Math.round(this.state.scale * 100) + '%';
      });
    }
    const rotationSlider = document.getElementById('rotation-slider');
    if (rotationSlider) {
      rotationSlider.addEventListener('input', (e) => {
        this.state.rotation = parseInt(e.target.value);
        document.getElementById('rotation-value').textContent = this.state.rotation + '°';
      });
    }
    const glowSlider = document.getElementById('glow-slider');
    if (glowSlider) {
      glowSlider.addEventListener('input', (e) => {
        this.state.glowIntensity = parseFloat(e.target.value);
        document.getElementById('glow-value').textContent = Math.round(this.state.glowIntensity * 100) + '%';
      });
    }

    // 해상도 선택
    document.querySelectorAll('.resolution-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.resolution-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.resolution = btn.dataset.res;
      });
    });

    // 저장 버튼들
    document.getElementById('btn-save-png')?.addEventListener('click', () => this._downloadPNG(false));
    document.getElementById('btn-save-transparent')?.addEventListener('click', () => this._downloadPNG(true));
    document.getElementById('btn-save-svg')?.addEventListener('click', () => this._downloadSVG());
    document.getElementById('btn-save-share')?.addEventListener('click', () => this._shareImage());
    document.getElementById('btn-save-new')?.addEventListener('click', () => this._startNew());
    document.getElementById('btn-save-archive')?.addEventListener('click', () => this.showScreen('archive'));

    // 보관함
    document.getElementById('btn-archive-home')?.addEventListener('click', () => this.showScreen('home'));

    // 설정
    document.getElementById('btn-settings')?.addEventListener('click', () => this.showScreen('settings'));
    document.getElementById('btn-settings-back')?.addEventListener('click', () => this.showScreen('home'));
    document.getElementById('btn-reset-onboarding')?.addEventListener('click', () => {
      localStorage.removeItem('creosigil_onboarding');
      this.showScreen('intro');
    });

    // 선택 카드 이벤트 (이벤트 위임)
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.option-card');
      if (!card) return;
      const group = card.dataset.group;
      const value = card.dataset.value;
      const multi = card.dataset.multi === 'true';
      this._handleCardSelect(card, group, value, multi);
    });

    // 더보기 토글
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.more-toggle');
      if (!toggle) return;
      const targetId = toggle.dataset.target;
      if (targetId) this._toggleMore(targetId);
    });
  }

  // ============================================================
  // 화면 전환
  // ============================================================

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${id}`);
    if (target) {
      target.classList.add('active');
      target.scrollTop = 0;
    }

    if (id === 'detail-traditional') this._renderTraditionalOptions();
    if (id === 'detail-modern') this._renderModernOptions();
    if (id === 'mood') this._renderMoodOptions();
    if (id === 'edit') this._initEditScreen();
    if (id === 'save') this._initSaveScreen();
    if (id === 'archive') this._renderHistory();
  }

  _goBack() {
    const screenMap = {
      'screen-purpose': 'home',
      'screen-type': 'purpose',
      'screen-detail-traditional': 'type',
      'screen-detail-modern': 'type',
      'screen-mood': this.state.type === 'traditional' ? 'detail-traditional' : 'detail-modern',
      'screen-edit': 'mood',
      'screen-save': 'edit',
      'screen-archive': 'home',
      'screen-settings': 'home'
    };
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
      const target = screenMap[activeScreen.id];
      if (target) this.showScreen(target);
    }
  }

  // ============================================================
  // 시작
  // ============================================================

  _startCreation(mode) {
    this.state = {
      ...this.state,
      step: 0,
      purposes: [],
      type: null,
      structure: null,
      style: null,
      density: null,
      lineStyle: null,
      symmetry: null,
      decoration: [],
      complexity: null,
      mood: null,
      glowIntensity: 0.7,
      scale: 1.0,
      rotation: 0,
      isGenerating: false,
      generationDone: false
    };
    this.lastSavedConfig = null;
    this.showScreen('purpose');
  }

  _startNew() {
    this._startCreation('quick');
  }

  // ============================================================
  // 옵션 카드 렌더링
  // ============================================================

  _renderTraditionalOptions() {
    const container = document.getElementById('trad-options-container');
    if (!container) return;
    container.innerHTML = `
      ${this._renderOptionGroup('봉인 구조', 'structure', APP_DATA.traditional.structures, false, '시길을 어떤 형태의 구조로 봉인할까요?', '봉인 구조는 시길의 외형적 틀을 결정합니다. 원형은 안정과 완결, 마법진은 복합적 에너지, 봉인문은 강한 차단과 보호를 상징합니다.')}
      ${this._renderOptionGroup('상징의 밀도', 'density', APP_DATA.traditional.densities, false, '얼마나 많은 상징을 담을까요?', '단순할수록 의도가 선명하게 집중됩니다. 처음이라면 단순 또는 중간을 추천합니다.')}
      ${this._renderOptionGroup('선 스타일', 'lineStyle', APP_DATA.traditional.lineStyles, false, '시길의 결(선)을 정해주세요', '선의 두께와 질감은 시길이 전달하는 에너지의 성격을 바꿉니다.')}
      ${this._renderOptionGroup('대칭 방식', 'symmetry', APP_DATA.traditional.symmetries, false, '어떤 대칭으로 구성할까요?', '완전 대칭은 안정과 균형, 의도적 불균형은 변화와 역동을 담습니다.')}
      ${this._renderOptionGroup('장식 요소', 'decoration', APP_DATA.traditional.decorations, true, '추가 장식을 선택하세요 (복수 선택 가능)', '장식은 선택 사항입니다. 없어도 완전한 시길이 됩니다.')}
    `;
  }

  _renderModernOptions() {
    const container = document.getElementById('modern-options-container');
    if (!container) return;
    container.innerHTML = `
      ${this._renderOptionGroup('표현 스타일', 'style', APP_DATA.modern.styles, false, '어떤 시각 언어로 표현할까요?', '스타일은 시길이 사람들에게 주는 첫 인상을 결정합니다.')}
      ${this._renderOptionGroup('선 스타일', 'lineStyle', APP_DATA.modern.lineStyles, false, '선의 느낌은 어떻게 할까요?', '현대형에서 선은 디자인 품질을 크게 좌우합니다.')}
      ${this._renderOptionGroup('복잡도', 'complexity', APP_DATA.modern.complexities, false, '복잡도는 어느 정도로 할까요?', '심플할수록 배경화면으로 쓰기 편하고, 정교할수록 포스터 느낌이 납니다.')}
      ${this._renderOptionGroup('대칭 방식', 'symmetry', APP_DATA.modern.symmetries, false, '어떤 대칭으로 구성할까요?', '완전 대칭은 안정적, 자유 균형은 개성을 살립니다.')}
    `;
  }

  _renderMoodOptions() {
    const container = document.getElementById('mood-options-container');
    if (!container) return;
    container.innerHTML = `
      <div class="option-section">
        <p class="section-desc">분위기는 시길의 배경색, 선 색상, 광채를 결정합니다.</p>
        <button class="more-toggle" data-target="mood-more">더 알아보기 ▾</button>
        <div class="more-content" id="mood-more">
          <p>각 분위기 테마는 독자적인 에너지와 색을 가지고 있습니다. 
          흑요석 다크는 깊고 신비로운 오컬트 분위기, 월광 실버는 달빛처럼 은은한 신비,
          심홍 봉인은 강렬한 의지와 결연함을 담습니다. 당신의 의도가 어울리는 분위기를 선택해주세요.</p>
        </div>
        <div class="option-grid">
          ${APP_DATA.moods.map(mood => `
            <div class="option-card mood-card ${this.state.mood === mood.id ? 'selected' : ''}" 
                 data-group="mood" data-value="${mood.id}">
              <div class="mood-preview" style="background:${mood.bg};border-color:${mood.line};">
                <div class="mood-glow" style="background:${mood.glow};"></div>
              </div>
              <span class="mood-icon">${mood.icon}</span>
              <span class="mood-label">${mood.label}</span>
              <span class="mood-desc">${mood.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _renderOptionGroup(title, group, options, multi, hint, moreText) {
    const selectedVals = multi ? this.state[group] : [this.state[group]];
    return `
      <div class="option-section" id="section-${group}">
        <h3 class="section-title">${title}</h3>
        <p class="section-hint">${hint}</p>
        <button class="more-toggle" data-target="more-${group}">더 알아보기 ▾</button>
        <div class="more-content" id="more-${group}">
          <p>${moreText}</p>
        </div>
        <div class="option-grid">
          ${options.map(opt => `
            <div class="option-card ${(selectedVals || []).includes(opt.id) ? 'selected' : ''}" 
                 data-group="${group}" data-value="${opt.id}" data-multi="${multi}"
                 title="${opt.detail || ''}">
              <span class="opt-label">${opt.label}</span>
              <span class="opt-desc">${opt.desc}</span>
            </div>
          `).join('')}
        </div>
        <div class="validation-error" id="error-${group}" style="display:none;">
          이 항목을 선택해주세요
        </div>
      </div>
    `;
  }

  // ============================================================
  // 선택 처리
  // ============================================================

  _handleCardSelect(card, group, value, multi) {
    if (group === 'purpose') {
      const idx = this.state.purposes.indexOf(value);
      if (idx >= 0) {
        this.state.purposes.splice(idx, 1);
        card.classList.remove('selected');
      } else {
        if (this.state.purposes.length >= 3) {
          this._showToast('의도는 최대 3개까지 선택할 수 있습니다.');
          return;
        }
        this.state.purposes.push(value);
        card.classList.add('selected');
      }
      this._updatePurposeAdvice();
    } else if (multi) {
      const idx = this.state[group].indexOf(value);
      if (idx >= 0) {
        this.state[group].splice(idx, 1);
        card.classList.remove('selected');
      } else {
        this.state[group].push(value);
        card.classList.add('selected');
      }
    } else {
      // 단일 선택
      const parent = card.closest('.option-grid');
      if (parent) parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      this.state[group] = value;
    }

    // 에러 메시지 숨기기
    const err = document.getElementById(`error-${group}`);
    if (err) err.style.display = 'none';
  }

  _updatePurposeAdvice() {
    const adviceEl = document.getElementById('purpose-advice');
    if (!adviceEl) return;
    const count = this.state.purposes.length;
    if (count === 0) {
      adviceEl.textContent = '';
      adviceEl.className = 'purpose-advice';
    } else if (count === 1) {
      adviceEl.textContent = '✨ 좋습니다! 하나의 중심 의도는 가장 선명하고 강력한 시길을 만듭니다.';
      adviceEl.className = 'purpose-advice advice-good';
    } else if (count === 2) {
      adviceEl.textContent = '⚠️ 두 가지 의도를 담을 수 있습니다. 두 목적이 서로 연결되는지 생각해보세요.';
      adviceEl.className = 'purpose-advice advice-warn';
    } else {
      adviceEl.textContent = '⚡ 세 가지 의도는 복잡한 시길이 됩니다. 가장 중요한 하나에 집중하면 더 강력해집니다.';
      adviceEl.className = 'purpose-advice advice-complex';
    }
  }

  // ============================================================
  // 유효성 검사 및 다음 단계
  // ============================================================

  _validateAndNext(screen) {
    let valid = true;

    if (screen === 'purpose') {
      if (this.state.purposes.length === 0) {
        this._highlightError('purpose-section', '목적을 하나 이상 선택해주세요.');
        valid = false;
      }
      if (valid) this.showScreen('type');

    } else if (screen === 'traditional') {
      const required = [
        { id: 'structure', label: '봉인 구조' },
        { id: 'density', label: '상징의 밀도' },
        { id: 'lineStyle', label: '선 스타일' },
        { id: 'symmetry', label: '대칭 방식' }
      ];
      const missing = [];
      required.forEach(r => {
        if (!this.state[r.id]) {
          this._showSectionError(r.id);
          missing.push(r.label);
          valid = false;
        }
      });
      if (!valid) {
        this._showToast(`선택하지 않은 항목이 있습니다: ${missing.join(', ')}`);
        // 첫 번째 미선택 항목으로 스크롤
        const firstMissing = required.find(r => !this.state[r.id]);
        if (firstMissing) {
          const el = document.getElementById(`section-${firstMissing.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        this.showScreen('mood');
      }

    } else if (screen === 'modern') {
      const required = [
        { id: 'style', label: '표현 스타일' },
        { id: 'lineStyle', label: '선 스타일' },
        { id: 'complexity', label: '복잡도' },
        { id: 'symmetry', label: '대칭 방식' }
      ];
      const missing = [];
      required.forEach(r => {
        if (!this.state[r.id]) {
          this._showSectionError(r.id);
          missing.push(r.label);
          valid = false;
        }
      });
      if (!valid) {
        this._showToast(`선택하지 않은 항목이 있습니다: ${missing.join(', ')}`);
        const firstMissing = required.find(r => !this.state[r.id]);
        if (firstMissing) {
          const el = document.getElementById(`section-${firstMissing.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        this.showScreen('mood');
      }

    } else if (screen === 'mood') {
      if (!this.state.mood) {
        this._showToast('분위기를 선택해주세요.');
        valid = false;
      }
      if (valid) this.showScreen('edit');
    }
  }

  _showSectionError(groupId) {
    const section = document.getElementById(`section-${groupId}`);
    if (section) {
      section.classList.add('shake');
      section.style.borderColor = '#ff4455';
      setTimeout(() => {
        section.classList.remove('shake');
        section.style.borderColor = '';
      }, 800);
    }
    const err = document.getElementById(`error-${groupId}`);
    if (err) err.style.display = 'block';
  }

  _highlightError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 800);
    }
    this._showToast(msg);
  }

  // ============================================================
  // 편집 화면
  // ============================================================

  _initEditScreen() {
    // 슬라이더 기본값
    const scaleSlider = document.getElementById('scale-slider');
    if (scaleSlider) scaleSlider.value = this.state.scale;
    const rotationSlider = document.getElementById('rotation-slider');
    if (rotationSlider) rotationSlider.value = this.state.rotation;
    const glowSlider = document.getElementById('glow-slider');
    if (glowSlider) glowSlider.value = this.state.glowIntensity;

    // 분위기 미리보기 반영
    const moodData = APP_DATA.moods.find(m => m.id === this.state.mood) || APP_DATA.moods[0];
    const canvas = document.getElementById('edit-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = moodData.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    this._generateSigil();
  }

  async _generateSigil() {
    if (this.state.isGenerating) return;
    this.state.isGenerating = true;
    this.state.generationDone = false;

    const progressEl = document.getElementById('generation-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const genBtn = document.getElementById('btn-edit-generate');
    const saveBtn = document.getElementById('btn-edit-save');

    if (progressEl) progressEl.style.display = 'flex';
    if (genBtn) genBtn.disabled = true;
    if (saveBtn) saveBtn.disabled = true;

    const canvas = this.editCanvas;
    if (!canvas) { this.state.isGenerating = false; return; }

    const resData = APP_DATA.resolutions.find(r => r.id === this.state.resolution) || APP_DATA.resolutions[1];
    canvas.width = Math.floor(resData.width / 4);
    canvas.height = Math.floor(resData.height / 4);

    const config = {
      purposes: this.state.purposes,
      type: this.state.type,
      structure: this.state.structure,
      style: this.state.style,
      density: this.state.density,
      lineStyle: this.state.lineStyle,
      symmetry: this.state.symmetry,
      decoration: this.state.decoration,
      complexity: this.state.complexity,
      mood: this.state.mood,
      glowIntensity: this.state.glowIntensity
    };

    try {
      this._updateProgress(0);
      await this.sigilEngine.generate(config);
      this.state.generationDone = true;
    } catch (err) {
      console.error('Generation error:', err);
    }

    this._updateProgress(100);
    await new Promise(r => setTimeout(r, 300));

    if (progressEl) progressEl.style.display = 'none';
    if (genBtn) genBtn.disabled = false;
    if (saveBtn) saveBtn.disabled = false;
    this.state.isGenerating = false;
  }

  _updateProgress(val) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    if (progressBar) progressBar.style.width = val + '%';
    if (progressText) progressText.textContent = val + '%';
  }

  // ============================================================
  // 저장 화면
  // ============================================================

  _goToSave() {
    if (!this.state.generationDone) {
      this._showToast('시길 생성이 완료된 후 저장할 수 있습니다.');
      return;
    }
    // 보관함에 자동 저장
    if (!this.lastSavedConfig) {
      this._saveToHistory();
    }
    this.showScreen('save');
  }

  _initSaveScreen() {
    // 미리보기 이미지 설정
    const preview = document.getElementById('save-preview');
    const canvas = this.editCanvas;
    if (preview && canvas && this.state.generationDone) {
      preview.src = canvas.toDataURL('image/png');
    }

    // 기본 해상도 버튼 선택
    document.querySelectorAll('.resolution-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.res === this.state.resolution);
    });
  }

  async _downloadPNG(transparent) {
    const resData = APP_DATA.resolutions.find(r => r.id === this.state.resolution) || APP_DATA.resolutions[1];
    const offCanvas = document.createElement('canvas');
    offCanvas.width = resData.width;
    offCanvas.height = resData.height;
    const offEngine = new SigilEngine(offCanvas);

    const config = {
      purposes: this.state.purposes,
      type: this.state.type,
      structure: this.state.structure,
      style: this.state.style,
      density: this.state.density,
      lineStyle: this.state.lineStyle,
      symmetry: this.state.symmetry,
      decoration: this.state.decoration,
      complexity: this.state.complexity,
      mood: this.state.mood,
      glowIntensity: this.state.glowIntensity
    };

    this._showToast('고화질로 렌더링 중...');
    await offEngine.generate(config);

    if (transparent) {
      const ctx = offCanvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const data = imageData.data;
      const moodData = APP_DATA.moods.find(m => m.id === this.state.mood) || APP_DATA.moods[0];
      const bgR = parseInt(moodData.bg.slice(1, 3), 16);
      const bgG = parseInt(moodData.bg.slice(3, 5), 16);
      const bgB = parseInt(moodData.bg.slice(5, 7), 16);
      for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - bgR);
        const dg = Math.abs(data[i + 1] - bgG);
        const db = Math.abs(data[i + 2] - bgB);
        if (dr + dg + db < 45) data[i + 3] = 0;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    const link = document.createElement('a');
    link.download = `creosigil_${transparent ? 'transparent_' : ''}${Date.now()}.png`;
    link.href = offCanvas.toDataURL('image/png');
    link.click();
    this._showToast(transparent ? '투명 PNG 저장 완료!' : 'PNG 저장 완료!');
  }

  _downloadSVG() {
    const moodData = APP_DATA.moods.find(m => m.id === this.state.mood) || APP_DATA.moods[0];
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 2560" width="1440" height="2560">
  <rect width="1440" height="2560" fill="${moodData.bg}"/>
  <circle cx="720" cy="1280" r="400" fill="none" stroke="${moodData.line}" stroke-width="3" filter="url(#glow)"/>
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- CREOSIGIL - ${new Date().toLocaleDateString('ko-KR')} -->
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `creosigil_${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    this._showToast('SVG 저장 완료!');
  }

  async _shareImage() {
    if (!this.editCanvas) return;
    try {
      const blob = await new Promise(resolve => this.editCanvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `creosigil_${Date.now()}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'CREOSIGIL', text: '내 시길을 공유합니다.' });
      } else {
        // 폴백: 다운로드
        this._downloadPNG(false);
      }
    } catch (err) {
      this._downloadPNG(false);
    }
  }

  // ============================================================
  // 보관함
  // ============================================================

  _saveToHistory() {
    if (!this.editCanvas || !this.state.generationDone) return;
    const config = {
      purposes: [...this.state.purposes],
      type: this.state.type,
      structure: this.state.structure,
      style: this.state.style,
      density: this.state.density,
      lineStyle: this.state.lineStyle,
      symmetry: this.state.symmetry,
      decoration: [...(this.state.decoration || [])],
      complexity: this.state.complexity,
      mood: this.state.mood,
      glowIntensity: this.state.glowIntensity,
      resolution: this.state.resolution
    };
    const thumbnail = this.editCanvas.toDataURL('image/jpeg', 0.5);
    const item = {
      id: Date.now(),
      config,
      thumbnail,
      date: new Date().toLocaleDateString('ko-KR')
    };
    this.historyList.unshift(item);
    if (this.historyList.length > 20) this.historyList.pop();
    localStorage.setItem('creosigil_history', JSON.stringify(this.historyList));
    this.lastSavedConfig = config;
  }

  _loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('creosigil_history')) || [];
    } catch { return []; }
  }

  _renderHistory() {
    const container = document.getElementById('archive-list');
    if (!container) return;
    if (this.historyList.length === 0) {
      container.innerHTML = '<div class="archive-empty">저장된 시길이 없습니다.<br>시길을 만들고 저장하면 여기에 보관됩니다.</div>';
      return;
    }
    container.innerHTML = this.historyList.map(item => `
      <div class="archive-item" data-id="${item.id}">
        <img class="archive-thumb" src="${item.thumbnail}" alt="sigil">
        <div class="archive-info">
          <span class="archive-date">${item.date}</span>
          <span class="archive-meta">${item.config.type === 'traditional' ? '전통형' : '현대형'} · ${this._getMoodLabel(item.config.mood)}</span>
          <span class="archive-purposes">${(item.config.purposes || []).map(p => this._getPurposeLabel(p)).join(' · ')}</span>
        </div>
        <div class="archive-actions">
          <button class="btn-archive-load" onclick="app.loadFromHistory(${item.id})">다시 편집</button>
          <button class="btn-archive-delete" onclick="app.deleteHistory(${item.id})">삭제</button>
        </div>
      </div>
    `).join('');
  }

  loadFromHistory(id) {
    const item = this.historyList.find(h => h.id === id);
    if (!item) return;
    Object.assign(this.state, item.config);
    this.state.generationDone = false;
    this.lastSavedConfig = null;
    this.showScreen('edit');
  }

  deleteHistory(id) {
    this.historyList = this.historyList.filter(h => h.id !== id);
    localStorage.setItem('creosigil_history', JSON.stringify(this.historyList));
    this._renderHistory();
  }

  _getMoodLabel(id) {
    const m = APP_DATA.moods.find(m => m.id === id);
    return m ? m.label : id;
  }

  _getPurposeLabel(id) {
    const p = APP_DATA.purposes.find(p => p.id === id);
    return p ? p.label : id;
  }

  // ============================================================
  // 유틸리티
  // ============================================================

  _toggleMore(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('open');
  }

  _showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  _showExamples() {
    this._showToast('예시 화면은 준비 중입니다.');
  }
}

// 앱 시작
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new CreosigilApp();
});

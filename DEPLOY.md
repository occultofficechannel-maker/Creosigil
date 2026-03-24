# CREOSIGIL — GitHub & GitHub Pages 배포 가이드

## 📦 프로젝트 구조

```
creosigil/
├── index.html          # 메인 앱 파일
├── manifest.json       # PWA 매니페스트
├── sw.js               # 서비스 워커 (오프라인 지원)
├── css/
│   └── style.css       # 전체 스타일시트
├── js/
│   ├── data.js         # 앱 데이터 (목적, 옵션 등)
│   ├── sigil-engine.js # 시길 생성 엔진 (Canvas)
│   └── app.js          # 앱 메인 로직
├── icons/
│   └── icon.svg        # 앱 아이콘 (SVG)
├── .gitignore
├── README.md
└── DEPLOY.md           # 이 파일
```

---

## 🚀 GitHub에 올리는 방법

### 1. GitHub 저장소 만들기
1. https://github.com 접속 → 로그인
2. 우측 상단 `+` → `New repository`
3. Repository name: `creosigil` (또는 원하는 이름)
4. Public 선택 (GitHub Pages 무료 사용)
5. `Create repository` 클릭

---

### 2. 코드 업로드 (옵션 A: GitHub 웹 업로드)

**가장 쉬운 방법입니다.**

1. 저장소 페이지에서 `uploading an existing file` 클릭
2. 아래 파일/폴더를 업로드:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `.gitignore`
   - `README.md`
   - `DEPLOY.md`
3. 폴더는 직접 드래그로 업로드:
   - `css/style.css`
   - `js/data.js`
   - `js/sigil-engine.js`
   - `js/app.js`
   - `icons/icon.svg`
4. `Commit changes` 클릭

---

### 3. 코드 업로드 (옵션 B: Git CLI)

```bash
# 로컬 폴더에서 실행
git init
git add .
git commit -m "feat: CREOSIGIL PWA v1.0 초기 배포"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/creosigil.git
git push -u origin main
```

---

## 🌐 GitHub Pages로 공개 배포하는 방법

코드가 GitHub에 올라간 후:

1. 저장소 페이지 → `Settings` 탭
2. 좌측 메뉴 → `Pages`
3. **Source**: `Deploy from a branch` 선택
4. **Branch**: `main` / `/ (root)` 선택
5. `Save` 클릭
6. 약 1~3분 후 배포 완료

### 배포 URL 형태
```
https://YOUR_USERNAME.github.io/creosigil/
```

> 예: `https://myname.github.io/creosigil/`

---

## 📱 PWA 설치 방법 (스마트폰)

### Android (Chrome)
1. 위 URL을 Chrome으로 열기
2. 주소창 오른쪽 `⋮` → `홈 화면에 추가`
3. `추가` 탭

### iPhone (Safari)
1. 위 URL을 Safari로 열기
2. 하단 공유 버튼(□↑) 탭
3. `홈 화면에 추가` 탭
4. `추가` 탭

---

## ⚠️ 주의사항

- `sw.js` 서비스 워커는 HTTPS 환경에서만 정상 동작합니다
- GitHub Pages는 기본적으로 HTTPS를 제공하므로 배포 후 PWA 기능 완전 활성화
- 로컬에서 `file://` 프로토콜로 열면 서비스 워커가 작동하지 않을 수 있음

---

## 🔄 업데이트 배포

코드 수정 후:

```bash
git add .
git commit -m "fix: 버그 수정 내용"
git push
```

GitHub Pages는 push 후 자동으로 재배포됩니다.

---

## 📊 앱 정보

| 항목 | 내용 |
|---|---|
| 앱 이름 | CREOSIGIL |
| 버전 | 1.0 |
| 타입 | PWA (Progressive Web App) |
| 저장 방식 | LocalStorage (기기 내 저장) |
| 서버 불필요 | 완전 정적 웹앱 |
| 지원 저장 포맷 | PNG (고화질), 투명 PNG, SVG |
| 지원 해상도 | 1080×1920, 1440×2560, 2160×3840 |

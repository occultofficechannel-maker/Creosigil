/**
 * CREOSIGIL - 데이터 모듈
 * 목적, 스타일, 분위기 데이터 정의
 */

const PURPOSES = [
  { id: 'protection', name: '보호', desc: '외부 기운 차단', icon: '🛡', symbol: '△' },
  { id: 'purification', name: '정화', desc: '부정적 에너지 제거', icon: '✦', symbol: '○' },
  { id: 'prosperity', name: '번영', desc: '풍요와 성공', icon: '◈', symbol: '☆' },
  { id: 'focus', name: '집중', desc: '목표와 의지', icon: '◎', symbol: '→' },
  { id: 'healing', name: '회복', desc: '치유와 재생', icon: '❂', symbol: '∞' },
  { id: 'block', name: '차단', desc: '특정 에너지 봉인', icon: '⊗', symbol: '✕' },
  { id: 'love', name: '인연', desc: '관계와 연결', icon: '◇', symbol: '♡' },
  { id: 'intuition', name: '직관', desc: '내면의 지혜', icon: '⌬', symbol: '⟨⟩' }
];

const PURPOSE_ADVICE = {
  1: '하나의 목적에 집중할수록 시길이 더 선명하고 강해집니다.',
  2: '두 목적이 연결되어 복합적인 시길이 만들어집니다. 중심 의도를 먼저 확인하세요.',
  3: '세 목적이 결합됩니다. 가장 중요한 하나가 중심이 되어야 해요.',
  over: '⚠️ 여러 목적이 섞이면 시길이 복잡해집니다. 1~2개를 권장합니다.'
};

const TRADITIONAL_OPTIONS = {
  structure: {
    title: '봉인 구조',
    advice: '시길의 기본 형태를 결정합니다. 원형 인장은 가장 안정적인 전통 형태입니다.',
    items: [
      { id: 'circle-seal', name: '원형 인장', desc: '원을 기반으로 한 봉인 형태' },
      { id: 'magic-circle', name: '마법진', desc: '다층 원형 구조의 의식 문양' },
      { id: 'seal-gate', name: '봉인문', desc: '에너지를 가두는 봉인 형태' },
      { id: 'rune-combo', name: '룬 결합', desc: '룬 문자를 조합한 상징' },
      { id: 'ritual-sym', name: '의식 대칭', desc: '완전 대칭의 의식 형태' },
      { id: 'moon-bond', name: '월상 결속', desc: '달 위상을 반영한 형태' }
    ]
  },
  density: {
    title: '상징의 밀도',
    advice: '처음 시길을 만든다면 중간 밀도를 권장합니다.',
    items: [
      { id: 'simple', name: '단순', desc: '최소 요소, 강한 인상' },
      { id: 'medium', name: '중간', desc: '균형 잡힌 구성' },
      { id: 'complex', name: '복합', desc: '세밀하고 풍부한 구성' },
      { id: 'multi', name: '다층', desc: '여러 층이 겹친 형태' }
    ]
  },
  lineStyle: {
    title: '선 스타일',
    advice: '선의 종류가 시길의 감성을 크게 좌우합니다.',
    items: [
      { id: 'thin-ink', name: '가는 잉크선', desc: '섬세하고 정밀함' },
      { id: 'carved', name: '새긴 선', desc: '돌에 새긴 듯 강함' },
      { id: 'rough', name: '거친 필사선', desc: '손으로 쓴 유기적 느낌' },
      { id: 'sharp', name: '날카로운 각선', desc: '단호하고 결단적' }
    ]
  },
  symmetry: {
    title: '대칭 방식',
    advice: '완전 대칭은 안정감을, 부분 대칭은 긴장감을 줍니다.',
    items: [
      { id: 'full-sym', name: '완전 대칭', desc: '수직·수평 완전 균형' },
      { id: 'partial-sym', name: '반대칭', desc: '한 축만 대칭' },
      { id: 'intentional', name: '의식적 불균형', desc: '의도적 비대칭' }
    ]
  },
  decoration: {
    title: '외곽 장식',
    advice: '외곽 장식은 시길에 의식적 경계를 더합니다.',
    items: [
      { id: 'no-deco', name: '없음', desc: '순수한 형태만' },
      { id: 'single-ring', name: '단일 링', desc: '하나의 원으로 경계' },
      { id: 'double-ring', name: '이중 링', desc: '두 겹의 원형 경계' },
      { id: 'dot-ring', name: '룬 점열', desc: '점과 룬 기호 배치' },
      { id: 'star-ring', name: '별자리 점', desc: '별자리 패턴 배치' }
    ]
  }
};

const MODERN_OPTIONS = {
  style: {
    title: '표현 스타일',
    advice: '어떤 시각 언어로 표현할지 결정합니다.',
    items: [
      { id: 'minimal-logo', name: '미니멀 로고', desc: '불필요한 요소 제거' },
      { id: 'geometric', name: '기하학형', desc: '도형 중심 구성' },
      { id: 'neon-symbol', name: '네온 심볼', desc: '발광 효과 중심' },
      { id: 'emblem', name: '엠블럼형', desc: '배지·원형 배지 형태' },
      { id: 'abstract', name: '추상 아이콘', desc: '자유로운 선 조합' },
      { id: 'crystal', name: '유리 크리스탈', desc: '결정체 구조 느낌' }
    ]
  },
  form: {
    title: '형태 성향',
    advice: '배경화면 용도라면 세로형 심볼이나 방사형을 추천합니다.',
    items: [
      { id: 'circle-center', name: '원형 중심', desc: '원을 기반으로 안정적' },
      { id: 'vertical', name: '세로형 심볼', desc: '세로 화면에 최적화' },
      { id: 'radial', name: '방사형', desc: '중심에서 퍼지는 구조' },
      { id: 'badge', name: '배지형', desc: '완결된 인장 느낌' }
    ]
  },
  tone: {
    title: '시각 톤',
    advice: '같은 스타일이라도 톤에 따라 느낌이 완전히 달라집니다.',
    items: [
      { id: 'clean-lux', name: '클린 럭스', desc: '여백과 정제, 고급스러움' },
      { id: 'futuristic', name: '미래적 테크', desc: '날카롭고 디지털 감각' },
      { id: 'dark-neon', name: '다크 네온', desc: '어두운 배경에 발광' },
      { id: 'astral', name: '시린 아스트랄', desc: '우주·은빛 세계' }
    ]
  },
  lineStyle: {
    title: '선 스타일',
    advice: '현대형은 선이 디자인 품질을 크게 좌우합니다.',
    items: [
      { id: 'monoline', name: '모노라인', desc: '균일한 두께의 단일 선' },
      { id: 'double-line', name: '이중선', desc: '두 선이 나란히' },
      { id: 'glow-line', name: '발광선', desc: '빛이 나는 네온 효과' },
      { id: 'chrome', name: '크롬 메탈선', desc: '금속 광택 질감' }
    ]
  },
  complexity: {
    title: '복잡도',
    advice: '배경화면 용도라면 심플~밸런스를 권장합니다.',
    items: [
      { id: 'simple', name: '심플', desc: '여백 중심, 빠른 인식' },
      { id: 'balance', name: '밸런스', desc: '구조와 장식의 균형' },
      { id: 'detailed', name: '정교', desc: '세부 묘사 풍부' },
      { id: 'elaborate', name: '화려함', desc: '장식 강화' }
    ]
  }
};

const MOODS = [
  {
    id: 'obsidian', name: '흑요석 다크', desc: '강렬한 보호',
    bg: '#0a0a0f', line: '#d9cfff', glow: '#a992ff', secondary: '#1a1428'
  },
  {
    id: 'moonlight', name: '월광 실버', desc: '직관과 정화',
    bg: '#0c0e14', line: '#e8eeff', glow: '#8fa4d4', secondary: '#141826'
  },
  {
    id: 'crimson', name: '심홍 봉인', desc: '의지와 행동',
    bg: '#120b0d', line: '#ffd9d9', glow: '#e05a7a', secondary: '#1e0f12'
  },
  {
    id: 'sacred', name: '백색 정화', desc: '순수와 치유',
    bg: '#f4f5f8', line: '#1b1e27', glow: '#6b7094', secondary: '#e8eaf0'
  },
  {
    id: 'bronze', name: '황동 각인', desc: '번영과 성공',
    bg: '#0e0b07', line: '#f5e6b0', glow: '#c89b3c', secondary: '#1a1408'
  },
  {
    id: 'neon', name: '네온 아스트랄', desc: '에너지 발산',
    bg: '#090a14', line: '#d9e5ff', glow: '#38d5ff', secondary: '#0d0f1c'
  },
  {
    id: 'minimal', name: '미니멀 럭스', desc: '정제와 고급',
    bg: '#111118', line: '#ffffff', glow: '#ccccee', secondary: '#1a1a24'
  },
  {
    id: 'cosmic', name: '코스믹 바이올렛', desc: '신비와 탐구',
    bg: '#0a071a', line: '#c8bbff', glow: '#7c5cff', secondary: '#14103a'
  }
];

// 목적별 전통형 추천 기본값
const PURPOSE_TRADITIONAL_DEFAULT = {
  protection:   { structure: 'circle-seal', density: 'medium', lineStyle: 'carved',  symmetry: 'full-sym', decoration: 'double-ring' },
  purification: { structure: 'ritual-sym',  density: 'simple', lineStyle: 'thin-ink', symmetry: 'full-sym', decoration: 'single-ring' },
  prosperity:   { structure: 'magic-circle',density: 'complex',lineStyle: 'thin-ink', symmetry: 'full-sym', decoration: 'star-ring' },
  focus:        { structure: 'seal-gate',   density: 'medium', lineStyle: 'sharp',   symmetry: 'full-sym', decoration: 'single-ring' },
  healing:      { structure: 'moon-bond',   density: 'simple', lineStyle: 'thin-ink', symmetry: 'full-sym', decoration: 'no-deco' },
  block:        { structure: 'seal-gate',   density: 'complex',lineStyle: 'sharp',   symmetry: 'full-sym', decoration: 'double-ring' },
  love:         { structure: 'circle-seal', density: 'medium', lineStyle: 'rough',   symmetry: 'partial-sym', decoration: 'dot-ring' },
  intuition:    { structure: 'moon-bond',   density: 'simple', lineStyle: 'thin-ink', symmetry: 'partial-sym', decoration: 'no-deco' }
};

// 목적별 현대형 추천 기본값
const PURPOSE_MODERN_DEFAULT = {
  protection:   { style: 'emblem',      form: 'circle-center', tone: 'futuristic', lineStyle: 'monoline',   complexity: 'balance' },
  purification: { style: 'minimal-logo',form: 'vertical',      tone: 'clean-lux',  lineStyle: 'monoline',   complexity: 'simple' },
  prosperity:   { style: 'geometric',   form: 'radial',        tone: 'astral',     lineStyle: 'chrome',     complexity: 'detailed' },
  focus:        { style: 'minimal-logo',form: 'circle-center', tone: 'futuristic', lineStyle: 'monoline',   complexity: 'simple' },
  healing:      { style: 'crystal',     form: 'vertical',      tone: 'astral',     lineStyle: 'double-line',complexity: 'balance' },
  block:        { style: 'geometric',   form: 'badge',         tone: 'dark-neon',  lineStyle: 'glow-line',  complexity: 'balance' },
  love:         { style: 'abstract',    form: 'radial',        tone: 'clean-lux',  lineStyle: 'double-line',complexity: 'simple' },
  intuition:    { style: 'crystal',     form: 'vertical',      tone: 'astral',     lineStyle: 'glow-line',  complexity: 'simple' }
};

// 목적별 기본 분위기
const PURPOSE_MOOD_DEFAULT = {
  protection: 'obsidian',
  purification: 'sacred',
  prosperity: 'bronze',
  focus: 'minimal',
  healing: 'moonlight',
  block: 'crimson',
  love: 'cosmic',
  intuition: 'moonlight'
};

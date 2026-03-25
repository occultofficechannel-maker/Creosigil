// CREOSIGIL — Data: purposes, styles, moods, advice texts

const PURPOSES = [
  { id: 'protection', icon: '🛡', name: '보호', desc: '외부 기운 차단, 감정 소모 방지', advice: '보호의 시길은 경계를 세웁니다. 무엇으로부터 자신을 지키고 싶은지 선명하게 생각하세요.' },
  { id: 'purification', icon: '✨', name: '정화', desc: '오래된 감정, 부정적 에너지 해소', advice: '정화는 덜어내는 행위입니다. 지금 놓아야 할 것이 무엇인지 떠올리며 선택하세요.' },
  { id: 'prosperity', icon: '🌿', name: '번영', desc: '풍요, 기회, 흐름의 활성화', advice: '번영은 강요가 아닌 열림입니다. 받아들일 준비가 된 마음으로 시작하세요.' },
  { id: 'focus', icon: '🎯', name: '집중', desc: '목표 명료화, 잡념 해소, 몰입', advice: '집중의 시길은 단순할수록 강합니다. 하나의 목표만 담으세요.' },
  { id: 'healing', icon: '💜', name: '회복', desc: '몸과 마음의 치유, 재생', advice: '회복은 시간이 필요합니다. 이 시길은 그 과정을 함께 담아냅니다.' },
  { id: 'blocking', icon: '🔒', name: '차단', desc: '특정 관계·영향·기운 봉인', advice: '차단은 강한 의지를 요합니다. 무엇을 끊어내고 싶은지 명확히 정하세요.' },
  { id: 'connection', icon: '🌙', name: '인연', desc: '관계 연결, 좋은 만남 초대', advice: '인연의 시길은 열린 마음에서 시작됩니다. 어떤 관계를 원하는지 생각하세요.' },
  { id: 'intuition', icon: '👁', name: '직관', desc: '내면의 목소리 강화, 통찰', advice: '직관은 내면에서 옵니다. 고요한 마음으로 선택에 집중하세요.' },
];

const TRAD_STRUCTURES = [
  { id: 'circle_seal', icon: '⭕', name: '원형 인장형', desc: '원을 기반으로 한 고전적 봉인 구조. 가장 안정적이고 완결된 인상.', detail: '원형 인장은 시길의 가장 기본적인 형태로, 완전함과 보호를 상징합니다. 동서양 마법 전통에서 모두 쓰이며, 경계를 세우고 의도를 봉인하는 힘이 있습니다.' },
  { id: 'magic_circle', icon: '🔮', name: '마법진형', desc: '다층 구조의 의식 원진. 복잡하고 신비로운 에너지장.', detail: '마법진은 여러 겹의 원과 상징이 겹쳐 이루어집니다. 복잡한 의도나 여러 목적을 하나의 강력한 구조로 통합할 때 적합합니다.' },
  { id: 'seal_gate', icon: '🗝', name: '봉인문형', desc: '특정 기운이나 존재를 봉인·차단하는 형태.', detail: '봉인문은 문을 닫는 행위를 상징합니다. 차단, 보호, 결계의 의도에 가장 적합하며 강한 경계를 만들어냅니다.' },
  { id: 'rune_combo', icon: '𝄞', name: '룬 결합형', desc: '고대 룬 문자를 결합해 의미를 층위화.', detail: '룬은 고대 북유럽의 신성한 문자로, 각각 고유한 의미와 힘을 지닙니다. 여러 룬을 결합해 의도를 다층적으로 표현할 수 있습니다.' },
  { id: 'symmetric', icon: '⚖', name: '의식 대칭형', desc: '좌우·상하 완전 대칭의 의식 구조. 균형과 안정.', detail: '대칭은 균형과 조화를 나타냅니다. 회복, 정화, 집중처럼 안정을 원하는 의도에 잘 어울립니다.' },
  { id: 'moon_bind', icon: '🌕', name: '월상 결속형', desc: '달의 위상을 반영한 천체적 봉인 구조.', detail: '달은 변화와 주기, 내면의 힘을 상징합니다. 달의 위상을 담은 시길은 흐름과 타이밍을 의도에 연결합니다.' },
];

const MODERN_STYLES = [
  { id: 'minimal_logo', icon: '◻', name: '미니멀 로고형', desc: '핵심 형태만 남긴 정제된 구조. 세련되고 고급스러움.', detail: '미니멀 로고형은 불필요한 요소를 모두 제거하고 본질만 남깁니다. 배경화면과 다른 앱에서 재사용하기 가장 편리한 형태입니다.' },
  { id: 'geometric', icon: '◇', name: '기하학형', desc: '삼각·육각·원 등 도형 중심의 정교한 구성.', detail: '기하학은 수학적 아름다움과 이성적 질서를 담습니다. 집중, 균형, 목표 달성의 의도와 잘 어울립니다.' },
  { id: 'neon_symbol', icon: '⚡', name: '네온 심볼형', desc: '발광 효과 중심의 강렬하고 미래적인 인상.', detail: '네온은 빛과 에너지를 가시화합니다. 강한 존재감과 목표 달성 에너지를 시각화하는 데 적합합니다.' },
  { id: 'emblem', icon: '🏅', name: '엠블럼형', desc: '방패·원형 배지 형태의 권위감 있는 구성.', detail: '엠블럼은 소속감과 정체성을 담습니다. 자신감, 존재감, 번영의 의도를 강하게 표현합니다.' },
  { id: 'abstract', icon: '〰', name: '추상 아이콘형', desc: '자유로운 선 조합의 개성 있는 구성.', detail: '추상은 규칙을 벗어난 자유로운 표현입니다. 독창적인 개성을 원하거나 직관적 의도를 담고 싶을 때 선택하세요.' },
  { id: 'crystal', icon: '💎', name: '크리스탈형', desc: '유리·보석 결정체 구조의 신비롭고 고급스러운 인상.', detail: '크리스탈은 정화와 투명함, 고급감을 상징합니다. 에너지 정화, 직관, 고급스러운 미감을 원할 때 선택하세요.' },
];

const TRAD_SYMBOLS = [
  { id: 'triangle', icon: '△', name: '삼각', desc: '방향성, 불꽃, 의지' },
  { id: 'circle', icon: '○', name: '원', desc: '완전함, 순환, 보호' },
  { id: 'grid', icon: '⊞', name: '사각/격자', desc: '안정, 구조, 지상' },
  { id: 'stars', icon: '✦', name: '점·별', desc: '천체, 빛, 방향' },
  { id: 'crescent', icon: '☽', name: '달', desc: '주기, 내면, 여성성' },
  { id: 'seal_line', icon: '〓', name: '봉인선', desc: '차단, 결계, 경계' },
];

const TRAD_DENSITY = [
  { id: 'simple', name: '단순', desc: '요소 1~2개, 여백 강조', icon: '·' },
  { id: 'medium', name: '중간', desc: '균형 잡힌 구성', icon: '⊙' },
  { id: 'complex', name: '복합', desc: '다층적 상징 구성', icon: '⊛' },
  { id: 'multilayer', name: '다층', desc: '겹겹이 쌓인 구조', icon: '⊕' },
];

const TRAD_LINE_STYLES = [
  { id: 'thin_ink', name: '가는 잉크선', desc: '섬세하고 정밀한', icon: '—' },
  { id: 'carved', name: '새긴 선', desc: '강하고 각인된 느낌', icon: '▬' },
  { id: 'rough', name: '거친 필사선', desc: '유기적이고 손으로 쓴 느낌', icon: '〰' },
  { id: 'sharp', name: '날카로운 각선', desc: '단호하고 결단적인', icon: '⟨⟩' },
];

const TRAD_SYMMETRY = [
  { id: 'full', name: '완전 대칭', desc: '수직·수평·방사 완전 균형' },
  { id: 'half', name: '반대칭', desc: '일부 대칭, 자연스러운 변주' },
  { id: 'intentional', name: '의도적 불균형', desc: '방향성이 있는 구조' },
];

const TRAD_DECORATIONS = [
  { id: 'outer_ring', name: '외곽 원', desc: '단일 또는 이중 원 테두리', icon: '◯' },
  { id: 'rune_dots', name: '룬 점열', desc: '점이나 작은 기호의 열', icon: '···' },
  { id: 'star_dots', name: '별자리 점', desc: '천체의 배치를 참고한 점', icon: '✦✦' },
  { id: 'seal_cross', name: '결계선', desc: '교차하는 봉인 라인', icon: '✛' },
];

const MODERN_LINE_STYLES = [
  { id: 'monoline', name: '모노라인', desc: '균일한 두께의 단일 선', icon: '—' },
  { id: 'double', name: '이중선', desc: '두 선이 나란히 구성', icon: '═' },
  { id: 'glow_line', name: '발광선', desc: '빛이 나는 네온 효과', icon: '〜' },
  { id: 'chrome', name: '크롬 메탈선', desc: '금속 광택이 느껴지는 선', icon: '≡' },
];

const MODERN_COMPLEXITY = [
  { id: 'simple', name: '심플', desc: '요소 적고 여백 많음' },
  { id: 'balance', name: '밸런스', desc: '구조와 장식의 균형' },
  { id: 'detailed', name: '정교', desc: '세부 묘사 풍부' },
  { id: 'elaborate', name: '화려함', desc: '장식 강화, 강렬한 인상' },
];

const MODERN_SYMMETRY = [
  { id: 'full', name: '완전 대칭', desc: '수직·수평·방사 완전 균형' },
  { id: 'left_right', name: '좌우 대칭', desc: '좌우만 대칭, 상하 자유' },
  { id: 'radial', name: '방사 대칭', desc: '중심에서 방사형으로 균형' },
];

const MOODS = [
  {
    id: 'obsidian', name: '흑요석 다크', icon: '🖤',
    desc: '검고 신비로운 오컬트 무드',
    colors: { bg: '#070708', line: '#C8C0E8', glow: '#9B8FCC', accent: '#7B70B0', ambient: 'rgba(80, 60, 140, 0.15)' }
  },
  {
    id: 'moonlight', name: '월광 실버', icon: '🌙',
    desc: '차갑고 고요한 달빛 무드',
    colors: { bg: '#0A0D14', line: '#D4E0F0', glow: '#A8C0E0', accent: '#6890C0', ambient: 'rgba(100, 140, 200, 0.12)' }
  },
  {
    id: 'crimson', name: '심홍 봉인', icon: '🔴',
    desc: '붉고 강렬한 봉인의 무드',
    colors: { bg: '#0D0609', line: '#F0D0D8', glow: '#D06080', accent: '#A04060', ambient: 'rgba(160, 40, 70, 0.15)' }
  },
  {
    id: 'sacred_white', name: '백색 정화', icon: '🤍',
    desc: '맑고 순수한 정화의 무드',
    colors: { bg: '#0E0E12', line: '#F0EEF8', glow: '#E0DCF4', accent: '#B0A8D8', ambient: 'rgba(180, 175, 220, 0.1)' }
  },
  {
    id: 'brass', name: '황동 각인', icon: '🟡',
    desc: '고대의 황동 인장 무드',
    colors: { bg: '#0C0A06', line: '#E8D890', glow: '#C8B850', accent: '#907830', ambient: 'rgba(160, 140, 40, 0.12)' }
  },
  {
    id: 'neon_astral', name: '네온 아스트랄', icon: '💙',
    desc: '우주적이고 강렬한 네온 무드',
    colors: { bg: '#05080F', line: '#90D0FF', glow: '#60A8FF', accent: '#3070E0', ambient: 'rgba(60, 120, 240, 0.15)' }
  },
  {
    id: 'minimal_lux', name: '미니멀 럭스', icon: '⬜',
    desc: '정제된 고급스러운 미니멀 무드',
    colors: { bg: '#0F0F12', line: '#D8D4EC', glow: '#B0A8D0', accent: '#7870A8', ambient: 'rgba(120, 115, 170, 0.08)' }
  },
  {
    id: 'cosmic', name: '코스믹 블루', icon: '🔵',
    desc: '심오하고 우주적인 블루 무드',
    colors: { bg: '#04060E', line: '#8090D8', glow: '#6080C8', accent: '#3050A0', ambient: 'rgba(60, 80, 180, 0.15)' }
  },
];

const BACKGROUNDS = [
  { id: 'pure_black', name: '순수 흑', color: '#000000', gradient: null },
  { id: 'dark_gradient', name: '다크 그라디언트', color: '#0A0A14', gradient: 'radial-gradient(ellipse at center, #1A1030 0%, #050510 100%)' },
  { id: 'deep_space', name: '딥 스페이스', color: '#020308', gradient: 'radial-gradient(ellipse at 30% 30%, #0A1030 0%, #020308 70%)' },
  { id: 'obsidian', name: '흑요석', color: '#080810', gradient: 'linear-gradient(135deg, #120820 0%, #080810 50%, #0A0A18 100%)' },
  { id: 'dark_forest', name: '어두운 숲', color: '#060C08', gradient: 'linear-gradient(160deg, #0A1410 0%, #060C08 100%)' },
  { id: 'midnight_blue', name: '미드나잇 블루', color: '#040810', gradient: 'radial-gradient(ellipse at 70% 20%, #0A1428 0%, #040810 60%)' },
];

const ADVICE_TEXTS = {
  purpose: {
    single: '하나의 의도는 시길을 선명하게 만듭니다. 지금 가장 중심이 되는 목적을 골랐군요.',
    double: '두 가지 의도를 선택했습니다. 시길이 복합적이 될 수 있습니다. 더 중요한 것을 생각해보세요.',
    triple: '세 가지 의도는 시길을 복잡하게 만들 수 있습니다. 하나의 핵심 의도에 집중하면 더 강한 시길이 됩니다.',
  },
  structure: {
    none: '시길의 기반 구조를 선택하세요. 모든 선택에 설명이 있으니 천천히 읽어보세요.',
  },
  density: {
    none: '밀도는 시길의 복잡도를 결정합니다. 처음이라면 단순 또는 중간을 추천합니다.',
  },
};

// Resolution presets
const RESOLUTIONS = [
  { id: 'hd', label: 'HD', width: 1080, height: 1920 },
  { id: 'qhd', label: 'QHD', width: 1440, height: 2560 },
  { id: '4k', label: '4K', width: 2160, height: 3840 },
];

// Default selections
const DEFAULTS = {
  trad: {
    structure: 'circle_seal',
    symbol: 'circle',
    density: 'medium',
    lineStyle: 'thin_ink',
    symmetry: 'full',
    decoration: 'outer_ring',
  },
  modern: {
    style: 'minimal_logo',
    lineStyle: 'monoline',
    complexity: 'balance',
    symmetry: 'full',
  },
};

// Validation groups for each step (by type)
const TRAD_REQUIRED_GROUPS = ['structure', 'symbol', 'density', 'lineStyle', 'symmetry'];
const MODERN_REQUIRED_GROUPS = ['style', 'lineStyle', 'complexity', 'symmetry'];

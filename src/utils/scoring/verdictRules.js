export const STATUS_THEMES = {
  green:  { quoteColor: '#16A34A', highlightColor: '#16A34A' },
  blue:   { quoteColor: '#2F80ED', highlightColor: '#2F80ED' },
  orange: { quoteColor: '#F97316', highlightColor: '#F97316' },
  amber:  { quoteColor: '#D97706', highlightColor: '#D97706' },
  red:    { quoteColor: '#E11D48', highlightColor: '#E11D48' },
};

export const STATUS_COPY = {
  green: {
    heroTitle: '현재 흐름은 꽤 안정적으로 보여요.',
    heroBody:  '초반의 좋은 인상에만 기대기보다, 시간이 지나도 일관성이 유지되는지 천천히 확인해보세요.',
  },
  blue: {
    heroTitle: '조건과 관계 흐름을 조금 더 봐도 좋아요.',
    heroBody:  '호감은 유지하되, 아직은 관계를 빠르게 확정하기보다 흐름을 보는 편이 좋아요.',
  },
  orange: {
    heroTitle: '조건보다 실제 태도를 먼저 확인해보세요.',
    heroBody:  '조건이 좋아 보여도 대화 속 태도와 일관성을 먼저 확인하는 편이 좋아요.',
  },
  amber: {
    heroTitle: '감정을 깊게 쓰기 전 속도를 늦춰보세요.',
    heroBody:  '확신이 생기기 전까지는 기대를 키우기보다 자신의 감정 에너지를 지키는 편이 좋아요.',
  },
  red: {
    heroTitle: '지금은 관계를 정리하는 쪽이 더 안전해 보여요.',
    heroBody:  '대화가 반복적으로 불안정하거나 신뢰를 깎는다면, 더 설득하려 하기보다 빠져나오는 선택이 필요해요.',
  },
};

export const VERDICT_EMOJI = { green: '✅', blue: '🔍', orange: '⚠️', amber: '⏸️', red: '🚩' };

export function getStatusTheme(color) { return STATUS_THEMES[color] || STATUS_THEMES.blue; }
export function getStatusCopy(color)  { return STATUS_COPY[color]  || STATUS_COPY.blue; }

export function generateHeroCopy(report) {
  const color = report.color || 'blue';
  const score = report.totalScore || 50;

  // 1. 상태 기반 기본 타이틀 & 가이드 톤 결정
  const baseTitles = {
    green: "미래의 동반자로서 높은 안정성과 정서적 일치감을 보입니다.",
    blue: "관계의 호감은 분명하나 현실 조건의 추가 관찰이 필요해요.",
    amber: "정서적 comfort의 부족으로 감정 투자의 조절이 필요합니다.",
    orange: "조건 스펙은 화려하나 교차 검증되지 않은 신뢰 확인이 필수입니다.",
    red: "지속 관여할수록 심리적 에너지 소모와 충돌 리스크가 큽니다."
  };

  let title = baseTitles[color] || baseTitles.blue;

  // 2. 세부 지표 기반의 강조 포인트 분기 (이름 검사 절대 금지!)
  if (color === 'orange' && report.verifiedCount <= 1) {
    title = "조건보다 실제 행동 태도와 투명성을 먼저 확인해보세요.";
  } else if (color === 'blue' && report.relationScore >= 8) {
    title = "조건과 관계 정서 흐름을 조금 더 긍정적으로 봐도 좋은 흐름입니다.";
  } else if (color === 'red' && score < 25) {
    title = "객관적인 경고 신호들이 다수 감지되어 확실한 거리두기를 강력 권장해요.";
  } else if (color === 'amber' && report.relationScore < 4) {
    title = "정서적 comfort 결여로 감정을 깊게 쓰기 전 완급조절 필요";
  }

  // 3. 네 마디 문단 합성 알고리즘 (Sentence Composition)
  const segments = [];

  // [마디 1: 관계의 감정/정서적 안정도 평가]
  if (report.relationScore >= 7) {
    segments.push("두 사람의 대화 밀도와 소통의 일치감은 비교적 원만하고 긍정적인 수준을 보여줍니다.");
  } else if (report.relationScore >= 4) {
    segments.push("일상적인 소통 흐름은 평온하나, 갈등이나 깊은 가치관을 조율할 때 다소 편차가 느껴집니다.");
  } else {
    segments.push("대화 템포의 기복이 잦고 서로의 정서적 편안함과 지지 기반이 우려되는 상황입니다.");
  }

  // [마디 2: 정보 신뢰 및 현실 스펙 가치 정합도 평가]
  if (report.conditionScore >= 6 && report.trustScore >= 3) {
    segments.push("주요한 현실 스펙 정보들이 투명하게 교차 검증되어 신뢰도의 깊이가 단단합니다.");
  } else if (report.conditionScore >= 6 && report.trustScore <= 2) {
    segments.push("겉으로 드러난 가치 조건은 좋아 보이지만 교차 확인된 검증도가 낮아 섣부른 감정 투자는 신중해야 합니다.");
  } else {
    segments.push("장기적인 관점에서의 현실 가치관 조율과 거주지 등 구체적 정합성에 대해 좀 더 밀도 높은 대화가 필요합니다.");
  }

  // [마디 3: 경고/위험 플래그 및 Cap Reason 영향 반영]
  const capFiltered = (report.comments || []).find(c => c.includes("제한되었") || c.includes("제한이 걸려"));
  if (capFiltered) {
    segments.push(capFiltered);
  } else if (report.verifiedCount <= 1 && report.conditionScore >= 6) {
    segments.push("주요 정보들의 실질적 검증 수치가 다소 투명하지 못해 겉보기에 현혹되지 않도록 교차 확인이 필수적입니다.");
  } else {
    segments.push("관계 안정성을 해치는 뚜렷한 심리적 유해 신호나 결정적 이상 패턴은 아직 감지되지 않았습니다.");
  }

  // [마디 4: 최종 액션 권장 가이드 (Next Action Guide)]
  const guides = {
    green: "장기적인 동반자 비전을 아름답게 설계하며 관계를 진지하게 구축해 볼 타이밍입니다.",
    blue: "호감은 기분 좋게 이어가되, 아직은 감정을 과속하기보다 약속 이행과 일관성을 지켜보는 편이 좋습니다.",
    orange: "스펙 조건에 취하기보다 상대방의 일상적인 신용과 약속 이행 투명성을 차분하게 교차 관찰하세요.",
    amber: "상대방에게 조급하게 끌려가기보다 본인의 심리적 편안함과 경계선이 충분히 지켜지는지 먼저 조율해야 합니다.",
    red: "추가적인 심리 소모와 감정 매몰을 단호하게 차단하기 위해 차갑고 객관적인 거리두기가 절실합니다."
  };
  segments.push(guides[color] || guides.blue);

  const body = segments.join(" ");

  return { title, body, bullets: segments };
}

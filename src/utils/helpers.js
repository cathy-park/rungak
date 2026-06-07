import { STATUS_COPY, VERDICT_EMOJI, getStatusTheme, getStatusCopy, generateHeroCopy } from './scoring/verdictRules';
import { analyze } from './scoring/analyzeCandidate';
import { sampleCandidates, characters, AVATAR_BASE, relationItems, statusTypeKeys, getStatusLabel, emotionalBondItems, energyTagOptions, personalityTypeTags, timelineTypeOptions, feelingOptions, emptyCandidate, defaultRelation, defaultEmotionalBond, assetOptions, incomeOptions } from './scoring/scoreOptions';
import { signalByCode } from './scoring/timelineScore';
import { optionLabel } from './scoring/analyzeCandidate';

export function getDaysAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return '예정';
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}주 전`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}달 전`;
  } catch (e) {
    return '';
  }
}

export function compressBase64Image(base64Str, maxWidth = 120, maxHeight = 120, quality = 0.6) {
  return new Promise((resolve) => {
    if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }
    
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

export function migrateTextToItems(text, type = 'fixed') {
  if (!text || typeof text !== 'string') return [];
  return text
    .split('\n')
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)
    .map((line, idx) => ({
      id: Date.now() - Math.floor(Math.random() * 100000) - idx,
      text: line,
      ...(type === 'check' ? { status: 'unchecked' } : {})
    }));
}

export function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function bulletLines(text = '') {
  return String(text)
    .split('\n')
    .map((line) => line.trim().replace(/^[-•]\s*/, ''))
    .filter(Boolean);
}

export function getDisplayReport(candidate, report) {
  // 100% 이름 검사 없는 무결한 데이터 카피 매핑
  const copy = generateHeroCopy(report);

  // 모든 등록 후보에 대하여 동일하고 무결하게 정량 분석 점수를 기반으로 4대 지표 환산 계산 (100점 백분율 스케일업)
  const relationVal = Math.round((report.relationScore / 10) * 100) || 50;
  const trustVal = Math.round((report.trustScore / 6) * 100) || 50;
  const conditionVal = Math.round((report.conditionScore / 10) * 100) || 50;
  const riskVal = `${(candidate.red || []).length}건`;

  // 기존 comments 리스트에서 정량 계산된 추가 사유(예: capReason, flowScore) 등이 소실되지 않도록 정교한 배열 머지 수행
  const baseComments = [copy.body];
  const existingExtras = (report.comments || []).filter(c => 
    c !== STATUS_COPY[report.color]?.heroBody && 
    !c.includes("감정적 친밀도와 안정감은 매우 높은 수준이지만") && 
    !c.includes("기본적인 대화와 일상적인 가치는") && 
    !c.includes("소통 방식에서의 지속적인 마찰과")
  );

  return {
    ...report,
    label: copy.title,
    comments: [...baseComments, ...existingExtras],
    metrics: {
      relation: relationVal,
      trust: trustVal,
      condition: conditionVal,
      risk: riskVal
    }
  };
}

export function generateHeroSummary(report) {
  const summaries = {
    green: "정서와 신뢰 일치도가 매우 우수하여 깊은 관계로 가기에 적합합니다.",
    blue: "호감은 기분 좋게 유지하되, 속도를 늦추며 일관성을 검증할 때입니다.",
    orange: "겉으로 보이는 조건보다 대화 속 태도와 정보의 투명성 확인이 필요해요.",
    amber: "감정을 쏟기 전에 본인의 정서적 피로도와 편안함을 먼저 챙기세요.",
    red: "반복적인 피로와 갈등 누적으로 건강한 정서적 거리두기가 시급합니다."
  };
  return summaries[report.color] || summaries.blue;
}

export function normalizeCandidate(raw) {
  const analysis = analyze(raw);
  const report = getDisplayReport(raw, analysis);
  const finalScore = Math.round(report.totalScore);
  const heroCopy = generateHeroCopy(analysis);

  return {
    ...raw,
    ...report,
    finalScore: finalScore,
    displayScore: finalScore,
    totalScore: finalScore,
    verdict: report.verdict,
    color: report.color,
    metrics: report.metrics,
    copy: {
      heroTitle: report.label,
      heroSummary: generateHeroSummary(report),
      detailTitle: report.label,
      detailBody: report.comments?.[0] || '관계의 전반적인 정량 데이터 분석이 완료되었습니다.',
      detailComments: report.comments || [],
      detailBullets: heroCopy.bullets || []
    }
  };
}

export function rankCandidates(normalizedList) {
  return [...normalizedList].sort((a, b) => {
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }
    const riskA = a.metrics?.risk || 50;
    const riskB = b.metrics?.risk || 50;
    if (riskA !== riskB) {
      return riskA - riskB;
    }
    const relB = b.metrics?.relation || 50;
    const relA = a.metrics?.relation || 50;
    return relB - relA;
  });
}

export function scoreTone(color) {
  return {
    green:  { className: 'tone-green',  label: '안정' },
    blue:   { className: 'tone-blue',   label: '관찰' },
    orange: { className: 'tone-orange', label: '확인' },
    amber:  { className: 'tone-amber',  label: '보류' },
    red:    { className: 'tone-red',    label: '위험' },
    gray:   { className: 'tone-gray',   label: '기타' },
  }[color] || { className: 'tone-blue', label: '관찰' };
}
export function scoreLevel(percent) {
  if (percent >= 80) return { label: '좋음', color: 'green' };
  if (percent >= 60) return { label: '괜찮음', color: 'blue' };
  if (percent >= 40) return { label: '확인 필요', color: 'amber' };
  if (percent >= 25) return { label: '주의', color: 'orange' };
  return { label: '위험', color: 'red' };
}
export function optLabel(options, value) {
  return options.find((item) => item.value === value)?.label || value || '미확인';
}
export function createForm(candidate) {
  const currentTimeline = candidate?.dateTimeline || candidate?.timeline || [];
  const currentMemo = candidate?.fixedObservationMemo !== undefined ? candidate.fixedObservationMemo : (candidate?.observationMemo || '');
  return {
    ...emptyCandidate,
    ...candidate,
    quickNoteSummary: candidate?.quickNoteSummary || '',
    quickNoteGood: candidate?.quickNoteGood || '',
    quickNoteConcern: candidate?.quickNoteConcern || '',
    quickNoteNextCheck: candidate?.quickNoteNextCheck || '',
    fixedObservationMemo: currentMemo,
    dateTimeline: currentTimeline,
    verified: { ...(candidate?.verified || {}) },
    relation: { ...defaultRelation, ...(candidate?.relation || {}) },
    emotionalBond: { ...defaultEmotionalBond, ...(candidate?.emotionalBond || {}) },
    energyTags: [...(candidate?.energyTags || [])],
    personalityTags: [...(candidate?.personalityTags || [])],
    observationNotes: candidate?.observationNotes || '',
    green: [...(candidate?.green || [])],
    yellow: [...(candidate?.yellow || [])],
    red: [...(candidate?.red || [])],
  };
}
export function candidateMarkdown(candidate, report) {
  const character = characters.find((item) => item.id === candidate.character);
  const relation = relationItems.map((item) => {
    const val = candidate.relation?.[item.key] ?? 5;
    const isStatus = statusTypeKeys.includes(item.key);
    const statusTxt = isStatus ? ` [${getStatusLabel(val).label}]` : '';
    return `- ${item.label}: ${val}/10${statusTxt}`;
  }).join('\n');

  const emotionalBondSection = emotionalBondItems.map((item) => {
    const val = candidate.emotionalBond?.[item.key] ?? 5;
    return `- ${item.label}: ${val}/10`;
  }).join('\n');

  const energyTagsText = (candidate.energyTags || []).map(id => energyTagOptions.find(t => t.id === id)?.label).filter(Boolean).join(', ') || '선택 없음';
  const personalityTagsText = (candidate.personalityTags || []).map(id => personalityTypeTags.find(t => t.id === id)?.label).filter(Boolean).join(', ') || '선택 없음';

  const currentTimeline = candidate.dateTimeline || candidate.timeline || [];
  const timelines = currentTimeline.length
    ? currentTimeline.map((event) => {
        const type = optLabel(timelineTypeOptions, event.type);
        const feeling = optLabel(feelingOptions, event.feeling);
        const notes = bulletLines(event.notes).map((line) => `  - ${line}`).join('\n') || '  - 기록 없음';
        const selected = (event.signals || []).map((code) => signalByCode(code)?.label).filter(Boolean).join(', ') || '없음';
        return [`### ${event.date || '날짜 미상'} · ${type} · ${feeling}`, notes, `- 행동 신호: ${selected}`].join('\n');
      }).join('\n\n')
    : '기록 없음';


  const fixedObservationItemsMarkdown = (candidate.fixedObservationItems || []).length
    ? candidate.fixedObservationItems.map(item => `- ${item.text}`).join('\n')
    : '기록 없음';

  return [
    `# 런각 연구소 관계 구조 리포트: ${candidate.name || '무명의 후보'}`,
    '',
    '> 이 리포트는 "이 사람이 나를 무너뜨릴 사람인지, 함께 성장 가능한 사람인지"를 구조적으로 관찰하기 위한 도구입니다.',
    '',
    '## 1. 관계 관찰 요약',
    `- 총점: ${report.totalScore}/100`,
    `- 판정: ${report.verdict}`,
    `- 요약: ${report.label}`,
    `- 코멘트: ${report.comments[0]}`,

    '',
    '## 3. 기본 프로필',
    `- 이름/별명: ${candidate.name || '미확인'}`,
    `- 캐릭터 유형: ${character?.label || '미스터리형'}`,
    `- 인간 유형 태그: ${personalityTagsText}`,
    `- 생년월일/나이: ${candidate.birthDate || '미확인'} / ${report.age || candidate.age || '미확인'}세`,
    `- 직업: ${candidate.job || '미확인'}`,
    `- MBTI: ${candidate.mbti || '미확인'}`,
    `- 거주지: ${candidate.location || '미확인'}`,
    `- 만난 경로: ${candidate.route || '미확인'}`,
    `- 첫인상 메모: ${candidate.memo || '없음'}`,
    '',
    '## 4. 정서적 결 (Emotional Bond)',
    '> 대화 밀도, 정서 에너지, 가치관 결합도를 관찰합니다.',
    emotionalBondSection,
    '',
    '## 5. 관계 에너지 방향',
    `> 이 사람이 나에게 유발하는 에너지: ${energyTagsText}`,
    '',
    '## 6. 대화/태도 관찰 (0=미검증, 상태형 항목 포함)',
    relation,
    '',
    '## 7. 조건/스펙',
    `- 키: ${candidate.height ? `${candidate.height}cm` : '미확인'}`,
    `- 자산: ${optionLabel(assetOptions, candidate.asset)}`,
    `- 연봉: ${optionLabel(incomeOptions, candidate.income)}`,

    `- 주거 형태: ${candidate.housing || '미확인'}`,
    `- 흡연/음주: ${candidate.smoking || '미확인'} / ${candidate.drinking || '미확인'}`,
    `- 점수 합계: 조건 ${report.conditionScore}/10 | 대화/태도 ${report.relationScore}/10 | 정보확인 ${report.trustScore}/6 | 지속가능성 ${report.realityScore}/4`,
    '',
    '## 8. 플래그 (관찰된 신호)',
    `- 🟢 그린플래그: ${(candidate.green || []).join(' / ') || '없음'}`,
    `- 🟡 옐로우플래그: ${(candidate.yellow || []).join(' / ') || '없음'}`,
    `- 🔴 레드플래그: ${(candidate.red || []).join(' / ') || '없음'}`,
    '',
    '## 9. 타임라인 (관계 흐름 기록)',
    timelines,
    '',
    '## 10. 배경 정보 리스트',
    fixedObservationItemsMarkdown,
    '',
    '---',
    '> LLM 활용 제안: 위 리포트를 기반으로 "이 관계가 나에게 지속 가능한 구조인가"를 함께 분석해주세요.',
    '',
  ].join('\n');
}

export function getScoreStatusLabel(score) {
  const s = Number(score || 0);
  if (s === 0) return { label: '미검증', color: 'gray' };
  if (s <= 3) return { label: '주의', color: 'red' };
  if (s <= 6) return { label: '관찰중', color: 'amber' };
  if (s <= 8) return { label: '안정적', color: 'blue' };
  return { label: '매우 좋음', color: 'green' };
}

export function getReverseScoreStatusLabel(score) {
  const s = Number(score || 0);
  if (s === 0) return { label: '미검증', color: 'gray' };
  if (s <= 3) return { label: '매우 안정', color: 'green' };
  if (s <= 6) return { label: '보통', color: 'blue' };
  if (s <= 8) return { label: '주의', color: 'amber' };
  return { label: '위험', color: 'red' };
}

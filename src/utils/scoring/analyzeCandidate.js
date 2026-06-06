import {
  assetOptions,
  incomeOptions,
  greenFlags,
  yellowFlags,
  redFlags,
  relationItems,
  verifiedKeys,
  signalOptions
} from './scoreOptions';

import { clamp, timelineScore } from './timelineScore';
import { getStatusCopy } from './verdictRules';

export function optionScore(options, value) {
  return (options.find((item) => item.value === value) || options[0]).score;
}

export function optionLabel(options, value) {
  return (options.find((item) => item.value === value) || options[0]).label;
}

export function calcAge(birthDate) {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const diff = today.getMonth() - birth.getMonth();
  if (diff < 0 || (diff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return String(age);
}

export function heightScore(height) {
  const h = Number(height);
  if (!h) return 3;
  if (h >= 185) return 8;
  if (h >= 180) return 7;
  if (h >= 176) return 5;
  if (h >= 172) return 3;
  return 1;
}

export function ageScore(age) {
  const a = Number(age);
  if (!a) return 1.8;
  if (a >= 31 && a <= 42) return 3;
  if (a >= 28 && a <= 47) return 2.2;
  return 1.2;
}

export function verified(candidate, key) {
  return Boolean(candidate.verified?.[key]);
}

export function recommendJobStability(job) {
  if (!job) return 3;
  const j = job.toLowerCase().replace(/\s+/g, '');
  if (/공무원|군인|경찰|소방|교사|선생님|공기업|공공기관|의사|약사|한의사|변호사|회계사|세무사|노무사|관세사|법무사|변리사|전문직/.test(j)) {
    return 5;
  }
  if (/대기업|중견|개발자|엔지니어|금융|은행|증권|보험|연구원|석사|박사/.test(j)) {
    return 4;
  }
  if (/프리랜서|계약직|알바|아르바이트|취준|구직|인턴|일용직|파견직/.test(j)) {
    return 2;
  }
  return 3;
}

export function analyze(candidate) {
  const age = candidate.age || calcAge(candidate.birthDate);
  const rows = [
    { key: 'height', label: '키', raw: heightScore(candidate.height), max: 8 },
    { key: 'body', label: '체형/외적 취향', raw: Number(candidate.bodyFit || 3), max: 5 },
    { key: 'asset', label: '자산', raw: optionScore(assetOptions, candidate.asset), max: 9 },
    { key: 'income', label: '연봉', raw: optionScore(incomeOptions, candidate.income), max: 7 },
    { key: 'job', label: '직업 안정성', raw: (candidate.job && (candidate.jobStability === 3 || !candidate.jobStability)) ? recommendJobStability(candidate.job) : Number(candidate.jobStability || 3), max: 5 },
    { key: 'age', label: '나이 차이', raw: ageScore(age), max: 3 },
    { key: 'distance', label: '거리', raw: Number(candidate.distanceFit || 3) * 0.6, max: 3 },
  ];
  
  const conditionScore = clamp(Math.round(rows.reduce((sum, item) => sum + clamp(item.raw, 0, item.max), 0) / 4), 0, 10);
  const totalWeight = relationItems.reduce((sum, item) => sum + item.weight, 0);
  const relationRaw = relationItems.reduce((sum, item) => sum + Number(candidate.relation?.[item.key] ?? 5) * item.weight, 0) / Math.max(totalWeight, 1);
  const relationScore = clamp(Math.round(relationRaw * 1), 0, 10);
  
  const verifiedCount = verifiedKeys.filter((key) => verified(candidate, key)).length;
  const moneyVerified = (verified(candidate, 'asset') ? 1 : 0) + (verified(candidate, 'income') ? 1 : 0);
  const jobVerified = verified(candidate, 'job') ? 1 : 0;
  const importantVerified = ['height', 'asset', 'income', 'job'].filter((key) => verified(candidate, key)).length;

  const currentTimeline = candidate.dateTimeline || candidate.timeline || [];
  const meetCount = currentTimeline.filter((ev) => ev.type === 'meet' || ev.type === 'date').length;
  const meetBonus = meetCount >= 3 ? 1.5 : 0;

  const trustScore = clamp(Math.round((verifiedCount * 0.9 + importantVerified * 1.2 + moneyVerified * 1.1 + jobVerified * 2.5 + meetBonus) / 2.5), 0, 6);
  const realityScore = clamp(Math.round(((Number(candidate.relation?.present || 5) + Number(candidate.relation?.action || 5)) * 0.75) / 2.5), 0, 4);
  
  const greenScore = (candidate.green || []).reduce((sum, label) => sum + (greenFlags.find((item) => item.label === label)?.score || 0), 0);
  const yellowScore = (candidate.yellow || []).reduce((sum, label) => sum + (yellowFlags.find((item) => item.label === label)?.score || 0), 0);
  const redList = candidate.red || [];
  
  // [확인] 점수 과잉 삭제 방지를 위한 상한선(Cap) 로직 정상 적용 상태
  let scoreCap = 100;
  let capReason = "";
  if (redList.includes("돈을 빌리려는 뉘앙스")) { scoreCap = Math.min(scoreCap, 20); capReason = "돈을 빌리려는 뉘앙스 등 치명적 위험이 있어 총점이 제한되었어요."; }
  if (redList.includes("허위 확인")) { scoreCap = Math.min(scoreCap, 25); if(!capReason) capReason = "주요 정보 허위 기재가 확인되어 총점 상한이 걸려있어요."; }
  if (redList.includes("내 판단을 예민함으로 몰아감")) { scoreCap = Math.min(scoreCap, 35); if(!capReason) capReason = "가스라이팅성 대화 패턴으로 인해 판단 총점이 대폭 제한되었어요."; }
  if (redList.includes("직업/자산/연봉 허위 의심")) { scoreCap = Math.min(scoreCap, 55); if(!capReason) capReason = "조건 스펙 자체는 높으나 진실성 의심 항목으로 인해 총점 반영이 제한적이에요."; }

  const redScore = redList.reduce((sum, label) => {
    const flag = redFlags.find((item) => item.label === label);
    if (!flag || flag.hardRun) return sum;
    return sum + Math.max(flag.score, -8);
  }, 0);
  
  // bonusPenalty: 플래그만 반영
  const bonusPenalty = clamp(greenScore + yellowScore + redScore, -18, 10);
  
  // 모든 수동 플래그 통합
  const manualFlags = [...(candidate.green || []), ...(candidate.yellow || []), ...redList];
  const flowScore = timelineScore(currentTimeline, redList, manualFlags);
  
  const preScore = Math.round(conditionScore + relationScore + trustScore + realityScore + bonusPenalty + flowScore);
  const totalScore = Math.min(preScore, scoreCap);
  
  const hardRun = redList.some((label) => redFlags.find((item) => item.label === label)?.hardRun);
  const lowVerify = verifiedCount <= 1 && conditionScore >= 6;
  let color = 'blue';
  let verdict = '더 만나며 관찰';

  // 1. 점수 기반 기본 판정
  if (totalScore >= 80) {
    color = 'green';
    verdict = '계속 만나도 좋음';
  } else if (totalScore >= 60) {
    color = 'blue';
    verdict = '더 만나며 관찰';
  } else if (totalScore >= 40) {
    color = 'amber';
    verdict = '조건 확인 필요';
  } else if (totalScore >= 10) {
    color = 'orange';
    verdict = '감정 투입 보류';
  } else {
    color = 'red';
    verdict = '정리 권장';
  }

  // 2. 심각도에 따른 예외 처리 (강등 로직)
  if (hardRun) {
    color = 'red';
    verdict = '정리 권장';
  } else if (totalScore >= 60 && (lowVerify || (conditionScore >= 7 && trustScore <= 2))) {
    color = 'amber';
    verdict = '조건 확인 필요';
  } else if (totalScore >= 40 && (relationScore < 5 || Number(candidate.relation?.comfort || 10) <= 3)) {
    color = 'orange';
    verdict = '감정 투입 보류';
  }

  const copy = getStatusCopy(color);
  const label = copy.heroTitle;
  const comments = [copy.heroBody];
  if (scoreCap < 100 && capReason) comments.push(capReason);
  if (flowScore !== 0) comments.push(`타임라인 만남 흐름 점수 ${flowScore > 0 ? '+' : ''}${flowScore}점이 반영됐어요.`);

  // [신규] 기록 건수 상태 판정
  const recordCount = currentTimeline.length;
  let recordStatus = '데이터 부족';
  if (recordCount >= 10) recordStatus = '반복 패턴 관찰 가능';
  else if (recordCount >= 5) recordStatus = '흐름 형성 중';
  else if (recordCount >= 1) recordStatus = '초기 관찰';

  // [신규] 최근 5개 타임라인 흐름 분석
  const recentEvents = currentTimeline.slice(-5);
  const recentFlowScore = timelineScore(recentEvents, redList, manualFlags);
  
  // 과거 대비 추세 분석 (이전 5개)
  const pastEvents = currentTimeline.slice(-10, -5);
  const pastFlowScore = pastEvents.length > 0 ? timelineScore(pastEvents, redList, manualFlags) : 0;
  
  let trend = '유지';
  if (recentFlowScore > pastFlowScore) trend = '상승';
  else if (recentFlowScore < pastFlowScore) trend = '하락';

  // 최근 긍정/부정 신호 카운트
  let recentPos = 0;
  let recentNeg = 0;
  recentEvents.forEach(ev => {
    (ev.signals || []).forEach(sig => {
      const detail = signalOptions.find(item => item.code === sig);
      if (detail) {
        if (detail.score > 0) recentPos++;
        else if (detail.score < 0) recentNeg++;
      }
    });
  });

  const flowAnalysis = {
    recordStatus,
    recentFlowScore,
    trend,
    recentPos,
    recentNeg
  };
  
  return { 
    age, rows, conditionScore, relationScore, trustScore, realityScore, 
    bonusPenalty, flowScore, totalScore, verifiedCount, verdict, label, 
    color, comments, meetCount, meetBonus, flowAnalysis 
  };
}

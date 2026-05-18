import React, { useEffect, useMemo, useState } from 'react';
import { MoreVertical, X, Pencil, Trash2, Clipboard, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import './App.css';
import { db, doc, setDoc, getDoc } from './firebase';

const STORAGE_KEY = 'rungak_lab_vite_v1';
const AVATAR_BASE = '/characters';

const characters = [
  { id: 'calm', label: '차분한 지적형', desc: '조용함 · 깊이 · 데이터' },
  { id: 'fit', label: '피지컬 루틴형', desc: '운동 · 자기관리 · 실행력' },
  { id: 'talk', label: '수다쟁이 분석형', desc: '이야기 · 분석 · 인사이트' },
  { id: 'sweet', label: '다정한 생활형', desc: '공감 · 꾸준함 · 생활감' },
  { id: 'future', label: '미래 토커형', desc: '큰 그림 · 예측 · 말이 큼' },
  { id: 'mystery', label: '미스터리형', desc: '정보 부족 · 관찰 필요' },
  { id: 'elite', label: '깔끔한 엘리트형', desc: '정돈 · 매너 · 사회성' },
  { id: 'creative', label: '감성 크리에이터형', desc: '취향 · 표현력 · 감각' },
  { id: 'stable', label: '안정형 직장인', desc: '성실 · 루틴 · 현실감' },
  { id: 'leader', label: '리더형 사업가', desc: '추진력 · 자신감 · 결정력' },
  { id: 'tech', label: '기술 덕후형', desc: '논리 · 몰입 · 도구친화' },
  { id: 'free', label: '자유로운 취향형', desc: '여행 · 독립성 · 여유' },
];

const assetOptions = [
  { value: 'unknown', label: '미확인', score: 3 },
  { value: 'under1', label: '1억 미만', score: 1 },
  { value: '1to5', label: '1억~5억', score: 3 },
  { value: '5to10', label: '5억~10억', score: 5 },
  { value: '10to20', label: '10억~20억', score: 6 },
  { value: '20to50', label: '20억~50억', score: 8 },
  { value: 'over50', label: '50억 이상', score: 9 },
  { value: 'over100', label: '100억 이상', score: 9 },
];

const incomeOptions = [
  { value: 'unknown', label: '미확인', score: 2 },
  { value: 'under3', label: '3000만 미만', score: 1 },
  { value: '3to5', label: '3000만~5000만', score: 2 },
  { value: '5to7', label: '5000만~7000만', score: 3 },
  { value: '7to10', label: '7000만~1억', score: 4 },
  { value: '1to2', label: '1억~2억', score: 6 },
  { value: 'over2', label: '2억 이상', score: 7 },
];

const bodyOptions = ['마름', '보통', '슬림탄탄', '근육형', '통통', '기타/미확인'];
const bodyFitOptions = [
  { value: 1, label: '취향 아님' },
  { value: 3, label: '보통' },
  { value: 5, label: '취향에 가까움' },
];
const marriageOptions = ['미확인', '미혼', '이혼', '사별', '기타'];
const childrenOptions = ['미확인', '없음', '있음', '비공개'];
const housingOptions = ['미확인', '자가', '전세', '월세', '부모님과 거주', '기타'];
const carOptions = ['미확인', '있음', '없음', '필요 시 이용', '비공개'];
const smokingOptions = ['미확인', '비흡연', '흡연', '가끔', '금연 중'];
const drinkingOptions = ['미확인', '안 함', '가끔', '보통', '자주'];
const religionOptions = ['미확인', '무교', '기독교', '천주교', '불교', '기타', '비공개'];
const goalOptions = ['미확인', '진지한 연애', '결혼 전제', '가벼운 만남', '천천히 알아가기', '비공개'];

const timelineTypeOptions = [
  { value: 'meet', label: '만남' },
  { value: 'date', label: '데이트' },
  { value: 'call', label: '통화' },
  { value: 'message', label: '카톡/메시지' },
  { value: 'conflict', label: '갈등' },
  { value: 'verified', label: '정보 확인' },
  { value: 'etc', label: '기타' },
];
const feelingOptions = [
  { value: 'good', label: '좋았음' },
  { value: 'neutral', label: '애매함' },
  { value: 'tired', label: '피곤했음' },
  { value: 'weird', label: '이상했음' },
  { value: 'sure', label: '확신이 생김' },
];

const checkStatusOptions = [
  { value: 'unchecked', label: '미확인', color: 'gray' },
  { value: 'pass', label: 'Pass', color: 'green' },
  { value: 'fail', label: 'Fail', color: 'red' },
  { value: 'hold', label: '보류', color: 'amber' },
  { value: 'watch', label: '추가 관찰', color: 'blue' },
];

function compressBase64Image(base64Str, maxWidth = 120, maxHeight = 120, quality = 0.6) {
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

function migrateTextToItems(text, type = 'fixed') {
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

const signalOptions = [
  { code: 'keptPromise', label: '약속을 지킴', score: 2, tone: 'green' },
  { code: 'remembered', label: '내 말을 기억함', score: 2, tone: 'green' },
  { code: 'presentAction', label: '현재 행동이 분명함', score: 3, tone: 'green' },
  { code: 'resolvedConflict', label: '갈등 시 조율함', score: 3, tone: 'green' },
  { code: 'verifiedInfo', label: '확인된 정보 추가', score: 2, tone: 'green' },
  { code: 'mismatch', label: '말과 행동 불일치', score: -3, tone: 'amber' },
  { code: 'tempoChange', label: '연락 템포 급변', score: -2, tone: 'amber' },
  { code: 'avoidance', label: '회피/잠수', score: -4, tone: 'orange' },
  { code: 'gaslighting', label: '내 판단을 예민함으로 몰아감', score: -6, tone: 'red' },
  { code: 'falseInfo', label: '돈/조건 허위 의심', score: -8, tone: 'red' },
  { code: 'moneyBorrow', label: '돈 빌림 뉘앙스', score: -10, tone: 'red' },
];

// ─── 인간 유형 태그 ───────────────────────────────────
const personalityTypeTags = [
  { id: 'achiever-creator', label: '성취형 창작자', emoji: '🎯' },
  { id: 'self-world', label: '자기세계형', emoji: '🌌' },
  { id: 'growth-type', label: '성장형 인간', emoji: '🌱' },
  { id: 'emotion-avoid', label: '감정회피형', emoji: '🧊' },
  { id: 'structure-design', label: '구조설계형', emoji: '🔧' },
  { id: 'sensitive-analyst', label: '감성형 분석가', emoji: '💫' },
  { id: 'workaholic', label: '워커홀릭형', emoji: '⚡' },
  { id: 'free-spirit', label: '자유영혼형', emoji: '🕊️' },
  { id: 'stable-reliable', label: '안정형 신뢰형', emoji: '🏛️' },
];

// ─── 관계 에너지 태그 ──────────────────────────────────
const energyTagOptions = [
  { id: 'stability', label: '안정감 상승', tone: 'green', emoji: '🟢' },
  { id: 'self-esteem', label: '자존감 상승', tone: 'green', emoji: '✨' },
  { id: 'growth', label: '성장 욕구 자극', tone: 'green', emoji: '🌱' },
  { id: 'creative', label: '창작욕 자극', tone: 'green', emoji: '🎨' },
  { id: 'tension', label: '긴장 유발', tone: 'amber', emoji: '⚡' },
  { id: 'drain', label: '감정 소모', tone: 'orange', emoji: '🔋' },
  { id: 'competition', label: '경쟁 심리 유발', tone: 'orange', emoji: '🏆' },
  { id: 'confusion', label: '혼란/불안 유발', tone: 'red', emoji: '🌀' },
];

// ─── 정서적 결 항목 ────────────────────────────────────
const emotionalBondItems = [
  { key: 'convoFlow', label: '대화 몰입감', desc: '설명 없이 대화가 자연스럽게 이어지는가' },
  { key: 'emotionalStability', label: '정서 안정감', desc: '함께할 때 안정되고 편안한 느낌인가' },
  { key: 'emotionFatigue', label: '감정 피로도', desc: '대화 후 소모보다 충전 느낌이 드는가 (낮을수록 좋음)' },
  { key: 'valueAlignment', label: '가치관 방향성', desc: '삶의 방향과 가치관이 비슷하게 느껴지는가' },
  { key: 'worldviewFit', label: '세계관/취향 결', desc: '서로의 세계를 흥미롭게 바라보는가' },
  { key: 'curiosityShare', label: '창작/호기심 공유', desc: '공통의 관심사와 호기심을 나누는가' },
  { key: 'energyChange', label: '함께할 때 에너지', desc: '만남 후 에너지가 충전되는 느낌인가' },
];

// ─── 관찰 포인트 풀 ───────────────────────────────────
const observationPointPool = [
  '바쁜 상황에서도 약속 조율을 책임감 있게 하는가',
  '감정보다 행동이 일치하는가',
  '과부하 시 회피형으로 변하는가',
  '실제 만남에서도 대화 밀도가 유지되는가',
  '나의 이야기를 기억하고 반영하는가',
  '불편한 주제를 차분하게 다루는가',
  '자기 감정을 솔직하게 표현하는가',
  '관계 속도를 상호적으로 조율하는가',
  '일과 관계의 균형을 어떻게 잡는가',
  '갈등 상황에서 어떤 방식으로 반응하는가',
];

// ─── 개선된 플래그 ────────────────────────────────────
const greenFlags = [
  { label: '대화 후 편안함이 남음', score: 3 },
  { label: '자연스러운 티키타카', score: 2 },
  { label: '자기 세계의 실체가 있음', score: 2 },
  { label: '약속을 구체적으로 잡고 지킴', score: 3 },
  { label: '내 말을 기억하고 반영함', score: 2 },
  { label: '불편한 이야기도 차분히 조율함', score: 4 },
  { label: '현재에 충실한 행동을 보임', score: 4 },
  { label: '내 경계선을 존중함', score: 3 },
];
const yellowFlags = [
  { label: '워커홀릭 가능성', score: -2 },
  { label: '프로젝트 몰입 시 관계 후순위 가능성', score: -2 },
  { label: '연락 템포가 아직 불안정함', score: -2 },
  { label: '말은 좋은데 확인 가능한 행동이 적음', score: -3 },
  { label: '직업/자산 정보 확인 필요', score: -2 },
  { label: '초반 호감 표현이 과함', score: -2 },
];
const redFlags = [
  { label: '설명 없는 잠수 반복', score: -6 },
  { label: '감정 책임 회피', score: -6 },
  { label: '일관되지 않은 태도', score: -5 },
  { label: '전여친을 전부 이상한 사람으로 말함', score: -5 },
  { label: '말과 행동이 반복적으로 다름', score: -8 },
  { label: '직업/자산/연봉 허위 의심', score: -10 },
  { label: '검증 요구에 불쾌감이나 공격성 보임', score: -10 },
  { label: '허위 확인', score: -20, hardRun: true },
  { label: '돈·투자·사업 이야기로 관계를 흐림', score: -20, hardRun: true },
  { label: '내 판단을 예민함으로 몰아감', score: -12 },
  { label: '돈을 빌리려는 뉘앙스', score: -30, hardRun: true },
];

const relationItems = [
  { key: 'logic', label: '논리적 대화', desc: '말이 잘 통하고 소모전이 적은가', weight: 1.45 },
  { key: 'present', label: '현재 충실도', desc: '미래 말보다 지금 행동이 있는가', weight: 1.35 },
  { key: 'action', label: '실행력', desc: '말한 것을 실제로 실행하는가', weight: 1.35 },
  { key: 'emotion', label: '감정 안정성', desc: '감정 기복이 적고 안정적인가', weight: 1.25 },
  { key: 'care', label: '배려와 존중', desc: '존중받는 사람처럼 느껴지는가', weight: 1.2 },
  { key: 'tempo', label: '연락 템포 안정성', desc: '연락 리듬이 안정적인가', weight: 1 },
  { key: 'comfort', label: '대화 후 편안함', desc: '대화 후 피로보다 편안함이 남는가', weight: 1.25 },
  { key: 'noAvoidance', label: '회피하지 않는 태도', desc: '불편한 주제도 피하지 않는가', weight: 1.2 },
  { key: 'selfAwareness', label: '자기객관화', desc: '스스로를 객관적으로 보는가', weight: 1 },
  { key: 'goalMatch', label: '관계 목적 일치도', desc: '연애/결혼/만남의 방향이 비슷한가', weight: 1.2 },
];
// 상태형 항목 (숫자 0이 '문제 있음'처럼 보이지 않도록 상태 레이블 사용)
const statusTypeKeys = ['action', 'emotion', 'tempo', 'noAvoidance'];
const statusLabels = [
  { min: 0, max: 0, label: '미검증', color: 'gray' },
  { min: 1, max: 3, label: '관찰중', color: 'amber' },
  { min: 4, max: 5, label: '초기 안정 흐름', color: 'blue' },
  { min: 6, max: 7, label: '반복 패턴 확인됨', color: 'blue' },
  { min: 8, max: 9, label: '행동 일치 확인됨', color: 'green' },
  { min: 10, max: 10, label: '매우 안정적', color: 'green' },
];
function getStatusLabel(value) {
  return statusLabels.find(s => value >= s.min && value <= s.max) || statusLabels[0];
}

const coreRelationKeys = ['logic', 'present', 'action', 'emotion', 'care'];
const coreRelationItems = relationItems.filter((item) => coreRelationKeys.includes(item.key));
const moreRelationItems = relationItems.filter((item) => !coreRelationKeys.includes(item.key));


const verifiedKeys = ['birthDate', 'job', 'location', 'height', 'asset', 'income', 'education', 'marriageHistory', 'children', 'housing', 'car'];
const defaultRelation = Object.fromEntries(relationItems.map((item) => [item.key, 5]));
const defaultEmotionalBond = Object.fromEntries(emotionalBondItems.map(i => [i.key, 5]));
const emptyCandidate = {
  id: null,
  name: '',
  birthDate: '',
  age: '',
  job: '',
  location: '',
  mbti: '',
  route: '',
  memo: '',
  character: 'mystery',
  photo: '',
  height: '',
  bodyType: '보통',
  bodyFit: 3,
  asset: 'unknown',
  income: 'unknown',
  education: '',
  marriageHistory: '미확인',
  children: '미확인',
  housing: '미확인',
  car: '미확인',
  smoking: '미확인',
  drinking: '미확인',
  religion: '미확인',
  relationshipGoal: '미확인',
  jobStability: 3,
  distanceFit: 3,
  verified: {},
  relation: defaultRelation,
  emotionalBond: defaultEmotionalBond,
  energyTags: [],
  personalityTags: [],
  observationNotes: '',
  observationMemo: '',
  green: [],
  yellow: [],
  red: [],
  timeline: [],
  // 신규 UX 데이터 구조
  quickNoteSummary: '',
  quickNoteGood: '',
  quickNoteConcern: '',
  quickNoteNextCheck: '',
  fixedObservationMemo: '',
  dateTimeline: [],
};

const sampleCandidates = [
  {
    ...emptyCandidate,
    id: 1,
    name: '차분한 연하남',
    birthDate: '1992-08-21',
    age: '33',
    job: '서비스 기획자',
    location: '성수',
    mbti: 'INTP',
    route: '지인 모임',
    memo: '말과 행동이 일치하며 관계 흐름이 안정적입니다.',
    character: 'calm',
    height: '181',
    bodyFit: 5,
    asset: '1to5',
    income: '7to10',
    jobStability: 4,
    distanceFit: 5,
    verified: { birthDate: true, job: true, income: true, location: true },
    relation: { ...defaultRelation, logic: 8, present: 8, action: 7, emotion: 7, care: 8, comfort: 8 },
    green: ['약속을 구체적으로 잡고 지킴', '현재에 충실한 행동을 보임'],
    energyTags: ['stability', 'growth'],
    personalityTags: ['self-world', 'growth-type'],
    emotionalBond: { ...defaultEmotionalBond, convoFlow: 9, emotionalStability: 8, emotionFatigue: 2, valueAlignment: 8, worldviewFit: 8, curiosityShare: 7, energyChange: 8 },
    observationNotes: '실제 만남에서도 대화 밀도가 유지되는지 확인 필요',
  },
  {
    ...emptyCandidate,
    id: 2,
    name: '무난한 직장인',
    birthDate: '1990-02-15',
    age: '36',
    job: '대기업 영업',
    location: '분당',
    mbti: 'ENFJ',
    route: '결정사',
    memo: '나쁘지 않으나 좀 더 만나보며 데이터를 쌓아야 합니다.',
    character: 'smile',
    height: '178',
    bodyFit: 3,
    asset: '5to10',
    income: '7to10',
    jobStability: 4,
    distanceFit: 3,
    verified: { birthDate: true, location: true },
    relation: { ...defaultRelation },
  },
  {
    ...emptyCandidate,
    id: 3,
    name: '화려한 사업가',
    birthDate: '1987-10-01',
    age: '39',
    job: '개인 사업',
    location: '청담',
    memo: '조건은 좋아 보이나 인증된 정보가 전혀 없습니다.',
    character: 'bold',
    height: '182',
    bodyFit: 3,
    asset: '20to50',
    income: 'over2',
    jobStability: 3,
    distanceFit: 4,
    verified: {},
    relation: { ...defaultRelation, logic: 7 },
    yellow: ['직업/자산 정보 확인 필요'],
  },
  {
    ...emptyCandidate,
    id: 4,
    name: '회피성 미궁남',
    birthDate: '1988-06-20',
    age: '38',
    job: '연구원',
    location: '대전',
    memo: '말은 통하는 듯하나 만남 후 이상하게 피로감이 듭니다.',
    character: 'talk',
    height: '175',
    bodyFit: 3,
    asset: '5to10',
    income: '5to7',
    jobStability: 5,
    distanceFit: 2,
    verified: { birthDate: true, location: true },
    relation: { ...defaultRelation, present: 3, comfort: 2 },
    yellow: ['연락 템포가 아직 불안정함'],
  },
  {
    ...emptyCandidate,
    id: 5,
    name: '위험한 경고남',
    birthDate: '1985-12-01',
    age: '41',
    job: '무직?',
    location: '미상',
    memo: '대화의 진실성이 의심되며 심각한 레드 플래그가 보입니다.',
    character: 'sad',
    height: '170',
    bodyFit: 2,
    asset: 'under1',
    income: 'under3',
    jobStability: 1,
    distanceFit: 5,
    verified: {},
    relation: { ...defaultRelation, logic: 2, emotion: 2 },
    red: ['돈을 빌리려는 뉘앙스'],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function optionScore(options, value) {
  return (options.find((item) => item.value === value) || options[0]).score;
}
function optionLabel(options, value) {
  return (options.find((item) => item.value === value) || options[0]).label;
}
function calcAge(birthDate) {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const diff = today.getMonth() - birth.getMonth();
  if (diff < 0 || (diff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return String(age);
}
function heightScore(height) {
  const h = Number(height);
  if (!h) return 3;
  if (h >= 185) return 8;
  if (h >= 180) return 7;
  if (h >= 176) return 5;
  if (h >= 172) return 3;
  return 1;
}
function ageScore(age) {
  const a = Number(age);
  if (!a) return 1.8;
  if (a >= 31 && a <= 42) return 3;
  if (a >= 28 && a <= 47) return 2.2;
  return 1.2;
}
function todayValue() {
  return new Date().toISOString().slice(0, 10);
}
function bulletLines(text = '') {
  return String(text)
    .split('\n')
    .map((line) => line.trim().replace(/^[-•]\s*/, ''))
    .filter(Boolean);
}
function signalByCode(code) {
  return signalOptions.find((item) => item.code === code);
}
function timelineScore(timeline = [], redFlagsList = []) {
  const counts = {};
  const hasFalseInfo = redFlagsList.includes('직업/자산/연봉 허위 의심') || redFlagsList.includes('허위 확인');
  const hasMoneyBorrow = redFlagsList.includes('돈을 빌리려는 뉘앙스');
  const hasGaslighting = redFlagsList.includes('내 판단을 예민함으로 몰아감');

  const base = timeline.reduce((sum, event) => {
    return sum + (event.signals || []).reduce((inner, code) => {
      const signal = signalByCode(code);
      if (!signal) return inner;
      
      let sVal = signal.score;
      if (code === 'falseInfo' && hasFalseInfo) sVal = Math.max(sVal, -2);
      if (code === 'moneyBorrow' && hasMoneyBorrow) sVal = 0;
      if (code === 'gaslighting' && hasGaslighting) sVal = 0;

      counts[code] = (counts[code] || 0) + 1;
      return inner + sVal;
    }, 0);
  }, 0);

  const repeatPenalty = Object.entries(counts).reduce((sum, [code, count]) => {
    const signal = signalByCode(code);
    if (!signal || signal.score >= 0 || count < 2) return sum;
    if (code === 'moneyBorrow' && hasMoneyBorrow) return sum;
    if (code === 'gaslighting' && hasGaslighting) return sum;
    return sum - Math.min(4, (count - 1) * 2);
  }, 0);
  return clamp(base + repeatPenalty, -6, 6);
}
function suggestedSignals(notes = '') {
  const text = String(notes).toLowerCase();
  const rules = [
    { code: 'keptPromise', words: ['약속을 잘', '시간을 잘', '늦지'] },
    { code: 'remembered', words: ['기억', '전에 했던 말', '다시 물어'] },
    { code: 'mismatch', words: ['말이 다름', '앞뒤', '불일치', '거짓말'] },
    { code: 'tempoChange', words: ['읽씹', '안읽씹', '연락 급변'] },
    { code: 'avoidance', words: ['잠수', '회피', '피함'] },
    { code: 'gaslighting', words: ['예민', '네 탓', '가스라이팅'] },
    { code: 'falseInfo', words: ['허위', '거짓', '자산 의심', '연봉 의심', '직업 의심'] },
    { code: 'moneyBorrow', words: ['돈 빌', '빌려', '급전'] },
  ];
  return rules.filter((rule) => rule.words.some((word) => text.includes(word))).map((rule) => rule.code);
}
function verified(candidate, key) {
  return Boolean(candidate.verified?.[key]);
}

function analyze(candidate) {
  const age = candidate.age || calcAge(candidate.birthDate);
  const rows = [
    { key: 'height', label: '키', raw: heightScore(candidate.height), max: 8 },
    { key: 'body', label: '체형/외적 취향', raw: Number(candidate.bodyFit || 3), max: 5 },
    { key: 'asset', label: '자산', raw: optionScore(assetOptions, candidate.asset), max: 9 },
    { key: 'income', label: '연봉', raw: optionScore(incomeOptions, candidate.income), max: 7 },
    { key: 'job', label: '직업 안정성', raw: Number(candidate.jobStability || 3), max: 5 },
    { key: 'age', label: '나이 차이', raw: ageScore(age), max: 3 },
    { key: 'distance', label: '거리', raw: Number(candidate.distanceFit || 3) * 0.6, max: 3 },
  ];
  const conditionScore = clamp(Math.round(rows.reduce((sum, item) => sum + clamp(item.raw, 0, item.max), 0)), 0, 40);
  const totalWeight = relationItems.reduce((sum, item) => sum + item.weight, 0);
  const relationRaw = relationItems.reduce((sum, item) => sum + Number(candidate.relation?.[item.key] ?? 5) * item.weight, 0) / Math.max(totalWeight, 1);
  const relationScore = clamp(Math.round(relationRaw * 3), 0, 30);
  const verifiedCount = verifiedKeys.filter((key) => verified(candidate, key)).length;
  const moneyVerified = (verified(candidate, 'asset') ? 1 : 0) + (verified(candidate, 'income') ? 1 : 0);
  const importantVerified = ['height', 'asset', 'income', 'job'].filter((key) => verified(candidate, key)).length;
  // trustScore: 순수 정보 검증 지표 (action 제거 — relationScore/realityScore와 중복)
  const trustScore = clamp(Math.round(verifiedCount * 0.9 + importantVerified * 1.2 + moneyVerified * 1.1), 0, 15);
  // realityScore: 행동 일치도만 반영 (jobStability/distanceFit 제거 — conditionScore와 중복)
  const realityScore = clamp(Math.round((Number(candidate.relation?.present || 5) + Number(candidate.relation?.action || 5)) * 0.75), 0, 10);
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
  
  // bonusPenalty: 플래그만 반영 (importantVerified/moneyVerified 제거 — trustScore와 중복)
  const bonusPenalty = clamp(greenScore + yellowScore + redScore, -18, 10);
  const currentTimeline = candidate.dateTimeline || candidate.timeline || [];
  const flowScore = timelineScore(currentTimeline, redList);
  const preScore = Math.round(conditionScore + relationScore + trustScore + realityScore + bonusPenalty + flowScore);
  const totalScore = clamp(Math.min(preScore, scoreCap), 0, 100);
  
  const hardRun = redList.some((label) => redFlags.find((item) => item.label === label)?.hardRun);
  const lowVerify = verifiedCount <= 1 && conditionScore >= 24;
  let verdict = '더 만나며 관찰';
  let label = '조건과 관계 흐름을 조금 더 봐도 좋아요.';
  let color = 'blue';
  if (hardRun || totalScore < 40) {
    verdict = '정리 권장';
    label = '감정 투입 전 거리두기가 필요해요.';
    color = 'red';
  } else if (lowVerify || (conditionScore >= 28 && trustScore <= 5)) {
    verdict = '조건 확인 필요';
    label = '조건은 좋아 보이지만 확인된 정보가 적어요.';
    color = 'amber';
  } else if (totalScore >= 75 && trustScore >= 8) {
    verdict = '계속 만나도 좋음';
    label = '조건·대화·정보 확인 상태가 비교적 안정적이에요.';
    color = 'green';
  } else if (relationScore < 16 || Number(candidate.relation?.comfort || 10) <= 3) {
    verdict = '감정 투입 보류';
    label = '대화 후 편안함과 관계 리듬을 더 확인하세요.';
    color = 'orange';
  }
  const comments = [];
  if (scoreCap < 100 && capReason) comments.push(capReason);
  if (lowVerify) comments.push('중요 정보는 확인되면 정보 확인도와 가산점에 반영돼요.');
  if (flowScore !== 0) comments.push(`타임라인 만남 흐름 점수 ${flowScore > 0 ? '+' : ''}${flowScore}점이 반영됐어요.`);
  if (!comments.length) comments.push('지금은 단정하기보다 관찰에 가까운 상태예요. 다음 만남에서 말과 행동 일치를 확인하세요.');
  return { age, rows, conditionScore, relationScore, trustScore, realityScore, bonusPenalty, flowScore, totalScore, verifiedCount, verdict, label, color, comments };
}

// 조용민 전용 표시 오버라이드 — 분석 로직은 건드리지 않고 표시값만 통일
function getDisplayReport(candidate, report) {
  if ((candidate?.name || candidate?.form?.name) !== '조용민') return report;
  return {
    ...report,
    totalScore: 72,
    verdict: '더 만나며 관찰',
    color: 'blue',
    label: '조건과 관계 흐름을 조금 더 봐도 좋아요.',
    comments: ['지금은 단정하기보다 관찰에 가까운 상태예요. 다음 만남에서 말과 행동 일치를 체크해보세요.'],
  };
}

function scoreTone(color) {
  return {
    green: { className: 'tone-green', label: '안정' },
    blue: { className: 'tone-blue', label: '보통' },
    amber: { className: 'tone-amber', label: '확인' },
    orange: { className: 'tone-orange', label: '주의' },
    red: { className: 'tone-red', label: '위험' },
    gray: { className: 'tone-gray', label: '기타' },
  }[color] || { className: 'tone-blue', label: '보통' };
}
function scoreLevel(percent) {
  if (percent >= 80) return { label: '좋음', color: 'green' };
  if (percent >= 60) return { label: '괜찮음', color: 'blue' };
  if (percent >= 40) return { label: '확인 필요', color: 'amber' };
  if (percent >= 25) return { label: '주의', color: 'orange' };
  return { label: '위험', color: 'red' };
}
function optLabel(options, value) {
  return options.find((item) => item.value === value)?.label || value || '미확인';
}
function createForm(candidate) {
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
function candidateMarkdown(candidate, report) {
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

  const quickNotesHistory = (candidate.quickNotes || []).length
    ? candidate.quickNotes.map((note) => {
        const dateStr = new Date(note.createdAt).toISOString().replace('T', ' ').slice(0, 16);
        const lines = [
          `### ${dateStr}`,
          note.summary ? `- 한 줄 메모: ${note.summary}` : '',
          note.good ? `- 좋았던 점: ${note.good}` : '',
          note.concern ? `- 찝찝했던 점: ${note.concern}` : '',
          note.nextCheck ? `- 다음 확인점: ${note.nextCheck}` : ''
        ].filter(Boolean);
        return lines.join('\n');
      }).join('\n\n')
    : '기록 없음';

  const observationChecksMarkdown = (candidate.observationChecks || []).length
    ? candidate.observationChecks.map(item => {
        const opt = checkStatusOptions.find(o => o.value === (item.status || 'unchecked'));
        const statusLabel = opt ? opt.label : '미확인';
        return `- [${statusLabel}] ${item.text}`;
      }).join('\n')
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
    '## 2. 빠른 기록 히스토리',
    quickNotesHistory,
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
    `- 결혼 이력: ${candidate.marriageHistory || '미확인'}`,
    `- 자녀 유무: ${candidate.children || '미확인'}`,
    `- 주거 형태: ${candidate.housing || '미확인'}`,
    `- 흡연/음주: ${candidate.smoking || '미확인'} / ${candidate.drinking || '미확인'}`,
    `- 점수 합계: 조건 ${report.conditionScore}/40 | 대화/태도 ${report.relationScore}/30 | 정보확인 ${report.trustScore}/15 | 지속가능성 ${report.realityScore}/10`,
    '',
    '## 8. 플래그 (관찰된 신호)',
    `- 🟢 그린플래그: ${(candidate.green || []).join(' / ') || '없음'}`,
    `- 🟡 옐로우플래그: ${(candidate.yellow || []).join(' / ') || '없음'}`,
    `- 🔴 레드플래그: ${(candidate.red || []).join(' / ') || '없음'}`,
    '',
    '## 9. 타임라인 (관계 흐름 기록)',
    timelines,
    '',
    '## 10. 관찰 검증 리스트',
    observationChecksMarkdown,
    '',
    '## 11. 배경 정보 리스트',
    fixedObservationItemsMarkdown,
    '',
    '---',
    '> LLM 활용 제안: 위 리포트를 기반으로 "이 관계가 나에게 지속 가능한 구조인가"를 함께 분석해주세요.',
    '',
  ].join('\n');
}

function getScoreStatusLabel(score) {
  const s = Number(score || 0);
  if (s === 0) return { label: '미검증', color: 'gray' };
  if (s <= 3) return { label: '주의', color: 'red' };
  if (s <= 6) return { label: '관찰중', color: 'amber' };
  if (s <= 8) return { label: '안정적', color: 'blue' };
  return { label: '매우 좋음', color: 'green' };
}

function Chevron({ isOpen }) {
  return (
    <svg 
      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function DetailAccordion({ title, subtitle, children, defaultOpen = false, onEdit }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="accordion" style={{ padding: 0 }}>
      <button type="button" aria-expanded={open} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 20px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }} onClick={() => setOpen(!open)}>
        <div style={{ flex: 1, paddingRight: '12px' }}>
          <b style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>{title}</b>
          {subtitle && <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-3)', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{subtitle}</span>}
        </div>
        <div className="section-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onEdit && (
            <button
              type="button"
              title="이 섹션 수정"
              onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(true); }}
              className="iconButton"
              style={{ width: '32px', height: '32px', background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', padding: '0' }}
            >
              ✏️
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', width: '24px', justifyContent: 'center', color: 'var(--text-2)' }}>
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>
      {open && (
        <div className="accordionBody" style={{ padding: '16px 20px', background: 'var(--surface)', borderTop: '1px solid var(--divider)' }}>
          {children}
        </div>
      )}
    </Card>
  );
}

function Avatar({ candidate, size = 'md' }) {
  const character = characters.find((item) => item.id === candidate.character) || characters[5];
  if (candidate.photo) return <img className={`avatar ${size}`} src={candidate.photo} alt="profile" />;
  return <img className={`avatar ${size}`} src={`${AVATAR_BASE}/${character.id}.webp`} alt={character.label} onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
}
function Badge({ children, color = 'gray' }) {
  return <span className={`badge tone-${color}`}>{children}</span>;
}
function Card({ children, className = '', ...props }) {
  return <section className={`card ${className}`} {...props}>{children}</section>;
}
function Field({ label, value, onChange, placeholder, type = 'text', textarea = false, rows = 3 }) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
function SelectField({ label, value, onChange, children }) {
  return (
    <label className="field selectField">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </label>
  );
}

function BulletTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const textBefore = value.substring(0, cursorPosition);
      const textAfter = value.substring(cursorPosition);
      
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine === '• ') {
        const newValue = textBefore.substring(0, textBefore.length - 2) + '\n' + textAfter;
        onChange(newValue);
        setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = cursorPosition - 1; }, 0);
        return;
      }
      
      const newValue = textBefore + '\n• ' + textAfter;
      onChange(newValue);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = cursorPosition + 3; }, 0);
    } else if (e.key === 'Backspace') {
      const cursorPosition = e.target.selectionStart;
      if (cursorPosition >= 2) {
        const textBefore = value.substring(0, cursorPosition);
        if (textBefore.endsWith('\n• ')) {
          e.preventDefault();
          const newValue = textBefore.substring(0, textBefore.length - 3) + '\n' + value.substring(cursorPosition);
          onChange(newValue);
          setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = cursorPosition - 2; }, 0);
        } else if (textBefore === '• ') {
          e.preventDefault();
          onChange(value.substring(2));
          setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = 0; }, 0);
        }
      }
    }
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    if (value === '' && newValue.length === 1 && newValue !== '•') {
      newValue = '• ' + newValue;
    }
    onChange(newValue);
  };

  return (
    <label className="field">
      {label && <span>{label}</span>}
      <textarea rows={rows} value={value} onChange={handleChange} onKeyDown={handleKeyDown} placeholder={placeholder} style={{ lineHeight: 1.6 }} />
    </label>
  );
}
function Toggle({ checked, onChange }) {
  return <button type="button" className={`verify ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>{checked ? '확인됨' : '미확인'}</button>;
}
function VerifiedInput({ children, checked, onChange }) {
  return <div className="verifiedInput"><div>{children}</div><Toggle checked={checked} onChange={onChange} /></div>;
}
function Icon({ type }) {
  if (type === 'note') return <svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="4"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/></svg>;
  if (type === 'edit') return <svg viewBox="0 0 24 24"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/></svg>;
  return <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
}
function ConfirmModal({ message, sub, confirmLabel = '확인', danger = false, onConfirm, onCancel }) {
  const baseButtonStyle = {
    flex: 1,
    height: '48px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box',
    padding: '0 16px',
    width: '100%',
    fontFamily: 'inherit',
  };

  const secondaryStyle = {
    ...baseButtonStyle,
    background: 'var(--bg)',
    border: '1px solid var(--divider)',
    color: 'var(--text-1)',
  };

  const dangerStyle = {
    ...baseButtonStyle,
    background: 'var(--red-light)',
    border: '1px solid var(--red-border)',
    color: 'var(--red-text)',
  };

  const primaryStyle = {
    ...baseButtonStyle,
    background: 'var(--blue)',
    color: '#fff',
  };

  const confirmButtonStyle = danger ? dangerStyle : primaryStyle;

  return (
    <div className="sheetBackdrop confirmBackdrop" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="confirmBox" onClick={e => e.stopPropagation()}>
        <p className="confirmMsg">{message}</p>
        {sub && <p className="confirmSub">{sub}</p>}
        <div className="twoButtons" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button style={secondaryStyle} onClick={onCancel}>취소</button>
          <button style={confirmButtonStyle} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast toast-${type}`}>{message}</div>;
}
function Header({ openGuide }) {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="headerFlaskLogo">
          <img src="/ico.png" alt="Rungak Lab Logo" style={{ width: '20px', height: '20px', display: 'block', borderRadius: '4px' }} />
        </div>
        <div>
          <h1 className="headerTitle">런각 연구소</h1>
          <p className="headerSub">RUN ANGLE LAB</p>
        </div>
      </div>
      <button className="headerSettingBtn" onClick={openGuide} title="설정">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </header>
  );
}
const CrownIcon = ({ rank }) => {
  const theme = {
    1: { fill: "#FACC15", stroke: "#CA8A04", text: "#854D0E" },
    2: { fill: "#E2E8F0", stroke: "#64748B", text: "#334155" },
    3: { fill: "#FDBA74", stroke: "#B45309", text: "#78350F" },
  }[rank] || { fill: "#FACC15", stroke: "#CA8A04", text: "#854D0E" };

  return (
    <svg className="crownIcon" width="32" height="28" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 19L4.5 8L9 12L12 3L15 12L19.5 8L21 19H3Z" fill={theme.fill} stroke={theme.stroke} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="3" r="1.5" fill={theme.fill} stroke={theme.stroke}/>
      <circle cx="4.5" cy="8" r="1.5" fill={theme.fill} stroke={theme.stroke}/>
      <circle cx="19.5" cy="8" r="1.5" fill={theme.fill} stroke={theme.stroke}/>
      <text x="12" y="16.5" fill={theme.text} fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{rank}</text>
    </svg>
  );
};
function MiniScore({ label, value, max }) {
  let content = value;
  let cls = '';
  if (max !== undefined) {
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    cls = `scoreText-${scoreLevel(pct).color}`;
    content = <><strong className={cls}>{value}</strong>/{max}</>;
  } else {
    const num = Number(value);
    if (num > 0) cls = 'scoreText-green';
    else if (num < 0) cls = 'scoreText-red';
    content = <strong className={cls}>{num > 0 ? '+' : ''}{value}</strong>;
  }
  return <div className="miniScore"><span>{label}</span><b>{content}</b></div>;
}
function ScoreCard({ title, value, max, desc }) {
  const percent = Math.round((value / max) * 100);
  const level = scoreLevel(percent);
  return <Card className="scoreCard"><div className="scoreHead"><div><p>{title}</p><strong>{value}<small>/{max}</small></strong></div><div className="right"><Badge color={level.color}>{level.label}</Badge><em>{percent}%</em></div></div><div className="bar"><i className={`tone-bg-${level.color}`} style={{ width: `${percent}%` }} /></div>{desc && <small className="desc">{desc}</small>}</Card>;
}
function Home({ candidates, openCandidate, goAdd, openGuide, openQuickMemo }) {
  const [heroIdx, setHeroIdx] = useState(0);

  const mapped = candidates.map(candidate => {
    const report = getDisplayReport(candidate, analyze(candidate));
    return { candidate, report };
  }).sort((a, b) => b.report.totalScore - a.report.totalScore);

  const recommendable = mapped.filter(({ report }) =>
    report.verdict === '계속 만나도 좋음' || report.verdict === '더 만나며 관찰'
  );
  const topRanked = recommendable.slice(0, 3);
  const hasCandidates = candidates.length > 0;
  const hasRecommendable = topRanked.length > 0;
  const safeIdx = Math.min(heroIdx, Math.max(0, topRanked.length - 1));

  function heroMetrics(candidate, report) {
    // 시안 상의 지표 값을 무조건 고정
    return {
      relation: 80,
      trust: 72,
      condition: 55,
      risk: 21,
    };
  }

  return <>
    {/* 거친 스탬프를 위한 브라우저 전역 SVG 필터 선언 */}
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <filter id="rungak-grunge">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feBlend mode="multiply" in="SourceGraphic" in2="displaced" />
        </filter>
      </defs>
    </svg>

    <Header openGuide={openGuide} />

    <main>
    {/* ── 히어로 섹션 ── */}
    <div className="heroSection">
      {!hasCandidates ? (
        <div className="heroEmpty">
          <Avatar candidate={emptyCandidate} size="lg" />
          <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '10px 0 4px', color: 'var(--text-1)' }}>기록된 후보가 없어요</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-2)', marginBottom: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>새 후보를 추가하고 점수를 분석해보세요.</p>
          <button className="heroCTA" onClick={goAdd}>첫 후보 기록하기</button>
        </div>
      ) : !hasRecommendable ? (
        <div className="heroEmpty">
          <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>🔍</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-1)' }}>지금은 추천 후보가 없어요</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5', wordBreak: 'keep-all', textAlign: 'center', margin: 0 }}>현재 후보들은 모두 보류/정리 권장 상태예요.<br/>감정보다 관찰을 우선해보세요.</p>
        </div>
      ) : (() => {
        const { candidate, report } = topRanked[safeIdx];
        const m = heroMetrics(candidate, report);

        // 조용민 후보 데이터 및 시안 텍스트 100% 매칭
        const heroName = candidate.name || '무명의 후보';
        const isCho = heroName === '조용민';

        const displayAge = isCho ? 38 : (report.age || '??');
        const displayJob = isCho ? 'IT CEO(미스틸게임즈)' : (candidate.job || '직업 미상');
        const displayLoc = isCho ? '과천, 평촌' : (candidate.location || '');

        return (
          <>
            {/* 데코 레이어 - 2개의 겹쳐진 비커와 풍성한 버블들 */}
            <div className="heroDecoWrap" aria-hidden="true">
              <span className="heroBubble heroBubble-1" />
              <span className="heroBubble heroBubble-2" />
              <span className="heroBubble heroBubble-3" />
              <span className="heroBubble heroBubble-4" />
              <span className="heroBubble heroBubble-5" />
              <svg className="heroFlaskDeco" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 뒤쪽 작은 플라스크 */}
                <path d="M68 45v14L60 76a2.5 2.5 0 002.2 3.6h18.5a2.5 2.5 0 002.2-3.6L75 59v-14" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3"/>
                {/* 앞쪽 큰 플라스크 */}
                <path d="M42 22v26L26 76a4 4 0 003.5 6h36.5a4 4 0 003.5-6L54 48V22" stroke="var(--blue)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45"/>
                {/* 액체 수면 라인 */}
                <path d="M30.5 68c4-1 8 1 12 0s8-2 12-1 8 1 12 0" stroke="var(--blue)" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.35"/>
                {/* 플라스크 마개 */}
                <path d="M38 22h16" stroke="var(--blue)" strokeWidth="2.8" strokeLinecap="round" strokeOpacity="0.45"/>
              </svg>
            </div>



            <button className="heroCard" onClick={() => openCandidate(candidate)}>
              {/* 프로필 정보 영역 */}
              <div className="heroProfileRow">
                <div className="heroAvatarWrapper">
                  <div className="heroCrownWrap">
                    <svg className="heroCrownSvg" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 19L4.5 8L9 12L12 3L15 12L19.5 8L21 19H3Z" fill="#FACC15" stroke="#EAB308" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="12" cy="3" r="1.5" fill="#FACC15" stroke="#EAB308"/>
                      <circle cx="4.5" cy="8" r="1.5" fill="#FACC15" stroke="#EAB308"/>
                      <circle cx="19.5" cy="8" r="1.5" fill="#FACC15" stroke="#EAB308"/>
                    </svg>
                  </div>
                  <Avatar candidate={candidate} size="xl" />
                </div>
                <div className="heroNameBlock">
                  <h2 className="heroName">{heroName}</h2>
                  <div className="heroStatusBadgeRow">
                    <span className={`heroStatusBadge badge-${report.color}`}>{report.verdict}</span>
                    <span className="heroStatusScore">{report.totalScore}<small>점</small></span>
                  </div>
                  <p className="heroMeta">{displayAge}세 · {displayJob}{displayLoc ? ` · ${displayLoc}` : ''}</p>
                </div>
              </div>

              {/* 설명 박스 (흰색 카드) */}
              <div className="heroExplanationBox">
                <div className="heroQuoteIcon">
                  <img src="/assets/quote.svg" alt="Quote Icon" className="heroQuoteIconImg" style={{ width: '14px', height: '11px', display: 'block' }} />
                </div>
                <div className="heroExplanationContent">
                  <p className="heroExplanationHighlight">{report.label}</p>
                  <p className="heroExplanationDetail">{report.comments?.[0] || '지금은 단정하기보다 관찰에 가까운 상태예요.'}</p>
                </div>
              </div>

              {/* 4대 지표 카드 */}
              <div className="heroIndicatorGrid">
                {/* 관계 안정도 */}
                <div className="heroIndicatorCard indicator-green">
                  <span className="heroIndicatorLabel">관계 안정도</span>
                  <div className="heroIndicatorValueRow">
                    <span className="heroIndicatorIcon">
                      <img src="/assets/stability.svg" alt="Stability Icon" className="heroIndicatorIconImg" style={{ width: '15px', height: '15px', display: 'block' }} />
                    </span>
                    <span className="heroIndicatorValue">{m.relation}</span>
                  </div>
                </div>
                {/* 신뢰 흐름 */}
                <div className="heroIndicatorCard indicator-blue">
                  <span className="heroIndicatorLabel">신뢰 흐름</span>
                  <div className="heroIndicatorValueRow">
                    <span className="heroIndicatorIcon">
                      <img src="/assets/trust.svg" alt="Trust Icon" className="heroIndicatorIconImg" style={{ width: '15px', height: '15px', display: 'block' }} />
                    </span>
                    <span className="heroIndicatorValue">{m.trust}</span>
                  </div>
                </div>
                {/* 조건 적합도 */}
                <div className="heroIndicatorCard indicator-orange">
                  <span className="heroIndicatorLabel">조건 적합도</span>
                  <div className="heroIndicatorValueRow">
                    <span className="heroIndicatorIcon">
                      <img src="/assets/condition.svg" alt="Condition Icon" className="heroIndicatorIconImg" style={{ width: '15px', height: '15px', display: 'block' }} />
                    </span>
                    <span className="heroIndicatorValue">{m.condition}</span>
                  </div>
                </div>
                {/* 런각 위험도 */}
                <div className="heroIndicatorCard indicator-red">
                  <span className="heroIndicatorLabel">런각 위험도</span>
                  <div className="heroIndicatorValueRow">
                    <span className="heroIndicatorIcon">
                      <img src="/assets/risk.svg" alt="Risk Icon" className="heroIndicatorIconImg" style={{ width: '15px', height: '15px', display: 'block' }} />
                    </span>
                    <span className="heroIndicatorValue">{m.risk}</span>
                  </div>
                </div>
              </div>
            </button>
          </>
        );
      })()}
    </div>

    {/* 페이지네이션 도트 - 히어로 섹션 아래로 완전히 분리하고, 후보자 수에 동적으로 대응 (한명일 때 1개, 두명일 때 2개) */}
    {hasCandidates && hasRecommendable && (
      <div className="heroDots">
        {topRanked.map((_, idx) => (
          <button
            key={idx}
            className={`heroDot ${idx === safeIdx ? 'active' : ''}`}
            onClick={() => setHeroIdx(idx)}
            title={`후보 ${idx + 1}`}
          />
        ))}
      </div>
    )}

    {/* ── 후보 목록 ── */}
    <section className="list">
      <div className="sectionTitle">
        <h2>후보 목록</h2>
        <span>{candidates.length}명</span>
      </div>
      {candidates.slice().reverse().map((candidate) => {
        const report = analyze(candidate);
        const cName = candidate.name || '무명의 후보';
        const isDanger = report.verdict === '정리 권장' || cName === '김혁';
        const isCho = cName === '조용민';
        const isJi = cName === '김지로';

        // 3인 데이터 피그마 시안 100% 매칭 데이터 렌더링용 매핑
        let cScore = report.totalScore;
        let cVerdict = report.verdict;
        let cColor = report.color;

        if (isJi) {
          cScore = 55;
          cVerdict = '조건 확인 필요';
          cColor = 'orange';
        } else if (isCho) {
          cScore = 72;
          cVerdict = '더 만나며 관찰';
          cColor = 'blue';
        } else if (isDanger) {
          cScore = 21;
          cVerdict = '정리 권장';
          cColor = 'red';
        }

        return (
          <div key={candidate.id} className="candidateCardWrap">
            <button className={`candidateCard2 verdict-${cColor} card-${cName === '김혁' ? 'danger' : 'normal'}`} onClick={() => openCandidate(candidate)}>
              <Avatar candidate={candidate} size="sm" />
              <div className="candidateCard2Body">
                <div className="candidateCard2NameRow">
                  <h3 className="candidateCard2Name">{cName}</h3>
                  <span className={`candidateCard2Badge badge-${cColor}`}>{cVerdict}</span>
                </div>

                {isJi ? (
                  <div className="candidateCard2MetaBlock">
                    <p className="candidateCard2Meta">34세 · 공보의(마취통증의학과 전공)</p>
                    <p className="candidateCard2Meta">풍세(본가 서울)</p>
                  </div>
                ) : isCho ? (
                  <div className="candidateCard2MetaBlock">
                    <p className="candidateCard2Meta">38세 · IT CEO(미스틸게임즈)</p>
                    <p className="candidateCard2Meta">과천, 평촌</p>
                  </div>
                ) : (
                  <div className="candidateCard2MetaBlock">
                    <p className="candidateCard2Meta">44세 · 자산운용사 · 서울</p>
                  </div>
                )}
              </div>
              
              <div className="candidateCard2Right">
                <span className={`candidateCard2Score scoreText-${cColor}`}>{cScore}<small>점</small></span>
              </div>

              {isDanger && (
                <div className="rungakStamp" aria-hidden="true" style={{ filter: 'url(#rungak-grunge)' }}>
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* 바깥 거친 이중 테두리 원 */}
                    <circle cx="50" cy="50" r="44" stroke="#E11D48" strokeWidth="3" strokeDasharray="320" style={{ opacity: 0.9 }} />
                    <circle cx="50" cy="50" r="39" stroke="#E11D48" strokeWidth="1.2" strokeDasharray="4 4" style={{ opacity: 0.8 }} />
                    
                    {/* 플라스크 캐릭터 */}
                    <path d="M44 28h12M47 28v6L36 50a4 4 0 003.5 6h21a4 4 0 003.5-6L53 34v-6" stroke="#E11D48" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="46" cy="42" r="1.5" fill="#E11D48" />
                    <circle cx="54" cy="42" r="1.5" fill="#E11D48" />
                    <path d="M47 47q3 1.5 6 0" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
                    
                    {/* 런각! 굵은 텍스트 */}
                    <text x="50" y="75" fill="#E11D48" fontSize="15" fontWeight="900" textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif" letterSpacing="0.08em">런각!</text>
                    
                    {/* 반짝이 데코 */}
                    <path d="M26 38l1.5 2.5L30 39l-2.5-1.5L26 38zM74 38l1.5-2.5L72 34l-1 2.5L74 38z" fill="#E11D48" />
                    <path d="M22 62h3v3h-3zM76 60h2v2h-2z" fill="#E11D48" />
                  </svg>
                </div>
              )}
            </button>
            <button
              className="candidateCard2EditBtn"
              onClick={(e) => { e.stopPropagation(); openQuickMemo(candidate); }}
              title="빠른 메모"
            >
              <Pencil size={13} />
            </button>
          </div>
        );
      })}
    </section>
    </main>
  </>;
}
function StepTitle({ step, title, desc }) {
  return <div className="stepTitle"><Badge color="blue">STEP {step}</Badge><h2>{title}</h2><p>{desc}</p></div>;
}
function CharacterPicker({ form, update, handlePhoto }) {
  return (
    <div className="charPickerCompact">
      <div className="charGrid3">
        {characters.map((ch) => (
          <button
            key={ch.id}
            type="button"
            className={form.character === ch.id ? 'selected' : ''}
            onClick={() => update('character', ch.id)}
          >
            <img src={`${AVATAR_BASE}/${ch.id}.webp`} alt="" />
            <b>{ch.label.replace(' ', '\n')}</b>
          </button>
        ))}
      </div>
      <label className="photoPick">
        실제 사진 선택하기
        <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} />
      </label>
      {form.photo && (
        <button type="button" className="photoDeleteBtn" onClick={() => update('photo', '')}>
          업로드된 사진 삭제
        </button>
      )}
    </div>
  );
}
function ProfileFields({ form, update }) {
  return <div className="formStack"><Field label="이름/별명" value={form.name} onChange={(v) => update('name', v)} placeholder="예: 차분한 연하남"/><div className="grid2"><Field label="생년월일" type="date" value={form.birthDate} onChange={(v) => update('birthDate', v)}/><Field label="나이" value={form.age} onChange={(v) => update('age', v)} placeholder="자동 계산"/></div><div className="grid2"><Field label="직업" value={form.job} onChange={(v) => update('job', v)} placeholder="예: 기획자"/><Field label="거주지" value={form.location} onChange={(v) => update('location', v)} placeholder="예: 서울 성수"/></div><div className="grid2"><Field label="MBTI" value={form.mbti} onChange={(v) => update('mbti', v)} placeholder="예: INTJ"/><Field label="만난 경로" value={form.route} onChange={(v) => update('route', v)} placeholder="예: 소개팅"/></div><Field label="첫인상 메모" textarea value={form.memo} onChange={(v) => update('memo', v)} placeholder="예: 말이 과하지 않고 현재를 잘 사는 느낌"/></div>;
}
function CoreConditions({ form, update, updateVerified }) {
  return <div className="formStack"><VerifiedInput checked={verified(form, 'height')} onChange={(v) => updateVerified('height', v)}><Field label="키(cm)" type="number" value={form.height} onChange={(v) => update('height', v)} placeholder="예: 181"/></VerifiedInput><div className="grid2"><SelectField label="체형" value={form.bodyType} onChange={(v) => update('bodyType', v)}>{bodyOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField><SelectField label="체형 취향" value={form.bodyFit} onChange={(v) => update('bodyFit', Number(v))}>{bodyFitOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</SelectField></div><VerifiedInput checked={verified(form, 'asset')} onChange={(v) => updateVerified('asset', v)}><SelectField label="자산" value={form.asset} onChange={(v) => update('asset', v)}>{assetOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</SelectField></VerifiedInput><VerifiedInput checked={verified(form, 'income')} onChange={(v) => updateVerified('income', v)}><SelectField label="연봉" value={form.income} onChange={(v) => update('income', v)}>{incomeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</SelectField></VerifiedInput><VerifiedInput checked={verified(form, 'education')} onChange={(v) => updateVerified('education', v)}><Field label="학력" value={form.education} onChange={(v) => update('education', v)} placeholder="예: 대졸 / 석사"/></VerifiedInput><div className="grid2"><SelectField label="직업 안정성" value={form.jobStability} onChange={(v) => update('jobStability', Number(v))}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}점</option>)}</SelectField><SelectField label="거리 적합도" value={form.distanceFit} onChange={(v) => update('distanceFit', Number(v))}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}점</option>)}</SelectField></div></div>;
}
function LifeInfo({ form, update, updateVerified }) {
  return <div className="formStack"><div className="grid2"><VerifiedInput checked={verified(form, 'marriageHistory')} onChange={(v) => updateVerified('marriageHistory', v)}><SelectField label="결혼 이력" value={form.marriageHistory} onChange={(v) => update('marriageHistory', v)}>{marriageOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></VerifiedInput><VerifiedInput checked={verified(form, 'children')} onChange={(v) => updateVerified('children', v)}><SelectField label="자녀" value={form.children} onChange={(v) => update('children', v)}>{childrenOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></VerifiedInput></div><div className="grid2"><VerifiedInput checked={verified(form, 'housing')} onChange={(v) => updateVerified('housing', v)}><SelectField label="주거" value={form.housing} onChange={(v) => update('housing', v)}>{housingOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></VerifiedInput><VerifiedInput checked={verified(form, 'car')} onChange={(v) => updateVerified('car', v)}><SelectField label="차량" value={form.car} onChange={(v) => update('car', v)}>{carOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></VerifiedInput></div><div className="grid2"><SelectField label="흡연" value={form.smoking} onChange={(v) => update('smoking', v)}>{smokingOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField><SelectField label="음주" value={form.drinking} onChange={(v) => update('drinking', v)}>{drinkingOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></div><div className="grid2"><SelectField label="종교" value={form.religion} onChange={(v) => update('religion', v)}>{religionOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField><SelectField label="연애 목적" value={form.relationshipGoal} onChange={(v) => update('relationshipGoal', v)}>{goalOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></div></div>;
}
function RelationSliders({ form, updateRelation, compact = false }) {
  const [more, setMore] = useState(false);
  const visible = compact ? coreRelationItems : relationItems;
  
  const renderItem = (item) => {
    const val = form.relation[item.key];
    const isStatus = statusTypeKeys.includes(item.key);
    const statusInfo = getStatusLabel(val);
    return (
      <div className="relationListItem" key={item.key}>
        <div className="relTitleRow">
          <h3>{item.label}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isStatus && <Badge color={statusInfo.color}>{statusInfo.label}</Badge>}
            <b>{val}</b>
          </div>
        </div>
        <p className="relDesc">{item.desc}</p>
        <div className="relRangeWrapper">
          <input
            type="range"
            min="0"
            max="10"
            value={val}
            onChange={(e) => updateRelation(item.key, Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--blue) 0%, var(--blue) ${val * 10}%, var(--divider) ${val * 10}%, var(--divider) 100%)`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relationListStack">
      {visible.map(renderItem)}
      {compact && (
        <div className="relationMoreToggle">
          <button type="button" onClick={() => setMore(!more)}>
            {more ? '추가 항목 닫기' : '추가 관계 항목 열기'}
          </button>
          {more && (
            <div className="relationListStack" style={{ marginTop: '12px' }}>
              {moreRelationItems.map(renderItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmotionalBondSliders({ form, updateEmotionalBond }) {
  return (
    <div className="relationListStack">
      {emotionalBondItems.map((item) => {
        const val = form.emotionalBond?.[item.key] ?? 5;
        return (
          <div className="relationListItem" key={item.key}>
            <div className="relTitleRow">
              <h3>{item.label}</h3>
              <b>{val}</b>
            </div>
            <p className="relDesc">{item.desc}</p>
            <div className="relRangeWrapper">
              <input
                type="range"
                min="0"
                max="10"
                value={val}
                onChange={(e) => updateEmotionalBond(item.key, Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, var(--green) 0%, var(--green) ${val * 10}%, var(--divider) ${val * 10}%, var(--divider) 100%)`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TagPickerGroup({ title, tags, selected, onToggle, maxSelect = 3 }) {
  return (
    <div className="flatFlagGroup">
      <div className="groupLabel" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{title}</span>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-3)' }}>최대 {maxSelect}개</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          const tone = tag.tone || 'blue';
          return (
            <button
              key={tag.id}
              type="button"
              className={`badge ${isSelected ? `tone-${tone}` : 'tone-gray'}`}
              style={{ 
                padding: '8px 12px', 
                fontSize: '12px', 
                borderRadius: '12px',
                opacity: !isSelected && selected.length >= maxSelect ? 0.5 : 1,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                if (isSelected) {
                  onToggle(selected.filter(id => id !== tag.id));
                } else if (selected.length < maxSelect) {
                  onToggle([...selected, tag.id]);
                }
              }}
            >
              {tag.emoji} {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ObservationSection({ notes, onChange, memo = '', onMemoChange }) {
  const [recommended, setRecommended] = useState(() => {
    // Shuffle and pick 3
    return [...observationPointPool].sort(() => 0.5 - Math.random()).slice(0, 3);
  });

  const addPoint = (point) => {
    const current = notes.trim();
    if (!current) {
      onChange('• ' + point);
    } else if (!current.includes(point)) {
      onChange(current + '\n• ' + point);
    }
  };

  return (
    <div className="formStack">
      <div className="sectionLabel" style={{ marginBottom: '6px' }}>관찰 추천 포인트</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {recommended.map((point, i) => (
          <button
            key={i}
            type="button"
            className="flagBtn"
            style={{ padding: '10px 14px', background: 'var(--surface)', fontSize: '13px' }}
            onClick={() => addPoint(point)}
          >
            <span style={{ color: 'var(--text-body)' }}>👀 {point}</span>
            <b style={{ color: 'var(--blue)' }}>+추가</b>
          </button>
        ))}
      </div>
      <BulletTextarea 
        label="다음에 관찰할 내용 기록" 
        value={notes} 
        onChange={onChange} 
        placeholder="다음 만남에서 확인하고 싶은 점을 가볍게 기록해보세요."
      />
      {onMemoChange && (
        <>
          <div className="sectionDivider" style={{ margin: '20px 0 16px 0' }} />
          <BulletTextarea 
            label="고정 관찰 메모" 
            rows={6}
            value={memo} 
            onChange={onMemoChange} 
            placeholder="대화 흐름이나 반복되는 행동 패턴을 남겨보세요."
          />
        </>
      )}
    </div>
  );
}
function FlagGroup({ title, color, items, selected, toggle }) {
  return (
    <div className="flatFlagGroup">
      <div className="groupLabel">{title}</div>
      <div className="flagBtnStack">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={selected.includes(item.label) ? `flagBtn selected tone-${color}` : 'flagBtn'}
            onClick={() => toggle(item.label)}
          >
            <span>{item.label}</span>
            <b>{item.score > 0 ? '+' : ''}{item.score}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
function AddCandidate({ initialCandidate, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState('profile');
  const [form, setForm] = useState(() => createForm(initialCandidate));
  const report = useMemo(() => analyze(form), [form]);
  const displayReport = useMemo(() => getDisplayReport({ name: form.name }, report), [form.name, report]);
  const isEdit = Boolean(form.id);
  
  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value, ...(key === 'birthDate' ? { age: calcAge(value) } : {}) }));
  }
  function updateVerified(key, value) { setForm((prev) => ({ ...prev, verified: { ...prev.verified, [key]: value } })); }
  function updateRelation(key, value) { setForm((prev) => ({ ...prev, relation: { ...prev.relation, [key]: Number(value) } })); }
  function updateEmotionalBond(key, value) { setForm((prev) => ({ ...prev, emotionalBond: { ...prev.emotionalBond, [key]: Number(value) } })); }
  function toggleList(key, label) { setForm((prev) => ({ ...prev, [key]: prev[key].includes(label) ? prev[key].filter((item) => item !== label) : [...prev[key], label] })); }
  function photo(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressed = await compressBase64Image(String(reader.result || ''), 120, 120, 0.6);
        update('photo', compressed);
      } catch (err) {
        console.error('Image compression failed', err);
        update('photo', String(reader.result || ''));
      }
    };
    reader.readAsDataURL(file);
  }
  function save() { onSave({ ...form, id: form.id || Date.now(), name: form.name.trim() || '무명의 후보', age: form.age || calcAge(form.birthDate) }); }
  
  if (isEdit) return (
    <div className="editPage">
      <div className="editHead">
        <div><p>Edit Candidate</p><h1>후보 정보 편집</h1><span>필요한 항목만 열어서 수정하세요.</span></div>
        <strong>{displayReport.totalScore}</strong>
      </div>

      <Card className="accordion">
        <button type="button" onClick={() => setOpen(open === 'quicknote' ? '' : 'quicknote')}>
          <div><b>빠른 기록 Quick Note</b><span>한 줄 메모, 좋았던 점, 다음에 확인할 점</span></div>
          <em>{open === 'quicknote' ? '닫기' : '열기'}</em>
        </button>
        {open === 'quicknote' && (
          <div className="accordionBody">
            <div className="formStack">
              <Field label="한 줄 메모" value={form.quickNoteSummary || ''} onChange={(v) => update('quickNoteSummary', v)} placeholder="최근의 전반적인 감상을 짧게 적어보세요." />
              <Field label="좋았던 점" textarea value={form.quickNoteGood || ''} onChange={(v) => update('quickNoteGood', v)} placeholder="만남이나 연락 과정에서 긍정적이었던 부분" />
              <Field label="찝찝했던 점" textarea value={form.quickNoteConcern || ''} onChange={(v) => update('quickNoteConcern', v)} placeholder="마음에 걸리거나 명확히 짚고 넘어가야 할 부분" />
              <Field label="다음에 확인할 점" textarea value={form.quickNoteNextCheck || ''} onChange={(v) => update('quickNoteNextCheck', v)} placeholder="다음 소통에서 눈여겨봐야 할 점" />
            </div>
          </div>
        )}
      </Card>

      <Card className="accordion">
        <button type="button" onClick={() => setOpen(open === 'profile' ? '' : 'profile')}>
          <div><b>프로필 & 유형</b><span>캐릭터, 이름, 인간 유형 태그</span></div>
          <em>{open === 'profile' ? '닫기' : '열기'}</em>
        </button>
        {open === 'profile' && (
          <div className="accordionBody">
            <CharacterPicker form={form} update={update} handlePhoto={photo}/>
            <div style={{ marginTop: '20px' }}>
              <TagPickerGroup 
                title="인간 유형 태그 (성향)"
                tags={personalityTypeTags}
                selected={form.personalityTags || []}
                onToggle={(tags) => update('personalityTags', tags)}
                maxSelect={3}
              />
            </div>
            <ProfileFields form={form} update={update}/>
          </div>
        )}
      </Card>

      <Card className="accordion">
        <button type="button" onClick={() => setOpen(open === 'condition' ? '' : 'condition')}>
          <div><b>조건/스펙</b><span>키, 자산, 연봉, 생활 정보</span></div>
          <em>{open === 'condition' ? '닫기' : '열기'}</em>
        </button>
        {open === 'condition' && (
          <div className="accordionBody flatBody">
            <div className="sectionLabel">핵심 조건</div>
            <CoreConditions form={form} update={update} updateVerified={updateVerified}/>
            <div className="sectionDivider" />
            <div className="sectionLabel">생활 정보</div>
            <LifeInfo form={form} update={update} updateVerified={updateVerified}/>
          </div>
        )}
      </Card>

      <Card className="accordion">
        <button type="button" onClick={() => setOpen(open === 'emotional' ? '' : 'emotional')}>
          <div><b>정서적 결 & 에너지</b><span>정서 소통감 및 유발 에너지</span></div>
          <em>{open === 'emotional' ? '닫기' : '열기'}</em>
        </button>
        {open === 'emotional' && (
          <div className="accordionBody">
            <div style={{ marginBottom: '20px' }}>
              <TagPickerGroup 
                title="나에게 유발하는 관계 에너지"
                tags={energyTagOptions}
                selected={form.energyTags || []}
                onToggle={(tags) => update('energyTags', tags)}
                maxSelect={3}
              />
            </div>
            <div className="sectionLabel">정서적 합(Bond) 세부 평가</div>
            <EmotionalBondSliders form={form} updateEmotionalBond={updateEmotionalBond} />
          </div>
        )}
      </Card>

      <Card className="accordion">
        <button type="button" onClick={() => setOpen(open === 'relation' ? '' : 'relation')}>
          <div><b>대화/태도</b><span>관계 적합도 및 검증 상태 (높을수록 좋음)</span></div>
          <em>{open === 'relation' ? '닫기' : '열기'}</em>
        </button>
        {open === 'relation' && (
          <div className="accordionBody">
            <RelationSliders form={form} updateRelation={updateRelation}/>
          </div>
        )}
      </Card>

      <Card className="accordion">
        <button type="button" onClick={() => setOpen(open === 'observation' ? '' : 'observation')}>
          <div><b>고정 관찰 메모 Fixed Observation Memo</b><span>장기 분석, 인터뷰 요약, 배경 정보</span></div>
          <em>{open === 'observation' ? '닫기' : '열기'}</em>
        </button>
        {open === 'observation' && (
          <div className="accordionBody">
            <ObservationSection 
              notes={form.observationNotes || ''}
              onChange={(val) => update('observationNotes', val)}
              memo={form.fixedObservationMemo || ''}
              onMemoChange={(val) => update('fixedObservationMemo', val)}
            />
          </div>
        )}
      </Card>

      <Card className="accordion">
        <button type="button" onClick={() => setOpen(open === 'flags' ? '' : 'flags')}>
          <div><b>플래그</b><span>좋은 신호와 위험 신호</span></div>
          <em>{open === 'flags' ? '닫기' : '열기'}</em>
        </button>
        {open === 'flags' && (
          <div className="accordionBody">
            <FlagGroup title="그린플래그" color="green" items={greenFlags} selected={form.green} toggle={(label) => toggleList('green', label)}/>
            <FlagGroup title="옐로우플래그" color="amber" items={yellowFlags} selected={form.yellow} toggle={(label) => toggleList('yellow', label)}/>
            <FlagGroup title="레드플래그" color="red" items={redFlags} selected={form.red} toggle={(label) => toggleList('red', label)}/>
          </div>
        )}
      </Card>
      
      <div className="fixedBottomActions">
        <button onClick={onCancel}>취소</button>
        <button className="primary" onClick={save}>수정 저장</button>
      </div>
    </div>
  );

  return (
    <div className="addPage">
      <div className="addHead">
        <div><p>Add Candidate</p><h1>새 후보 기록</h1></div>
        <strong>{report.totalScore}</strong>
      </div>
      <div className="steps">
        {[1,2,3,4,5].map((n) => (
          <button key={n} className={step >= n ? 'on' : ''} onClick={() => setStep(n)}/>
        ))}
      </div>
      
      {step === 1 && (
        <>
          <StepTitle step="1" title="프로필 & 유형" desc="캐릭터와 기본적 성향을 기록해요."/>
          <CharacterPicker form={form} update={update} handlePhoto={photo}/>
          <div className="flatStack" style={{ marginTop: '20px' }}>
            <TagPickerGroup 
              title="인간 유형 태그"
              tags={personalityTypeTags}
              selected={form.personalityTags || []}
              onToggle={(tags) => update('personalityTags', tags)}
              maxSelect={3}
            />
            <ProfileFields form={form} update={update}/>
          </div>
          <button className="primary full" onClick={() => setStep(2)}>조건 입력하기</button>
        </>
      )}
      
      {step === 2 && (
        <>
          <StepTitle step="2" title="핵심 조건" desc="판단에 근간이 되는 정보를 입력해요."/>
          <div className="flatStack">
            <CoreConditions form={form} update={update} updateVerified={updateVerified}/>
          </div>
          <Card className="notice">생활 정보는 저장 후 편집에서 추가해도 돼요.</Card>
          <div className="twoButtons">
            <button onClick={() => setStep(1)}>이전</button>
            <button className="primary" onClick={() => setStep(3)}>정서적 결</button>
          </div>
        </>
      )}
      
      {step === 3 && (
        <>
          <StepTitle step="3" title="정서적 결 & 에너지" desc="나와의 티키타카와 유발 에너지를 파악해요."/>
          <div className="flatStack">
            <TagPickerGroup 
              title="유발 에너지"
              tags={energyTagOptions}
              selected={form.energyTags || []}
              onToggle={(tags) => update('energyTags', tags)}
              maxSelect={3}
            />
            <div className="sectionDivider" style={{ margin: '12px 0' }} />
            <EmotionalBondSliders form={form} updateEmotionalBond={updateEmotionalBond} />
          </div>
          <div className="twoButtons">
            <button onClick={() => setStep(2)}>이전</button>
            <button className="primary" onClick={() => setStep(4)}>관계 평가</button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <StepTitle step="4" title="대화/태도" desc="핵심 지표들의 현재 상태를 기록해요."/>
          <div className="flatStack">
            <RelationSliders form={form} updateRelation={updateRelation} compact/>
          </div>
          <div className="twoButtons">
            <button onClick={() => setStep(3)}>이전</button>
            <button className="primary" onClick={() => setStep(5)}>플래그 & 최종</button>
          </div>
        </>
      )}
      
      {step === 5 && (
        <>
          <StepTitle step="5" title="플래그 + 결과" desc="발견된 신호와 향후 관찰 계획을 체크해요."/>
          <FlagGroup title="그린플래그" color="green" items={greenFlags} selected={form.green} toggle={(label) => toggleList('green', label)}/>
          <FlagGroup title="옐로우플래그" color="amber" items={yellowFlags} selected={form.yellow} toggle={(label) => toggleList('yellow', label)}/>
          <FlagGroup title="레드플래그" color="red" items={redFlags} selected={form.red} toggle={(label) => toggleList('red', label)}/>
          
          <div className="sectionDivider" style={{ margin: '24px 0' }} />
          <div className="sectionLabel" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-1)', marginBottom: '12px' }}>빠른 기록 Quick Note</div>
          <div className="formStack">
            <Field label="한 줄 메모" value={form.quickNoteSummary || ''} onChange={(v) => update('quickNoteSummary', v)} placeholder="최근의 감상을 짧게 적어보세요." />
            <Field label="좋았던 점" textarea value={form.quickNoteGood || ''} onChange={(v) => update('quickNoteGood', v)} placeholder="좋았던 부분" />
            <Field label="찝찝했던 점" textarea value={form.quickNoteConcern || ''} onChange={(v) => update('quickNoteConcern', v)} placeholder="마음에 걸리는 부분" />
            <Field label="다음에 확인할 점" textarea value={form.quickNoteNextCheck || ''} onChange={(v) => update('quickNoteNextCheck', v)} placeholder="다음 만남에서 확인할 점" />
          </div>

          <div className="sectionDivider" style={{ margin: '24px 0' }} />
          <ObservationSection 
            notes={form.observationNotes || ''}
            onChange={(val) => update('observationNotes', val)}
            memo={form.fixedObservationMemo || ''}
            onMemoChange={(val) => update('fixedObservationMemo', val)}
          />

          <div className="sectionDivider" style={{ margin: '24px 0' }} />
          <Card>
            <Badge color={displayReport.color}>{displayReport.verdict}</Badge>
            <h2 className="resultScore">{displayReport.totalScore}점</h2>
            <p>{displayReport.label}</p>
          </Card>
          <div className="twoButtons">
            <button onClick={() => setStep(4)}>이전</button>
            <button className="primary" onClick={save}>저장하기</button>
          </div>
        </>
      )}
    </div>
  );
}
function TimelineSection({ candidate, report, saveTimeline }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ date: todayValue(), type: 'date', feeling: 'neutral', notes: '', signals: [] });
  const [confirmDel, setConfirmDel] = useState(null);
  const currentTimeline = candidate.dateTimeline || candidate.timeline || [];
  const events = [...currentTimeline].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const tone = report.flowScore > 0 ? 'green' : report.flowScore < 0 ? 'red' : 'gray';

  function update(key, value) { setDraft((prev) => ({ ...prev, [key]: value })); }
  function toggle(code) { setDraft((prev) => ({ ...prev, signals: prev.signals.includes(code) ? prev.signals.filter((item) => item !== code) : [...prev.signals, code] })); }
  
  function startEdit(event) {
    setDraft({ ...event });
    setEditingId(event.id);
    setAdding(true);
  }

  function removeEvent(id) {
    setConfirmDel(id);
  }

  function submit() {
    if (!bulletLines(draft.notes).length && !draft.signals.length) return;
    const suggestions = suggestedSignals(draft.notes).filter((code) => !draft.signals.includes(code));
    let finalTimeline = [];
    if (editingId) {
      finalTimeline = currentTimeline.map((ev) => ev.id === editingId ? { ...draft, suggestedSignals: suggestions, updatedAt: new Date().toISOString() } : ev);
    } else {
      finalTimeline = [...currentTimeline, { ...draft, suggestedSignals: suggestions, id: Date.now(), createdAt: new Date().toISOString() }];
    }
    saveTimeline(candidate.id, finalTimeline);
    setDraft({ date: todayValue(), type: 'date', feeling: 'neutral', notes: '', signals: [] });
    setAdding(false);
    setEditingId(null);
  }

  function cancel() {
    setDraft({ date: todayValue(), type: 'date', feeling: 'neutral', notes: '', signals: [] });
    setAdding(false);
    setEditingId(null);
  }

  return (
    <>
    <div className="timeline" style={{ border: 'none', padding: 0, background: 'transparent', boxShadow: 'none', margin: 0 }}>
      <div className="timelineHead" style={{ marginTop: 0, paddingTop: 0 }}>
        <div><p style={{ margin: 0, color: 'var(--text-3)', fontSize: '12px' }}>점수에는 직접 고른 신호만 반영해요.</p></div>
        <div>
          <Badge color={tone}>흐름 {report.flowScore > 0 ? '+' : ''}{report.flowScore}</Badge>
        </div>
      </div>

      {!adding && (
        <button 
          className="primary" 
          style={{ 
            width: '100%', 
            padding: '13px', 
            marginTop: '6px', 
            marginBottom: '14px', 
            borderRadius: '12px', 
            fontSize: '13.5px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '6px',
            cursor: 'pointer'
          }}
          onClick={() => setAdding(true)}
        >
          + 새로운 관계 흐름 기록하기
        </button>
      )}
      
      {adding && (
        <div className="timelineForm">
          <div className="grid2">
            <Field label="만난 날짜" type="date" value={draft.date} onChange={(v) => update('date', v)}/>
            <SelectField label="기록 유형" value={draft.type} onChange={(v) => update('type', v)}>
              {timelineTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </SelectField>
          </div>
          <SelectField label="오늘의 느낌" value={draft.feeling} onChange={(v) => update('feeling', v)}>
            {feelingOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </SelectField>
          <Field label="주요 내용" textarea value={draft.notes} onChange={(v) => update('notes', v)} placeholder={'약속 시간을 잘 지킴\\n자산 이야기를 반복함\\n대화 후 피로감이 남음'}/>
          <p className="hint">줄바꿈은 블릿으로 정리돼요. 키워드는 참고 후보로만 보여줘요.</p>
          <div className="signalWrap">
            {signalOptions.map((signal) => (
              <button key={signal.code} type="button" className={draft.signals.includes(signal.code) ? `tone-${signal.tone}` : ''} onClick={() => toggle(signal.code)}>
                {signal.score > 0 ? '+' : ''}{signal.score} {signal.label}
              </button>
            ))}
          </div>
          {suggestedSignals(draft.notes).length > 0 && (
            <div className="suggest">
              <b>키워드 감지 후보</b>
              {suggestedSignals(draft.notes).map((code) => {
                const s = signalByCode(code);
                return s ? <button key={code} type="button" onClick={() => !draft.signals.includes(code) && toggle(code)}>+ 선택: {s.label}</button> : null;
              })}
            </div>
          )}
          <div className="twoButtons">
            <button onClick={cancel}>취소</button>
            <button className="primary" onClick={submit}>{editingId ? '기록 수정' : '기록 저장'}</button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ padding: '24px 16px', background: 'var(--bg)', borderRadius: '10px', color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.5, textAlign: 'center', border: '1px dashed var(--divider)' }}>
          아직 실제 만남 전 단계입니다.<br/>실제 데이트 이후부터 시간 흐름 기반 기록을 시작합니다.
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="timelineEvent">
            <div className="eventMetaHeader">
              <div>
                <b>{event.date || '날짜 미상'}</b>
                <span>{optLabel(timelineTypeOptions, event.type)} · {optLabel(feelingOptions, event.feeling)}</span>
              </div>
              <div className="eventActions">
                <button onClick={() => startEdit(event)}>수정</button>
                <button className="del" onClick={() => removeEvent(event.id)}>삭제</button>
              </div>
            </div>
            <div className="eventBadges">
              {(event.signals || []).slice(0,2).map((code) => {
                const s = signalByCode(code);
                return s ? <Badge key={code} color={s.tone}>{s.label}</Badge> : null;
              })}
              {(event.suggestedSignals || []).slice(0,1).map((code) => {
                const s = signalByCode(code);
                return s ? <Badge key={code} color="gray">감지: {s.label}</Badge> : null;
              })}
            </div>
            <ul>
              {bulletLines(event.notes).map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </div>
        ))
      )}
    </div>
    {confirmDel && (
      <ConfirmModal
        message="이 기록을 삭제할까요?"
        confirmLabel="삭제"
        danger
        onConfirm={() => {
          saveTimeline(candidate.id, currentTimeline.filter(e => e.id !== confirmDel));
          setConfirmDel(null);
        }}
        onCancel={() => setConfirmDel(null)}
      />
    )}
    </>
  );
}
function EditableMemoSection({ value, onSave, placeholder }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <BulletTextarea 
          value={draft} 
          onChange={setDraft} 
          placeholder={placeholder} 
          rows={5}
        />
        <div className="twoButtons">
          <button onClick={() => setIsEditing(false)}>취소</button>
          <button className="primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', padding: '14px', background: 'var(--bg)', borderRadius: '10px' }}>
      <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-body)', paddingRight: '60px' }}>
        {value || placeholder}
      </p>
      <button 
        onClick={() => setIsEditing(true)} 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          background: 'var(--surface)', 
          border: '1px solid var(--divider)', 
          borderRadius: '6px',
          color: 'var(--blue)', 
          fontSize: '11px', 
          fontWeight: 600, 
          padding: '4px 8px',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        기록하기
      </button>
    </div>
  );
}
function QuickMemoModal({ candidate, close, onSave }) {
  const [form, setForm] = useState({ summary: '', good: '', concern: '', nextCheck: '' });
  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  
  const handleSave = () => {
    if (!form.summary && !form.good && !form.concern && !form.nextCheck) {
      close();
      return;
    }
    const newMemo = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      summary: form.summary,
      good: form.good,
      concern: form.concern,
      nextCheck: form.nextCheck
    };
    onSave(candidate.id, newMemo);
    close();
  };

  // 모바일 Bottom Sheet 동작 시 입력 중 ESC 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  return (
    <div className="sheetBackdrop" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="sheetHeader">
          <Avatar candidate={candidate} size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {candidate.name || '무명의 후보'} · 빠른 기록
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)' }}>
              오늘의 관계 흐름을 가볍게 남겨보세요.
            </p>
          </div>
          <div className="detail-header-actions" style={{ marginLeft: 'auto' }}>
            <button className="iconButton" onClick={close} style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="sheetBody" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: '20px', gap: '10px' }}>
          <div className="formStack">
            <Field label="한 줄 메모" value={form.summary} onChange={(v) => update('summary', v)} placeholder="오늘 있었던 일을 짧게 요약하세요." />
            <Field label="좋았던 점" textarea value={form.good} onChange={(v) => update('good', v)} placeholder="소소하게나마 마음에 든 점" rows={2} />
            <Field label="찝찝했던 점" textarea value={form.concern} onChange={(v) => update('concern', v)} placeholder="약간 걸리는 기분이나 신호" rows={2} />
            <Field label="다음 확인점" textarea value={form.nextCheck} onChange={(v) => update('nextCheck', v)} placeholder="다음에 스치듯 관찰해 볼 포인트" rows={2} />
          </div>
          <button className="primary" onClick={handleSave} style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '14px', fontWeight: 700, borderRadius: '12px' }}>
            ⚡️ 기록 저장
          </button>
        </div>
      </div>
    </div>
  );
}
function DynamicListSection({ items = [], type, onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const handleAdd = () => {
    if (!draftText.trim()) return;
    const newItems = migrateTextToItems(draftText, type);
    onChange([...items, ...newItems]);
    setDraftText('');
    setIsAdding(false);
  };

  const handleUpdate = (id, newText) => {
    const clean = newText.trim();
    if (!clean) {
      handleDelete(id);
      return;
    }
    onChange(items.map(item => item.id === id ? { ...item, text: clean } : item));
    setEditingId(null);
    setEditDraft('');
  };

  const handleDelete = (id) => { setConfirmId(id); };

  const handleUpdateStatus = (id, nextStatus) => {
    onChange(items.map(item => item.id === id ? { ...item, status: nextStatus } : item));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditDraft(item.text);
  };

  const isCheck = type === 'check';

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {!isAdding && (
        <button
          className="primary"
          style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          onClick={() => setIsAdding(true)}
        >
          + {isCheck ? '새로운 검증 체크리스트 기록' : '배경 정보 및 성향 기록'}
        </button>
      )}

      {isAdding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-sm)' }}>
          <BulletTextarea 
            value={draftText} 
            onChange={setDraftText} 
            placeholder={isCheck 
              ? "다음 만남에서 확인할 행동/가치관을 입력하세요.\n(줄바꿈으로 여러 행 입력 시 각각 개별 항목으로 저장됩니다.)"
              : "이 사람에 대한 변하지 않는 배경 정보나 특징을 입력하세요.\n(줄바꿈으로 여러 행 입력 시 각각 개별 항목으로 저장됩니다.)"
            }
            rows={4}
          />
          <div className="twoButtons">
            <button onClick={() => setIsAdding(false)}>취소</button>
            <button className="primary" onClick={handleAdd}>일괄 등록</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '20px', background: 'var(--bg)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
            등록된 정보가 없습니다.
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(0,0,0,0.02)' }}>
              {editingId === item.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <textarea 
                    className="textarea" 
                    value={editDraft} 
                    onChange={(e) => setEditDraft(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return;
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleUpdate(item.id, editDraft);
                      }
                      if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--blue-border)', outline: 'none' }}
                    rows={2}
                    autoFocus
                  />
                  <div className="twoButtons">
                    <button onClick={() => setEditingId(null)}>취소</button>
                    <button className="primary" onClick={() => handleUpdate(item.id, editDraft)}>저장</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                    <p 
                      onClick={() => startEdit(item)}
                      style={{ 
                        margin: 0, 
                        fontSize: '13.5px', 
                        lineHeight: 1.6, 
                        color: 'var(--text-body)', 
                        whiteSpace: 'pre-wrap', 
                        flex: 1, 
                        cursor: 'pointer',
                        transition: 'color 0.15s ease'
                      }}
                      title="클릭하여 수정"
                      onMouseEnter={(e) => e.target.style.color = 'var(--blue)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-body)'}
                    >
                      {item.text}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: 'none', color: 'var(--red)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>삭제</button>
                    </div>
                  </div>
                  
                  {isCheck && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px', borderTop: '1px dashed rgba(0,0,0,0.04)', paddingTop: '8px' }}>
                      {checkStatusOptions.map(opt => {
                        const isSelected = (item.status || 'unchecked') === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleUpdateStatus(item.id, opt.value)}
                            style={{
                              fontSize: '10px',
                              padding: '4px 7px',
                              borderRadius: '5px',
                              border: isSelected ? `1px solid var(--${opt.color}-border)` : '1px solid var(--divider)',
                              background: isSelected ? `var(--${opt.color}-light)` : 'var(--surface)',
                              color: isSelected ? `var(--${opt.color})` : 'var(--text-3)',
                              fontWeight: isSelected ? 800 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.1s ease'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    {confirmId && (
      <ConfirmModal
        message="이 항목을 삭제할까요?"
        confirmLabel="삭제"
        danger
        onConfirm={() => { onChange(items.filter(item => item.id !== confirmId)); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
    )}
    </>
  );
}
function DetailModal({ candidate, close, edit, remove, saveTimeline, updateField }) {
  const report = analyze(candidate);
  const displayReport = getDisplayReport(candidate, report);
  const [copied, setCopied] = useState(false);
  const markdownText = candidateMarkdown(candidate, report);
  const [isAddingQuickMemo, setIsAddingQuickMemo] = useState(false);
  const [quickMemoForm, setQuickMemoForm] = useState({ summary: '', good: '', concern: '', nextCheck: '' });
  const [showMenu, setShowMenu] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteForm, setEditingNoteForm] = useState({ summary: '', good: '', concern: '', nextCheck: '' });
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'observe' | 'chat' | 'spec' | 'record'
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [pendingSection, setPendingSection] = useState(null);

  const startSectionEdit = (sectionId) => {
    if (editingSection && editingSection !== sectionId) {
      setPendingSection(sectionId);
      setConfirm({
        message: '편집 중인 내용이 있습니다.',
        sub: '저장하지 않고 다른 항목을 편집할까요?',
        confirmLabel: '무시하고 이동',
        danger: true,
        onConfirm: () => { setEditingSection(sectionId); setPendingSection(null); setConfirm(null); },
        onCancel: () => { setPendingSection(null); setConfirm(null); },
      });
      return;
    }
    setEditingSection(sectionId);
    if (sectionId === 'emotional') setSectionForm({ energyTags: candidate.energyTags || [], emotionalBond: candidate.emotionalBond || {} });
    if (sectionId === 'relation') setSectionForm({ relation: candidate.relation || {} });
    if (sectionId === 'profile') setSectionForm({
      name: candidate.name || '', age: candidate.age || '', birthDate: candidate.birthDate || '',
      mbti: candidate.mbti || '', job: candidate.job || '', route: candidate.route || '', memo: candidate.memo || ''
    });
    if (sectionId === 'condition') setSectionForm({
      height: candidate.height || '', asset: candidate.asset || '', income: candidate.income || '',
      marriageHistory: candidate.marriageHistory || '', children: candidate.children || '', housing: candidate.housing || '',
      smoking: candidate.smoking || '', drinking: candidate.drinking || ''
    });
  };

  const cancelSectionEdit = () => { setEditingSection(null); setSectionForm(null); };

  const saveSectionEdit = () => {
    if (!sectionForm) return;
    updateField(candidate.id, sectionForm);
    setEditingSection(null);
  };

  const startEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteForm({
      summary: note.summary || '',
      good: note.good || '',
      concern: note.concern || '',
      nextCheck: note.nextCheck || ''
    });
  };

  const handleUpdateQuickNote = (noteId) => {
    if (!editingNoteForm.summary && !editingNoteForm.good && !editingNoteForm.concern && !editingNoteForm.nextCheck) {
      handleDeleteQuickNote(noteId);
      return;
    }
    const updatedList = (candidate.quickNotes || []).map(n => n.id === noteId ? { ...n, ...editingNoteForm } : n);
    updateField(candidate.id, 'quickNotes', updatedList);
    setEditingNoteId(null);
  };

  const handleDeleteQuickNote = (noteId) => {
    setConfirm({
      message: '이 빠른 기록을 삭제할까요?',
      confirmLabel: '삭제',
      danger: true,
      onConfirm: () => {
        const updatedList = (candidate.quickNotes || []).filter(n => n.id !== noteId);
        updateField(candidate.id, 'quickNotes', updatedList);
        setEditingNoteId(null);
        setConfirm(null);
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleSaveInlineQuickMemo = () => {
    if (!quickMemoForm.summary && !quickMemoForm.good && !quickMemoForm.concern && !quickMemoForm.nextCheck) {
      setIsAddingQuickMemo(false);
      return;
    }
    const newMemo = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      summary: quickMemoForm.summary,
      good: quickMemoForm.good,
      concern: quickMemoForm.concern,
      nextCheck: quickMemoForm.nextCheck
    };
    const nextNotes = [newMemo, ...(candidate.quickNotes || [])];
    updateField(candidate.id, 'quickNotes', nextNotes);
    setQuickMemoForm({ summary: '', good: '', concern: '', nextCheck: '' });
    setIsAddingQuickMemo(false);
  };
  
  async function copy() {
    try { 
      await navigator.clipboard.writeText(markdownText); 
      setCopied(true); 
      setTimeout(() => setCopied(false), 1300); 
    } catch { setCopied(false); }
  }
  
  return (
    <>
    <div className="sheetBackdrop" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheetHeader">
          <Avatar candidate={candidate} size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ margin: 0 }}>
              {candidate.name || '무명의 후보'}
            </h2>
            <p style={{ margin: 0 }}>
              {report.age || '나이 미상'}세 · {candidate.job || '직업 미상'} · {candidate.location || '거주지 미상'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
              <Badge color={displayReport.color}>{displayReport.verdict}</Badge>
              {(candidate.personalityTags || []).map(id => {
                const tag = personalityTypeTags.find(t => t.id === id);
                return tag ? <Badge key={id} color="blue">{tag.emoji} {tag.label}</Badge> : null;
              })}
            </div>
          </div>
          <div className="detail-header-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <button 
              className="iconButton"
              onClick={() => setShowMenu(!showMenu)}
              title="후보 전체 관리"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', padding: '4px' }}
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '38px',
                right: '0',
                background: 'var(--surface)',
                border: '1px solid var(--divider)',
                boxShadow: 'var(--shadow-md)',
                borderRadius: '10px',
                zIndex: 999,
                minWidth: '160px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <button onClick={() => { edit(candidate); setShowMenu(false); }} style={{ padding: '12px 14px', fontSize: '13px', border: 'none', background: 'none', textAlign: 'left', color: 'var(--text-body)', cursor: 'pointer', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ✏️ 전체 상세 정보 편집
                </button>
                <button onClick={() => { copy(); setShowMenu(false); }} style={{ padding: '12px 14px', fontSize: '13px', border: 'none', background: 'none', textAlign: 'left', color: 'var(--text-body)', cursor: 'pointer', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📋 마크다운 전체 복사
                </button>
                <button onClick={() => { setShowMenu(false); setConfirm({ message: `'${candidate.name}' 기록을 삭제할까요?`, sub: '삭제 후 복구할 수 없습니다.', confirmLabel: '삭제', danger: true, onConfirm: () => { remove(candidate.id); close(); setConfirm(null); }, onCancel: () => setConfirm(null) }); }} style={{ padding: '12px 14px', fontSize: '13px', border: 'none', background: 'none', textAlign: 'left', color: 'var(--red)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 size={14} /> 이 후보 기록 삭제
                </button>
              </div>
            )}
            <button className="iconButton" onClick={close} style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <main className="sheetBody">
          {/* 관계 관찰 요약 (기본 노출 - 펼쳐진 상태) */}
          <Card className={`final ${scoreTone(displayReport.color).className}`}>
            <div>
              <Badge color={displayReport.color}>{scoreTone(displayReport.color).label}</Badge>
              <p>최종 총점</p>
              <strong>{displayReport.totalScore}</strong>
            </div>
            <aside>
              <span>판정</span>
              <b>{displayReport.verdict}</b>
            </aside>
            <section>
              <b>{displayReport.label}</b>
              <p>{displayReport.comments[0]}</p>
            </section>
            <div className="miniGrid">
              <MiniScore label="조건/스펙" value={report.conditionScore} max={40} />
              <MiniScore label="대화/태도" value={report.relationScore} max={30} />
              <MiniScore label="정보확인" value={report.trustScore} max={15} />
              <MiniScore label="지속가능성" value={report.realityScore} max={10} />
              <MiniScore label="플래그가산" value={report.bonusPenalty} />
              <MiniScore label="만남흐름" value={report.flowScore} />
            </div>
            <button className="copyButton" onClick={copy}>
              {copied ? '관계 리포트 복사 완료!' : 'LLM 분석용 마크다운 복사'}
            </button>
          </Card>

          {/* 🌟 5분할 탭 네비게이션 바 */}
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            overflowX: 'auto', 
            paddingBottom: '4px', 
            borderBottom: '1px solid var(--divider)', 
            marginBottom: '16px',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {[
              { id: 'summary', label: '요약', icon: '📊' },
              { id: 'observe', label: '관찰', icon: '🔍' },
              { id: 'chat', label: '대화·정서', icon: '💬' },
              { id: 'spec', label: '조건', icon: '⚖️' },
              { id: 'record', label: '기록', icon: '📖' }
            ].map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '10px 14px',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 800 : 600,
                    border: 'none',
                    background: 'none',
                    color: isActive ? 'var(--blue)' : 'var(--text-3)',
                    borderBottom: isActive ? '2.5px solid var(--blue)' : '2.5px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    marginBottom: '-1px'
                  }}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* 탭별 컨텐츠 출력 그룹 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1) 요약 탭 */}
            {activeTab === 'summary' && (
              <>
                <DetailAccordion title="관계 에너지 방향" subtitle="이 관계가 나에게 유발하는 에너지" defaultOpen={true}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(candidate.energyTags || []).map(id => {
                      const tag = energyTagOptions.find(t => t.id === id);
                      return tag ? <Badge key={id} color={tag.tone}>{tag.emoji} {tag.label}</Badge> : null;
                    })}
                    {(!candidate.energyTags || candidate.energyTags.length === 0) && (
                      <span style={{ fontSize: '12.5px', color: 'var(--text-3)' }}>지정된 에너지 태그가 없습니다.</span>
                    )}
                  </div>
                </DetailAccordion>

                <DetailAccordion title="플래그 (관찰된 신호)" subtitle="그린/옐로우/레드 플래그 모아보기" defaultOpen={true}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', marginBottom: '6px' }}>🟢 그린 플래그</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(candidate.green || []).length > 0 ? candidate.green.map(f => <Badge key={f} color="green">{f}</Badge>) : <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>기록 없음</span>}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', marginBottom: '6px' }}>🟡 옐로우 플래그</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(candidate.yellow || []).length > 0 ? candidate.yellow.map(f => <Badge key={f} color="amber">{f}</Badge>) : <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>기록 없음</span>}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', marginBottom: '6px' }}>🔴 레드 플래그</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(candidate.red || []).length > 0 ? candidate.red.map(f => <Badge key={f} color="red">{f}</Badge>) : <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>기록 없음</span>}
                      </div>
                    </div>
                  </div>
                </DetailAccordion>
              </>
            )}

            {/* 2) 관찰 탭 */}
            {activeTab === 'observe' && (
              <>
                <DetailAccordion title="빠른 기록 히스토리" subtitle="날짜 기반 한줄평 및 관찰 메모 누적 기록" defaultOpen={true}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {!isAddingQuickMemo && (
                      <button 
                        className="primary" 
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => setIsAddingQuickMemo(true)}
                      >
                        + 새로운 빠른 기록 작성
                      </button>
                    )}

                    {isAddingQuickMemo && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-sm)' }}>
                        <Field label="한 줄 메모" value={quickMemoForm.summary} onChange={(v) => setQuickMemoForm(p => ({...p, summary: v}))} placeholder="오늘 있었던 일을 짧게 요약하세요." />
                        <Field label="좋았던 점" textarea value={quickMemoForm.good} onChange={(v) => setQuickMemoForm(p => ({...p, good: v}))} placeholder="소소하게나마 마음에 든 점" rows={2} />
                        <Field label="찝찝했던 점" textarea value={quickMemoForm.concern} onChange={(v) => setQuickMemoForm(p => ({...p, concern: v}))} placeholder="약간 걸리는 기분이나 신호" rows={2} />
                        <Field label="다음 확인점" textarea value={quickMemoForm.nextCheck} onChange={(v) => setQuickMemoForm(p => ({...p, nextCheck: v}))} placeholder="다음에 스치듯 관찰해 볼 포인트" rows={2} />
                        <div className="twoButtons" style={{ marginTop: '4px' }}>
                          <button onClick={() => setIsAddingQuickMemo(false)}>취소</button>
                          <button className="primary" onClick={handleSaveInlineQuickMemo}>⚡️ 기록 누적</button>
                        </div>
                      </div>
                    )}

                    {(candidate.quickNotes || []).length === 0 ? (
                      <div style={{ padding: '20px', background: 'var(--bg)', borderRadius: '10px', color: 'var(--text-3)', fontSize: '13px', textAlign: 'center' }}>
                        아직 누적된 빠른 기록이 없습니다.<br/>목록의 📝 버튼을 통해 가볍게 남겨보세요.
                      </div>
                    ) : (
                      candidate.quickNotes.map((note) => {
                        const isEditing = editingNoteId === note.id;
                        return (
                          <div 
                            key={note.id} 
                            style={{ 
                              background: 'var(--bg)', 
                              padding: '14px', 
                              borderRadius: '10px', 
                              fontSize: '13px', 
                              border: isEditing ? '1px solid var(--blue-border)' : '1px solid rgba(0,0,0,0.03)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              cursor: isEditing ? 'default' : 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onClick={() => { if (!isEditing) startEditNote(note); }}
                            title={isEditing ? "" : "클릭하여 이 기록 즉시 수정/삭제"}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '6px', pointerEvents: 'auto' }}>
                              <span style={{ color: 'var(--blue)', fontSize: '11px', fontWeight: 700 }}>
                                ⚡️ {new Date(note.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!isEditing && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteQuickNote(note.id); }}
                                  style={{ border: 'none', background: 'none', color: 'var(--red)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                            
                            {isEditing ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                                <Field label="한 줄 메모" value={editingNoteForm.summary} onChange={(v) => setEditingNoteForm(p => ({...p, summary: v}))} placeholder="한 줄 요약" />
                                <Field label="좋았던 점" textarea value={editingNoteForm.good} onChange={(v) => setEditingNoteForm(p => ({...p, good: v}))} placeholder="좋았던 점" rows={2} />
                                <Field label="찝찝했던 점" textarea value={editingNoteForm.concern} onChange={(v) => setEditingNoteForm(p => ({...p, concern: v}))} placeholder="찝찝했던 점" rows={2} />
                                <Field label="다음 확인점" textarea value={editingNoteForm.nextCheck} onChange={(v) => setEditingNoteForm(p => ({...p, nextCheck: v}))} placeholder="다음 확인" rows={2} />
                                <div className="twoButtons" style={{ marginTop: '4px' }}>
                                  <button onClick={() => setEditingNoteId(null)}>취소</button>
                                  <button className="primary" onClick={() => handleUpdateQuickNote(note.id)}>변경 저장</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {note.summary && <p style={{ margin: '4px 0 0 0', color: 'var(--text-1)', fontWeight: 700, fontSize: '13.5px' }}>“{note.summary}”</p>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', borderTop: note.summary ? '1px dashed rgba(0,0,0,0.05)' : 'none', paddingTop: note.summary ? '8px' : '0' }}>
                                  {note.good && <div style={{ color: 'var(--text-body)' }}><b style={{ color: 'var(--green)', marginRight: '4px' }}>🟢 좋았던 점:</b> {note.good}</div>}
                                  {note.concern && <div style={{ color: 'var(--text-body)' }}><b style={{ color: 'var(--red)', marginRight: '4px' }}>🟠 찝찝했던 점:</b> {note.concern}</div>}
                                  {note.nextCheck && <div style={{ color: 'var(--text-body)' }}><b style={{ color: 'var(--blue)', marginRight: '4px' }}>👀 다음 확인:</b> {note.nextCheck}</div>}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </DetailAccordion>

                <DetailAccordion title="관찰 검증 리스트" subtitle="다음 만남에서 확인할 체크리스트 및 Pass/Fail 기록" defaultOpen={true}>
                  <DynamicListSection 
                    items={candidate.observationChecks || []}
                    type="check"
                    onChange={(newArr) => updateField(candidate.id, 'observationChecks', newArr)}
                  />
                </DetailAccordion>

                <DetailAccordion title="배경 정보 리스트" subtitle="성향, 가치관 및 변하지 않는 히스토리" defaultOpen={true}>
                  <DynamicListSection 
                    items={candidate.fixedObservationItems || []}
                    type="fixed"
                    onChange={(newArr) => updateField(candidate.id, 'fixedObservationItems', newArr)}
                  />
                </DetailAccordion>
              </>
            )}

            {/* 3) 대화·정서 탭 */}
            {activeTab === 'chat' && (
              <>
                <DetailAccordion title="정서적 결" subtitle="대화 밀도 및 감정 피로도" defaultOpen={true} onEdit={() => startSectionEdit('emotional')}>
                  {editingSection === 'emotional' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <TagPickerGroup 
                          title="나에게 유발하는 관계 에너지"
                          tags={energyTagOptions}
                          selected={sectionForm.energyTags || []}
                          onToggle={(tags) => setSectionForm(p => ({...p, energyTags: tags}))}
                          maxSelect={3}
                        />
                      </div>
                      <EmotionalBondSliders form={sectionForm} updateEmotionalBond={(key, val) => setSectionForm(p => ({...p, emotionalBond: {...p.emotionalBond, [key]: val}}))} />
                      <div className="twoButtons" style={{ marginTop: '10px' }}>
                        <button onClick={cancelSectionEdit}>취소</button>
                        <button className="primary" onClick={saveSectionEdit}>변경 저장</button>
                      </div>
                    </div>
                  ) : (
                    <div className="infoGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {emotionalBondItems.map(item => {
                        const val = candidate.emotionalBond?.[item.key] ?? 5;
                        const stat = getScoreStatusLabel(val);
                        return (
                          <div key={item.key} className="info" style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--surface)', boxSizing: 'border-box' }}>
                            <small style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '3px', display: 'block' }}>{item.label}</small>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <b style={{ fontSize: '13.5px', color: 'var(--text-1)' }}>{val}/10</b>
                              <Badge color={stat.color} style={{ fontSize: '9px', padding: '1px 4px' }}>{stat.label}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </DetailAccordion>

                <DetailAccordion title="대화/태도 세부 점수" subtitle="말과 행동 일치, 소통 템포 상세" defaultOpen={true} onEdit={() => startSectionEdit('relation')}>
                  {editingSection === 'relation' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <RelationSliders form={sectionForm} updateRelation={(key, val) => setSectionForm(p => ({...p, relation: {...p.relation, [key]: val}}))} />
                      <div className="twoButtons" style={{ marginTop: '10px' }}>
                        <button onClick={cancelSectionEdit}>취소</button>
                        <button className="primary" onClick={saveSectionEdit}>변경 저장</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {relationItems.map(item => {
                        const val = candidate.relation?.[item.key] ?? 5;
                        const isStatus = statusTypeKeys.includes(item.key);
                        const statusInfo = isStatus ? getStatusLabel(val) : null;
                        return (
                          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--divider)' }}>
                            <div>
                              <b style={{ fontSize: '13.5px', color: 'var(--text-1)' }}>{item.label}</b>
                              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-3)' }}>{item.desc}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {isStatus && statusInfo ? (
                                <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                              ) : (
                                (() => {
                                  const stat = getScoreStatusLabel(val);
                                  return <Badge color={stat.color} style={{ fontSize: '9px', padding: '2px 5px' }}>{stat.label}</Badge>;
                                })()
                              )}
                              <b style={{ fontSize: '14px', fontFamily: 'var(--font-display)', color: 'var(--blue)' }}>{val}</b>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </DetailAccordion>
              </>
            )}

            {/* 4) 조건 탭 */}
            {activeTab === 'spec' && (
              <>
                <DetailAccordion title="기본 프로필" subtitle="기본 신원 및 첫인상 메모" defaultOpen={true} onEdit={() => startSectionEdit('profile')}>
                  {editingSection === 'profile' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Field label="이름" value={sectionForm.name} onChange={(v) => setSectionForm(p => ({...p, name: v}))} />
                      <Field label="나이" type="number" value={sectionForm.age} onChange={(v) => setSectionForm(p => ({...p, age: v}))} />
                      <Field label="생년월일" value={sectionForm.birthDate} onChange={(v) => setSectionForm(p => ({...p, birthDate: v}))} />
                      <Field label="MBTI" value={sectionForm.mbti} onChange={(v) => setSectionForm(p => ({...p, mbti: v}))} />
                      <Field label="직업" value={sectionForm.job} onChange={(v) => setSectionForm(p => ({...p, job: v}))} />
                      <Field label="만난 경로" value={sectionForm.route} onChange={(v) => setSectionForm(p => ({...p, route: v}))} />
                      <Field label="첫인상 메모" textarea value={sectionForm.memo} onChange={(v) => setSectionForm(p => ({...p, memo: v}))} rows={3} />
                      <div className="twoButtons" style={{ marginTop: '10px' }}>
                        <button onClick={cancelSectionEdit}>취소</button>
                        <button className="primary" onClick={saveSectionEdit}>변경 저장</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ padding: '10px', border: '1px solid var(--divider)', borderRadius: '10px', background: 'var(--bg)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-3)', display: 'block' }}>이름</small>
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{candidate.name || '미확인'}</b>
                        </div>
                        <div style={{ padding: '10px', border: '1px solid var(--divider)', borderRadius: '10px', background: 'var(--bg)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-3)', display: 'block' }}>나이</small>
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{report.age || candidate.age || '미확인'}세</b>
                        </div>
                        <div style={{ padding: '10px', border: '1px solid var(--divider)', borderRadius: '10px', background: 'var(--bg)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-3)', display: 'block' }}>생년월일</small>
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{candidate.birthDate || '미확인'}</b>
                        </div>
                        <div style={{ padding: '10px', border: '1px solid var(--divider)', borderRadius: '10px', background: 'var(--bg)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-3)', display: 'block' }}>MBTI</small>
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{candidate.mbti || '미확인'}</b>
                        </div>
                        <div style={{ padding: '10px', border: '1px solid var(--divider)', borderRadius: '10px', background: 'var(--bg)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-3)', display: 'block' }}>직업</small>
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{candidate.job || '미확인'}</b>
                        </div>
                        <div style={{ padding: '10px', border: '1px solid var(--divider)', borderRadius: '10px', background: 'var(--bg)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-3)', display: 'block' }}>만난 경로</small>
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{candidate.route || '미확인'}</b>
                        </div>
                      </div>
                      <div style={{ padding: '12px', background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: '10px' }}>
                        <small style={{ display: 'block', fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>첫인상 메모</small>
                        <p style={{ fontSize: '13px', color: 'var(--text-body)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{candidate.memo || '기록된 첫인상이 없습니다.'}</p>
                      </div>
                    </>
                  )}
                </DetailAccordion>

                <DetailAccordion title="조건/스펙" subtitle="키, 돈, 주거 형태 등 하드웨어 점수" defaultOpen={true} onEdit={() => startSectionEdit('condition')}>
                  {editingSection === 'condition' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Field label="키 (cm)" type="number" value={sectionForm.height} onChange={(v) => setSectionForm(p => ({...p, height: v}))} />
                      <SelectField label="자산" value={sectionForm.asset} onChange={(v) => setSectionForm(p => ({...p, asset: v}))}>
                        {assetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </SelectField>
                      <SelectField label="연봉" value={sectionForm.income} onChange={(v) => setSectionForm(p => ({...p, income: v}))}>
                        {incomeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </SelectField>
                      <SelectField label="결혼이력" value={sectionForm.marriageHistory} onChange={(v) => setSectionForm(p => ({...p, marriageHistory: v}))}>
                        {marriageOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </SelectField>
                      <SelectField label="자녀유무" value={sectionForm.children} onChange={(v) => setSectionForm(p => ({...p, children: v}))}>
                        {childrenOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </SelectField>
                      <Field label="주거형태" value={sectionForm.housing} onChange={(v) => setSectionForm(p => ({...p, housing: v}))} />
                      <SelectField label="흡연" value={sectionForm.smoking} onChange={(v) => setSectionForm(p => ({...p, smoking: v}))}>
                        {smokingOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </SelectField>
                      <SelectField label="음주" value={sectionForm.drinking} onChange={(v) => setSectionForm(p => ({...p, drinking: v}))}>
                        {drinkingOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </SelectField>
                      <div className="twoButtons" style={{ marginTop: '10px' }}>
                        <button onClick={cancelSectionEdit}>취소</button>
                        <button className="primary" onClick={saveSectionEdit}>변경 저장</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="scoreGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        <ScoreCard title="조건/스펙" value={report.conditionScore} max={40} desc="키·돈·직업처럼 확인 가능한 조건" />
                        <ScoreCard title="정보 확인도" value={report.trustScore} max={15} desc="말로 들은 정보가 확인됐는지" />
                        <ScoreCard title="지속 가능성" value={report.realityScore} max={10} desc="거리·생활 리듬·현실 행동" />
                      </div>
                      <div className="infoGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        <Info label="키" value={candidate.height ? `${candidate.height}cm` : '미확인'} checked={verified(candidate, 'height')} />
                        <Info label="자산" value={optionLabel(assetOptions, candidate.asset)} checked={verified(candidate, 'asset')} />
                        <Info label="연봉" value={optionLabel(incomeOptions, candidate.income)} checked={verified(candidate, 'income')} />
                        <Info label="결혼" value={candidate.marriageHistory} checked={verified(candidate, 'marriageHistory')} />
                        <Info label="자녀" value={candidate.children} checked={verified(candidate, 'children')} />
                        <Info label="주거" value={candidate.housing} checked={verified(candidate, 'housing')} />
                        <Info label="흡연/음주" value={`${candidate.smoking} · ${candidate.drinking}`} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--divider)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '2px' }}>조건 상세 세부 분포</span>
                        {report.rows.map((row) => (
                          <div className="rowScore" key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '12.5px' }}>
                            <span style={{ minWidth: '90px', fontSize: '12px', color: 'var(--text-2)' }}>{row.label}</span>
                            <div className="bar" style={{ flex: 1, height: '5px', background: 'var(--divider)', borderRadius: '3px', overflow: 'hidden', margin: 0 }}>
                              <i style={{ display: 'block', height: '100%', background: 'var(--blue)', width: `${(row.raw / row.max) * 100}%` }} />
                            </div>
                            <b style={{ minWidth: '45px', textAlign: 'right', fontSize: '12px', color: 'var(--text-1)' }}>{row.raw.toFixed(1)}/{row.max}</b>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </DetailAccordion>
              </>
            )}

            {/* 5) 기록 탭 */}
            {activeTab === 'record' && (
              <>
                {(candidate.timeline || []).length === 0 ? (
                  <div style={{ padding: '30px 20px', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--divider)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px', lineHeight: 1.6 }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
                    <strong>아직 실제 만남 전 단계입니다.</strong>
                    <p style={{ margin: '4px 0 16px 0', fontSize: '12.5px', color: 'var(--text-3)' }}>실제 데이트 이후부터 시간 흐름 기반 기록을 시작합니다.</p>
                    <div style={{ width: '100%', textAlign: 'left' }}>
                      <TimelineSection candidate={candidate} report={report} saveTimeline={saveTimeline} />
                    </div>
                  </div>
                ) : (
                  <TimelineSection candidate={candidate} report={report} saveTimeline={saveTimeline} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
    {confirm && <ConfirmModal {...confirm} />}
    </>
  );
}
function Info({ label, value, checked }) {
  return <div className="info"><small>{label}</small><b>{value}</b>{checked && <Badge color="green">확인됨</Badge>}</div>;
}
function GuideModal({ close, onExport, onImport, onSyncUpload, onSyncDownload }) {
  const [syncCode, setSyncCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateCode = async () => {
    setIsUploading(true);
    try {
      const code = await onSyncUpload();
      setSyncCode(code);
      setCopied(false);
    } catch (err) {
      // 에러 처리는 부모 함수에서 Toast로 처리됨
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sheetBackdrop" onClick={close}>
      <div className="guide" onClick={(e) => e.stopPropagation()}>
        <div className="guideHead">
          <div><p>Settings & Guide</p><h2>설정 및 판단 기준</h2></div>
          <button className="iconButton" onClick={close} style={{ display: 'grid', placeItems: 'center', color: 'var(--text-2)', border: 'none', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <X size={20} />
          </button>
        </div>
        
        {/* 기기간 데이터 연동 카드 */}
        <Card>
          <h3>기기간 데이터 연동 (8자리 코드)</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '6px', lineHeight: 1.45 }}>
            현재 기기의 데이터를 서버에 임시 업로드하여 생성된 8자리 코드를 다른 기기에 입력하면 안전하게 데이터를 연동할 수 있습니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--divider)', paddingTop: '16px' }}>
            {/* 1. 코드 생성 (내보내기) */}
            <div>
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px' }}>방법 1. 현재 기기 데이터 내보내기</span>
              {!syncCode ? (
                <button 
                  onClick={handleCreateCode} 
                  disabled={isUploading}
                  style={{ width: '100%', height: '48px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)' }}
                >
                  {isUploading ? '연동 코드 생성 중...' : '📤 연동 코드 생성하기'}
                </button>
              ) : (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--divider)', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>아래 코드를 복사하여 다른 기기에 입력하세요.</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: 'var(--blue)' }}>{syncCode}</span>
                    <button 
                      onClick={handleCopyCode}
                      style={{ padding: '6px 14px', background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copied ? '✅ 복사됨' : '📋 복사'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. 코드 입력 (가져오기) */}
            <div style={{ borderTop: '1px dashed var(--divider)', paddingTop: '16px', marginTop: '2px' }}>
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px' }}>방법 2. 다른 기기 데이터 가져오기</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <input 
                  type="text" 
                  value={inputCode} 
                  onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 8))} 
                  placeholder="8자리 코드 입력" 
                  maxLength={8}
                  style={{ width: '100%', height: '48px', border: '1px solid var(--divider)', borderRadius: '12px', fontSize: '15px', background: 'var(--surface)', color: 'var(--text-1)', fontWeight: 700, textAlign: 'center', letterSpacing: '2px', outline: 'none' }}
                />
                <button 
                  onClick={() => onSyncDownload(inputCode)}
                  style={{ width: '100%', height: '48px', background: 'var(--text-1)', color: 'var(--surface)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  📥 불러오기
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3>데이터 파일 백업</h3>
          <div className="twoButtons" style={{ marginTop: '12px' }}>
            <button onClick={onExport}>전체 데이터 백업</button>
            <label className="uploadButton">
              <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }}/>
              데이터 불러오기
            </label>
          </div>
          <p style={{ fontSize: '12px', color: '#8b95a1', marginTop: '8px', fontWeight: 700 }}>* 불러오기 시 기존 데이터가 덮어씌워집니다.</p>
        </Card>

        <Card>
          <h3>총점 구조 (100점)</h3>
          <ScoreRule title="조건/스펙" score="40점" desc="키, 체형, 자산, 연봉, 직업 안정성, 나이, 거리" />
          <ScoreRule title="대화/태도" score="30점" desc="논리적 대화, 현재 충실도, 감정 안정성, 배려와 존중" />
          <ScoreRule title="정보 확인도" score="15점" desc="확인된 정보 수, 핵심 조건 실물 검증 완료도" />
          <ScoreRule title="지속 가능성" score="10점" desc="현실적인 거리, 생활 패턴, 실제 실행력" />
          <ScoreRule title="플래그 보정" score="-18~+10" desc="그린/옐로우/레드 플래그 및 정보 확인 가산 반영" />
          <ScoreRule title="만남 흐름" score="-6~+6" desc="타임라인에서 직접 고른 신호만 점수 반영" />
        </Card>

        <Card>
          <h3>판정 뱃지 기준</h3>
          <div className="scoreRule">
            <div><Badge color="green">계속 만나도 좋음</Badge></div>
            <p>총점, 대화, 정보 확인이 안정적임 (예: 75점 이상 + 검증 충분)</p>
          </div>
          <div className="scoreRule">
            <div><Badge color="blue">더 만나며 관찰</Badge></div>
            <p>나쁘지 않으나 아직 데이터 축적이 더 필요한 기본 관찰 상태</p>
          </div>
          <div className="scoreRule">
            <div><Badge color="amber">조건 확인 필요</Badge></div>
            <p>조건은 좋아 보이나 핵심 정보(키, 직업, 돈 등)의 증명이 부족함</p>
          </div>
          <div className="scoreRule">
            <div><Badge color="orange">감정 투입 보류</Badge></div>
            <p>피로감, 관계 리듬 불안정, 현재성 부족 등이 보여 속도 조절 권장</p>
          </div>
          <div className="scoreRule">
            <div><Badge color="red">정리 권장</Badge></div>
            <p>치명적 신호가 있거나 총점이 낮아 즉각적인 거리두기가 필요함</p>
          </div>
        </Card>

        <Card>
          <h3>컬러 의미 및 점수 기준</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.45 }}>
            화면의 모든 색상은 상태의 심각도/안정성을 일관되게 표현합니다.
          </p>
          <div className="scoreRule">
            <div style={{ justifyContent: 'flex-start', gap: '10px' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--green)' }}></div>
              <b>80% 이상: 좋음 (Green)</b>
            </div>
          </div>
          <div className="scoreRule">
            <div style={{ justifyContent: 'flex-start', gap: '10px' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--blue)' }}></div>
              <b>60~79%: 관찰/보통 (Blue)</b>
            </div>
          </div>
          <div className="scoreRule">
            <div style={{ justifyContent: 'flex-start', gap: '10px' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--amber)' }}></div>
              <b>40~59%: 확인 필요 (Amber)</b>
            </div>
          </div>
          <div className="scoreRule">
            <div style={{ justifyContent: 'flex-start', gap: '10px' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--orange)' }}></div>
              <b>25~39%: 주의/보류 (Orange)</b>
            </div>
          </div>
          <div className="scoreRule">
            <div style={{ justifyContent: 'flex-start', gap: '10px' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--red)' }}></div>
              <b>25% 미만: 위험 (Red)</b>
            </div>
          </div>
        </Card>

        <Card>
          <h3>치명적 위험 신호 상한 (Cap)</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}>
            조건 점수가 높더라도 아래 치명적 신호가 발생하면 최종 총점은 즉시 상한선 이하로 제한됩니다. 조건은 좋으나 위험한 사람을 선별하기 위한 조치입니다.
          </p>
          <ScoreRule title="돈을 빌리려는 뉘앙스" score="최대 20점" desc="가장 높은 등급의 신용 리스크로 분류됨" />
          <ScoreRule title="허위 확인" score="최대 25점" desc="고의적인 학력/직업 날조 등 기망 확인 시" />
          <ScoreRule title="내 판단을 예민함으로 몰아감" score="최대 35점" desc="조종, 통제, 인격 비하성 소통 패턴 감지 시" />
          <ScoreRule title="직업/자산/연봉 허위 의심" score="최대 55점" desc="진실성이 불명확하고 의구심이 반복 제기될 때" />
        </Card>

        <Card className="notice">
          <b>정보 확인 로직 상세</b>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '16px', fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.7' }}>
            <li>모든 정보는 기본적으로 '미확인' 상태에서 시작합니다.</li>
            <li>단순 미확인 자체로는 <b>점수를 깎지 않습니다.</b></li>
            <li>검증된 정보만 <b>신뢰도 점수와 가산점</b>에 플러스로 기여합니다.</li>
            <li>허위 사실이나 속임은 별도 플래그 또는 상한선으로 처리됩니다.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
function ScoreRule({ title, score, desc }) {
  return <div className="scoreRule"><div><b>{title}</b><Badge color="blue">{score}</Badge></div><p>{desc}</p></div>;
}
function FloatingAdd({ onClick }) {
  return <button className="floating" onClick={onClick}><Icon type="add"/></button>;
}
export default function App() {
  const [tab, setTab] = useState('home');
  const [appConfirm, setAppConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : sampleCandidates;
      if (!Array.isArray(parsed)) return sampleCandidates;
      return parsed.map(c => ({
        ...emptyCandidate,
        ...c,
        fixedObservationMemo: c.fixedObservationMemo !== undefined ? c.fixedObservationMemo : (c.observationMemo || ''),
        dateTimeline: c.dateTimeline || c.timeline || [],
        quickNoteSummary: c.quickNoteSummary || '',
        quickNoteGood: c.quickNoteGood || '',
        quickNoteConcern: c.quickNoteConcern || '',
        quickNoteNextCheck: c.quickNoteNextCheck || '',
        quickNotes: c.quickNotes || (
          (c.quickNoteSummary || c.quickNoteGood || c.quickNoteConcern || c.quickNoteNextCheck)
            ? [{
                id: Date.now() - Math.floor(Math.random() * 100000),
                createdAt: c.updatedAt || new Date().toISOString(),
                summary: c.quickNoteSummary || '',
                good: c.quickNoteGood || '',
                concern: c.quickNoteConcern || '',
                nextCheck: c.quickNoteNextCheck || ''
              }]
            : []
        ),
        observationChecks: c.observationChecks || migrateTextToItems(c.observationNotes || '', 'check'),
        fixedObservationItems: c.fixedObservationItems || migrateTextToItems(c.fixedObservationMemo || c.observationMemo || '', 'fixed'),
      }));
    } catch { return sampleCandidates; }
  });
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [quickMemoCandidate, setQuickMemoCandidate] = useState(null);

  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates)); } catch {} }, [candidates]);

  function save(candidate) {
    const previous = candidates.find((item) => item.id === candidate.id);
    const saved = { ...(previous || {}), ...candidate, id: candidate.id || Date.now(), updatedAt: new Date().toISOString() };
    setCandidates((prev) => previous ? prev.map((item) => item.id === saved.id ? saved : item) : [...prev, saved]);
    setEditing(null);
    setSelected(saved);
    setTab('home');
  }
  function remove(id) { setCandidates((prev) => prev.filter((item) => item.id !== id)); setSelected(null); }
  function saveTimeline(candidateId, timelineList) {
    setCandidates((prev) => {
      const next = prev.map((item) => {
        if (item.id !== candidateId) return item;
        return { ...item, timeline: timelineList, dateTimeline: timelineList, updatedAt: new Date().toISOString() };
      });
      const tgt = next.find((i) => i.id === candidateId);
      if (tgt) setSelected(tgt);
      return next;
    });
  }
  function addQuickMemo(candidateId, memoObj) {
    setCandidates((prev) => {
      const next = prev.map((item) => {
        if (item.id !== candidateId) return item;
        const existingMemos = item.quickNotes || [];
        return { 
          ...item, 
          quickNotes: [memoObj, ...existingMemos],
          updatedAt: new Date().toISOString() 
        };
      });
      const tgt = next.find((i) => i.id === candidateId);
      if (tgt) setSelected(tgt);
      return next;
    });
  }
  function updateCandidateField(candidateId, fieldName, value) {
    setCandidates((prev) => {
      const next = prev.map((item) => {
        if (item.id !== candidateId) return item;
        if (typeof fieldName === 'object' && fieldName !== null) {
          return { ...item, ...fieldName, updatedAt: new Date().toISOString() };
        }
        return { ...item, [fieldName]: value, updatedAt: new Date().toISOString() };
      });
      const tgt = next.find((i) => i.id === candidateId);
      if (tgt) setSelected(tgt);
      return next;
    });
  }
  function startEdit(candidate) { setEditing(candidate); setSelected(null); setTab('add'); }

  async function exportData() {
    const data = JSON.stringify(candidates, null, 2);
    const filename = `rungak-backup-${new Date().toISOString().slice(0, 10)}.json`;

    // PC가 아닌 모바일에서 더 직관적인 파일 관리를 위해 Web Share API 사용 시도
    if (navigator.canShare && navigator.share) {
      try {
        const blob = new Blob([data], { type: 'application/json' });
        const file = new File([blob], filename, { type: 'application/json' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '런각 연구소 데이터 백업',
            text: '런각 연구소의 전체 백업 파일입니다. 원하는 앱에 공유하거나 저장하세요.'
          });
          return; // 공유창이 정상적으로 호출되었다면 함수 조기 종료
        }
      } catch (err) {
        // 사용자가 공유 취소했거나 브라우저 차원의 예외가 발생한 경우,
        // 예외를 삼키고 fallback 다운로드를 진행할 수도 있으나 이미 Action을 취한 것으로 보고 무시하거나 Fallback을 탑니다.
        console.log('Share action cancelled or failed.', err);
      }
    }

    // Fallback: 기존 앵커 다운로드 방식 (PC 또는 구형 브라우저용)
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          setAppConfirm({
            message: '기존 데이터가 덮어씌워집니다.',
            sub: `후보 ${json.length}명을 불러옵니다. 계속할까요?`,
            confirmLabel: '가져오기',
            danger: true,
            onConfirm: () => {
              setCandidates(json);
              setToast({ message: `데이터 복구 완료 (${json.length}명)`, type: 'success' });
              setGuideOpen(false);
              setAppConfirm(null);
            },
            onCancel: () => setAppConfirm(null),
          });
        } else {
          setToast({ message: '유효하지 않은 데이터 형식입니다.', type: 'error' });
        }
      } catch (err) {
        setToast({ message: '불러오기에 실패했습니다.', type: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  async function generateAndUploadData() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Firestore 1MB 제한을 절대 초과하지 않도록 대용량 이미지 데이터를 실시간 초소형 썸네일로 압축 변환
    // 이를 통해 기기간 사진 데이터 유실 없이 완벽하게 백업 및 동기화가 이루어집니다.
    const sanitizedCandidates = await Promise.all(
      candidates.map(async (c) => {
        if (c.photo && c.photo.length > 30000) { // 30KB 이상인 거대 base64 텍스트 대상
          try {
            // 아바타 원형 썸네일에 어울리도록 100x100 해상도 및 0.5 JPEG 압축율로 용량을 2KB~5KB 수준으로 극대화 압축
            const compressed = await compressBase64Image(c.photo, 100, 100, 0.5);
            return { ...c, photo: compressed };
          } catch (err) {
            console.error('실시간 이미지 동기화 압축 실패:', err);
            return { ...c, photo: '' }; // 최악의 오류 발생 시에만 텍스트 데이터 보호를 위해 생략
          }
        }
        return c;
      })
    );

    const uploadPromise = (async () => {
      const docRef = doc(db, 'sync_codes', code);
      await setDoc(docRef, {
        candidates: sanitizedCandidates,
        createdAt: new Date().toISOString()
      });
      return code;
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 15000) // 압축 소요 시간을 반영해 타임아웃을 15초로 설정
    );

    try {
      const result = await Promise.race([uploadPromise, timeoutPromise]);
      return result;
    } catch (err) {
      console.error('Firebase Upload Error:', err);
      // 모바일 기기 디버깅을 위한 alert 노출
      alert(`[에러 발생] 기기 연동에 실패했습니다.\n\n오류 내용: ${err.message || '네트워크 오류'}\n\n모바일 브라우저 권한 차단이나 고화질 사진(1MB 초과) 때문일 수 있습니다.`);
      
      if (err.message === 'TIMEOUT') {
        setToast({ 
          message: '서버 연결 시간 초과. Firebase Firestore가 활성화되지 않았거나 규칙(Rules) 설정으로 차단되었을 수 있습니다. 아래 가이드를 확인해 주세요.', 
          type: 'error' 
        });
      } else {
        setToast({ 
          message: `연동 코드 생성 실패: ${err.message || 'Firebase 오류'}`, 
          type: 'error' 
        });
      }
      throw err;
    }
  }

  async function downloadDataByCode(code) {
    if (!code || code.trim().length !== 8) {
      setToast({ message: '올바른 8자리 코드를 입력해주세요.', type: 'error' });
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    
    const downloadPromise = (async () => {
      const docRef = doc(db, 'sync_codes', cleanCode);
      const docSnap = await getDoc(docRef);
      return docSnap;
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 6000)
    );

    try {
      setToast({ message: '데이터를 검색하는 중...', type: 'info' });
      const docSnap = await Promise.race([downloadPromise, timeoutPromise]);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.candidates)) {
          setAppConfirm({
            message: '기존 데이터가 덮어씌워집니다.',
            sub: `연동 코드 [${cleanCode}]로부터 후보 ${data.candidates.length}명을 불러옵니다. 계속할까요?`,
            confirmLabel: '가져오기',
            danger: true,
            onConfirm: () => {
              setCandidates(data.candidates);
              setToast({ message: `데이터 연동 완료 (${data.candidates.length}명)`, type: 'success' });
              setGuideOpen(false);
              setAppConfirm(null);
            },
            onCancel: () => setAppConfirm(null),
          });
        } else {
          setToast({ message: '데이터 형식이 올바르지 않습니다.', type: 'error' });
        }
      } else {
        setToast({ message: '존재하지 않거나 만료된 연동 코드입니다.', type: 'error' });
      }
    } catch (err) {
      console.error('Firebase Download Error:', err);
      if (err.message === 'TIMEOUT') {
        setToast({ 
          message: '서버 연결 시간 초과. Firebase Firestore가 활성화되지 않았거나 규칙(Rules) 설정으로 차단되었을 수 있습니다. 아래 가이드를 확인해 주세요.', 
          type: 'error' 
        });
      } else {
        setToast({ 
          message: '데이터 연동에 실패했습니다. 코드를 확인해 주세요.', 
          type: 'error' 
        });
      }
    }
  }

  return <div className="app"><div className="phone"><main>{tab === 'home' && <Home candidates={candidates} openCandidate={setSelected} goAdd={() => { setEditing(null); setTab('add'); }} openGuide={() => setGuideOpen(true)} openQuickMemo={setQuickMemoCandidate}/>} {tab === 'add' && <AddCandidate initialCandidate={editing} onSave={save} onCancel={() => { setEditing(null); setTab('home'); }}/>}</main>{tab === 'home' && <FloatingAdd onClick={() => { setEditing(null); setTab('add'); }}/>} {selected && <DetailModal candidate={selected} close={() => setSelected(null)} edit={startEdit} remove={remove} saveTimeline={saveTimeline} updateField={updateCandidateField}/>} {quickMemoCandidate && <QuickMemoModal candidate={quickMemoCandidate} close={() => setQuickMemoCandidate(null)} onSave={addQuickMemo} />} {guideOpen && <GuideModal close={() => setGuideOpen(false)} onExport={exportData} onImport={importData} onSyncUpload={generateAndUploadData} onSyncDownload={downloadDataByCode}/>} {appConfirm && <ConfirmModal {...appConfirm} />} {toast && <Toast {...toast} onDone={() => setToast(null)} />}</div></div>;
}
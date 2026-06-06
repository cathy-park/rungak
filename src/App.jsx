import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, X, Pencil, Trash2, Clipboard, ChevronDown, ChevronUp, Plus, StickyNote } from 'lucide-react';
import './App.css';
import { db, doc, setDoc, getDoc, onSnapshot } from './firebase';

const STORAGE_KEY = 'rungak_lab_vite_v1';
const SYNC_CODE_KEY = 'rungak_sync_code_v1';
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

import {
  assetOptions, incomeOptions, bodyOptions, bodyFitOptions, marriageOptions, childrenOptions,
  housingOptions, carOptions, smokingOptions, drinkingOptions, religionOptions, goalOptions,
  timelineTypeOptions, feelingOptions, checkStatusOptions, signalOptions, personalityTypeTags,
  energyTagOptions, emotionalBondItems, observationPointPool, greenFlags, yellowFlags, redFlags,
  relationItems, statusTypeKeys, statusLabels, getStatusLabel, coreRelationKeys, coreRelationItems,
  moreRelationItems, verifiedKeys, defaultRelation, defaultEmotionalBond, emptyCandidate, sampleCandidates
} from './utils/scoring/scoreOptions';
import { STATUS_THEMES, STATUS_COPY, VERDICT_EMOJI, getStatusTheme, getStatusCopy, generateHeroCopy } from './utils/scoring/verdictRules';
import { clamp, signalByCode, timelineScore, suggestedSignals } from './utils/scoring/timelineScore';
import { optionScore, optionLabel, calcAge, heightScore, ageScore, verified, recommendJobStability, analyze } from './utils/scoring/analyzeCandidate';

import { getDaysAgo, compressBase64Image, migrateTextToItems, todayValue, bulletLines, getDisplayReport, generateHeroSummary, normalizeCandidate, rankCandidates, scoreTone, scoreLevel, optLabel, createForm, candidateMarkdown, getScoreStatusLabel, getReverseScoreStatusLabel } from './utils/helpers';
import { Chevron, DetailAccordion, Avatar, Badge, Card, Field, SelectField, BulletTextarea, Toggle, VerifiedInput, Icon, ConfirmModal, Toast, Header, MiniScore, ScoreCard, ScoreRule, FloatingAdd } from './components/ui/CommonUI';
import { Home } from './components/domain/Home';
import { StepTitle, CharacterPicker, ProfileFields, CoreConditions, LifeInfo, RelationSliders, EmotionalBondSliders, TagPickerGroup, PersonalityTagPicker, ObservationSection, FlagGroup, AddCandidate } from './components/domain/CandidateForm';
import { TimelineSection } from './components/domain/TimelineSection';
import { EditableMemoSection, QuickMemoModal, DynamicListSection, PopoverMenu, DetailModal } from './components/domain/DetailModal';
import { Info, GuideModal } from './components/domain/GuideModal';
import { CompareModal } from './components/domain/CompareModal';

export default function App() {
  const [tab, setTab] = useState('home');
  const [appConfirm, setAppConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [comparingCandidates, setComparingCandidates] = useState(null);

  // 파비콘 및 웹 탭바 아이콘을 8px 곡률로 정교하게 동적 깎아주는 효과
  useEffect(() => {
    const img = new Image();
    img.src = '/ico.png';
    img.crossOrigin = 'anonymous'; // CORS 문제 선제적 방지
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 128;
      canvas.height = img.height || 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const radius = size * 0.22; // 32px 크기 기준 8px 곡률(0.25비율)에 근접하는 골든 레이아웃 비율

      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 0, 0, size, size);

      try {
        const roundedDataUrl = canvas.toDataURL('image/png');
        
        // 1. 일반 웹 브라우저 탭용 favicon 갱신
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'shortcut icon';
        link.href = roundedDataUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      } catch (err) {
        console.warn('동적 파비콘 곡률 렌더링 우회 처리 실패 (CORS 또는 로컬 정책):', err);
      }
    };
  }, []);
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

  const [activeSyncCode, setActiveSyncCode] = useState(() => localStorage.getItem(SYNC_CODE_KEY) || null);
  const lastSyncedJsonRef = useRef(null); // null = 아직 초기화 전 (첫 렌더 시 자동업로드 방지)
  const uploadTimerRef = useRef(null);

  // 연동 코드 localStorage 유지
  useEffect(() => {
    if (activeSyncCode) localStorage.setItem(SYNC_CODE_KEY, activeSyncCode);
    else localStorage.removeItem(SYNC_CODE_KEY);
  }, [activeSyncCode]);

  // 후보 데이터 변경 시 자동 업로드 (2초 디바운스)
  // [버그 수정] lastSyncedJsonRef를 sanitized 데이터 기준으로 비교하고,
  // isSyncingFromLocalRef 3초 블로킹을 제거하여 원격 변경 수신을 차단하지 않도록 함
  useEffect(() => {
    if (!activeSyncCode) return;
    const currentJson = JSON.stringify(candidates);
    if (lastSyncedJsonRef.current === null) { lastSyncedJsonRef.current = currentJson; return; } // 앱 최초 로드 시 업로드 생략
    if (currentJson === lastSyncedJsonRef.current) return; // 원격 수신 데이터와 동일하면 재업로드 생략
    clearTimeout(uploadTimerRef.current);
    uploadTimerRef.current = setTimeout(async () => {
      try {
        const sanitized = await Promise.all(candidates.map(async (c) => {
          if (c.photo && c.photo.length > 30000) {
            try { return { ...c, photo: await compressBase64Image(c.photo, 100, 100, 0.5) }; }
            catch { return { ...c, photo: '' }; }
          }
          return c;
        }));
        const sanitizedJson = JSON.stringify(sanitized);
        // 업로드 직전에 ref를 sanitized 기준으로 설정하여
        // onSnapshot이 자기 데이터를 수신해도 중복 반영하지 않음
        lastSyncedJsonRef.current = sanitizedJson;
        await setDoc(doc(db, 'sync_codes', activeSyncCode), { candidates: sanitized, updatedAt: Date.now() });
      } catch (e) { console.error('Auto-sync upload failed:', e); }
    }, 2000);
    return () => clearTimeout(uploadTimerRef.current);
  }, [candidates, activeSyncCode]);

  // 실시간 수신 리스너
  // [버그 수정] isSyncingFromLocalRef 체크 제거 — lastSyncedJsonRef 비교만으로
  // 자기 데이터 중복 반영을 방지하고, 원격 변경은 즉시 수신하도록 수정
  useEffect(() => {
    if (!activeSyncCode) return;
    const unsub = onSnapshot(doc(db, 'sync_codes', activeSyncCode), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (!data?.candidates || !Array.isArray(data.candidates)) return;
      const remoteJson = JSON.stringify(data.candidates);
      if (remoteJson === lastSyncedJsonRef.current) return; // 자기 업로드 데이터 or 동일 데이터 무시
      lastSyncedJsonRef.current = remoteJson;
      setCandidates(data.candidates);
    }, (err) => console.error('Sync listener error:', err));
    return () => unsub();
  }, [activeSyncCode]);

  const viewModel = useMemo(() => {
    const analyzed = candidates.map(normalizeCandidate);
    const ranked = rankCandidates(analyzed);

    return {
      rankedCandidates: ranked,
      heroCandidates: ranked,
      topCandidate: ranked[0]
    };
  }, [candidates]);

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
      lastSyncedJsonRef.current = JSON.stringify(sanitizedCandidates); // 방금 업로드한 데이터를 기준으로 설정
      setActiveSyncCode(result); // 실시간 동기화 활성화
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
              lastSyncedJsonRef.current = JSON.stringify(data.candidates);
              setCandidates(data.candidates);
              setActiveSyncCode(cleanCode); // 실시간 동기화 활성화
              setToast({ message: `데이터 연동 완료 (${data.candidates.length}명) — 이제 실시간 동기화됩니다.`, type: 'success' });
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

  function disconnectSync() {
    setActiveSyncCode(null);
    lastSyncedJsonRef.current = null;
    setToast({ message: '실시간 동기화가 해제되었습니다.', type: 'info' });
  }

  return <div className="app"><div className="phone"><main>{tab === 'home' && <Home candidates={viewModel.rankedCandidates} openCandidate={setSelected} goAdd={() => { setEditing(null); setTab('add'); }} openGuide={() => setGuideOpen(true)} openQuickMemo={setQuickMemoCandidate} toggleFriendStamp={(candidate) => updateCandidateField(candidate.id, 'friendStamp', !candidate.friendStamp)} openCompare={setComparingCandidates}/>} {tab === 'add' && <AddCandidate initialCandidate={editing} onSave={save} onCancel={() => { setEditing(null); setTab('home'); }}/>}</main>{tab === 'home' && <FloatingAdd onClick={() => { setEditing(null); setTab('add'); }}/>} {selected && <DetailModal candidate={selected} close={() => setSelected(null)} edit={startEdit} remove={remove} saveTimeline={saveTimeline} updateField={updateCandidateField}/>} {quickMemoCandidate && <QuickMemoModal candidate={quickMemoCandidate} close={() => setQuickMemoCandidate(null)} onSave={addQuickMemo} />} {comparingCandidates && <CompareModal candidates={comparingCandidates} close={() => setComparingCandidates(null)} />} {guideOpen && <GuideModal close={() => setGuideOpen(false)} onExport={exportData} onImport={importData} onSyncUpload={generateAndUploadData} onSyncDownload={downloadDataByCode} activeSyncCode={activeSyncCode} onDisconnectSync={disconnectSync}/>} {appConfirm && <ConfirmModal {...appConfirm} />} {toast && <Toast {...toast} onDone={() => setToast(null)} />}</div></div>;
}
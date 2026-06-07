import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, MoreVertical, Trash2 } from 'lucide-react';
import { 
  checkStatusOptions, signalOptions, personalityTypeTags, energyTagOptions, 
  emotionalBondItems, relationItems, greenFlags, yellowFlags, redFlags,
  statusTypeKeys, getStatusLabel, assetOptions, incomeOptions, smokingOptions, drinkingOptions
} from '../../utils/scoring/scoreOptions';
import { 
  getDaysAgo, migrateTextToItems, bulletLines, getDisplayReport, generateHeroSummary,
  scoreTone, scoreLevel, candidateMarkdown, optLabel, getScoreStatusLabel, getReverseScoreStatusLabel,
  normalizeCandidate
} from '../../utils/helpers';
import { analyze, recommendJobStability, verified, optionLabel } from '../../utils/scoring/analyzeCandidate';
import { VERDICT_EMOJI } from '../../utils/scoring/verdictRules';
import { Chevron, Avatar, Badge, Card, Field, SelectField, BulletTextarea, Toggle, Icon, ConfirmModal, Toast, MiniScore, ScoreCard, DetailAccordion } from '../ui/CommonUI';
import { Info } from './GuideModal';
import { TimelineSection } from './TimelineSection';
import { TagPickerGroup, EmotionalBondSliders, RelationSliders, ObservationSection, PersonalityTagPicker, FlagGroup } from './CandidateForm';

function VerifyToggle({ verifiedObj, fieldKey, onChange }) {
  const isVerified = verifiedObj?.[fieldKey];
  return (
    <button 
      type="button"
      className={`verify ${isVerified ? 'on' : ''}`}
      style={{
        borderRadius: '980px',
        background: isVerified ? 'var(--green-light)' : 'var(--surface)',
        color: isVerified ? 'var(--green)' : 'var(--text-2)',
        border: '1px solid var(--divider)',
        padding: '7px 12px',
        fontSize: '11px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        alignSelf: 'flex-end',
        marginBottom: '4px'
      }}
      onClick={() => onChange(fieldKey, !isVerified)}
    >
      {isVerified ? '인증됨' : '미인증'}
    </button>
  );
}

export function EditableMemoSection({ value, onSave, placeholder }) {
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
export function QuickMemoModal({ candidate, close, onSave }) {
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
export function DynamicListSection({ items = [], type, onChange }) {
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
/* 더보기 드롭다운 — document.body에 portal로 렌더링하여 stacking context 탈출 */
export function PopoverMenu({ triggerRef, open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (triggerRef.current?.contains(e.target)) return; // 트리거 버튼 클릭은 toggle에 맡김
      onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, triggerRef, onClose]);

  if (!open || !triggerRef.current) return null;
  const r = triggerRef.current.getBoundingClientRect();

  return createPortal(
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: r.bottom + 6,
        right: window.innerWidth - r.right,
        zIndex: 9999,
        minWidth: '180px',
        background: 'var(--surface)',
        border: '1px solid var(--divider)',
        borderRadius: '12px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function DetailModal({ candidate, close, edit, remove, saveTimeline, updateField }) {
  const displayReport = normalizeCandidate(candidate);
  const report = analyze(candidate); // 상세 탭 개별 지표 렌더링용 보존
  const [copied, setCopied] = useState(false);
  const markdownText = candidateMarkdown(candidate, report);
  const [isAddingQuickMemo, setIsAddingQuickMemo] = useState(false);
  const [quickMemoForm, setQuickMemoForm] = useState({ summary: '', good: '', concern: '', nextCheck: '' });
  const [showMenu, setShowMenu] = useState(false);
  const expandedMoreRef = useRef(null);  // expanded 헤더 ⋯ 버튼
  const compactMoreRef  = useRef(null);  // compact 헤더 ⋯ 버튼
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteForm, setEditingNoteForm] = useState({ summary: '', good: '', concern: '', nextCheck: '' });
  const [activeTab, setActiveTab] = useState('summary');
  const [showAllSignals, setShowAllSignals] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [pendingSection, setPendingSection] = useState(null);

  const sheetRef = React.useRef(null);
  const [showCompactHeader, setShowCompactHeader] = useState(false);
  const activeMoreRef = showCompactHeader ? compactMoreRef : expandedMoreRef;

  const currentTimeline = candidate.dateTimeline || candidate.timeline || [];
  const signalCounts = {};
  currentTimeline.forEach(event => {
    if (event.signals && Array.isArray(event.signals)) {
      event.signals.forEach(code => {
        signalCounts[code] = (signalCounts[code] || 0) + 1;
      });
    }
  });

  const sortedSignals = Object.entries(signalCounts)
    .filter(([code, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => {
      const option = signalOptions.find(opt => opt.code === code);
      return { code, count, label: option?.label || code, tone: option?.tone || 'gray' };
    });

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowCompactHeader(scrollTop > 120);
    setShowMenu(false); // 스크롤로 헤더 전환 시 메뉴 닫기
  };

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
      mbti: candidate.mbti || '', job: candidate.job || '', location: candidate.location || '', memo: candidate.memo || '',
      jobStability: candidate.jobStability || 3,
      verified: candidate.verified || {}
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
      <div 
        className="sheet" 
        ref={sheetRef}
        onScroll={handleScroll}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', overflowY: 'auto', height: '92vh' }}
      >
        {/* ── Compact Sticky Header ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: showCompactHeader ? 'grid' : 'none',
          gridTemplateColumns: '40px 1fr auto',
          columnGap: '10px',
          alignItems: 'center',
          padding: '0 16px',
          height: '64px',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--divider)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          {/* 아바타 — overflow:hidden으로 이미지가 탭 영역 침범 방지 */}
          <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
            <Avatar candidate={candidate} size="sm" />
          </div>
          {/* 이름 · 점수 · 상태뱃지만 (성향뱃지 숨김) */}
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
              {candidate.name || '무명의 후보'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: `var(--${displayReport.color})`, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {displayReport.finalScore}점
            </span>
            <span className={`badge tone-${displayReport.color}`} style={{ fontSize: '10px', padding: '1px 6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {displayReport.verdict}
            </span>
          </div>
          {/* 액션 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button ref={compactMoreRef} className="iconButton" onClick={() => setShowMenu(v => !v)} style={{ width: '36px', height: '36px' }}>
              <MoreVertical size={18} />
            </button>
            <button className="iconButton" onClick={close} style={{ width: '36px', height: '36px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Expanded Profile Header ── */}
        <div style={{
          position: 'relative',          /* 액션 버튼 absolute 기준점 */
          display: 'grid',
          gridTemplateColumns: '84px minmax(0, 1fr)',   /* 2열 — 버튼은 column 차지 안 함 */
          columnGap: '12px',
          alignItems: 'start',
          padding: '18px 16px 16px',
          background: 'var(--bg)',
          overflow: 'visible'
        }}>
          {/* 액션 버튼 — absolute로 공간 점유 없이 우상단 고정 */}
          <div style={{ position: 'absolute', top: '14px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 3 }}>
            <button ref={expandedMoreRef} className="iconButton" onClick={() => setShowMenu(v => !v)} title="후보 전체 관리" style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
              <MoreVertical size={20} />
            </button>
            <button className="iconButton" onClick={close} style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>

          {/* Col 1: 프로필 사진 */}
          <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <Avatar candidate={candidate} size="xl" />
          </div>

          {/* Col 2: 정보 3줄 — 버튼 아래 공간까지 전폭 사용 */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '2px', overflow: 'visible' }}>
            {/* 줄 1: 이름 + 나이 — 버튼과 겹치지 않도록 오른쪽 여백 확보 */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', paddingRight: '88px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {candidate.name || '무명의 후보'}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {report.age || '나이 미상'}세
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); updateField(candidate.id, 'friendStamp', !candidate.friendStamp); }}
                style={{ 
                  background: 'none', border: 'none', padding: '0', cursor: 'pointer', 
                  fontSize: '16px', display: 'flex', alignItems: 'center', marginLeft: '2px',
                  filter: candidate.friendStamp ? 'none' : 'grayscale(100%) opacity(35%)',
                  transform: candidate.friendStamp ? 'scale(1.15) rotate(-5deg)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                title="친구 상태 토글"
              >
                🤝
              </button>
            </div>
            {/* 줄 2: 직업 · 지역 — 버튼 아래까지 전폭 */}
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--text-3)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {candidate.job || '직업 미상'}{candidate.location && ` · ${candidate.location}`}
            </p>
            {/* 줄 3: 뱃지 — 버튼 아래까지 전폭, 넘치면 wrap */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'visible', marginTop: '2px' }}>
              <span className={`badge tone-${displayReport.color}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{displayReport.verdict}</span>
              {(candidate.personalityTags || []).map(id => {
                const tag = personalityTypeTags.find(t => t.id === id);
                return tag ? <span key={id} className={`badge tone-${tag.tone || 'blue'}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{tag.emoji} {tag.label}</span> : null;
              })}
            </div>
          </div>
        </div>

        <main className="sheetBody" style={{ padding: '0 16px 40px' }}>
          {/* ── Sticky Tabs ── */}
          <div style={{
            position: 'sticky',
            top: showCompactHeader ? '64px' : '0px',
            zIndex: 35,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            margin: '0 -16px',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--divider)',
          }}>
            {[
              { id: 'summary', label: '요약', icon: '📊' },
              { id: 'spec', label: '조건', icon: '⚖️' },
              { id: 'chat', label: '대화·정서', icon: '💬' },
              { id: 'record', label: '기록', icon: '📖' }
            ].map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '10px 2px',
                    fontSize: '11px',
                    fontWeight: isActive ? 800 : 600,
                    border: 'none',
                    background: 'none',
                    color: isActive ? 'var(--blue)' : 'var(--text-3)',
                    borderBottom: isActive ? '2.5px solid var(--blue)' : '2.5px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'color 0.15s ease, border-bottom-color 0.15s ease',
                    minWidth: 0,
                    overflow: 'hidden',
                    marginBottom: '-1px'
                  }}
                >
                  <span style={{ fontSize: '14px', lineHeight: 1 }}>{t.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* 탭별 콘텐츠 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px' }}>
            {/* 1) 요약 탭 */}
            {activeTab === 'summary' && (
              <>
                <Card className={`final ${scoreTone(displayReport.color).className}`} style={{ marginTop: '0px', padding: '14px 16px 16px' }}>

                  {/* ── 한 줄 헤더: 이모지+판정 / 점수 ── */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                      <span style={{ fontSize: '15px', flexShrink: 0, lineHeight: 1 }}>{VERDICT_EMOJI[displayReport.color] || '🔍'}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: `var(--${displayReport.color})`, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayReport.verdict}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', flexShrink: 0 }}>
                      <strong style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.04em', color: 'var(--text-1)', lineHeight: 1 }}>
                        {displayReport.finalScore}
                      </strong>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-3)' }}>점</span>
                    </div>
                  </div>

                  {/* ── 분석 제목 ── */}
                  <p style={{ margin: '8px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-body)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                    {displayReport.copy.detailTitle}
                  </p>

                  {/* ── 관찰 포인트 bullets ── */}
                  <div style={{ marginTop: '10px', background: '#ffffff', borderRadius: '12px', padding: '11px 13px', border: '1px solid var(--divider)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: `var(--${displayReport.color})`, letterSpacing: '0.05em', marginBottom: '7px' }}>
                      관찰 포인트
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {(displayReport.copy.detailBullets?.length >= 2
                        ? displayReport.copy.detailBullets
                        : displayReport.copy.detailComments
                      ).map((bullet, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr', alignItems: 'start' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', marginTop: '7px', background: `var(--${displayReport.color})`, display: 'block' }} />
                          <span style={{ fontSize: '12.5px', color: 'var(--text-body)', lineHeight: 1.5, wordBreak: 'keep-all' }}>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── 최근 타임라인 흐름 분석 ── */}
                  {displayReport.flowAnalysis && (
                    <div style={{ marginTop: '10px', background: '#ffffff', borderRadius: '12px', padding: '11px 13px', border: '1px solid var(--divider)' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        최근 타임라인 흐름 분석
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>데이터 상태</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)' }}>{displayReport.flowAnalysis.recordStatus}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>최근 5회 추세</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: displayReport.flowAnalysis.trend === '상승' ? 'var(--green)' : displayReport.flowAnalysis.trend === '하락' ? 'var(--red)' : 'var(--text-body)' }}>
                            {displayReport.flowAnalysis.trend} <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 500 }}>({displayReport.flowAnalysis.recentPos}긍정 / {displayReport.flowAnalysis.recentNeg}부정)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 반복된 주요 흐름 (키워드 랭킹) ── */}
                  {sortedSignals.length > 0 && (
                    <div style={{ marginTop: '10px', background: '#ffffff', borderRadius: '12px', padding: '11px 13px', border: '1px solid var(--divider)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.05em' }}>
                          반복 관찰된 주요 흐름
                        </div>
                        {sortedSignals.length > 3 && (
                          <button 
                            onClick={() => setShowAllSignals(!showAllSignals)}
                            style={{ background: 'none', border: 'none', fontSize: '10px', fontWeight: 600, color: 'var(--blue)', cursor: 'pointer', padding: 0 }}
                          >
                            {showAllSignals ? '접기' : `+ ${sortedSignals.length - 3}개 더보기`}
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(showAllSignals ? sortedSignals : sortedSignals.slice(0, 3)).map((sig) => (
                          <div key={sig.code} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `var(--${sig.tone}-light)`, color: `var(--${sig.tone})`, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                            {sig.tone === 'green' ? '🟢' : sig.tone === 'amber' || sig.tone === 'orange' ? '🟡' : '🔴'} {sig.label}
                            <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.65)', color: 'inherit', border: '1px solid color-mix(in srgb, currentColor 30%, transparent)', padding: '2px 5px', borderRadius: '4px', marginLeft: '2px' }}>{sig.count}회</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="miniGrid" style={{ marginTop: '10px' }}>
                    <MiniScore label="조건/스펙" value={report.conditionScore} max={10} />
                    <MiniScore label="대화/태도" value={report.relationScore} max={10} />
                    <MiniScore label="정보확인" value={report.trustScore} max={6} />
                    <MiniScore label="지속가능성" value={report.realityScore} max={4} />
                    <MiniScore label="플래그가산" value={report.bonusPenalty} />
                    <MiniScore label="만남흐름" value={report.flowScore} />
                  </div>
                  <button className="copyButton" onClick={copy}>
                    {copied ? '관계 리포트 복사 완료!' : 'LLM 분석용 마크다운 복사'}
                  </button>
                </Card>
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
                        const stat = item.key === 'emotionFatigue' ? getReverseScoreStatusLabel(val) : getScoreStatusLabel(val);
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Field label="직업" value={sectionForm.job} onChange={(v) => setSectionForm(p => ({...p, job: v, jobStability: recommendJobStability(v)}))} />
                        </div>
                        <VerifyToggle verifiedObj={sectionForm.verified} fieldKey="job" onChange={(k, v) => setSectionForm(p => ({...p, verified: {...p.verified, [k]: v}}))} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Field label="거주지" value={sectionForm.location} onChange={(v) => setSectionForm(p => ({...p, location: v}))} />
                        </div>
                        <VerifyToggle verifiedObj={sectionForm.verified} fieldKey="location" onChange={(k, v) => setSectionForm(p => ({...p, verified: {...p.verified, [k]: v}}))} />
                      </div>
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
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{candidate.job || '미확인'}{verified(candidate, 'job') ? ' ✅' : ''}</b>
                        </div>
                        <div style={{ padding: '10px', border: '1px solid var(--divider)', borderRadius: '10px', background: 'var(--bg)' }}>
                          <small style={{ fontSize: '10px', color: 'var(--text-3)', display: 'block' }}>거주지</small>
                          <b style={{ fontSize: '13px', color: 'var(--text-1)' }}>{candidate.location || '미확인'}</b>
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Field label="키 (cm)" type="number" value={sectionForm.height} onChange={(v) => setSectionForm(p => ({...p, height: v}))} />
                        </div>
                        <VerifyToggle verifiedObj={sectionForm.verified} fieldKey="height" onChange={(k, v) => setSectionForm(p => ({...p, verified: {...p.verified, [k]: v}}))} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <SelectField label="자산" value={sectionForm.asset} onChange={(v) => setSectionForm(p => ({...p, asset: v}))}>
                            {assetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </SelectField>
                        </div>
                        <VerifyToggle verifiedObj={sectionForm.verified} fieldKey="asset" onChange={(k, v) => setSectionForm(p => ({...p, verified: {...p.verified, [k]: v}}))} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <SelectField label="연봉" value={sectionForm.income} onChange={(v) => setSectionForm(p => ({...p, income: v}))}>
                            {incomeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </SelectField>
                        </div>
                        <VerifyToggle verifiedObj={sectionForm.verified} fieldKey="income" onChange={(k, v) => setSectionForm(p => ({...p, verified: {...p.verified, [k]: v}}))} />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Field label="주거형태" value={sectionForm.housing} onChange={(v) => setSectionForm(p => ({...p, housing: v}))} />
                        </div>
                        <VerifyToggle verifiedObj={sectionForm.verified} fieldKey="housing" onChange={(k, v) => setSectionForm(p => ({...p, verified: {...p.verified, [k]: v}}))} />
                      </div>
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
                        <ScoreCard title="조건/스펙" value={report.conditionScore} max={10} desc="키·돈·직업처럼 확인 가능한 조건" />
                        <ScoreCard title="정보 확인도" value={report.trustScore} max={6} desc="말로 들은 정보가 확인됐는지" />
                        <ScoreCard title="지속 가능성" value={report.realityScore} max={4} desc="거리·생활 리듬·현실 행동" />
                      </div>
                      <div className="infoGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        <Info label="키" value={candidate.height ? `${candidate.height}cm` : '미확인'} checked={verified(candidate, 'height')} />
                        <Info label="자산" value={optionLabel(assetOptions, candidate.asset)} checked={verified(candidate, 'asset')} />
                        <Info label="연봉" value={optionLabel(incomeOptions, candidate.income)} checked={verified(candidate, 'income')} />

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
    <PopoverMenu triggerRef={activeMoreRef} open={showMenu} onClose={() => setShowMenu(false)}>
      <button
        onClick={() => { edit(candidate); setShowMenu(false); }}
        style={{ padding: '12px 14px', fontSize: '13px', border: 'none', background: 'none', textAlign: 'left', color: 'var(--text-body)', cursor: 'pointer', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}
      >✏️ 전체 상세 정보 편집</button>
      <button
        onClick={() => { copy(); setShowMenu(false); }}
        style={{ padding: '12px 14px', fontSize: '13px', border: 'none', background: 'none', textAlign: 'left', color: 'var(--text-body)', cursor: 'pointer', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}
      >📋 마크다운 전체 복사</button>
      <button
        onClick={() => { setShowMenu(false); setConfirm({ message: `'${candidate.name}' 기록을 삭제할까요?`, sub: '삭제 후 복구할 수 없습니다.', confirmLabel: '삭제', danger: true, onConfirm: () => { remove(candidate.id); close(); setConfirm(null); }, onCancel: () => setConfirm(null) }); }}
        style={{ padding: '12px 14px', fontSize: '13px', border: 'none', background: 'none', textAlign: 'left', color: 'var(--red)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}
      ><Trash2 size={14} /> 이 후보 기록 삭제</button>
    </PopoverMenu>
    {confirm && <ConfirmModal {...confirm} />}
    </>
  );
}
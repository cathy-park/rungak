import React, { useState } from 'react';
import { timelineTypeOptions, feelingOptions, signalOptions } from '../../utils/scoring/scoreOptions';
import { todayValue, bulletLines, optLabel } from '../../utils/helpers';
import { suggestedSignals, signalByCode } from '../../utils/scoring/timelineScore';
import { Card, SelectField, Field, Icon, Badge, ConfirmModal } from '../ui/CommonUI';
export function TimelineSection({ candidate, report, saveTimeline }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ date: todayValue(), type: 'date', feeling: 'neutral', notes: '', signals: [] });
  const [confirmDel, setConfirmDel] = useState(null);
  const [posOpen, setPosOpen] = useState(true);
  const [negOpen, setNegOpen] = useState(true);
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
          <div className="signalSections">
            <div className="signalGroup positiveGroup">
              <button 
                type="button" 
                onClick={() => setPosOpen(!posOpen)} 
                className="signalGroupTitle" 
                style={{ background: 'none', border: 'none', padding: 0, boxShadow: 'none', color: 'var(--green)', display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', marginRight: '4px', transition: 'transform 0.2s', transform: posOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                🟢 긍정 신호 (+)
              </button>
              {posOpen && (
                <div className="signalWrap" style={{ marginTop: '12px' }}>
                  {signalOptions.filter(s => s.score > 0).map((signal) => (
                    <button key={signal.code} type="button" className={draft.signals.includes(signal.code) ? `tone-${signal.tone}` : ''} onClick={() => toggle(signal.code)}>
                      +{signal.score} {signal.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="signalGroup negativeGroup">
              <button 
                type="button" 
                onClick={() => setNegOpen(!negOpen)} 
                className="signalGroupTitle" 
                style={{ background: 'none', border: 'none', padding: 0, boxShadow: 'none', color: 'var(--red)', display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', marginRight: '4px', transition: 'transform 0.2s', transform: negOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                🔴 부정 신호 (-)
              </button>
              {negOpen && (
                <div className="signalWrap" style={{ marginTop: '12px' }}>
                  {signalOptions.filter(s => s.score < 0).map((signal) => (
                    <button key={signal.code} type="button" className={draft.signals.includes(signal.code) ? `tone-${signal.tone}` : ''} onClick={() => toggle(signal.code)}>
                      {signal.score} {signal.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
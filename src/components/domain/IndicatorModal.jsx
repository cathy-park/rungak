import React from 'react';
import { X } from 'lucide-react';
import { relationItems, verifiedKeys } from '../../utils/scoring/scoreOptions';
import { verified } from '../../utils/scoring/analyzeCandidate';

export function IndicatorModal({ type, candidate, report, close }) {
  let title = '';
  let value = '';
  let desc = '';
  let color = 'blue';

  if (type === 'relation') {
    title = '관계 안정도';
    value = `${report.relationScore} / 10`;
    desc = '소통의 일치감, 정서적 편안함, 애정 표현 등 관계의 질을 평가한 점수입니다.';
    color = 'green';
  } else if (type === 'trust') {
    title = '신뢰 흐름';
    value = `${report.trustScore} / 6`;
    desc = '상대방이 제공한 정보의 교차 검증 여부와 약속 이행의 일관성을 평가한 점수입니다.';
    color = 'blue';
  } else if (type === 'condition') {
    title = '조건 적합도';
    value = `${report.conditionScore} / 10`;
    desc = '나이, 직업, 수입, 자산 등 현실적 기준과 가치관의 부합 정도입니다.';
    color = 'orange';
  } else if (type === 'risk') {
    title = '런각 위험도';
    value = `${report.red.length} 건`;
    desc = '반드시 주의해야 할 치명적인 단점이나 심리적 유해 신호입니다.';
    color = 'red';
  }

  return (
    <div className="sheetBackdrop" onClick={close} style={{ zIndex: 10000 }}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ padding: '24px', background: 'var(--bg)', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80vh' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '16px', background: `var(--${color})`, borderRadius: '2px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-1)' }}>{title}</h2>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: `var(--${color})`, marginTop: '4px' }}>{value}</span>
          </div>
          <button className="iconButton" onClick={close} style={{ margin: '-8px -8px 0 0' }}>
            <X size={24} color="var(--text-2)" />
          </button>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>{desc}</p>
        
        <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '50vh', overflowY: 'auto' }}>
          {type === 'risk' && report.red.length === 0 && <span style={{ fontSize: '13px', color: 'var(--text-3)', textAlign: 'center', padding: '10px 0' }}>발견된 치명적 위험 요소가 없습니다.</span>}
          {type === 'risk' && report.red.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', paddingBottom: i !== report.red.length - 1 ? '12px' : 0, borderBottom: i !== report.red.length - 1 ? '1px solid var(--divider)' : 'none' }}>
              <span style={{ marginTop: '2px' }}>🚩</span>
              <span style={{ fontSize: '13.5px', color: 'var(--text-1)', lineHeight: 1.5, fontWeight: 600 }}>{r}</span>
            </div>
          ))}
          
          {type === 'condition' && report.rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 600 }}>{r.label}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: 800 }}>{typeof r.raw === 'number' ? parseFloat(r.raw.toFixed(1)) : (r.raw || '-')} <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>/ {r.max}</span></span>
            </div>
          ))}

          {type === 'relation' && relationItems.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 600 }}>{r.label}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: 800 }}>{candidate.relation?.[r.key] || 5} <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>/ 10</span></span>
            </div>
          ))}

          {type === 'trust' && verifiedKeys.map((key, i) => {
            const labelMap = {
              birthDate: '나이/생일',
              job: '직업',
              location: '거주지',
              height: '키',
              asset: '자산',
              income: '연봉',
              education: '학력',
              housing: '주거/부동산',
              car: '차량'
            };
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 600 }}>
                  {labelMap[key] || '기타'} 검증
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: verified(candidate, key) ? 'var(--blue)' : 'var(--text-3)' }}>
                  {verified(candidate, key) ? '검증 완료' : '미검증'}
                </span>
              </div>
            );
          })}
        </div>
        
        <button className="primaryButton" onClick={close} style={{ marginTop: '16px', padding: '16px', borderRadius: '16px' }}>확인</button>
      </div>
    </div>
  );
}

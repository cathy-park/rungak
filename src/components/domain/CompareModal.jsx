import React from 'react';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { Avatar, Card, Icon } from '../ui/CommonUI';
import { calcAge } from '../../utils/scoring/analyzeCandidate';

export function CompareModal({ candidates, close }) {
  const [A, B] = candidates;

  const renderCandidateHero = (c) => {
    const age = calcAge(c.birthDate) || c.age || '미상';
    const job = c.job || '직업 미상';
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Avatar candidate={c} size="xl" />
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '12px 0 4px', color: 'var(--text-1)' }}>{c.name || '이름 없음'}</h3>
        <span className={`badge-${c.color}`} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'inline-block' }}>{c.verdict}</span>
        <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>{age}세 · {job}</p>
        <div style={{ marginTop: '8px', fontSize: '24px', fontWeight: 900, color: `var(--${c.color === 'default' ? 'blue' : c.color})` }}>
          {c.finalScore}<small style={{ fontSize: '12px', fontWeight: 600 }}>점</small>
        </div>
      </div>
    );
  };

  const renderBarRow = (label, valA, valB, max) => {
    const pctA = Math.max(0, Math.min(100, (valA / max) * 100));
    const pctB = Math.max(0, Math.min(100, (valB / max) * 100));
    
    const colorA = valA > valB ? 'var(--blue)' : valA === valB ? 'var(--text-3)' : '#9CA3AF';
    const colorB = valB > valA ? 'var(--green)' : valB === valA ? 'var(--text-3)' : '#9CA3AF';

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px', letterSpacing: '-0.02em' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: valA >= valB ? 'var(--text-1)' : 'var(--text-3)' }}>{valA}</span>
            <div style={{ width: '100%', height: '10px', background: 'var(--divider)', borderRadius: '5px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ height: '100%', width: `${pctA}%`, background: colorA, borderRadius: '5px', transition: 'width 0.5s ease-out' }} />
            </div>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'var(--divider)' }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100%', height: '10px', background: 'var(--divider)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctB}%`, background: colorB, borderRadius: '5px', transition: 'width 0.5s ease-out' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: valB >= valA ? 'var(--text-1)' : 'var(--text-3)' }}>{valB}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFlowBarRow = (valA, valB) => {
    // Flow is -70 to 70.
    const colorA = valA > 0 ? 'var(--blue)' : valA < 0 ? 'var(--red)' : 'var(--text-3)';
    const colorB = valB > 0 ? 'var(--green)' : valB < 0 ? 'var(--red)' : 'var(--text-3)';
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px', letterSpacing: '-0.02em' }}>타임라인 흐름 (Flow)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 800, color: colorA }}>
            {valA > 0 ? `+${valA}` : valA}
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--divider)' }} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 800, color: colorB }}>
            {valB > 0 ? `+${valB}` : valB}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sheetBackdrop" onClick={close} style={{ zIndex: 9999 }}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ height: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <header className="header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--divider)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '24px 24px 0 0' }}>
          <button className="iconBtn" onClick={close}><ChevronLeft /></button>
          <h1 className="headerTitle" style={{ fontSize: '16px', margin: 0 }}>후보 비교 분석</h1>
          <div style={{ width: 32 }} />
        </header>
        
        <main className="sheetBody" style={{ padding: '24px 20px', paddingBottom: '100px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 프로필 비교 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {renderCandidateHero(A)}
          <div style={{ width: '1px', background: 'var(--divider)' }} />
          {renderCandidateHero(B)}
        </div>

        {/* 핵심 지표 비교 */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-1)', marginBottom: '12px', paddingLeft: '4px' }}>핵심 지표 대조</h2>
          <Card style={{ margin: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px', paddingBottom: '8px' }}>
              {renderBarRow('기초 조건', A.conditionScore, B.conditionScore, 10)}
              {renderBarRow('관계성', A.relationScore, B.relationScore, 10)}
              {renderBarRow('신뢰/검증', A.trustScore, B.trustScore, 6)}
              {renderFlowBarRow(A.flowScore, B.flowScore)}
            </div>
          </Card>
        </div>

        {/* 최근 타임라인 추세 */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-1)', marginBottom: '12px', paddingLeft: '4px' }}>최근 타임라인 추세</h2>
          <Card style={{ margin: 0 }}>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', fontSize: '13px', color: 'var(--text-2)', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {A.flowAnalysis ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: A.flowAnalysis.trend === '상승' ? 'var(--blue)' : A.flowAnalysis.trend === '하락' ? 'var(--red)' : 'var(--text-1)' }}>
                        {A.flowAnalysis.trend} 추세
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>긍정 행동</span>
                        <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{A.flowAnalysis.recentPos}건</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>부정 행동</span>
                        <span style={{ fontWeight: 700, color: 'var(--red)' }}>{A.flowAnalysis.recentNeg}건</span>
                      </div>
                    </>
                  ) : <div style={{ textAlign: 'center', marginTop: '12px' }}>기록 부족</div>}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', fontSize: '13px', color: 'var(--text-2)', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {B.flowAnalysis ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: B.flowAnalysis.trend === '상승' ? 'var(--green)' : B.flowAnalysis.trend === '하락' ? 'var(--red)' : 'var(--text-1)' }}>
                        {B.flowAnalysis.trend} 추세
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>긍정 행동</span>
                        <span style={{ fontWeight: 700, color: 'var(--green)' }}>{B.flowAnalysis.recentPos}건</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>부정 행동</span>
                        <span style={{ fontWeight: 700, color: 'var(--red)' }}>{B.flowAnalysis.recentNeg}건</span>
                      </div>
                    </>
                  ) : <div style={{ textAlign: 'center', marginTop: '12px' }}>기록 부족</div>}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 치명적 플래그 비교 */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-1)', marginBottom: '12px', paddingLeft: '4px' }}>치명적 플래그 (Red Flags)</h2>
          <Card style={{ margin: 0 }}>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <div style={{ flex: 1 }}>
                {A.red && A.red.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {A.red.map(r => (
                      <div key={r} style={{ background: '#FFF1F2', color: '#E11D48', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'flex-start', lineHeight: 1.4 }}>
                        <span style={{ marginTop: '2px' }}>🚨</span> {r}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-3)', textAlign: 'center' }}>없음</div>
                )}
              </div>
              <div style={{ width: '1px', background: 'var(--divider)' }} />
              <div style={{ flex: 1 }}>
                {B.red && B.red.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {B.red.map(r => (
                      <div key={r} style={{ background: '#FFF1F2', color: '#E11D48', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'flex-start', lineHeight: 1.4 }}>
                        <span style={{ marginTop: '2px' }}>🚨</span> {r}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-3)', textAlign: 'center' }}>없음</div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 시스템 조언 */}
        <div style={{ background: 'var(--blue-light)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px' }}>💡</span>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--blue)' }}>런각 연구소 시스템 소견</h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-1)', lineHeight: 1.6, wordBreak: 'keep-all', margin: 0 }}>
            {A.finalScore > B.finalScore && A.flowScore >= B.flowScore ? 
              `종합 점수와 최근 흐름 모두 ${A.name}님이 더 안정적입니다. 레드 플래그가 없다면 긍정적으로 발전시켜 보세요.` :
             B.finalScore > A.finalScore && B.flowScore >= A.flowScore ? 
              `종합 점수와 최근 흐름 모두 ${B.name}님이 더 안정적입니다. 레드 플래그가 없다면 긍정적으로 발전시켜 보세요.` :
             A.finalScore > B.finalScore && B.flowScore > A.flowScore ?
              `${A.name}님의 기본 조건과 성향 점수가 더 높지만, 타임라인 흐름은 ${B.name}님이 더 안정적입니다. 현재의 감정선이 편안한 쪽을 선택하는 것이 좋습니다.` :
             B.finalScore > A.finalScore && A.flowScore > B.flowScore ?
              `${B.name}님의 기본 조건과 성향 점수가 더 높지만, 타임라인 흐름은 ${A.name}님이 더 안정적입니다. 초기 조건보다 시간 경과에 따른 행동 일관성을 더 신뢰하세요.` :
              `두 후보가 비슷한 구조적 특징을 보입니다. 시간을 두고 만남을 통해 추가적인 관찰 데이터(타임라인)를 수집하는 것이 좋습니다.`
            }
          </p>
        </div>
      </main>
      </div>
    </div>
  );
}

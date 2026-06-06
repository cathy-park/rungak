import React from 'react';
import { Card, Icon, ScoreRule } from '../ui/CommonUI';
export function Info({ label, value, checked }) {
  return <div className="info"><small>{label}</small><b>{value}</b>{checked && <Badge color="green">확인됨</Badge>}</div>;
}
export function GuideModal({ close, onExport, onImport, onSyncUpload, onSyncDownload, activeSyncCode, onDisconnectSync }) {
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
          <h3>기기간 실시간 동기화</h3>

          {/* 현재 연동 중 상태 표시 */}
          {activeSyncCode && (
            <div style={{ marginTop: '10px', padding: '12px 14px', background: 'color-mix(in srgb, var(--blue) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--blue) 25%, transparent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--blue)', marginBottom: '2px' }}>● 실시간 동기화 중</span>
                <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-1)' }}>{activeSyncCode}</span>
              </div>
              <button onClick={onDisconnectSync} style={{ padding: '6px 12px', border: '1px solid var(--divider)', borderRadius: '8px', background: 'var(--surface)', fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>연동 해제</button>
            </div>
          )}

          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '10px', lineHeight: 1.45 }}>
            코드로 한 번 연결하면 이후 변경 사항이 두 기기에 자동으로 반영됩니다.
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
          <h3>총점 구조 (0~100점)</h3>
          <ScoreRule title="기초 조건/스펙" score="10점" desc="키, 체형, 자산, 연봉, 직업 안정성, 나이, 거리" />
          <ScoreRule title="관계 정서/대화" score="10점" desc="논리적 대화, 현재 충실도, 감정 안정성, 배려와 존중" />
          <ScoreRule title="정보 신뢰도" score="6점" desc="확인된 정보 수, 핵심 조건 실물 검증 완료도" />
          <ScoreRule title="지속 가능성" score="4점" desc="현실 지속 가능성 및 실제 실행력" />
          <ScoreRule title="플래그 보정" score="-18~+10" desc="수동으로 체크한 그린/옐로우/레드 플래그 가감" />
          <ScoreRule title="타임라인 행동 흐름" score="-70~+70" desc="타임라인에 누적된 행동 신호 합산 (반복 시 페널티)" />
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
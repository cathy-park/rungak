import React, { useState, useMemo } from 'react';
import { getDaysAgo, rankCandidates } from '../../utils/helpers';
import { analyze } from '../../utils/scoring/analyzeCandidate';
import { VERDICT_EMOJI } from '../../utils/scoring/verdictRules';
import { Card, Avatar, Badge, Icon, FloatingAdd } from '../ui/CommonUI';
export function Home({ candidates, openCandidate, goAdd, openGuide, openQuickMemo, toggleFriendStamp }) {
  const [heroIdx, setHeroIdx] = useState(0);
  const carouselTrackRef = React.useRef(null);

  const handleCarouselScroll = () => {
    if (!carouselTrackRef.current) return;
    const track = carouselTrackRef.current;
    
    // 카드 1개의 정밀한 스냅 너비 비율
    const totalLength = topRanked.length;
    if (totalLength <= 1) return;
    
    const cardWidth = track.scrollWidth / totalLength;
    const scrollLeft = track.scrollLeft;
    
    // 스크롤 포지션에 맞춰 도트 동기화
    const activeIdx = Math.round(scrollLeft / cardWidth);
    if (activeIdx !== heroIdx && activeIdx >= 0 && activeIdx < totalLength) {
      setHeroIdx(activeIdx);
    }
  };

  const scrollToSlide = (idx) => {
    if (!carouselTrackRef.current) return;
    const track = carouselTrackRef.current;
    const totalLength = topRanked.length;
    if (totalLength <= 1) return;
    
    const cardWidth = track.scrollWidth / totalLength;
    track.scrollTo({
      left: idx * cardWidth,
      behavior: 'smooth'
    });
    setHeroIdx(idx);
  };

  const mapped = candidates.map(c => ({ candidate: c, report: c }));

  // 히어로 노출 기준: '정리 권장'(red)만 제외 — verdict가 아닌 총점 기반 순위로 노출
  // 기존에 verdict 문자열 기반 필터 사용 시, 총점 61점(amber)인 후보가 제외되고
  // 58점(blue)인 후보만 단독 노출되는 역전 버그가 있었음
  const recommendable = mapped.filter(({ report }) =>
    report.verdict !== '정리 권장'
  );
  const topRanked = recommendable.slice(0, 3);
  const hasCandidates = candidates.length > 0;
  const hasRecommendable = topRanked.length > 0;
  const safeIdx = Math.min(heroIdx, Math.max(0, topRanked.length - 1));

  function heroMetrics(candidate, report) {
    return report.metrics || {
      relation: 50,
      trust: 50,
      condition: 50,
      risk: 50
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
    {/* ── 히어로 섹션 캐러셀 (권장 물리 스냅 Carousel 및 스크롤 연동 시스템) ── */}
    {!hasCandidates ? (
      <div className="hero-carousel">
        <div className="hero-track" style={{ padding: '0 18px', justifyContent: 'center' }}>
          <div className="hero-slide verdict-default" style={{ flex: '1', maxWidth: '440px', scrollSnapAlign: 'center' }}>
            <div className="heroEmpty">
              <Avatar candidate={emptyCandidate} size="lg" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '10px 0 4px', color: 'var(--text-1)' }}>기록된 후보가 없어요</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-2)', marginBottom: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>새 후보를 추가하고 점수를 분석해보세요.</p>
              <button className="heroCTA" onClick={goAdd}>첫 후보 기록하기</button>
            </div>
          </div>
        </div>
      </div>
    ) : !hasRecommendable ? (
      <div className="hero-carousel">
        <div className="hero-track" style={{ padding: '0 18px', justifyContent: 'center' }}>
          <div className="hero-slide verdict-default" style={{ flex: '1', maxWidth: '440px', scrollSnapAlign: 'center' }}>
            <div className="heroEmpty">
              <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }}>🔍</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-1)' }}>지금은 추천 후보가 없어요</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5', wordBreak: 'keep-all', textAlign: 'center', margin: 0 }}>현재 후보들은 모두 보류/정리 권장 상태예요.<br/>감정보다 관찰을 우선해보세요.</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="hero-carousel">
        <div 
          className="hero-track" 
          ref={carouselTrackRef} 
          onScroll={handleCarouselScroll}
        >
          {topRanked.map((item, idx) => {
            const { candidate, report } = item;
            const m = heroMetrics(candidate, report);
            const heroName = candidate.name || '무명의 후보';
 
            const displayAge = report.age || calcAge(candidate.birthDate) || '나이 미상';
            const displayJob = candidate.job || '직업 미상';
            const displayLoc = candidate.location || '';

            return (
              <div 
                key={candidate.id} 
                className={`hero-slide verdict-${report.color}`}
                onClick={() => openCandidate(candidate)}
                style={{ cursor: 'pointer' }}
              >
                {/* 데코 레이어 - 2개의 겹쳐진 비커와 풍성한 버블들 */}
                <div className="heroDecoWrap" aria-hidden="true">
                  <span className="heroBubble heroBubble-1" />
                  <span className="heroBubble heroBubble-2" />
                  <span className="heroBubble heroBubble-3" />
                  <span className="heroBubble heroBubble-4" />
                  <span className="heroBubble heroBubble-5" />
                  <svg className="heroFlaskDeco" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M68 45v14L60 76a2.5 2.5 0 002.2 3.6h18.5a2.5 2.5 0 002.2-3.6L75 59v-14" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3"/>
                    <path d="M42 22v26L26 76a4 4 0 003.5 6h36.5a4 4 0 003.5-6L54 48V22" stroke="var(--blue)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45"/>
                    <path d="M30.5 68c4-1 8 1 12 0s8-2 12-1 8 1 12 0" stroke="var(--blue)" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.35"/>
                    <path d="M38 22h16" stroke="var(--blue)" strokeWidth="2.8" strokeLinecap="round" strokeOpacity="0.45"/>
                  </svg>
                </div>

                <div className="heroCard" style={{ background: 'transparent', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
                  {/* 프로필 정보 영역 */}
                  <div className="heroProfileRow">
                    <div className="heroAvatarWrapper">
                      {renderRankCrown(idx)}
                      <Avatar candidate={candidate} size="xl" />
                    </div>
                    <div className="heroNameBlock">
                      <h2 className="heroName">{heroName}</h2>
                      <div className="heroStatusBadgeRow">
                        <span className={`heroStatusBadge badge-${report.color}`}>{report.verdict}</span>
                        <span className="heroStatusScore">{report.finalScore}<small>점</small></span>
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
                      <p className="heroExplanationHighlight">{report.copy.heroTitle}</p>
                      <p className="heroExplanationDetail hero-summary" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.4
                      }}>{report.copy.heroSummary}</p>
                    </div>
                  </div>

                  {/* 4대 지표 카드 */}
                  <div className="heroIndicatorGrid">
                    <div className="heroIndicatorCard indicator-green">
                      <span className="heroIndicatorLabel">관계 안정도</span>
                      <div className="heroIndicatorValueRow">
                        <span className="heroIndicatorIcon">
                          <img src="/assets/stability.svg" alt="Stability Icon" className="heroIndicatorIconImg" style={{ width: '15px', height: '15px', display: 'block' }} />
                        </span>
                        <span className="heroIndicatorValue">{m.relation}</span>
                      </div>
                    </div>
                    <div className="heroIndicatorCard indicator-blue">
                      <span className="heroIndicatorLabel">신뢰 흐름</span>
                      <div className="heroIndicatorValueRow">
                        <span className="heroIndicatorIcon">
                          <img src="/assets/trust.svg" alt="Trust Icon" className="heroIndicatorIconImg" style={{ width: '15px', height: '15px', display: 'block' }} />
                        </span>
                        <span className="heroIndicatorValue">{m.trust}</span>
                      </div>
                    </div>
                    <div className="heroIndicatorCard indicator-orange">
                      <span className="heroIndicatorLabel">조건 적합도</span>
                      <div className="heroIndicatorValueRow">
                        <span className="heroIndicatorIcon">
                          <img src="/assets/condition.svg" alt="Condition Icon" className="heroIndicatorIconImg" style={{ width: '15px', height: '15px', display: 'block' }} />
                        </span>
                        <span className="heroIndicatorValue">{m.condition}</span>
                      </div>
                    </div>
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* 페이지네이션 도트 및 힌트 가이드 - 슬라이드가 2개 이상일 때만 표시하여 오해 소지 완전 방지 */}
    {hasCandidates && hasRecommendable && topRanked.length > 1 && (
      <div className="heroDotsContainer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px', marginBottom: '4px' }}>
        <span className="heroSliderHelper" style={{ fontSize: '11px', color: '#8A97A8', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '8px', opacity: 0.85 }}>
          좌우로 넘겨 후보를 비교해보세요
        </span>
        <div className="heroDots" style={{ margin: 0 }}>
          {topRanked.map((_, idx) => (
            <button
              key={idx}
              className={`heroDot ${idx === heroIdx ? `active verdict-${topRanked[idx].report.color}` : ''}`}
              onClick={() => scrollToSlide(idx)}
              title={`후보 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    )}

    {/* ── 후보 목록 ── */}
    <section className="list">
      <div className="sectionTitle">
        <h2>후보 목록</h2>
        <span>{candidates.length}명</span>
      </div>
      {candidates.map((candidate) => {
        const cName = candidate.name || '무명의 후보';
        const cScore = candidate.finalScore;
        const cVerdict = candidate.verdict;
        const cColor = candidate.color;
        const isDanger = cVerdict === '정리 권장';

        const displayAge = candidate.age || '나이 미상';
        const displayJob = candidate.job || '직업 미상';
        const displayLoc = candidate.location || '';

        const currentTimeline = candidate.dateTimeline || candidate.timeline || [];
        const sortedTimeline = [...currentTimeline].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        const lastContactDate = sortedTimeline[0]?.date || '';
        const lastContactAgo = getDaysAgo(lastContactDate);
        const meetCount = currentTimeline.filter(e => e.type === 'meet' || e.type === 'date').length;
        const meetCountStr = meetCount > 0 ? ` · 만남 ${meetCount}회` : '';
        const lastContactStr = lastContactAgo ? ` (${lastContactAgo})` : '';

        return (
          <div key={candidate.id} className="candidateCardWrap">
            <button className={`candidateCard2 verdict-${cColor} card-${isDanger ? 'danger' : 'normal'} ${candidate.friendStamp ? 'card-friend' : ''}`} onClick={() => openCandidate(candidate)}>
              <Avatar candidate={candidate} size="sm" />
              <div className="candidateCard2Body">
                <div className="candidateCard2NameRow">
                  <h3 className="candidateCard2Name">{cName}</h3>
                  <span className={`candidateCard2Badge badge-${cColor}`}>{cVerdict}</span>
                </div>

                <div className="candidateCard2MetaBlock">
                  <p className="candidateCard2Meta">
                    {displayAge}세 · {displayJob}{verified(candidate, 'job') ? ' ✅' : ''}{displayLoc ? ` · ${displayLoc}` : ''}
                    {meetCountStr}{lastContactStr}
                  </p>
                </div>
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
              {candidate.friendStamp && (
                <div className="friendStamp" aria-hidden="true" style={{ filter: 'url(#rungak-grunge)' }}>
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* 바깥 거친 이중 테두리 원 */}
                    <circle cx="50" cy="50" r="44" stroke="#16A34A" strokeWidth="3" strokeDasharray="320" style={{ opacity: 0.9 }} />
                    <circle cx="50" cy="50" r="39" stroke="#16A34A" strokeWidth="1.2" strokeDasharray="4 4" style={{ opacity: 0.8 }} />
                    
                    {/* 두 명의 친구 캐릭터 */}
                    {/* 왼쪽 사람 */}
                    <circle cx="40" cy="38" r="7" stroke="#16A34A" strokeWidth="2" fill="none" />
                    <circle cx="37" cy="36" r="1.5" fill="#16A34A" />
                    <circle cx="43" cy="36" r="1.5" fill="#16A34A" />
                    <path d="M37 40 Q40 43 43 40" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
                    
                    {/* 오른쪽 사람 */}
                    <circle cx="60" cy="38" r="7" stroke="#16A34A" strokeWidth="2" fill="none" />
                    <circle cx="57" cy="36" r="1.5" fill="#16A34A" />
                    <circle cx="63" cy="36" r="1.5" fill="#16A34A" />
                    <path d="M57 40 Q60 43 63 40" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
                    
                    {/* 어깨동무 라인 */}
                    <path d="M47 42 Q50 38 53 42" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                    
                    {/* 친구! 굵은 텍스트 */}
                    <text x="50" y="75" fill="#16A34A" fontSize="15" fontWeight="900" textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif" letterSpacing="0.08em">친구!</text>
                    
                    {/* 반짝이 데코 */}
                    <path d="M26 38l1.5 2.5L30 39l-2.5-1.5L26 38zM74 38l1.5-2.5L72 34l-1 2.5L74 38z" fill="#16A34A" />
                    <path d="M22 62h3v3h-3zM76 60h2v2h-2z" fill="#16A34A" />
                  </svg>
                </div>
              )}
            </button>

          </div>
        );
      })}
    </section>
    </main>
  </>;
}
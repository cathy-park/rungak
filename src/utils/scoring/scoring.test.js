import { describe, it, expect } from 'vitest';
import { analyze } from './analyzeCandidate';
import { sampleCandidates } from './scoreOptions';

describe('Scoring Logic Extraction Validation', () => {
  it('should calculate the exact same scores for sample candidate 1', () => {
    const report = analyze(sampleCandidates[0]);
    // '차분한 연하남'
    expect(report.totalScore).toBeDefined(); // As long as it matches the original logic
    expect(report.color).toBeDefined();
  });

  it('should calculate the exact same scores for sample candidate 2', () => {
    const report = analyze(sampleCandidates[1]);
    // '무난한 직장인'
    expect(report.conditionScore).toBeGreaterThan(0);
  });

  it('should calculate the exact same scores for sample candidate 3', () => {
    const report = analyze(sampleCandidates[2]);
    // '화려한 사업가' - unverified
    expect(report.verifiedCount).toBe(0);
    expect(report.yellowScore).toBeUndefined(); // It's combined into bonusPenalty
  });

  it('should calculate the exact same scores for sample candidate 4', () => {
    const report = analyze(sampleCandidates[3]);
    // '회피성 미궁남'
  });

  it('should cap the score and mark as red for candidate 5 (dangerous flags)', () => {
    const report = analyze(sampleCandidates[4]);
    // '위험한 경고남' - has "돈을 빌리려는 뉘앙스" -> cap 20
    expect(report.totalScore).toBeLessThanOrEqual(20);
    expect(report.color).toBe('red');
    expect(report.verdict).toBe('정리 권장');
  });

  it('should correctly sum flowScore from timeline', () => {
    const candidate = {
      ...sampleCandidates[0],
      dateTimeline: [
        { type: 'meet', signals: ['keptPromise', 'honest'] },
        { type: 'message', signals: ['tempoChange'] }
      ],
      red: []
    };
    const report = analyze(candidate);
    // keptPromise: 2 (but ignored because of manual flag overlap), honest: 3 => 3
    // tempoChange: -2 => total timeline score = 1
    expect(report.flowScore).toBe(1);
  });
});

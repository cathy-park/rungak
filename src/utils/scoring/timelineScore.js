import { signalOptions } from './scoreOptions';

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function signalByCode(code) {
  return signalOptions.find((item) => item.code === code);
}

const flagToSignalMap = {
  '약속을 구체적으로 잡고 지킴': 'keptPromise',
  '내 말을 기억하고 반영함': 'remembered',
  '불편한 이야기도 차분히 조율함': 'resolvedConflict',
  '자연스러운 티키타카': 'tikitaka',
  '내 경계선을 존중함': 'respectBoundary',
  '현재에 충실한 행동을 보임': 'presentAction',
  '연락 템포가 아직 불안정함': 'tempoChange',
  '은근히 나를 통제하려는 느낌이 듦': 'controlFreak',
  '자기 이야기만 주로 함': 'selfCentered',
  '설명 없는 잠수 반복': 'avoidance',
  '결정을 자꾸 미룸': 'avoidance',
  '말과 행동이 반복적으로 다름': 'mismatch',
  '내 판단을 예민함으로 몰아감': 'gaslighting',
  '감정의 쓰레기통으로 취급함': 'emotionalTrash',
  '돈을 빌리려는 뉘앙스': 'moneyBorrow',
  '직업/자산/연봉 허위 의심': 'falseInfo',
  '허위 확인': 'falseInfo',
};

export function timelineScore(timeline = [], redFlagsList = [], manualFlags = []) {
  const counts = {};
  const hasFalseInfo = redFlagsList.includes('직업/자산/연봉 허위 의심') || redFlagsList.includes('허위 확인');
  const hasMoneyBorrow = redFlagsList.includes('돈을 빌리려는 뉘앙스');
  const hasGaslighting = redFlagsList.includes('내 판단을 예민함으로 몰아감');

  // 수동 플래그에서 이미 적용된 신호 목록 정리
  const manualSignals = new Set(
    manualFlags.map(flag => flagToSignalMap[flag]).filter(Boolean)
  );
  
  const ignoredOnce = new Set(); // 이미 1회 무시된(수동 플래그와 겹친) 신호 추적

  const base = timeline.reduce((sum, event) => {
    return sum + (event.signals || []).reduce((inner, code) => {
      const signal = signalByCode(code);
      if (!signal) return inner;

      // 동일 사건 이중 계산 방지: 수동 플래그에 있는 항목이면 타임라인 첫 1회는 0점 처리
      if (manualSignals.has(code) && !ignoredOnce.has(code)) {
        ignoredOnce.add(code);
        counts[code] = (counts[code] || 0) + 1; // 횟수 누적은 정상적으로 진행(이후 반복 감점을 위해)
        return inner;
      }
      
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
  
  return clamp(base + repeatPenalty, -70, 70);
}

export function suggestedSignals(notes = '') {
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

import React, { useState, useRef, useEffect } from 'react';
import { 
  bodyOptions, bodyFitOptions, assetOptions, incomeOptions, marriageOptions, childrenOptions,
  housingOptions, carOptions, smokingOptions, drinkingOptions, religionOptions, goalOptions,
  personalityTypeTags, energyTagOptions, coreRelationItems, moreRelationItems, emotionalBondItems, observationPointPool,
  characters, AVATAR_BASE, greenFlags, yellowFlags, redFlags
} from '../../utils/scoring/scoreOptions';
import { compressBase64Image, todayValue, createForm, getDisplayReport } from '../../utils/helpers';
import { verified, recommendJobStability, analyze, calcAge } from '../../utils/scoring/analyzeCandidate';
import { Chevron, DetailAccordion, Avatar, Badge, Card, Field, SelectField, BulletTextarea, Toggle, VerifiedInput, Icon } from '../ui/CommonUI';
export function StepTitle({ step, title, desc }) {
  return <div className="stepTitle"><Badge color="blue">STEP {step}</Badge><h2>{title}</h2><p>{desc}</p></div>;
}
export function CharacterPicker({ form, update, handlePhoto }) {
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
export function ProfileFields({ form, update, updateVerified }) {
  return (
    <div className="formStack">
      <Field label="이름/별명" value={form.name} onChange={(v) => update('name', v)} placeholder="예: 차분한 연하남"/>
      <div className="grid2">
        <Field label="생년월일" type="date" value={form.birthDate} onChange={(v) => update('birthDate', v)}/>
        <Field label="나이" value={form.age} onChange={(v) => update('age', v)} placeholder="자동 계산"/>
      </div>
      <div className="grid2">
        <VerifiedInput checked={verified(form, 'job')} onChange={(v) => updateVerified('job', v)}>
          <Field label="직업" value={form.job} onChange={(v) => update({ job: v, jobStability: recommendJobStability(v) })} placeholder="예: 기획자"/>
        </VerifiedInput>
        <Field label="거주지" value={form.location} onChange={(v) => update('location', v)} placeholder="예: 서울 성수"/>
      </div>
      <div className="grid2">
        <Field label="MBTI" value={form.mbti} onChange={(v) => update('mbti', v)} placeholder="예: INTJ"/>
        <Field label="만난 경로" value={form.route} onChange={(v) => update('route', v)} placeholder="예: 소개팅"/>
      </div>
      <Field label="첫인상 메모" textarea value={form.memo} onChange={(v) => update('memo', v)} placeholder="예: 말이 과하지 않고 현재를 잘 사는 느낌"/>
    </div>
  );
}
export function CoreConditions({ form, update, updateVerified }) {
  return <div className="formStack"><VerifiedInput checked={verified(form, 'height')} onChange={(v) => updateVerified('height', v)}><Field label="키(cm)" type="number" value={form.height} onChange={(v) => update('height', v)} placeholder="예: 181"/></VerifiedInput><div className="grid2"><SelectField label="체형" value={form.bodyType} onChange={(v) => update('bodyType', v)}>{bodyOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField><SelectField label="체형 취향" value={form.bodyFit} onChange={(v) => update('bodyFit', Number(v))}>{bodyFitOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</SelectField></div><VerifiedInput checked={verified(form, 'asset')} onChange={(v) => updateVerified('asset', v)}><SelectField label="자산" value={form.asset} onChange={(v) => update('asset', v)}>{assetOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</SelectField></VerifiedInput><VerifiedInput checked={verified(form, 'income')} onChange={(v) => updateVerified('income', v)}><SelectField label="연봉" value={form.income} onChange={(v) => update('income', v)}>{incomeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</SelectField></VerifiedInput><VerifiedInput checked={verified(form, 'education')} onChange={(v) => updateVerified('education', v)}><Field label="학력" value={form.education} onChange={(v) => update('education', v)} placeholder="예: 대졸 / 석사"/></VerifiedInput><div className="grid2"><SelectField label="직업 안정성" value={form.jobStability} onChange={(v) => update('jobStability', Number(v))}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}점</option>)}</SelectField><SelectField label="거리 적합도" value={form.distanceFit} onChange={(v) => update('distanceFit', Number(v))}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}점</option>)}</SelectField></div></div>;
}
export function LifeInfo({ form, update, updateVerified }) {
  return <div className="formStack"><div className="grid2"><VerifiedInput checked={verified(form, 'housing')} onChange={(v) => updateVerified('housing', v)}><SelectField label="주거" value={form.housing} onChange={(v) => update('housing', v)}>{housingOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></VerifiedInput><VerifiedInput checked={verified(form, 'car')} onChange={(v) => updateVerified('car', v)}><SelectField label="차량" value={form.car} onChange={(v) => update('car', v)}>{carOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></VerifiedInput></div><div className="grid2"><SelectField label="흡연" value={form.smoking} onChange={(v) => update('smoking', v)}>{smokingOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField><SelectField label="음주" value={form.drinking} onChange={(v) => update('drinking', v)}>{drinkingOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></div><div className="grid2"><SelectField label="종교" value={form.religion} onChange={(v) => update('religion', v)}>{religionOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField><SelectField label="연애 목적" value={form.relationshipGoal} onChange={(v) => update('relationshipGoal', v)}>{goalOptions.map((opt) => <option key={opt}>{opt}</option>)}</SelectField></div></div>;
}
export function RelationSliders({ form, updateRelation, compact = false }) {
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

export function EmotionalBondSliders({ form, updateEmotionalBond }) {
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
                  background: item.key === 'emotionFatigue'
                    ? `linear-gradient(to right, var(--red) 0%, var(--red) ${val * 10}%, var(--divider) ${val * 10}%, var(--divider) 100%)`
                    : `linear-gradient(to right, var(--green) 0%, var(--green) ${val * 10}%, var(--divider) ${val * 10}%, var(--divider) 100%)`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TagPickerGroup({ title, tags, selected, onToggle, maxSelect = 3 }) {
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

export const PERSONALITY_CATEGORIES = [
  { key: 'positive', label: '긍정형', color: '#16A34A' },
  { key: 'neutral',  label: '중립형', color: '#64748B' },
  { key: 'caution',  label: '주의형', color: '#D97706' },
  { key: 'danger',   label: '위험형', color: '#BE123C' },
];

export function PersonalityTagPicker({ selected, onToggle, maxSelect = 3 }) {
  return (
    <div className="flatFlagGroup">
      <div className="groupLabel" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>인간 유형 태그 (성향)</span>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-3)' }}>최대 {maxSelect}개</span>
      </div>
      {PERSONALITY_CATEGORIES.map(cat => {
        const tags = personalityTypeTags.filter(t => t.category === cat.key);
        return (
          <div key={cat.key} style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '7px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: cat.color, letterSpacing: '0.02em' }}>{cat.label}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map(tag => {
                const isSelected = selected.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`badge ${isSelected ? `tone-${tag.tone}` : 'tone-gray'}`}
                    style={{
                      padding: '7px 11px',
                      fontSize: '12px',
                      borderRadius: '10px',
                      opacity: !isSelected && selected.length >= maxSelect ? 0.4 : 1,
                      cursor: !isSelected && selected.length >= maxSelect ? 'default' : 'pointer',
                      transition: 'all 0.15s',
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
      })}
    </div>
  );
}

export function ObservationSection({ notes, onChange, memo = '', onMemoChange }) {
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
export function FlagGroup({ title, color, items, selected, toggle }) {
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
export function AddCandidate({ initialCandidate, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState('profile');
  const [form, setForm] = useState(() => createForm(initialCandidate));
  const report = useMemo(() => analyze(form), [form]);
  const displayReport = useMemo(() => getDisplayReport({ name: form.name }, report), [form.name, report]);
  const isEdit = Boolean(form.id);
  
  function update(key, value) {
    setForm((prev) => {
      if (typeof key === 'object' && key !== null) {
        let next = { ...prev, ...key };
        if (key.birthDate) {
          next.age = calcAge(key.birthDate);
        }
        return next;
      }
      return { ...prev, [key]: value, ...(key === 'birthDate' ? { age: calcAge(value) } : {}) };
    });
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
        <button type="button" onClick={() => setOpen(open === 'profile' ? '' : 'profile')}>
          <div><b>프로필 & 유형</b><span>캐릭터, 이름, 인간 유형 태그</span></div>
          <em>{open === 'profile' ? '닫기' : '열기'}</em>
        </button>
        {open === 'profile' && (
          <div className="accordionBody">
            <CharacterPicker form={form} update={update} handlePhoto={photo}/>
            <div style={{ marginTop: '20px' }}>
              <PersonalityTagPicker
                selected={form.personalityTags || []}
                onToggle={(tags) => update('personalityTags', tags)}
                maxSelect={3}
              />
            </div>
            <ProfileFields form={form} update={update} updateVerified={updateVerified}/>
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
            <PersonalityTagPicker
              selected={form.personalityTags || []}
              onToggle={(tags) => update('personalityTags', tags)}
              maxSelect={3}
            />
            <ProfileFields form={form} update={update} updateVerified={updateVerified}/>
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
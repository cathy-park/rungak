import React, { useState, useEffect, useRef } from 'react';
import { bulletLines, scoreLevel } from '../../utils/helpers';
import { STATUS_THEMES, VERDICT_EMOJI } from '../../utils/scoring/verdictRules';
import { characters, AVATAR_BASE } from '../../utils/scoring/scoreOptions';
import { ChevronUp, ChevronDown } from 'lucide-react';
export function Chevron({ isOpen }) {
  return (
    <svg 
      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

export function DetailAccordion({ title, subtitle, children, defaultOpen = false, onEdit }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="accordion" style={{ padding: 0 }}>
      <button type="button" aria-expanded={open} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 20px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }} onClick={() => setOpen(!open)}>
        <div style={{ flex: 1, paddingRight: '12px' }}>
          <b style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>{title}</b>
          {subtitle && <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-3)', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{subtitle}</span>}
        </div>
        <div className="section-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onEdit && (
            <button
              type="button"
              title="이 섹션 수정"
              onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(true); }}
              className="iconButton"
              style={{ width: '32px', height: '32px', background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', padding: '0' }}
            >
              ✏️
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', width: '24px', justifyContent: 'center', color: 'var(--text-2)' }}>
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>
      {open && (
        <div className="accordionBody" style={{ padding: '16px 20px', background: 'var(--surface)', borderTop: '1px solid var(--divider)' }}>
          {children}
        </div>
      )}
    </Card>
  );
}

export function Avatar({ candidate, size = 'md' }) {
  const character = characters.find((item) => item.id === candidate.character) || characters[5];
  if (candidate.photo) return <img className={`avatar ${size}`} src={candidate.photo} alt="profile" />;
  return <img className={`avatar ${size}`} src={`${AVATAR_BASE}/${character.id}.webp`} alt={character.label} onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
}
export function Badge({ children, color = 'gray' }) {
  return <span className={`badge tone-${color}`}>{children}</span>;
}
export function Card({ children, className = '', ...props }) {
  return <section className={`card ${className}`} {...props}>{children}</section>;
}
export function Field({ label, value, onChange, placeholder, type = 'text', textarea = false, rows = 3 }) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
export function SelectField({ label, value, onChange, children }) {
  return (
    <label className="field selectField">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </label>
  );
}

export function BulletTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const textBefore = value.substring(0, cursorPosition);
      const textAfter = value.substring(cursorPosition);
      
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];
      
      if (currentLine === '• ') {
        const newValue = textBefore.substring(0, textBefore.length - 2) + '\n' + textAfter;
        onChange(newValue);
        setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = cursorPosition - 1; }, 0);
        return;
      }
      
      const newValue = textBefore + '\n• ' + textAfter;
      onChange(newValue);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = cursorPosition + 3; }, 0);
    } else if (e.key === 'Backspace') {
      const cursorPosition = e.target.selectionStart;
      if (cursorPosition >= 2) {
        const textBefore = value.substring(0, cursorPosition);
        if (textBefore.endsWith('\n• ')) {
          e.preventDefault();
          const newValue = textBefore.substring(0, textBefore.length - 3) + '\n' + value.substring(cursorPosition);
          onChange(newValue);
          setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = cursorPosition - 2; }, 0);
        } else if (textBefore === '• ') {
          e.preventDefault();
          onChange(value.substring(2));
          setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = 0; }, 0);
        }
      }
    }
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    if (value === '' && newValue.length === 1 && newValue !== '•') {
      newValue = '• ' + newValue;
    }
    onChange(newValue);
  };

  return (
    <label className="field">
      {label && <span>{label}</span>}
      <textarea rows={rows} value={value} onChange={handleChange} onKeyDown={handleKeyDown} placeholder={placeholder} style={{ lineHeight: 1.6 }} />
    </label>
  );
}
export function Toggle({ checked, onChange }) {
  return <button type="button" className={`verify ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>{checked ? '확인됨' : '미확인'}</button>;
}
export function VerifiedInput({ children, checked, onChange }) {
  return <div className="verifiedInput"><div>{children}</div><Toggle checked={checked} onChange={onChange} /></div>;
}
export function Icon({ type }) {
  if (type === 'note') return <svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="4"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/></svg>;
  if (type === 'edit') return <svg viewBox="0 0 24 24"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/></svg>;
  return <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
}
export function ConfirmModal({ message, sub, confirmLabel = '확인', danger = false, onConfirm, onCancel }) {
  const baseButtonStyle = {
    flex: 1,
    height: '48px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box',
    padding: '0 16px',
    width: '100%',
    fontFamily: 'inherit',
  };

  const secondaryStyle = {
    ...baseButtonStyle,
    background: 'var(--bg)',
    border: '1px solid var(--divider)',
    color: 'var(--text-1)',
  };

  const dangerStyle = {
    ...baseButtonStyle,
    background: 'var(--red-light)',
    border: '1px solid var(--red-border)',
    color: 'var(--red-text)',
  };

  const primaryStyle = {
    ...baseButtonStyle,
    background: 'var(--blue)',
    color: '#fff',
  };

  const confirmButtonStyle = danger ? dangerStyle : primaryStyle;

  return (
    <div className="sheetBackdrop confirmBackdrop" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="confirmBox" onClick={e => e.stopPropagation()}>
        <p className="confirmMsg">{message}</p>
        {sub && <p className="confirmSub">{sub}</p>}
        <div className="twoButtons" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button style={secondaryStyle} onClick={onCancel}>취소</button>
          <button style={confirmButtonStyle} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
export function Toast({ message, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast toast-${type}`}>{message}</div>;
}
export function Header({ openGuide }) {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/assets/ico.png" alt="Rungak Lab Logo" style={{ width: '32px', height: '32px', display: 'block', objectFit: 'contain', borderRadius: '8px' }} />
        <div>
          <h1 className="headerTitle">런각 연구소</h1>
          <p className="headerSub">RUN ANGLE LAB</p>
        </div>
      </div>
      <button className="headerSettingBtn" onClick={openGuide} title="설정">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </header>
  );
}
export const CrownIcon = ({ rank }) => {
  const theme = {
    1: { fill: "#FACC15", stroke: "#CA8A04", text: "#854D0E" },
    2: { fill: "#E2E8F0", stroke: "#64748B", text: "#334155" },
    3: { fill: "#FDBA74", stroke: "#B45309", text: "#78350F" },
  }[rank] || { fill: "#FACC15", stroke: "#CA8A04", text: "#854D0E" };

  return (
    <svg className="crownIcon" width="32" height="28" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 19L4.5 8L9 12L12 3L15 12L19.5 8L21 19H3Z" fill={theme.fill} stroke={theme.stroke} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="3" r="1.5" fill={theme.fill} stroke={theme.stroke}/>
      <circle cx="4.5" cy="8" r="1.5" fill={theme.fill} stroke={theme.stroke}/>
      <circle cx="19.5" cy="8" r="1.5" fill={theme.fill} stroke={theme.stroke}/>
      <text x="12" y="16.5" fill={theme.text} fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{rank}</text>
    </svg>
  );
};
export function MiniScore({ label, value, max }) {
  let content = value;
  let cls = '';
  if (max !== undefined) {
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    cls = `scoreText-${scoreLevel(pct).color}`;
    content = <><strong className={cls}>{value}</strong>/{max}</>;
  } else {
    const num = Number(value);
    if (num > 0) cls = 'scoreText-green';
    else if (num < 0) cls = 'scoreText-red';
    content = <strong className={cls}>{num > 0 ? '+' : ''}{value}</strong>;
  }
  return <div className="miniScore"><span>{label}</span><b>{content}</b></div>;
}
export function ScoreCard({ title, value, max, desc }) {
  const percent = Math.round((value / max) * 100);
  const level = scoreLevel(percent);
  return <Card className="scoreCard"><div className="scoreHead"><div><p>{title}</p><strong>{value}<small>/{max}</small></strong></div><div className="right"><Badge color={level.color}>{level.label}</Badge><em>{percent}%</em></div></div><div className="bar"><i className={`tone-bg-${level.color}`} style={{ width: `${percent}%` }} /></div>{desc && <small className="desc">{desc}</small>}</Card>;
}
export const renderRankCrown = (idx) => {
  let fill, stroke, num;
  if (idx === 0) {
    fill = "#FACC15"; // 금색
    stroke = "#EAB308";
    num = "1";
  } else if (idx === 1) {
    fill = "#CBD5E1"; // 은색
    stroke = "#94A3B8";
    num = "2";
  } else if (idx === 2) {
    fill = "#FDBA74"; // 동색
    stroke = "#CA8A04";
    num = "3";
  } else {
    return null;
  }

  return (
    <div className={`heroCrownWrap rank-${num}`}>
      <svg className="heroCrownSvg" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 19L4.5 8L9 12L12 3L15 12L19.5 8L21 19H3Z" fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="12" cy="3" r="1.5" fill={fill} stroke={stroke}/>
        <circle cx="4.5" cy="8" r="1.5" fill={fill} stroke={stroke}/>
        <circle cx="19.5" cy="8" r="1.5" fill={fill} stroke={stroke}/>
        <text x="12" y="15" fill={idx === 1 ? "#475569" : "#78350F"} fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{num}</text>
      </svg>
    </div>
  );
};
export function ScoreRule({ title, score, desc }) {
  return <div className="scoreRule"><div><b>{title}</b><Badge color="blue">{score}</Badge></div><p>{desc}</p></div>;
}
export function FloatingAdd({ onClick }) {
  return <button className="floating" onClick={onClick}><Icon type="add"/></button>;
}
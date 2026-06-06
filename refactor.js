const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');
const lines = code.split('\n');

const startIndex = lines.findIndex(l => l.startsWith('const assetOptions = ['));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('return { title, body, bullets: segments };'));

if (startIndex !== -1 && endIndex !== -1) {
  const endFuncIndex = endIndex + 1; // include the closing brace '}'

  const imports = `import {
  assetOptions, incomeOptions, bodyOptions, bodyFitOptions, marriageOptions, childrenOptions,
  housingOptions, carOptions, smokingOptions, drinkingOptions, religionOptions, goalOptions,
  timelineTypeOptions, feelingOptions, checkStatusOptions, signalOptions, personalityTypeTags,
  energyTagOptions, emotionalBondItems, observationPointPool, greenFlags, yellowFlags, redFlags,
  relationItems, statusTypeKeys, statusLabels, getStatusLabel, coreRelationKeys, coreRelationItems,
  moreRelationItems, verifiedKeys, defaultRelation, defaultEmotionalBond, emptyCandidate, sampleCandidates
} from './utils/scoring/scoreOptions';
import { STATUS_THEMES, STATUS_COPY, VERDICT_EMOJI, getStatusTheme, getStatusCopy, generateHeroCopy } from './utils/scoring/verdictRules';
import { clamp, signalByCode, timelineScore, suggestedSignals } from './utils/scoring/timelineScore';
import { optionScore, optionLabel, calcAge, heightScore, ageScore, verified, recommendJobStability, analyze } from './utils/scoring/analyzeCandidate';

function getDaysAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return '예정';
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return \`\${diffDays}일 전\`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return \`\${diffWeeks}주 전\`;
    const diffMonths = Math.floor(diffDays / 30);
    return \`\${diffMonths}달 전\`;
  } catch (e) {
    return '';
  }
}

function compressBase64Image(base64Str, maxWidth = 120, maxHeight = 120, quality = 0.6) {
  return new Promise((resolve) => {
    if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }
    
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

function migrateTextToItems(text, type = 'fixed') {
  if (!text || typeof text !== 'string') return [];
  return text
    .split('\\n')
    .map(line => line.replace(/^[•\\-\\*]\\s*/, '').trim())
    .filter(Boolean)
    .map((line, idx) => ({
      id: Date.now() - Math.floor(Math.random() * 100000) - idx,
      text: line,
      ...(type === 'check' ? { status: 'unchecked' } : {})
    }));
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function bulletLines(text = '') {
  return String(text)
    .split('\\n')
    .map((line) => line.trim().replace(/^[-•]\\s*/, ''))
    .filter(Boolean);
}`;

  const newLines = [
    ...lines.slice(0, startIndex),
    imports,
    ...lines.slice(endFuncIndex + 1)
  ];
  fs.writeFileSync('src/App.jsx', newLines.join('\n'));
  console.log('Refactor successful. Removed lines', startIndex, 'to', endFuncIndex);
} else {
  console.log('Failed to find start or end index', startIndex, endIndex);
}

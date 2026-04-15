<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>IPA Check</title>
<style>
body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #eee; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #444; padding: 4px 8px; text-align: left; }
th { background: #333; }
.pass { color: #4ade80; }
.fail { color: #f87171; background: rgba(248,113,113,0.1); }
.warn { color: #fbbf24; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.counts span { margin-right: 20px; }
input { padding: 6px 12px; font-size: 14px; background: #333; color: #eee; border: 1px solid #555; border-radius: 6px; }
#summary { margin-bottom: 12px; font-size: 14px; }
</style>
</head>
<body>
<div header>
  <h2>PU2/PU3 音节-字母匹配检查</h2>
  <input type="text" id="filter" placeholder="Filter words..." oninput="render()">
</div>
<div id="summary"></div>
<div id="app"></div>
<script type="module">
import { PU2_VOCAB } from './web/src/data/pu2_vocab.js';
import { PU3_VOCAB } from './web/src/data/pu3_vocab.js';

// Build word list
const VOCAB = { ...PU2_VOCAB, ...PU3_VOCAB };
const allWords = [];
for (const unitKey in VOCAB) {
  const unit = VOCAB[unitKey];
  for (const w of (unit.words || [])) {
    allWords.push({ unitKey, word: w.word, phonetic: w.phonetic || '' });
  }
}

// VOWEL_PHONEMES from App.jsx (line 117)
const VOWEL_PHONEMES = [
  'iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə',
  'ɑː','ɔː','ɜː','ɪ','ʊ','uː','e','æ','ʌ','ə','ɒ','ɔ','ɑ',
];

function getVowels(phonetic) {
  const stripped = phonetic.replace(/[\/\[\]]/g, '');
  const vowels = [];
  let pos = 0;
  while (pos < stripped.length) {
    const ch = stripped[pos];
    if (ch === 'ˈ' || ch === 'ˌ') { pos++; continue; }
    let matched = false;
    for (const vp of VOWEL_PHONEMES) {
      if (stripped.slice(pos, pos + vp.length) === vp) {
        vowels.push({ ipa: vp, pos });
        pos += vp.length;
        matched = true;
        break;
      }
    }
    if (!matched) pos++;
  }
  return vowels;
}

function splitSyllables(word, phonetic) {
  if (!phonetic) return [{ letters: word, ipa: '' }];
  const vowels = getVowels(phonetic);
  const stripped = phonetic.replace(/[\/\[\]]/g, '');
  if (vowels.length === 0) return [{ letters: word, ipa: '' }];
  if (vowels.length === 1) return [{ letters: word, ipa: phonetic }];

  const syllableIpas = [];
  let prevPos = 0;
  for (let i = 1; i < vowels.length; i++) {
    const gapStart = vowels[i-1].pos + vowels[i-1].ipa.length;
    const gapEnd = vowels[i].pos;
    const gap = stripped.slice(gapStart, gapEnd).replace(/[ˈˌ]/g, '');
    const gapLen = gap.length;
    if (gapLen === 0) {
      syllableIpas.push(stripped.slice(prevPos, gapStart));
      prevPos = gapStart;
    } else if (gapLen === 1) {
      syllableIpas.push(stripped.slice(prevPos, gapStart));
      prevPos = gapStart;
    } else if (gapLen === 2) {
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1));
      prevPos = gapStart + 1;
    } else {
      const mid = Math.floor(gapLen / 2);
      const actualSplit = gapStart + mid;
      syllableIpas.push(stripped.slice(prevPos, actualSplit));
      prevPos = actualSplit;
    }
  }
  syllableIpas.push(stripped.slice(prevPos));

  // Letter allocation by IPA length
  const ipaLengths = syllableIpas.map(ipa => ipa.replace(/[ˈˌ]/g, '').length);
  const totalIpaLen = ipaLengths.reduce((a, b) => a + b, 0);
  if (totalIpaLen === 0) return [{ letters: word, ipa: phonetic }];

  const wordClean = word.replace(/ /g, '');
  let letterCounts = ipaLengths.map(len => Math.round(len / totalIpaLen * wordClean.length));
  const diff = wordClean.length - letterCounts.reduce((a, b) => a + b, 0);
  if (diff > 0) {
    for (let j = 0; j < diff; j++) letterCounts[j % letterCounts.length]++;
  } else if (diff < 0) {
    for (let j = 0; j < Math.abs(diff); j++) {
      for (let k = 0; k < letterCounts.length; k++) {
        if (letterCounts[k] > 1) { letterCounts[k]--; break; }
      }
    }
  }

  const result = [];
  let wPos = 0;
  for (let i = 0; i < syllableIpas.length; i++) {
    const letters = wordClean.slice(wPos, wPos + letterCounts[i]);
    wPos += letterCounts[i];
    result.push({ letters, ipa: '/' + syllableIpas[i] + '/' });
  }
  return result;
}

function analyzeWord(word, phonetic) {
  const syllables = splitSyllables(word, phonetic);
  const vowels = getVowels(phonetic);
  const stripped = phonetic.replace(/[\/\[\]]/g, '');
  const wordClean = word.replace(/ /g, '');
  const ipaClean = stripped.replace(/[ˈˌ]/g, '');
  const totalIpa = ipaClean.length;
  const totalLetters = wordClean.length;
  const numIpaVowels = vowels.length;
  const numSyllables = syllables.length;

  const issues = [];

  // Rule 1: Vowel count vs syllable count
  if (numIpaVowels !== numSyllables) {
    issues.push(`IPA元音${numIpaVowels}≠音节${numSyllables}`);
  }

  // Rule 2: Overall ratio
  if (totalIpa > 0) {
    const ratio = totalLetters / totalIpa;
    if (ratio < 0.8 || ratio > 1.3) {
      issues.push(`字母/IPA比例${ratio.toFixed(2)}异常`);
    }
  }

  // Rule 3: Per-syllable suspicious ratio
  for (let i = 0; i < syllables.length; i++) {
    const sylIpa = syllables[i].ipa.replace(/[\/ˈˌ]/g, '');
    const sylLenIpa = sylIpa.length;
    const sylLenLetters = syllables[i].letters.length;
    if (sylLenIpa > 0 && sylLenLetters > 0) {
      const r = sylLenLetters / sylLenIpa;
      if (r < 0.4 || r > 3.0) {
        issues.push(`音节${i+1} [${syllables[i].letters}]/${sylIpa}=${r.toFixed(1)}可疑`);
      }
    }
    if (sylLenIpa > 0 && sylLenLetters === 0) {
      issues.push(`音节${i+1} IPA有但字母为空`);
    }
  }

  return { word, phonetic, syllables, issues, numIpaVowels, numSyllables, totalLetters, totalIpa };
}

const results = allWords.map(w => analyzeWord(w.word, w.phonetic));
const problems = results.filter(r => r.issues.length > 0);

document.getElementById('summary').innerHTML =
  `<b>总计:</b> ${allWords.length} 词 | <span class="fail">问题: ${problems.length} 词</span> | <span class="pass">正常: ${allWords.length - problems.length} 词</span>`;

let filter = '';
const filterEl = document.getElementById('filter');
filterEl.addEventListener('input', e => { filter = e.target.value.toLowerCase(); render(); });

function render() {
  const filtered = filter
    ? results.filter(r => r.word.toLowerCase().includes(filter) || r.issues.some(i => i.includes(filter)))
    : results;

  const app = document.getElementById('app');
  if (!filter) {
    // Show only problems
    const toShow = filtered.filter(r => r.issues.length > 0);
    app.innerHTML = `<h3>问题词汇 (${toShow.length})</h3>
      <table>
        <tr><th>单词</th><th>音标</th><th>问题</th><th>分割结果</th></tr>
        ${toShow.map(r => `<tr class="fail">
          <td>${r.word}</td>
          <td>${r.phonetic}</td>
          <td>${r.issues.join('<br>')}</td>
          <td>${r.syllables.map(s => `[${s.letters}]→${s.ipa}`).join(' | ')}</td>
        </tr>`).join('')}
      </table>`;
  } else {
    // Show all filtered
    app.innerHTML = `<h3>搜索: "${filter}" (${filtered.length})</h3>
      <table>
        <tr><th>单词</th><th>音标</th><th>状态</th><th>分割结果</th></tr>
        ${filtered.map(r => `<tr class="${r.issues.length ? 'fail' : 'pass'}">
          <td>${r.word}</td>
          <td>${r.phonetic}</td>
          <td>${r.issues.length ? r.issues[0] : '✓ 正常'}</td>
          <td>${r.syllables.map(s => `[${s.letters}]→${s.ipa}`).join(' | ')}</td>
        </tr>`).join('')}
      </table>`;
  }
}

render();
</script>
</body>
</html>

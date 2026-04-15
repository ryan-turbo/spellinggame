import fs from 'fs';

// 读取词汇数据
const pu2 = fs.readFileSync('F:/pu-spelling-game/web/src/data/pu2_vocab.js', 'utf-8');
const pu3 = fs.readFileSync('F:/pu-spelling-game/web/src/data/pu3_vocab.js', 'utf-8');

// 提取词组
const phraseRegex = /word: "([^"]+ [^"]+)".*?phonetic: "([^"]+)"/g;
const phrases = [];

let match;
while ((match = phraseRegex.exec(pu2 + pu3)) !== null) {
  phrases.push({ word: match[1], phonetic: match[2] });
}

console.log('Checking ' + phrases.length + ' multi-word phrases...\n');

const V=['iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə','ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u'];

function countVowels(ipa) {
  const st = ipa.replace(/[\[\]\/]/g, '');
  let count = 0;
  let pos = 0;
  while (pos < st.length) {
    if (st[pos] === 'ˈ' || st[pos] === 'ˌ') { pos++; continue; }
    let matched = false;
    for (const vp of V) {
      if (st.slice(pos, pos + vp.length) === vp) {
        count++;
        pos += vp.length;
        matched = true;
        break;
      }
    }
    if (!matched) pos++;
  }
  return count;
}

let issues = [];
for (const p of phrases) {
  const wordLetters = p.word.replace(/ /g, '').length;
  const ipaClean = p.phonetic.replace(/[\[\]\/]/g, '');
  const vowelCount = countVowels(p.phonetic);
  
  // 检查 IPA 中的空格数是否匹配词组单词数
  const wordParts = p.word.split(' ').length;
  const ipaParts = ipaClean.split(/\s+/).length;
  
  if (wordParts !== ipaParts) {
    issues.push({
      word: p.word,
      issue: `word has ${wordParts} parts but IPA has ${ipaParts}`,
      phonetic: p.phonetic
    });
  }
}

if (issues.length === 0) {
  console.log('All multi-word phrases OK!');
} else {
  console.log('Issues found:\n');
  for (const i of issues) {
    console.log(i.word + ': ' + i.issue);
    console.log('  phonetic: ' + i.phonetic);
    console.log('');
  }
}

// 测试修改后的逻辑

function splitSyllablesSimple(word, phonetic) {
  if (!phonetic) return [{ letters: word, ipa: '' }]

  const stripped = phonetic.replace(/[\[\]\/]/g, '')

  // 元音列表
  const VOWEL_PHONEMES = [
    'iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə',
    'ɑː','ɔː','uː','ɜː',
    'ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ',
    'a','i','o','u'
  ]

  // 扫描 IPA，提取元音位置
  const vowelUnits = []
  let pos = 0
  while (pos < stripped.length) {
    if (stripped[pos] === 'ˈ' || stripped[pos] === 'ˌ') { pos++; continue }
    let matched = false
    for (const vp of VOWEL_PHONEMES) {
      if (stripped.slice(pos, pos + vp.length) === vp) {
        vowelUnits.push({ ipa: vp, charPos: pos })
        pos += vp.length
        matched = true
        break
      }
    }
    if (!matched) pos++
  }

  if (vowelUnits.length === 0) return [{ letters: word, ipa: '' }]
  if (vowelUnits.length === 1) return [{ letters: word, ipa: phonetic }]

  // 按元音边界切分 IPA
  const syllableIpas = []
  let prevPos = 0
  for (let i = 1; i < vowelUnits.length; i++) {
    const gapStart = vowelUnits[i - 1].charPos + vowelUnits[i - 1].ipa.length
    const gapEnd = vowelUnits[i].charPos
    const gap = stripped.slice(gapStart, gapEnd)
    const numCons = gap.replace(/[ˈˌ]/g, '').length

    if (numCons === 0) {
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1))
      prevPos = gapStart + 1
    } else if (numCons === 1) {
      syllableIpas.push(stripped.slice(prevPos, gapStart))
      prevPos = gapStart
    } else if (numCons === 2) {
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1))
      prevPos = gapStart + 1
    } else {
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1))
      prevPos = gapStart + 1
    }
  }
  syllableIpas.push(stripped.slice(prevPos))

  // 比例法分配字母
  const wordLower = word.replace(/ /g, '').toLowerCase()
  const ipaLengths = syllableIpas.map(ip => ip.replace(/[ˈˌ]/g, '').length)
  const totalIpa = ipaLengths.reduce((a, b) => a + b, 0)
  
  let letterSyllables = []
  if (totalIpa > 0) {
    let counts = ipaLengths.map(l => Math.round(l / totalIpa * wordLower.length))
    const diff = wordLower.length - counts.reduce((a, b) => a + b, 0)
    if (diff > 0) counts[counts.length - 1] += diff
    if (diff < 0) counts[counts.length - 1] += diff
    let wPos = 0
    for (const cnt of counts) {
      letterSyllables.push(wordLower.slice(wPos, wPos + cnt))
      wPos += cnt
    }
  }

  return syllableIpas.map((ipa, i) => ({
    letters: letterSyllables[i] || '',
    ipa: '/' + ipa + '/'
  }))
}

// 测试
const testCases = [
  { word: 'Tuesday', ipa: '/ˈtjuːzdeɪ/' },
  { word: 'Wednesday', ipa: '/ˈwenzdeɪ/' },
  { word: 'Thursday', ipa: '/ˈθɜːzdeɪ/' },
  { word: 'Friday', ipa: '/ˈfraɪdeɪ/' },
  { word: 'Saturday', ipa: '/ˈsætədeɪ/' },
  { word: 'day', ipa: '/deɪ/' },
  { word: 'library', ipa: '/ˈlaɪbrəri/' },
  { word: 'strawberry', ipa: '/ˈstrɔːbəri/' },
];

console.log('=== 音节划分测试（比例法）===\n');
for (const { word, ipa } of testCases) {
  const result = splitSyllablesSimple(word, ipa);
  console.log(`${word} (${ipa}):`);
  result.forEach((s, i) => {
    console.log(`  音节${i + 1}: letters="${s.letters}" (${s.letters.length}字母) ipa="${s.ipa}"`);
  });
  const totalLetters = result.reduce((sum, s) => sum + s.letters.length, 0);
  console.log(`  总字母数: ${totalLetters} (应为 ${word.length})`);
  console.log();
}

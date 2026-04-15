// 验证修复后的 DVD 和 CD

function splitSyllables(word, phonetic) {
  if (!phonetic) return [{ letters: word, ipa: '' }]

  const wordParts = word.split(' ')
  if (wordParts.length > 1) {
    const ipaParts = phonetic.replace(/[\[\]\/]/g, '').split(/\s+/)
    const results = []
    for (let i = 0; i < wordParts.length; i++) {
      const ipa = ipaParts[i] || ''
      const syllables = splitSyllables(wordParts[i], '/' + ipa + '/')
      results.push(...syllables)
    }
    return results
  }

  const stripped = phonetic.replace(/[\[\]\/]/g, '')
  const VOWEL_PHONEMES = [
    'iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə',
    'ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u'
  ]

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
    } else {
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1))
      prevPos = gapStart + 1
    }
  }
  syllableIpas.push(stripped.slice(prevPos))

  const wordLower = word.toLowerCase()
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
  { word: 'watch a DVD', ipa: '/wɒtʃ ə ˌdiː viː ˈdiː/' },
  { word: 'listen to a CD', ipa: '/ˈlɪsən tə ə ˌsiː ˈdiː/' },
];

console.log('=== 修复后的 IPA 测试 ===\n');
for (const { word, ipa } of testCases) {
  const result = splitSyllables(word, ipa);
  console.log(`${word} (${ipa}):`);
  result.forEach((s, i) => {
    console.log(`  音节${i + 1}: letters="${s.letters}" ipa="${s.ipa}"`);
  });
  console.log();
}

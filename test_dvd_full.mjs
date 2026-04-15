// 测试 DVD 单独处理

function splitSyllables(word, phonetic) {
  if (!phonetic) return [{ letters: word, ipa: '' }]

  const wordParts = word.split(' ')
  if (wordParts.length > 1) {
    const ipaParts = phonetic.replace(/[\[\]\/]/g, '').split(/\s+/)
    const results = []
    
    if (ipaParts.length > wordParts.length) {
      const mergedIpaParts = []
      let ipaIdx = 0
      for (let wIdx = 0; wIdx < wordParts.length; wIdx++) {
        if (wIdx === wordParts.length - 1) {
          mergedIpaParts.push(ipaParts.slice(ipaIdx).join(' '))
        } else {
          mergedIpaParts.push(ipaParts[ipaIdx] || '')
          ipaIdx++
        }
      }
      for (let i = 0; i < wordParts.length; i++) {
        const ipa = mergedIpaParts[i] || ''
        const ipaWithSlashes = ipa ? '/' + ipa + '/' : ''
        const syllables = splitSyllables(wordParts[i], ipaWithSlashes)
        results.push(...syllables)
      }
    } else {
      for (let i = 0; i < wordParts.length; i++) {
        const ipa = ipaParts[i] || ''
        const ipaWithSlashes = ipa ? '/' + ipa + '/' : ''
        const syllables = splitSyllables(wordParts[i], ipaWithSlashes)
        results.push(...syllables)
      }
    }
    return results
  }

  // 单词处理
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

  // 按元音边界切分
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

// 测试 DVD 单独
console.log('=== DVD 单独处理 ===');
const dvdResult = splitSyllables('DVD', '/ˌdiː viː ˈdiː/');
console.log('DVD:', dvdResult);

// 测试 watch a DVD
console.log('\n=== watch a DVD ===');
const fullResult = splitSyllables('watch a DVD', '/wɒtʃ ə ˌdiː viː ˈdiː/');
console.log('watch a DVD:', fullResult);

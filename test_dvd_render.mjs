// 完整模拟 LetterInput 组件的渲染逻辑

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

// 模拟 LetterInput 渲染
function simulateLetterInputRender(word, phonetic) {
  const syllables = splitSyllables(word, phonetic)
  console.log(`\n单词: "${word}"`)
  console.log(`音标: ${phonetic}`)
  console.log(`\nsyllables 数组:`)
  syllables.forEach((s, i) => console.log(`  [${i}] letters="${s.letters}" ipa="${s.ipa}"`))

  // 展平为各字母的元数据
  let globalIdx = 0
  const flat = []
  syllables.forEach(syl => {
    for (const ch of syl.letters) {
      flat.push({ ch: ch.toLowerCase(), globalIdx: globalIdx++ })
    }
  })
  console.log(`\nflat 数组 (所有字母):`)
  flat.forEach(f => console.log(`  [${f.globalIdx}] "${f.ch}"`))

  // 计算每个音节组含多少个字母格
  let letterCount = 0
  const sylBoxes = syllables.map((syl, idx) => {
    const count = syl.letters.length
    const boxes = []
    const startIdx = letterCount
    for (let j = 0; j < count; j++) {
      const gi = letterCount++
      boxes.push(`[input ${gi} for "${flat[gi].ch}"]`)
    }
    console.log(`\nsylBoxes[${idx}]:`)
    console.log(`  音节: "${syl.letters}"`)
    console.log(`  IPA: ${syl.ipa}`)
    console.log(`  输入框: ${boxes.join(', ')}`)
    return { boxes, ipa: syl.ipa, sylIdx: idx }
  })

  // 模拟渲染
  console.log(`\n=== 渲染结果 ===`)
  syllables.forEach((syl, si) => {
    console.log(`\n<div class="syllable-group"> (索引 ${si})`)
    console.log(`  <span class="syllable-ipa">${syl.ipa}</span>`)
    console.log(`  <div class="syllable-boxes">`)
    if (sylBoxes[si]) {
      sylBoxes[si].boxes.forEach(box => console.log(`    ${box}`))
    }
    console.log(`  </div>`)
    console.log(`</div>`)
  })
}

// 测试 watch a DVD
simulateLetterInputRender('watch a DVD', '/wɒtʃ ə ˌdiːviːˈdiː/')

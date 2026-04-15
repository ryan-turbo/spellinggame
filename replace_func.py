# -*- coding: utf-8 -*-
"""Replace splitSyllables function in App.jsx"""
import re

new_func = r"""// ─── 音节分组建构（辅音边界切分 + 元音感知分配）─────────
/**
 * 将单词按音节拆分成 [{letters, ipa}] 数组
 * 核心：先找 IPA 元音边界切分 IPA；再用"辅音字母组优先"策略切分字母
 */
const splitSyllables = (word, phonetic) => {
  if (!phonetic) return [{ letters: word, ipa: '' }]

  const stripped = phonetic.replace(/[\[\]\/]/g, '')

  // ── 元音列表（按长度降序）──────────────────────────────
  const VOWEL_PHONEMES = [
    'iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə',
    'ɑː','ɔː','uː','ɜː',
    'ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ',
    'a','i','o','u'
  ]

  // ── 扫描 IPA，提取元音位置 ───────────────────────────
  const vowelUnits = [] // [{ipa, charPos}]
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

  // ── 第一步：按元音边界切分 IPA ──────────────────────────
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
      syllableIpas.push(stripped.slice(prevPos, gapStart + Math.ceil(numCons / 2)))
      prevPos = gapStart + Math.ceil(numCons / 2)
    }
  }
  syllableIpas.push(stripped.slice(prevPos))

  // ── 第二步：辅音字母组边界切分字母 ─────────────────────
  // IPA 辅音映射表：字母组合 → IPA（用于从字母匹配 IPA）
  const CONSONANT_MAP = [
    { letters: 'sh', ipa: 'ʃ' }, { letters: 'ch', ipa: 'tʃ' }, { letters: 'tch', ipa: 'tʃ' },
    { letters: 'th', ipa: 'θ' }, { letters: 'ph', ipa: 'f' }, { letters: 'wh', ipa: 'w' },
    { letters: 'wr', ipa: 'r' }, { letters: 'kn', ipa: 'n' }, { letters: 'ng', ipa: 'ŋ' },
    { letters: 'ck', ipa: 'k' }, { letters: 'sc', ipa: 's' }, { letters: 'st', ipa: '' },
    { letters: 'str', ipa: '' }, { letters: 'spl', ipa: '' }, { letters: 'squ', ipa: '' },
    { letters: 'sch', ipa: 'sk' },
    // 单辅音
    { letters: 'b', ipa: 'b' }, { letters: 'c', ipa: 'k' }, { letters: 'd', ipa: 'd' },
    { letters: 'f', ipa: 'f' }, { letters: 'g', ipa: 'g' }, { letters: 'h', ipa: 'h' },
    { letters: 'j', ipa: 'dʒ' }, { letters: 'k', ipa: 'k' }, { letters: 'l', ipa: 'l' },
    { letters: 'm', ipa: 'm' }, { letters: 'n', ipa: 'n' }, { letters: 'p', ipa: 'p' },
    { letters: 'qu', ipa: 'kw' }, { letters: 'r', ipa: 'r' }, { letters: 's', ipa: 's' },
    { letters: 't', ipa: 't' }, { letters: 'v', ipa: 'v' }, { letters: 'w', ipa: 'w' },
    { letters: 'x', ipa: 'ks' }, { letters: 'y', ipa: 'j' }, { letters: 'z', ipa: 'z' },
  ]

  /**
   * 在字母串 l[pos] 位置，尝试匹配一个 IPA 音素
   * @returns {{consumedIpa: number, consumedLetter: number}}
   */
  function matchOne(letters, pos, ipa) {
    if (pos >= letters.length || ipa.length === 0) return { consumedIpa: 0, consumedLetter: 0 }

    // 1. 辅音 digraph（优先最长匹配）
    for (const { letters: dl, ipa: di } of CONSONANT_MAP) {
      if (letters.slice(pos, pos + dl.length).toLowerCase() === dl) {
        if (!di) {
          // 不发辅音：跳过字母，不消耗 IPA
          return { consumedIpa: 0, consumedLetter: dl.length }
        }
        if (ipa.startsWith(di)) {
          return { consumedIpa: di.length, consumedLetter: dl.length }
        }
      }
    }

    // 2. 元音字母（IPA 必以元音开头）
    const lc = letters[pos]
    if ('aeiou'.includes(lc)) {
      const vowelCombos = [
        { letters: 'ou', ipa: ['aʊ', 'əʊ', 'ʌ'] },
        { letters: 'ow', ipa: ['aʊ', 'əʊ'] },
        { letters: 'oo', ipa: ['uː', 'ʊ'] },
        { letters: 'ee', ipa: ['iː'] },
        { letters: 'ea', ipa: ['iː', 'e', 'eɪ'] },
        { letters: 'ai', ipa: ['eɪ'] }, { letters: 'ay', ipa: ['eɪ'] },
        { letters: 'oy', ipa: ['ɔɪ'] }, { letters: 'oi', ipa: ['ɔɪ'] },
        { letters: 'ie', ipa: ['aɪ', 'iː'] }, { letters: 'au', ipa: ['ɔː'] },
        { letters: 'aw', ipa: ['ɔː'] }, { letters: 'ar', ipa: ['ɑː', 'ɒ'] },
        { letters: 'or', ipa: ['ɔː', 'ɜː'] }, { letters: 'er', ipa: ['ɜː'] },
        { letters: 'ir', ipa: ['ɜː'] }, { letters: 'ur', ipa: ['ɜː'] },
        { letters: 'ear', ipa: ['ɪə', 'ɜː'] }, { letters: 'air', ipa: ['eə'] },
        { letters: 'a', ipa: ['ɑː', 'æ', 'ɒ', 'eɪ'] },
        { letters: 'e', ipa: ['e', 'iː', 'eɪ'] },
        { letters: 'i', ipa: ['ɪ', 'aɪ', 'iː'] },
        { letters: 'o', ipa: ['ɒ', 'əʊ', 'ʌ'] },
        { letters: 'u', ipa: ['ʌ', 'ʊ', 'uː', 'ə'] },
      ]
      for (const { letters: vl, ipa: va } of vowelCombos) {
        if (letters.slice(pos, pos + vl.length).toLowerCase() === vl) {
          for (const ipaSeq of va) {
            if (ipa.startsWith(ipaSeq)) {
              return { consumedIpa: ipaSeq.length, consumedLetter: vl.length }
            }
          }
        }
      }
    }

    return { consumedIpa: 0, consumedLetter: 0 }
  }

  /**
   * 将字母串按 IPA 片段分配
   */
  function allocateLetters(letters, syllableIpas) {
    const result = []
    let lPos = 0

    for (let si = 0; si < syllableIpas.length; si++) {
      const ipa = syllableIpas[si].replace(/[ˈˌ]/g, '')
      let syllLetters = ''
      let iPos = 0

      while (iPos < ipa.length && lPos < letters.length) {
        const { consumedIpa, consumedLetter } = matchOne(letters, lPos, ipa.slice(iPos))
        if (consumedLetter > 0) {
          syllLetters += letters.slice(lPos, lPos + consumedLetter)
          lPos += consumedLetter
          iPos += consumedIpa
        } else {
          // 无法规则匹配：跳过 IPA 一个字符（它没有对应字母，如部分 schwa）
          iPos++
        }
      }

      // 剩余字母归此音节（最后一个音节吞掉所有剩余）
      if (si === syllableIpas.length - 1 && lPos < letters.length) {
        syllLetters += letters.slice(lPos)
        lPos = letters.length
      }

      result.push(syllLetters)
    }

    return result
  }

  const wordLower = word.replace(/ /g, '').toLowerCase()
  let letterSyllables = allocateLetters(wordLower, syllableIpas)

  // 兜底：若规则分配总量不对，用比例法
  const totalAllocated = letterSyllables.join('').length
  if (totalAllocated !== wordLower.length) {
    const ipaLengths = syllableIpas.map(ip => ip.replace(/[ˈˌ]/g, '').length)
    const totalIpa = ipaLengths.reduce((a, b) => a + b, 0)
    if (totalIpa > 0) {
      let counts = ipaLengths.map(l => Math.round(l / totalIpa * wordLower.length))
      const diff = wordLower.length - counts.reduce((a, b) => a + b, 0)
      if (diff > 0) counts[counts.length - 1] += diff
      if (diff < 0) counts[counts.length - 1] += diff
      let wPos = 0
      letterSyllables.length = 0
      for (const cnt of counts) {
        letterSyllables.push(wordLower.slice(wPos, wPos + cnt))
        wPos += cnt
      }
    }
  }

  return syllableIpas.map((ipa, i) => ({
    letters: letterSyllables[i] || '',
    ipa: '/' + ipa + '/'
  }))
}
"""

# Read the file
with open('web/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the function
# Pattern: from "// ─── 音节分组建构（IPA元音扫描..." to the closing of splitSyllables
start_pattern = r'// ─── 音节分组建构（IPA元音扫描'
# Find start of function
start_idx = content.find(start_pattern)
if start_idx == -1:
    print("ERROR: Could not find start of splitSyllables function")
    print("Searching for alternative...")
    # Try to find by function name
    alt = content.find('const splitSyllables')
    print(f"Found 'const splitSyllables' at: {alt}")
    # Find the comment before it
    before = content.rfind('//', 0, alt)
    start_idx = before

# Find end: look for the next top-level function (starts at column 0 after some whitespace)
# The function ends before "const shuffle"
# Find "// ─── 通用工具 ─"
end_pattern = '// ─── 通用工具 ─'
end_idx = content.find(end_pattern, start_idx)

if start_idx == -1 or end_idx == -1:
    print(f"ERROR: start={start_idx}, end={end_idx}")
    import sys; sys.exit(1)

print(f"Replacing lines {content[:start_idx].count(chr(10))+1} to {content[:end_idx].count(chr(10))+1}")
print(f"Old text length: {end_idx - start_idx}")
print(f"New text length: {len(new_func)}")

# Replace
new_content = content[:start_idx] + new_func + '\n\n' + content[end_idx:]

with open('web/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")

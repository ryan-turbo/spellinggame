import { useState, useEffect, useCallback, useRef } from 'react'
import { VOCAB as PU2_VOCAB } from './data/pu2_vocab'
import { PU3_VOCAB } from './data/pu3_vocab'
import { recordGameResult, loadStats } from './pages/StatsPage'

// PU2 + PU3 合并（key 已改为 pu2u1-pu2u9, pu3u1-pu3u9）
const VOCAB = { ...PU2_VOCAB, ...PU3_VOCAB }
const getAllWordsForVocab = (key) => VOCAB[key]?.words || []
const getVocabData = (key) => VOCAB[key] || {}
import StatsPage from './pages/StatsPage'
import './App.css'

// ─── 工具 ───────────────────────────────────────────────
const speak = (text) => {
  // 优先播放预录制的 mp3 音频（en-GB-RyanNeural）
  const audio = new Audio(`/audio/${encodeURIComponent(text)}.mp3`)
  audio.onerror = () => {
    // mp3 不存在时降级到系统 TTS
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const preferred = ['Google UK English Male','Google UK English Female','Microsoft George','Microsoft Hazel','Daniel','Microsoft David']
    for (const name of preferred) {
      const v = voices.find(vo => vo.name.includes(name))
      if (v) { u.voice = v; break }
    }
    u.lang = 'en-GB'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  }
  audio.play().catch(() => {})
}

// ─── 键盘打字音效 ────────────────────────────────────────
let _audioCtx = null
let _audioCtxReady = false

const getAudioCtx = () => {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  // 浏览器 autoplay 策略：需要用户交互后才能 resume
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().then(() => { _audioCtxReady = true }).catch(() => {})
  } else {
    _audioCtxReady = true
  }
  return _audioCtx
}

// 初始化音频上下文（用户首次交互时调用）
const initAudio = () => {
  try {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    _audioCtxReady = true
  } catch {}
}

const playKeySound = (pitch = 1) => {
  if (!_audioCtxReady) return
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012))
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filt = ctx.createBiquadFilter()
    filt.type = 'bandpass'
    filt.frequency.value = 1800 * pitch
    filt.Q.value = 3
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.45, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    src.connect(filt).connect(gain).connect(ctx.destination)
    src.start(now)
    src.stop(now + 0.06)
  } catch {}
}

const playCorrectSound = () => {
  if (!_audioCtxReady) return
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    [[329.63, 0], [392.0, 0.08], [523.25, 0.16]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0.45, now + delay)
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4)
      osc.connect(g).connect(ctx.destination)
      osc.start(now + delay)
      osc.stop(now + delay + 0.4)
    })
  } catch {}
}

// ─── 音节分组建构（辅音边界切分 + 元音感知分配）─────────
/**
 * 将单词按音节拆分成 [{letters, ipa}] 数组
 * 核心：先找 IPA 元音边界切分 IPA；再用"辅音字母组优先"策略切分字母
 */
const splitSyllables = (word, phonetic) => {
  if (!phonetic) return [{ letters: word, ipa: '' }]

  // ── 多词组处理：按空格分割，递归调用 ───────────────────
  const wordParts = word.split(' ')
  if (wordParts.length > 1) {
    // IPA 也按空格分割（如 /hæv ə ˈʃaʊə/ → ['hæv', 'ə', 'ˈʃaʊə']）
    const ipaParts = phonetic.replace(/[\[\]\/]/g, '').split(/\s+/)
    const results = []
    
    // 如果 IPA 部分多于单词部分，需要合并多余的 IPA
    // 例如: watch a DVD → 3个词，但 IPA 有 5 部分
    // 需要把 DVD 对应的 IPA 部分合并
    if (ipaParts.length > wordParts.length) {
      const mergedIpaParts = []
      let ipaIdx = 0
      for (let wIdx = 0; wIdx < wordParts.length; wIdx++) {
        // 计算当前单词需要的 IPA 部分数量
        // 简单启发式：最后一个单词获取所有剩余的 IPA 部分
        if (wIdx === wordParts.length - 1) {
          // 最后一个单词：合并剩余所有 IPA
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
      // 正常情况：IPA 部分数量等于或少于单词数量
      for (let i = 0; i < wordParts.length; i++) {
        const ipa = ipaParts[i] || ''
        const ipaWithSlashes = ipa ? '/' + ipa + '/' : ''
        const syllables = splitSyllables(wordParts[i], ipaWithSlashes)
        results.push(...syllables)
      }
    }
    return results
  }

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
      // 3+ 个辅音：第一辅音归前音节，其余归后音节（onset maximization）
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1))
      prevPos = gapStart + 1
    }
  }
  syllableIpas.push(stripped.slice(prevPos))

  // ── 后处理：若首个音节 IPA 无元音音素（如 "wedn|esday" 中的 "wedn"）
  // 则合并到下一音节（确保首音节有元音支撑字母分配）
  const vowelPhonemes = ['iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə','ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u']
  const hasVowel = (ipa) => vowelPhonemes.some(v => ipa.includes(v))
  if (syllableIpas.length >= 2 && !hasVowel(syllableIpas[0])) {
    syllableIpas[1] = syllableIpas[0] + syllableIpas[1]
    syllableIpas.shift()
  }

  // ── 第二步：辅音字母组边界切分字母 ─────────────────────
  // IPA 辅音映射表：字母/digraph → IPA（字母→IPA，用于从字母串中匹配 IPA）
  // 注意：同一 IPA 可能对应多个字母组合（如 k=c/k/ck/ch）
  const CONSONANT_MAP = [
    // 双字母 digraph
    { letters: 'sh', ipa: 'ʃ' }, { letters: 'ch', ipa: 'tʃ' }, { letters: 'th', ipa: 'θ' },
    { letters: 'ph', ipa: 'f' }, { letters: 'wh', ipa: 'w' }, { letters: 'wr', ipa: 'r' },
    { letters: 'kn', ipa: 'n' }, { letters: 'ng', ipa: 'ŋ' }, { letters: 'ck', ipa: 'k' },
    { letters: 'sc', ipa: 's' }, { letters: 'gh', ipa: '' }, // gh 不发音（night）或发 f（laugh）
    { letters: 'mb', ipa: 'm' }, // mb 尾 m（climb）
    // 单辅音
    { letters: 'b', ipa: 'b' }, { letters: 'c', ipa: 'k' }, { letters: 'd', ipa: 'd' },
    { letters: 'f', ipa: 'f' }, { letters: 'g', ipa: 'ɡ' }, { letters: 'h', ipa: 'h' },
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

    // 1. 辅音 digraph + 单辅音（优先最长匹配）
    for (const { letters: dl, ipa: di } of CONSONANT_MAP) {
      if (letters.slice(pos, pos + dl.length).toLowerCase() === dl) {
        if (di === '') {
          // 不发辅音：跳过字母，不消耗 IPA（gh）
          return { consumedIpa: 0, consumedLetter: dl.length }
        }
        if (ipa.startsWith(di)) {
          return { consumedIpa: di.length, consumedLetter: dl.length }
        }
        // IPA 以辅音开头但 digraph 不匹配？按单辅音处理（末尾字母）
        // 例：IPA "t" vs 字母 "ck" → ck 不发 k 音，按 c=IPA k 不匹配
      }
    }

    // 2. 元音字母 → IPA
    const lc = letters[pos]
    if ('aeiouy'.includes(lc)) {
      // 按"字母序列 vs IPA序列"贪心匹配
      const vowelCombos = [
        // 双字母元音
        { letters: 'ou', ipa: ['aʊ', 'əʊ', 'ʌ'] },
        { letters: 'ow', ipa: ['aʊ', 'əʊ'] },
        { letters: 'oo', ipa: ['uː', 'ʊ'] },
        { letters: 'ee', ipa: ['iː'] },
        { letters: 'ea', ipa: ['iː', 'e', 'eɪ'] },
        { letters: 'ai', ipa: ['eɪ'] }, { letters: 'ay', ipa: ['eɪ'] },
        { letters: 'oy', ipa: ['ɔɪ'] }, { letters: 'oi', ipa: ['ɔɪ'] },
        { letters: 'ie', ipa: ['aɪ', 'iː'] },
        { letters: 'au', ipa: ['ɔː'] }, { letters: 'aw', ipa: ['ɔː'] },
        { letters: 'ey', ipa: ['eɪ'] }, { letters: 'ei', ipa: ['eɪ'] },
        // r 组合
        { letters: 'ar', ipa: ['ɑː', 'ɒ'] },
        { letters: 'or', ipa: ['ɔː', 'ɜː'] },
        { letters: 'er', ipa: ['ɜː'] },
        { letters: 'ir', ipa: ['ɜː'] }, { letters: 'ur', ipa: ['ɜː'] },
        { letters: 'ear', ipa: ['ɪə', 'ɜː'] }, { letters: 'air', ipa: ['eə'] },
        { letters: 'ere', ipa: ['ɪə', 'eə'] }, { letters: 'are', ipa: ['eə'] },
        { letters: 'oor', ipa: ['ɔː'] }, { letters: 'our', ipa: ['ɔː', 'ʊə'] },
        // 单元音（最末）
        { letters: 'a', ipa: ['ɑː', 'æ', 'ɒ', 'eɪ'] },
        { letters: 'e', ipa: ['e'] }, // 不含 eɪ！避免 ea 匹配 eɪ
        { letters: 'i', ipa: ['ɪ', 'aɪ', 'iː'] },
        { letters: 'o', ipa: ['ɒ', 'əʊ', 'ʌ'] },
        { letters: 'u', ipa: ['ʌ', 'ʊ', 'uː', 'ə'] },
        { letters: 'y', ipa: ['ɪ', 'aɪ'] }, // y as vowel
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

    // 3. 无法匹配：字母和 IPA 各消耗 1 字符（对齐错位）
    // 例如 Wednesday: 字母 'd' 无法匹配 IPA 'n'，各跳过 1 字符继续
    return { consumedIpa: 1, consumedLetter: 1 }
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
        }
        iPos += consumedIpa
      }

      // 仅最后一个音节：吞掉所有剩余字母
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

  // 检查分配是否合理：如果某音节字母数 > IPA字符数的2倍，可能匹配错误
  const ipaLengths = syllableIpas.map(ip => ip.replace(/[ˈˌ]/g, '').length)
  const needsFallback = letterSyllables.some((s, i) => s.length > ipaLengths[i] * 2 + 1)

  // 兜底：若规则分配总量不对，或分配不合理，用比例法
  const totalAllocated = letterSyllables.join('').length
  if (totalAllocated !== wordLower.length || needsFallback) {
    const totalIpa = ipaLengths.reduce((a, b) => a + b, 0)
    if (totalIpa > 0) {
      let counts = ipaLengths.map(l => Math.round(l / totalIpa * wordLower.length))
      const diff = wordLower.length - counts.reduce((a, b) => a + b, 0)
      if (diff > 0) counts[counts.length - 1] += diff
      if (diff < 0) counts[counts.length - 1] += diff
      let wPos = 0
      letterSyllables = []
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


// ─── 通用工具 ──────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)
const loadProgress = () => {
  try { return JSON.parse(localStorage.getItem('pu2_progress') || '{}') } catch { return {} }
}
const saveProgress = p => localStorage.setItem('pu2_progress', JSON.stringify(p))

// ─── 闪卡组件 ──────────────────────────────────────────
function FlashCard({ word, unitTitle, index, total, onSpeak }) {
  const imgSrc = word.image ? (word.image.startsWith('/') ? word.image : '/' + word.image) : `/images/${word.word}.png`

  return (
    <div className="flashcard-scene">
      <div className="flashcard-meta">
        <span className="flashcard-unit">{unitTitle}</span>
        <span className="flashcard-counter">{index + 1} / {total}</span>
      </div>
      <div className="flashcard-simple">
        <img src={imgSrc} alt={word.word} className="flashcard-img"
          onError={e => { e.target.style.display = 'none' }} />
        <span className="flashcard-word">{word.word}</span>
        <span className="flashcard-phonetic">{word.phonetic}</span>
        <div className="flashcard-definition">{word.definition}</div>
        <button className="icon-btn" onClick={() => onSpeak(word.word)}>🔊</button>
      </div>
    </div>
  )
}

// ─── 字母输入框组件（音节分组版）──────────────────────
function LetterInput({ word, phonetic, onDone, disabled, vals, setVals }) {
  const syllables = splitSyllables(word, phonetic)

  // 展平为各字母的元数据
  let globalIdx = 0
  const flat = []
  syllables.forEach(syl => {
    for (const ch of syl.letters) {
      flat.push({ ch: ch.toLowerCase(), globalIdx: globalIdx++ })
    }
  })
  const total = flat.length

  const inputsRef = useRef([])

  // 每次换题时聚焦
  useEffect(() => {
    const t = setTimeout(() => inputsRef.current[0]?.focus(), 80)
    return () => clearTimeout(t)
  }, [word])

  // 禁用解除后自动聚焦
  useEffect(() => {
    if (!disabled) {
      const t = setTimeout(() => inputsRef.current[0]?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [disabled])

  const handleChange = (i, v) => {
    if (disabled) return
    const char = v.toLowerCase().slice(-1)
    const next = [...vals]
    next[i] = char
    setVals(next)
    if (char) playKeySound(0.7 + (i / total) * 0.8)
    if (char && i < total - 1) inputsRef.current[i + 1]?.focus()
    if (char && i === total - 1) setTimeout(() => onDone(next.join('')), 50)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) inputsRef.current[i - 1]?.focus()
  }

  // 计算每个音节组含多少个字母格
  let letterCount = 0
  const sylBoxes = syllables.map(syl => {
    const count = syl.letters.length
    const boxes = []
    for (let j = 0; j < count; j++) {
      const gi = letterCount++
      const entered = vals[gi]?.toLowerCase()
      const expected = flat[gi].ch
      let cls = 'letter-box'
      if (entered) cls += entered === expected ? ' letter-correct' : ' letter-wrong'
      boxes.push(
        <input
          key={gi}
          ref={el => inputsRef.current[gi] = el}
          className={cls}
          value={vals[gi]}
          onChange={e => handleChange(gi, e.target.value)}
          onKeyDown={e => handleKeyDown(gi, e)}
          maxLength={1}
          disabled={disabled}
          autoFocus={gi === 0}
        />
      )
    }
    return { boxes, ipa: syl.ipa, sylIdx: syllables.indexOf(syl) }
  })

  return (
    <div className="syllable-group-row">
      {syllables.map((syl, si) => (
        <div key={si} className="syllable-group">
          <span className="syllable-ipa">{syl.ipa}</span>
          <div className="syllable-boxes">
            {syllables[si] && sylBoxes[si]
              ? sylBoxes[si].boxes
              : null}
          </div>
        </div>
      ))}
    </div>
  )
}


// ─── 闯关游戏（单阶段）───────────────────────────────
function SpellingGame({ unitKey, unitTitle, allWords, onComplete, onBack }) {
  const [queue] = useState(() => shuffle(allWords).slice(0, 10))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [finished, setFinished] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [wordResults, setWordResults] = useState([]) // [{word, correct}]
  const [submitted, setSubmitted] = useState(false) // 已提交过正确答案，等待 Enter 下一题
  const [inputVals, setInputVals] = useState([]) // LetterInput 的当前输入
  const w = queue[current]

  useEffect(() => {
    const t = setTimeout(() => speak(w.word), 400)
    return () => clearTimeout(t)
  }, [current, w.word])

  // 切题时重置状态
  useEffect(() => {
    setFeedback(null)
    setSubmitted(false)
    setInputVals(Array(w.word.length).fill(''))
  }, [current, w.word])

  // 回车键：直接检查当前输入是否正确
  const handleEnter = useCallback((e) => {
    if (e.key === 'Enter') {
      const typed = inputVals.join('')
      const expected = w.word.replace(/ /g, '')
      // 输入完整且正确 → 下一题
      if (typed.length === expected.length && typed.toLowerCase() === expected.toLowerCase()) {
        if (!submitted) {
          // 首次答对：计分
          setFeedback('correct')
          setScore(s => s + 1)
          setWordResults(r => [...r, { word: w.word, correct: true }])
          setSubmitted(true)
          playCorrectSound()
        }
        // 已答对过 → 切题
        setTimeout(() => {
          if (current + 1 >= queue.length) setFinished(true)
          else { setCurrent(c => c + 1); setHintLevel(0); setInputVals([]) }
        }, 400)
      }
    }
  }, [inputVals, w.word, submitted, current, queue.length])

  useEffect(() => {
    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [handleEnter])

  const handleDone = useCallback((typed) => {
    const expected = w.word.replace(/ /g, '')
    const correct = typed.toLowerCase() === expected.toLowerCase()
    if (correct) {
      setFeedback('correct')
      setScore(s => s + 1)
      setWordResults(r => [...r, { word: w.word, correct: true }])
      setSubmitted(true)
      playCorrectSound()
    } else {
      setFeedback('wrong')
      setWordResults(r => [...r, { word: w.word, correct: false }])
    }
  }, [w.word])

  const giveUp = () => {
    setWordResults(r => [...r, { word: w.word, correct: false }])
    speak(w.word)
    setTimeout(() => {
      if (current + 1 >= queue.length) setFinished(true)
      else { setCurrent(c => c + 1); setHintLevel(0); setSubmitted(false); setInputVals([]) }
    }, 1800)
  }

  useEffect(() => {
    if (!finished) return
    const prog = loadProgress()
    const prev = prog[unitKey] || { bestScore: 0, completed: false }
    prog[unitKey] = { bestScore: Math.max(prev.bestScore, score), completed: true }
    saveProgress(prog)
    // 记录详细统计（用于图表）
    recordGameResult({ unitKey, score, total: queue.length, wordResults })
  }, [finished])

  // ── 结束页 ──
  if (finished) {
    const pct = Math.round((score / queue.length) * 100)
    return (
      <div className="result-screen">
        <div className="result-card">
          <h2 className="result-title">🎉 Round Complete!</h2>
          <div className="result-score">{score} / {queue.length}</div>
          <div className="result-bar"><div className="result-bar-fill" style={{ width: pct + '%' }} /></div>
          <p className="result-pct">{pct}% correct</p>
          <button className="btn btn-primary" onClick={onComplete}>Back to Menu</button>
        </div>
      </div>
    )
  }

  const hintText = hintLevel === 1 ? `First letter: ${w.word[0].toUpperCase()}...`
    : hintLevel === 2 ? `Answer: ${w.word}` : null
  const imgSrc = w.image ? (w.image.startsWith('/') ? w.image : '/' + w.image) : `/images/${w.word}.png`

  return (
    <div className="spelling-scene">
      <div className="spelling-header">
        <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
        <span className="spelling-title">{unitTitle}</span>
        <span className="spelling-score">🏆 {score} pts</span>
      </div>
      <div className="spelling-progress-bar">
        <div className="spelling-progress-fill" style={{ width: `${(current / queue.length) * 100}%` }} />
      </div>

      <div className={`phase-tag ${feedback === 'correct' ? 'phase-correct' : ''} ${feedback === 'wrong' ? 'phase-wrong' : ''}`}>
        {feedback === 'correct' ? '✨ Correct! Press Enter to continue' : feedback === 'wrong' ? 'Try Again' : `Q${current + 1} / ${queue.length}`}
      </div>

      {/* 卡片区：超大图 + 释义直接显示 */}
      <div className="spell-card">
        <img src={imgSrc} alt={w.word} className="spell-card-img"
          onError={e => { e.target.style.display = 'none' }} />
        <div className="spell-def">{w.definition}</div>
        <div className="spell-phonetic">{w.phonetic}</div>
      </div>

      <button className="btn btn-speak spell-audio-btn" onClick={() => speak(w.word)}>
        🔊 Listen Again
      </button>

      <LetterInput word={w.word} phonetic={w.phonetic} onDone={handleDone} disabled={feedback === 'correct'} vals={inputVals} setVals={setInputVals} />

      <div className="spell-actions">
        <button className="btn btn-hint" onClick={() => setHintLevel(h => Math.min(h + 1, 2))} disabled={hintLevel === 2}>
          💡 Hint {hintLevel + 1}/2
        </button>
        <button className="btn btn-giveup" onClick={giveUp}>Give Up</button>
      </div>
      {hintText && <div className="spell-hint">{hintText}</div>}
    </div>
  )
}

// ─── 主 App ─────────────────────────────────────────────
// 确保语音列表加载完毕
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
}

// ─── 课程数据（可扩展 PU1/PU3）──────────────────────
const COURSES = [
  {
    id: 'PU1',
    icon: '🌱',
    title: 'Spelling Bee',
    subtitle: 'Essential English for Beginners',
    color: '#22c55e',
    bg: '#bbf7d0',
    cover: null,
    units: [], // 待填充
    locked: true,
  },
  {
    id: 'PU2',
    icon: '📚',
    title: 'Meet the Family',
    subtitle: '168 Words · 9 Units',
    color: '#3b82f6',
    bg: '#dbeafe',
    cover: null,
    units: ['pu2u1','pu2u2','pu2u3','pu2u4','pu2u5','pu2u6','pu2u7','pu2u8','pu2u9'],
    locked: false,
  },
  {
    id: 'PU3',
    icon: '🚀',
    title: 'Welcome to Diversicus',
    subtitle: '143 Words · 9 Units',
    color: '#8b5cf6',
    bg: '#ede9fe',
    cover: null,
    units: ['pu3u1','pu3u2','pu3u3','pu3u4','pu3u5','pu3u6','pu3u7','pu3u8','pu3u9'],
    locked: false,
  },
]

export default function App() {
  const [homeView, setHomeView] = useState('home') // 'home' | 'browse'
  const [activeCourse, setActiveCourse] = useState(null) // null | COURSES item
  const [activeUnit, setActiveUnit] = useState(null)      // 'u1'..'u9'
  const [unitView, setUnitView] = useState(null)          // null|'flashcard'|'spelling'|'random'
  const [startWordIdx, setStartWordIdx] = useState(0)      // BrowseAll 点击单词时的起始索引
  const [showStats, setShowStats] = useState(false)        // 统计页面
  const [progress, setProgress] = useState(loadProgress)
  const refresh = () => setProgress(loadProgress())

  // 首次用户交互时初始化音频上下文（绕过浏览器 autoplay 限制）
  const audioInitedRef = useRef(false)
  const initOnInteraction = useCallback(() => {
    if (!audioInitedRef.current) {
      audioInitedRef.current = true
      const ctx = getAudioCtx()
      if (ctx.state === 'suspended') ctx.resume()
      _audioCtxReady = true
    }
  }, [])

  // ── 全局首次点击初始化音频 ──
  const onFirstClick = useCallback(() => initOnInteraction(), [initOnInteraction])

  // ── 统计页面 ─────────────────────────────────────
  if (showStats) {
    return (
      <div className="app" onClick={onFirstClick}>
        <StatsPage onBack={() => setShowStats(false)} />
      </div>
    )
  }

  // ── 第三级：闯关 / 闪卡 / 随机闯关 ─────────────
  if (activeCourse && unitView) {
    const words = unitView === 'random'
      ? (() => {
          const all = activeCourse.units.flatMap(k => VOCAB[k]?.words || [])
          const arr = [...all]
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
          }
          return arr.slice(0, 10)
        })()
      : (activeUnit ? getVocabData(activeUnit)?.words || [] : [])
    const title = unitView === 'random' ? `Random Challenge (10 words)`
      : unitView === 'flashcard' ? getVocabData(activeUnit)?.title
      : getVocabData(activeUnit)?.title
    return (
      <div className="app" onClick={onFirstClick}>
        <div className="embedded-view">
          <div className="embedded-header">
            <button className="icon-btn" onClick={() => { setActiveCourse(null); setActiveUnit(null); setUnitView(null) }}>
              ← Back to Courses
            </button>
          </div>
          {unitView === 'flashcard' && activeUnit && (
            <UnitFlashcardView
              unitKey={activeUnit}
              VOCAB={VOCAB}
              progress={progress}
              refresh={refresh}
              startIdx={startWordIdx}
            />
          )}
          {(unitView === 'spelling' || unitView === 'random') && (
            <SpellingGame
              key={`${unitView}-${activeUnit || 'all'}-${Date.now()}`}
              unitKey={activeUnit || 'random'}
              unitTitle={title}
              allWords={words}
              onComplete={() => { refresh(); setActiveCourse(null); setActiveUnit(null); setUnitView(null) }}
              onBack={() => { setUnitView(null); setActiveUnit(null) }}
            />
          )}
        </div>
      </div>
    )
  }

  // ── 第二级：课程内（单元列表） ─────────────────
  if (activeCourse) {
    return (
      <div className="app level-view" style={{ "--card-color": activeCourse.color, "--card-bg": activeCourse.bg }} onClick={onFirstClick}>
        <button className="back-btn" onClick={() => { setActiveCourse(null); setActiveUnit(null); setUnitView(null) }}>
          ← Back to Courses
        </button>
        <div className="level-banner">
          <span className="level-icon">{activeCourse.icon}</span>
          <div>
            <h1 className="level-title">{activeCourse.id} · {activeCourse.title}</h1>
            <p className="level-subtitle">{activeCourse.subtitle}</p>
          </div>
        </div>

        <div className="random-btn-wrap">
          <button className="btn btn-lg"
            onClick={() => { setUnitView('random'); setActiveUnit(null) }}>
            🎲 Random Challenge (10 words)
          </button>
        </div>

        <div className="unit-grid">
          {activeCourse.units.map(key => {
            const unit = VOCAB[key]
            if (!unit) return null
            const prog = progress[key] || {}
            const done = prog.completed
            const stars = prog.bestScore ? Math.min(3, Math.ceil(prog.bestScore / 4)) : 0
            return (
              <div key={key} className={`unit-card ${done ? 'done' : ''}`}
                style={{ '--card-color': activeCourse.color, 'display': 'flex', 'flexDirection': 'column', 'gap': '8px' }}>
                <div className="unit-key-row">
                  <span className="unit-card-key">{key.replace('pu3u', 'PU3U').replace('pu2u', 'PU2U')}</span>
                  {done && <span className="unit-stars">{'★'.repeat(stars)}</span>}
                </div>
                <div className="unit-title-row">
                  <h3 className="unit-card-title">{unit.title}</h3>
                </div>
                <p className="unit-card-meta">{unit.words.length} words</p>
                <div className="unit-card-actions">
                  <button className="unit-action-btn challenge" onClick={() => { setActiveUnit(key); setUnitView('spelling') }}>
                    <span className="unit-action-icon">🎯</span>
                    <span className="unit-action-label">Challenge</span>
                  </button>
                  <button className="unit-action-btn learn" onClick={() => { setActiveUnit(key); setUnitView('flashcard') }}>
                    <span className="unit-action-icon">📖</span>
                    <span className="unit-action-label">Learn</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── 首页（课程卡片网格） ──────────────────────────
  return (
    <div className="app home-view" onClick={onFirstClick}>
      <header className="app-header">
        <div className="app-header-row">
          <div>
            <h1>🎯 Spelling Academy</h1>
            <p className="app-subtitle">Master English Vocabulary — One Level at a Time</p>
          </div>
        </div>
      </header>

      {/* 导航 tabs：My Progress | Courses | Browse All Words */}
      <div className="home-nav-tabs">
        <button className={`home-nav-tab ${homeView === 'home' ? 'active' : ''}`} onClick={() => setHomeView('home')}>📖 Courses</button>
        <button className={`home-nav-tab ${homeView === 'browse' ? 'active' : ''}`} onClick={() => setHomeView('browse')}>🔍 Browse All</button>
        <button className="home-nav-tab" onClick={() => setShowStats(true)}>🏆 My Progress</button>
      </div>

      {homeView === 'browse' ? (
        <BrowseAllView
          VOCAB={VOCAB}
          PU2_VOCAB={PU2_VOCAB}
          PU3_VOCAB={PU3_VOCAB}
          progress={progress}
          onBack={() => setHomeView('home')}
          onFlashcard={(unitKey, wordIdx = 0) => { 
            const course = unitKey.startsWith('pu2u') ? 'PU2' : 'PU3'
            setActiveUnit(unitKey); setActiveCourse(COURSES.find(c => c.id === course)); setUnitView('flashcard'); setStartWordIdx(wordIdx)
          }}
          onChallenge={(unitKey) => { 
            const course = unitKey.startsWith('pu2u') ? 'PU2' : 'PU3'
            setActiveUnit(unitKey); setActiveCourse(COURSES.find(c => c.id === course))
          }}
        />
      ) : (
        <>
        <div className="course-grid">
          {COURSES.map(course => (
            <div
              key={course.id}
              className={`course-card ${course.locked ? 'locked' : ''}`}
              style={{ '--card-color': course.color, '--card-bg': course.bg }}
              onClick={() => !course.locked && setActiveCourse(course)}
            >
              <div className="course-card-header">
                <span className="course-icon">{course.icon}</span>
                <span className="course-id">{course.id}</span>
                {course.locked && <span className="course-lock">🔒</span>}
              </div>
              <h2 className="course-title">{course.title}</h2>
              <p className="course-subtitle">{course.subtitle}</p>
              {!course.locked && (
                <div className="course-units-preview">
                  {course.units.slice(0,3).map(u => (
                    <span key={u} className="unit-chip">{u.replace('pu2u', 'PU2U').replace('pu3u', 'PU3U')}</span>
                  ))}
                  {course.units.length > 3 && <span className="unit-chip muted">+{course.units.length-3} more</span>}
                </div>
              )}
              {course.locked ? (
                <span className="course-btn locked">Coming Soon</span>
              ) : (
                <span className="course-btn">Start Learning →</span>
              )}
            </div>
          ))}
        </div>

        {/* Banner */}
        <img src="/images/banner.png" alt="" className="home-banner" />
        </>
      )}

      {/* 联系方式 */}
      <div className="home-contact-info">
        bug feedback/班级群，请加微信：sugarbomb2017
      </div>
    </div>
  )
}
// ─── 辅助：单元闪卡浏览 ─────────────────────────────
function UnitFlashcardView({ unitKey, VOCAB, progress, refresh, startIdx = 0 }) {
  const unit = VOCAB[unitKey]
  const words = (unit?.words || []).map(w => ({ ...w, unitTitle: unit.title }))
  const [idx, setIdx] = useState(startIdx)
  const [mastered, setMastered] = useState(() => {
    const p = loadProgress()
    return p[unitKey]?.masteredWords || []
  })
  const saveM = useCallback((list) => {
    const p = loadProgress()
    p[unitKey] = { ...p[unitKey], masteredWords: list }
    saveProgress(p); refresh()
  }, [unitKey, refresh])
  const toggleM = () => {
    const word = words[idx].word
    const next = mastered.includes(word) ? mastered.filter(x => x !== word) : [...mastered, word]
    setMastered(next); saveM(next)
  }
  if (!words.length) return null
  return (
    <div className="app flashcard-standalone">
      <FlashCard word={words[idx]} unitTitle={words[idx].unitTitle} index={idx} total={words.length} onSpeak={speak} />
      <div className="flashcard-controls">
        <button className="btn btn-secondary" onClick={() => setIdx(i => Math.max(0, i - 1))}>← Prev</button>
        <button className={`btn ${mastered.includes(words[idx].word) ? 'btn-gold' : 'btn-primary'}`} onClick={toggleM}>
          {mastered.includes(words[idx].word) ? '✓ Mastered' : 'Mark Mastered'}
        </button>
        <button className="btn btn-secondary" onClick={() => setIdx(i => Math.min(words.length - 1, i + 1))}>Next →</button>
      </div>
    </div>
  )
}

// ─── 辅助：浏览全部词库 ────────────────────────────
function BrowseAllView({ VOCAB, PU2_VOCAB, PU3_VOCAB, progress, onBack, onFlashcard, onChallenge }) {
  const [courseFilter, setCourseFilter] = useState('all') // 'all' | 'pu2' | 'pu3'
  const [unitFilter, setUnitFilter] = useState('all')
  
  // Get available unit keys based on course filter
  const getUnitKeys = (course) => {
    if (course === 'all') {
      // Return all keys from both PU2 and PU3
      return [...Object.keys(PU2_VOCAB), ...Object.keys(PU3_VOCAB)]
    }
    const vocab = course === 'pu2' ? PU2_VOCAB : PU3_VOCAB
    return Object.keys(vocab)
  }
  
  const currentUnits = getUnitKeys(courseFilter)
  
  // Get all words based on filters
  const getWords = () => {
    let words = []
    const vocab = courseFilter === 'all' ? VOCAB : (courseFilter === 'pu2' ? PU2_VOCAB : PU3_VOCAB)
    const unitKeys = getUnitKeys(courseFilter)
    
    if (unitFilter === 'all') {
      words = unitKeys.flatMap(k => vocab[k]?.words?.map((w, i) => ({...w, unitKey: k, wordIndexInUnit: i})) || [])
    } else {
      words = vocab[unitFilter]?.words?.map((w, i) => ({...w, unitKey: unitFilter, wordIndexInUnit: i})) || []
    }
    return words
  }
  
  const visible = getWords()
  
  return (
    <div className="browse-all-view">
      <div className="browse-header">
        <button className="icon-btn" onClick={onBack}>← Back</button>
        <h2>All Words</h2>
      </div>
      
      {/* Course selector */}
      <div className="course-tabs">
        <button className={`course-tab ${courseFilter === 'all' ? 'active' : ''}`}
          onClick={() => { setCourseFilter('all'); setUnitFilter('all'); }}>📚 All (PU2+PU3)</button>
        <button className={`course-tab ${courseFilter === 'pu2' ? 'active' : ''}`}
          onClick={() => { setCourseFilter('pu2'); setUnitFilter('u1'); }}>📚 PU2</button>
        <button className={`course-tab ${courseFilter === 'pu3' ? 'active' : ''}`}
          onClick={() => { setCourseFilter('pu3'); setUnitFilter('u1'); }}>🚀 PU3</button>
      </div>
      
      {/* Unit selector */}
      <div className="unit-tabs">
        <button className={`tab-btn ${unitFilter === 'all' ? 'active' : ''}`}
          onClick={() => setUnitFilter('all')}>All</button>
        {currentUnits.map(k => (
          <button key={k} className={`tab-btn ${unitFilter === k ? 'active' : ''}`}
            onClick={() => setUnitFilter(k)}>{k.replace('pu2u','PU2U').replace('pu3u','PU3U')}</button>
        ))}
      </div>
      
      <div className="browse-stats">
        {visible.length} words
      </div>
      
      <div className="browse-grid">
        {visible.map((w) => (
          <div key={w.word} className="word-chip"
            onClick={() => onFlashcard(w.unitKey, w.wordIndexInUnit)}>
            <img src={w.image ? (w.image.startsWith('/') ? w.image : '/' + w.image) : `/images/${w.word}.png`} alt={w.word} className="word-chip-img"
              onError={e => { e.target.style.opacity='0.2' }} />
            <span className="word-chip-name">{w.word}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

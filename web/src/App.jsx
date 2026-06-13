import { useState, useEffect, useCallback, useRef } from 'react'
import { VOCAB as PU2_VOCAB } from './data/pu2_vocab'
import { PU3_VOCAB } from './data/pu3_vocab'
import { PU1_VOCAB } from './data/pu1_vocab'
import { recordGameResult, loadStats } from './pages/StatsPage'
import StatsPage from './pages/StatsPage'
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { cn } from './lib/utils'
import { ArrowLeft, Volume2, Lightbulb, Flag, ChevronRight, Search, BookOpen, Trophy, Target, Zap, Star } from 'lucide-react'

const VOCAB = { ...PU1_VOCAB, ...PU2_VOCAB, ...PU3_VOCAB }
const getAllWordsForVocab = (key) => VOCAB[key]?.words || []
const getVocabData = (key) => VOCAB[key] || {}

// ─── 工具 ───────────────────────────────────────────────
const speak = (text) => {
  const audio = new Audio(`/audio/${encodeURIComponent(text)}.mp3`)
  audio.onerror = () => {
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
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().then(() => { _audioCtxReady = true }).catch(() => {})
  } else {
    _audioCtxReady = true
  }
  return _audioCtx
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

// ─── 音节分组建构 ────────────────────────────────
const splitSyllables = (word, phonetic) => {
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

  const stripped = phonetic.replace(/[\[\]\/]/g, '')
  const VOWEL_PHONEMES = [
    'iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə',
    'ɑː','ɔː','uː','ɜː',
    'ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ',
    'a','i','o','u'
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
    } else if (numCons === 2) {
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1))
      prevPos = gapStart + 1
    } else {
      syllableIpas.push(stripped.slice(prevPos, gapStart + 1))
      prevPos = gapStart + 1
    }
  }
  syllableIpas.push(stripped.slice(prevPos))

  const vowelPhonemes = ['iː','eɪ','aɪ','ɔɪ','aʊ','ɪə','eə','ʊə','ɑː','ɔː','uː','ɜː','ɪ','e','æ','ʌ','ʊ','ə','ɒ','ɔ','a','i','o','u']
  const hasVowel = (ipa) => vowelPhonemes.some(v => ipa.includes(v))
  if (syllableIpas.length >= 2 && !hasVowel(syllableIpas[0])) {
    syllableIpas[1] = syllableIpas[0] + syllableIpas[1]
    syllableIpas.shift()
  }

  const CONSONANT_MAP = [
    { letters: 'sh', ipa: 'ʃ' }, { letters: 'ch', ipa: 'tʃ' }, { letters: 'th', ipa: 'θ' },
    { letters: 'ph', ipa: 'f' }, { letters: 'wh', ipa: 'w' }, { letters: 'wr', ipa: 'r' },
    { letters: 'kn', ipa: 'n' }, { letters: 'ng', ipa: 'ŋ' }, { letters: 'ck', ipa: 'k' },
    { letters: 'sc', ipa: 's' }, { letters: 'gh', ipa: '' }, { letters: 'mb', ipa: 'm' },
    { letters: 'b', ipa: 'b' }, { letters: 'c', ipa: 'k' }, { letters: 'd', ipa: 'd' },
    { letters: 'f', ipa: 'f' }, { letters: 'g', ipa: 'ɡ' }, { letters: 'h', ipa: 'h' },
    { letters: 'j', ipa: 'dʒ' }, { letters: 'k', ipa: 'k' }, { letters: 'l', ipa: 'l' },
    { letters: 'm', ipa: 'm' }, { letters: 'n', ipa: 'n' }, { letters: 'p', ipa: 'p' },
    { letters: 'qu', ipa: 'kw' }, { letters: 'r', ipa: 'r' }, { letters: 's', ipa: 's' },
    { letters: 't', ipa: 't' }, { letters: 'v', ipa: 'v' }, { letters: 'w', ipa: 'w' },
    { letters: 'x', ipa: 'ks' }, { letters: 'y', ipa: 'j' }, { letters: 'z', ipa: 'z' },
  ]

  function matchOne(letters, pos, ipa) {
    if (pos >= letters.length || ipa.length === 0) return { consumedIpa: 0, consumedLetter: 0 }
    for (const { letters: dl, ipa: di } of CONSONANT_MAP) {
      if (letters.slice(pos, pos + dl.length).toLowerCase() === dl) {
        if (di === '') return { consumedIpa: 0, consumedLetter: dl.length }
        if (ipa.startsWith(di)) return { consumedIpa: di.length, consumedLetter: dl.length }
      }
    }
    const lc = letters[pos]
    if ('aeiouy'.includes(lc)) {
      const vowelCombos = [
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
        { letters: 'ar', ipa: ['ɑː', 'ɒ'] },
        { letters: 'or', ipa: ['ɔː', 'ɜː'] },
        { letters: 'er', ipa: ['ɜː'] },
        { letters: 'ir', ipa: ['ɜː'] }, { letters: 'ur', ipa: ['ɜː'] },
        { letters: 'ear', ipa: ['ɪə', 'ɜː'] }, { letters: 'air', ipa: ['eə'] },
        { letters: 'ere', ipa: ['ɪə', 'eə'] }, { letters: 'are', ipa: ['eə'] },
        { letters: 'oor', ipa: ['ɔː'] }, { letters: 'our', ipa: ['ɔː', 'ʊə'] },
        { letters: 'a', ipa: ['ɑː', 'æ', 'ɒ', 'eɪ'] },
        { letters: 'e', ipa: ['e'] },
        { letters: 'i', ipa: ['ɪ', 'aɪ', 'iː'] },
        { letters: 'o', ipa: ['ɒ', 'əʊ', 'ʌ'] },
        { letters: 'u', ipa: ['ʌ', 'ʊ', 'uː', 'ə'] },
        { letters: 'y', ipa: ['ɪ', 'aɪ'] },
      ]
      for (const { letters: vl, ipa: va } of vowelCombos) {
        if (letters.slice(pos, pos + vl.length).toLowerCase() === vl) {
          for (const ipaSeq of va) {
            if (ipa.startsWith(ipaSeq)) return { consumedIpa: ipaSeq.length, consumedLetter: vl.length }
          }
        }
      }
    }
    return { consumedIpa: 1, consumedLetter: 1 }
  }

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
  const ipaLengths = syllableIpas.map(ip => ip.replace(/[ˈˌ]/g, '').length)
  const needsFallback = letterSyllables.some((s, i) => s.length > ipaLengths[i] * 2 + 1)
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
    <div className="flex flex-col items-center gap-3.5 animate-fade-in">
      <div className="w-full flex justify-between text-sm">
        <span className="font-semibold text-primary">{unitTitle}</span>
        <span className="text-text-light">{index + 1} / {total}</span>
      </div>
      <Card className="flex flex-col items-center p-7 w-full max-w-[500px]">
        <img src={imgSrc} alt={word.word}
          className="max-w-[480px] max-h-[320px] w-auto h-auto object-contain mb-4 bg-white rounded-[10px] p-4"
          onError={e => { e.target.style.display = 'none' }} />
        <span className="text-[30px] font-bold tracking-[-0.3px] text-center mt-4">{word.word}</span>
        <span className="text-[17px] text-primary text-center mt-1.5">{word.phonetic}</span>
        <div className="text-lg leading-relaxed text-center my-3.5 text-text">{word.definition}</div>
        <Button variant="primaryLight" size="icon" onClick={() => onSpeak(word.word)}>
          <Volume2 size={20} />
        </Button>
      </Card>
    </div>
  )
}

// ─── 字母输入框组件（音节分组版）──────────────────────
function LetterInput({ word, phonetic, onDone, disabled, vals, setVals }) {
  const syllables = splitSyllables(word, phonetic)
  let globalIdx = 0
  const flat = []
  syllables.forEach(syl => {
    for (const ch of syl.letters) {
      flat.push({ ch: ch.toLowerCase(), globalIdx: globalIdx++ })
    }
  })
  const total = flat.length
  const inputsRef = useRef([])

  useEffect(() => {
    const t = setTimeout(() => inputsRef.current[0]?.focus(), 80)
    return () => clearTimeout(t)
  }, [word])

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
    return { boxes, ipa: syl.ipa }
  })

  return (
    <div className="syllable-group-row">
      {syllables.map((syl, si) => (
        <div key={si} className="syllable-group">
          <span className="syllable-ipa">{syl.ipa}</span>
          <div className="syllable-boxes">
            {sylBoxes[si]?.boxes}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 闯关游戏 ───────────────────────────────
function SpellingGame({ unitKey, unitTitle, allWords, onComplete, onBack }) {
  const [queue] = useState(() => shuffle(allWords).slice(0, 10))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [finished, setFinished] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [wordResults, setWordResults] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [inputVals, setInputVals] = useState([])
  const w = queue[current]

  useEffect(() => {
    const t = setTimeout(() => speak(w.word), 400)
    return () => clearTimeout(t)
  }, [current, w.word])

  useEffect(() => {
    setFeedback(null)
    setSubmitted(false)
    setInputVals(Array(w.word.length).fill(''))
  }, [current, w.word])

  const handleEnter = useCallback((e) => {
    if (e.key === 'Enter') {
      const typed = inputVals.join('')
      const expected = w.word.replace(/ /g, '')
      if (typed.length === expected.length && typed.toLowerCase() === expected.toLowerCase()) {
        if (!submitted) {
          setFeedback('correct')
          setScore(s => s + 1)
          setWordResults(r => [...r, { word: w.word, correct: true }])
          setSubmitted(true)
          playCorrectSound()
        }
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
    recordGameResult({ unitKey, score, total: queue.length, wordResults })
  }, [finished])

  if (finished) {
    const pct = Math.round((score / queue.length) * 100)
    return (
      <div className="flex justify-center items-center min-h-[60vh] animate-scale-in">
        <Card className="p-11 text-center max-w-[380px] w-full shadow-[0_0_0_1px_var(--color-border),var(--shadow-lg)] rounded-[18px]">
          <h2 className="text-[30px] font-bold mb-6">🎉 Round Complete!</h2>
          <div className="text-[64px] font-bold text-primary leading-none tracking-[-2px]">{score} / {queue.length}</div>
          <Progress value={score} max={queue.length} className="my-6 h-[10px]" indicatorClassName="bg-accent" />
          <p className="text-[15px] text-text-soft mb-7">{pct}% correct</p>
          <Button onClick={onComplete}>Back to Menu</Button>
        </Card>
      </div>
    )
  }

  const hintText = hintLevel === 1 ? `First letter: ${w.word[0].toUpperCase()}...`
    : hintLevel === 2 ? `Answer: ${w.word}` : null
  const imgSrc = w.image ? (w.image.startsWith('/') ? w.image : '/' + w.image) : `/images/${w.word}.png`

  return (
    <div className="flex flex-col items-center gap-3.5 animate-fade-in">
      <div className="w-full flex items-center gap-3.5">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </Button>
        <span className="text-[15px] font-semibold flex-1">{unitTitle}</span>
        <span className="text-base font-bold text-accent">🏆 {score} pts</span>
      </div>

      <Progress value={current} max={queue.length} />

      <div className={cn("phase-tag", feedback === 'correct' && 'phase-correct', feedback === 'wrong' && 'phase-wrong')}>
        {feedback === 'correct' ? '✨ Correct! Press Enter to continue' : feedback === 'wrong' ? 'Try Again' : `Q${current + 1} / ${queue.length}`}
      </div>

      <Card className="w-full max-w-[480px] flex flex-col items-center p-7 gap-3">
        <img src={imgSrc} alt={w.word}
          className="max-w-[200px] max-h-[200px] w-auto h-auto object-contain mb-1.5 bg-white rounded-[10px] p-3"
          onError={e => { e.target.style.display = 'none' }} />
        <div className="text-base leading-relaxed text-center max-w-[440px] text-text">{w.definition}</div>
        <div className="text-base text-primary">{w.phonetic}</div>
      </Card>

      <Button variant="primaryLight" onClick={() => speak(w.word)}>
        <Volume2 size={16} /> Listen Again
      </Button>

      <LetterInput word={w.word} phonetic={w.phonetic} onDone={handleDone} disabled={feedback === 'correct'} vals={inputVals} setVals={setInputVals} />

      <div className="flex gap-2.5">
        <Button variant="coral" onClick={() => setHintLevel(h => Math.min(h + 1, 2))} disabled={hintLevel === 2}>
          <Lightbulb size={16} /> Hint {hintLevel + 1}/2
        </Button>
        <Button variant="outline" onClick={giveUp}>
          <Flag size={16} /> Give Up
        </Button>
      </div>
      {hintText && <div className="text-base text-coral font-semibold text-center">{hintText}</div>}
    </div>
  )
}

// ─── 辅助：单元闪卡浏览 ─────────────────────────────
function UnitFlashcardView({ unitKey, VOCAB, progress, refresh, startIdx = 0, onBack }) {
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
    <div className="animate-fade-in">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-3">
          <ArrowLeft size={16} /> Back to Unit List
        </Button>
      )}
      <FlashCard word={words[idx]} unitTitle={words[idx].unitTitle} index={idx} total={words.length} onSpeak={speak} />
      <div className="flex gap-2.5 justify-center mt-6">
        <Button variant="secondary" onClick={() => setIdx(i => Math.max(0, i - 1))}>
          ← Prev
        </Button>
        <Button variant={mastered.includes(words[idx].word) ? "gold" : "default"} onClick={toggleM}>
          {mastered.includes(words[idx].word) ? '✓ Mastered' : 'Mark Mastered'}
        </Button>
        <Button variant="secondary" onClick={() => setIdx(i => Math.min(words.length - 1, i + 1))}>
          Next →
        </Button>
      </div>
    </div>
  )
}

// ─── 辅助：浏览全部词库 ────────────────────────────
function BrowseAllView({ VOCAB, PU1_VOCAB, PU2_VOCAB, PU3_VOCAB, progress, onBack, onFlashcard, onChallenge }) {
  const [courseFilter, setCourseFilter] = useState('pu1')
  const [unitFilter, setUnitFilter] = useState('pu1u0')

  const getUnitKeys = (course) => {
    const vocab = course === 'pu1' ? PU1_VOCAB : (course === 'pu2' ? PU2_VOCAB : PU3_VOCAB)
    return Object.keys(vocab || {})
  }

  const currentUnits = getUnitKeys(courseFilter)

  const getWords = () => {
    let words = []
    const vocab = courseFilter === 'pu1' ? PU1_VOCAB : (courseFilter === 'pu2' ? PU2_VOCAB : PU3_VOCAB)
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
    <div className="max-w-[860px] mx-auto animate-fade-in">
      <div className="flex items-center gap-3.5 mb-[18px]">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-2xl font-bold tracking-[-0.3px]">All Words</h2>
      </div>

      {/* Course selector tabs */}
      <div className="flex gap-1.5 mb-3.5">
        {[
          { key: 'pu1', icon: '🌱', label: 'PU1' },
          { key: 'pu2', icon: '📚', label: 'PU2' },
          { key: 'pu3', icon: '🚀', label: 'PU3' },
        ].map(c => (
          <button
            key={c.key}
            onClick={() => { setCourseFilter(c.key); setUnitFilter(c.key === 'pu1' ? 'pu1u0' : (c.key === 'pu2' ? 'pu2u1' : 'pu3u1')) }}
            className={cn(
              "flex-1 rounded-md py-2.5 px-4 text-sm font-semibold cursor-pointer transition-all duration-150 border-0",
              courseFilter === c.key
                ? "bg-surface text-text shadow-[0_0_0_1px_var(--color-border)]"
                : "bg-bg-deep text-text-light hover:bg-surface-hover hover:text-text-soft shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
            )}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Unit filter tabs */}
      <div className="flex flex-wrap gap-2 mb-[18px]">
        <button
          onClick={() => setUnitFilter('all')}
          className={cn(
            "rounded-[18px] px-3.5 py-1.5 text-[13px] cursor-pointer transition-all duration-150 border-0",
            unitFilter === 'all'
              ? "bg-primary text-white shadow-[0_0_0_1px_var(--color-primary)]"
              : "bg-surface text-text-light shadow-[0_0_0_1px_var(--color-border)] hover:bg-surface-hover hover:text-text-soft"
          )}
        >
          All
        </button>
        {currentUnits.map(k => (
          <button
            key={k}
            onClick={() => setUnitFilter(k)}
            className={cn(
              "rounded-[18px] px-3.5 py-1.5 text-[13px] cursor-pointer transition-all duration-150 border-0",
              unitFilter === k
                ? "bg-primary text-white shadow-[0_0_0_1px_var(--color-primary)]"
                : "bg-surface text-text-light shadow-[0_0_0_1px_var(--color-border)] hover:bg-surface-hover hover:text-text-soft"
            )}
          >
            {k.replace('pu1u','PU1U').replace('pu2u','PU2U').replace('pu3u','PU3U')}
          </button>
        ))}
      </div>

      <div className="text-center text-text-light mb-3.5 text-[13px]">
        {visible.length} words
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {visible.map((w) => (
          <div
            key={w.word}
            onClick={() => onFlashcard(w.unitKey, w.wordIndexInUnit)}
            className="bg-surface shadow-[0_0_0_1px_var(--color-border)] rounded-[10px] p-3 text-center cursor-pointer transition-all duration-150 flex flex-col items-center gap-1.5 hover:shadow-[0_0_0_1px_var(--color-border-hover),0_4px_12px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2),0_0_20px_rgba(106,95,193,0.3)] hover:-translate-y-0.5"
          >
            <img
              src={w.image ? (w.image.startsWith('/') ? w.image : '/' + w.image) : `/images/${w.word}.png`}
              alt={w.word}
              className="w-14 h-14 object-contain bg-white rounded-md p-1"
              onError={e => { e.target.style.opacity = '0.2'; e.target.style.filter = 'grayscale(1)' }}
            />
            <span className="text-[13px] font-semibold break-all leading-[1.3]">{w.word}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 主 App ─────────────────────────────────────────────
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
}

const COURSES = [
  {
    id: 'PU1', icon: '🌱', title: 'Hello', subtitle: '183 Words · 10 Units',
    color: '#22c55e', bg: '#bbf7d0',
    units: ['pu1u0','pu1u1','pu1u2','pu1u3','pu1u4','pu1u5','pu1u6','pu1u7','pu1u8','pu1u9'],
    locked: false,
  },
  {
    id: 'PU2', icon: '📚', title: 'Meet the Family', subtitle: '168 Words · 9 Units',
    color: '#3b82f6', bg: '#dbeafe',
    units: ['pu2u1','pu2u2','pu2u3','pu2u4','pu2u5','pu2u6','pu2u7','pu2u8','pu2u9'],
    locked: false,
  },
  {
    id: 'PU3', icon: '🚀', title: 'Welcome to Diversicus', subtitle: '143 Words · 9 Units',
    color: '#8b5cf6', bg: '#ede9fe',
    units: ['pu3u1','pu3u2','pu3u3','pu3u4','pu3u5','pu3u6','pu3u7','pu3u8','pu3u9'],
    locked: false,
  },
]

export default function App() {
  const [homeView, setHomeView] = useState('home')
  const [activeCourse, setActiveCourse] = useState(null)
  const [activeUnit, setActiveUnit] = useState(null)
  const [unitView, setUnitView] = useState(null)
  const [startWordIdx, setStartWordIdx] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [progress, setProgress] = useState(loadProgress)
  const refresh = () => setProgress(loadProgress())

  const audioInitedRef = useRef(false)
  const initOnInteraction = useCallback(() => {
    if (!audioInitedRef.current) {
      audioInitedRef.current = true
      const ctx = getAudioCtx()
      if (ctx.state === 'suspended') ctx.resume()
      _audioCtxReady = true
    }
  }, [])

  const onFirstClick = useCallback(() => initOnInteraction(), [initOnInteraction])

  // ── 统计页面 ─────────────────────────────────────
  if (showStats) {
    return (
      <div className="max-w-[860px] mx-auto px-6 py-8" onClick={onFirstClick}>
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
      <div className="max-w-[860px] mx-auto px-6 py-8" onClick={onFirstClick}>
        <Card className="p-6 mt-5">
          <div className="mb-3.5 pb-3 border-b border-border">
            <Button variant="ghost" size="sm" onClick={() => { setActiveCourse(null); setActiveUnit(null); setUnitView(null) }}>
              <ArrowLeft size={16} /> Back to Courses
            </Button>
          </div>
          {unitView === 'flashcard' && activeUnit && (
            <UnitFlashcardView
              unitKey={activeUnit} VOCAB={VOCAB} progress={progress} refresh={refresh}
              startIdx={startWordIdx} onBack={() => { setUnitView(null); setActiveUnit(null) }}
            />
          )}
          {(unitView === 'spelling' || unitView === 'random') && (
            <SpellingGame
              key={`${unitView}-${activeUnit || 'all'}-${Date.now()}`}
              unitKey={activeUnit || 'random'} unitTitle={title} allWords={words}
              onComplete={() => { refresh(); setUnitView(null); setActiveUnit(null) }}
              onBack={() => { setUnitView(null); setActiveUnit(null) }}
            />
          )}
        </Card>
      </div>
    )
  }

  // ── 第二级：课程内（单元列表） ─────────────────
  if (activeCourse) {
    return (
      <div className="max-w-[860px] mx-auto px-6 py-6" onClick={onFirstClick}>
        <Button variant="ghost" size="sm" onClick={() => { setActiveCourse(null); setActiveUnit(null); setUnitView(null) }} className="mb-4">
          <ArrowLeft size={16} /> Back to Courses
        </Button>

        <div className="flex items-center gap-4 bg-bg-deep rounded-[14px] p-5 mb-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
          <span className="text-5xl">{activeCourse.icon}</span>
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.3px] text-text">{activeCourse.id} · {activeCourse.title}</h1>
            <p className="text-[13px] text-text-light mt-1">{activeCourse.subtitle}</p>
          </div>
        </div>

        <div className="mb-5">
          <button
            onClick={() => { setUnitView('random'); setActiveUnit(null) }}
            className="w-full flex items-center justify-center gap-2.5 bg-surface rounded-[14px] py-4 px-6 text-sm font-semibold text-text uppercase tracking-[0.4px] cursor-pointer transition-all duration-150 border-0 shadow-[0_0_0_1px_var(--color-border),inset_0_1px_3px_rgba(0,0,0,0.1)] hover:bg-surface-hover hover:shadow-[0_0_0_1px_var(--color-border-hover),0_4px_12px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_3px_rgba(0,0,0,0.1)]"
          >
            <Zap size={18} /> Random Challenge (10 words)
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {activeCourse.units.map(key => {
            const unit = VOCAB[key]
            if (!unit) return null
            const prog = progress[key] || {}
            const done = prog.completed
            const stars = prog.bestScore ? Math.min(3, Math.ceil(prog.bestScore / 4)) : 0
            return (
              <Card key={key} className={cn("p-4 flex flex-col gap-2 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--color-border-hover),var(--shadow),var(--shadow-glow)]", done && "shadow-[0_0_0_1px_rgba(194,239,78,0.25)]")}>
                <div className="flex items-center justify-between">
                  <Badge variant={done ? "success" : "default"}>
                    {key.replace('pu3u', 'PU3U').replace('pu2u', 'PU2U').replace('pu1u', 'PU1U')}
                  </Badge>
                  {done && <span className="text-sm text-coral">{'★'.repeat(stars)}</span>}
                </div>
                <div className="py-1.5 px-2 rounded-md bg-bg-deep">
                  <h3 className="text-[15px] font-semibold text-text leading-[1.3]">{unit.title}</h3>
                </div>
                <p className="text-xs text-text-light ml-2 my-0.5">{unit.words.length} words</p>
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => { setActiveUnit(key); setUnitView('spelling') }}
                    className="flex flex-col items-center gap-1 flex-1 py-2.5 px-2 rounded-[10px] cursor-pointer border-0 text-xs font-semibold uppercase tracking-[0.2px] transition-all duration-150 bg-primary-light text-primary hover:bg-[rgba(106,95,193,0.25)] active:scale-[0.96]"
                  >
                    <Target size={20} />
                    <span>Challenge</span>
                  </button>
                  <button
                    onClick={() => { setActiveUnit(key); setUnitView('flashcard') }}
                    className="flex flex-col items-center gap-1 flex-1 py-2.5 px-2 rounded-[10px] cursor-pointer border-0 text-xs font-semibold uppercase tracking-[0.2px] transition-all duration-150 bg-coral-bg text-coral hover:bg-[rgba(255,178,135,0.2)] active:scale-[0.96]"
                  >
                    <BookOpen size={20} />
                    <span>Learn</span>
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ── 首页 ────────────────────────────────
  return (
    <div className="max-w-[860px] mx-auto px-6 py-8 pb-16" onClick={onFirstClick}>
      {/* Header */}
      <header className="text-center py-12">
        <h1 className="text-[40px] font-bold tracking-[-0.5px] leading-[1.1] text-text">🎯 Spelling Academy</h1>
        <p className="text-[15px] text-text-light mt-2 font-normal">Master English Vocabulary — One Level at a Time</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 bg-bg-deep rounded-[10px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] mb-7">
        <button
          onClick={() => setHomeView('home')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-150 border-0",
            homeView === 'home' ? "bg-surface text-text shadow-[0_0_0_1px_var(--color-border)]" : "bg-transparent text-text-light hover:bg-surface-hover hover:text-text-soft"
          )}
        >
          <BookOpen size={16} /> Courses
        </button>
        <button
          onClick={() => setHomeView('browse')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-150 border-0",
            homeView === 'browse' ? "bg-surface text-text shadow-[0_0_0_1px_var(--color-border)]" : "bg-transparent text-text-light hover:bg-surface-hover hover:text-text-soft"
          )}
        >
          <Search size={16} /> Browse All
        </button>
        <button
          onClick={() => setShowStats(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-150 border-0 bg-transparent text-text-light hover:bg-surface-hover hover:text-text-soft"
        >
          <Trophy size={16} /> My Progress
        </button>
      </div>

      {homeView === 'browse' ? (
        <BrowseAllView
          VOCAB={VOCAB} PU1_VOCAB={PU1_VOCAB} PU2_VOCAB={PU2_VOCAB} PU3_VOCAB={PU3_VOCAB}
          progress={progress} onBack={() => setHomeView('home')}
          onFlashcard={(unitKey, wordIdx = 0) => {
            let course = 'PU3'
            if (unitKey.startsWith('pu1u')) course = 'PU1'
            else if (unitKey.startsWith('pu2u')) course = 'PU2'
            setActiveUnit(unitKey); setActiveCourse(COURSES.find(c => c.id === course)); setUnitView('flashcard'); setStartWordIdx(wordIdx)
          }}
          onChallenge={(unitKey) => {
            let course = 'PU3'
            if (unitKey.startsWith('pu1u')) course = 'PU1'
            else if (unitKey.startsWith('pu2u')) course = 'PU2'
            setActiveUnit(unitKey); setActiveCourse(COURSES.find(c => c.id === course))
          }}
        />
      ) : (
        <>
          {/* Course Cards Grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {COURSES.map(course => (
              <div
                key={course.id}
                className={cn(
                  "bg-surface rounded-[14px] shadow-[0_0_0_1px_var(--color-border)] p-5 cursor-pointer transition-all duration-150 flex flex-col gap-2.5",
                  course.locked ? "opacity-50 cursor-default" : "hover:shadow-[0_0_0_1px_var(--color-border-hover),var(--shadow),var(--shadow-glow)] hover:-translate-y-[3px]"
                )}
                onClick={() => !course.locked && setActiveCourse(course)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-4xl">{course.icon}</span>
                  <Badge variant="default">{course.id}</Badge>
                  {course.locked && <span className="ml-auto text-base">🔒</span>}
                </div>
                <h2 className="text-[22px] font-bold text-text leading-[1.2] tracking-[-0.3px]">{course.title}</h2>
                <p className="text-[13px] text-text-light">{course.subtitle}</p>
                {(course.id === 'PU1' || course.id === 'PU2') && <br/>}
                {!course.locked && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {course.units.slice(0,3).map(u => (
                      <Badge key={u} variant="muted" className="text-[10px]">
                        {u.replace('pu1u', 'PU1U').replace('pu2u', 'PU2U').replace('pu3u', 'PU3U')}
                      </Badge>
                    ))}
                    {course.units.length > 3 && <Badge variant="muted" className="text-[10px]">+{course.units.length-3} more</Badge>}
                  </div>
                )}
                {course.locked ? (
                  <span className="mt-2 py-2.5 px-4 rounded-md bg-text-muted text-white text-xs font-semibold text-center block uppercase tracking-[0.3px]">Coming Soon</span>
                ) : (
                  <span className="mt-2 py-2.5 px-4 rounded-md bg-muted-purple text-white text-xs font-semibold text-center block uppercase tracking-[0.3px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] transition-all hover:bg-[#8a759e]">
                    Start Learning <ChevronRight size={12} className="inline ml-1" />
                  </span>
                )}
              </div>
            ))}
          </div>

          <img src="/images/banner.gif" alt="" className="home-banner" />
        </>
      )}

      <div className="text-center text-[13px] text-text-muted mt-12 p-3 bg-surface rounded-md">
        bug feedback/班级群，请加微信：sugarbomb2017
      </div>
    </div>
  )
}

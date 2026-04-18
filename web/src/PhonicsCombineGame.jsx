/**
 * PhonicsCombineGame — Challenge 模式
 *
 * 完成逻辑：最后一个单词拼合正确后，停留在原页面，
 * 在拼读规则文本处显示 "🎉 Congratulations!"，由用户手动返回上级菜单
 */

import { useState, useEffect, useCallback, useReducer, useRef, useMemo } from 'react'

// ── Audio ───────────────────────────────────────────────────
let _audio = null

function stopAudio() {
  if (_audio) {
    try { _audio.pause(); _audio.src = '' } catch (_) {}
    _audio = null
  }
}

function speakWord(word) {
  return new Promise(resolve => {
    stopAudio()
    _audio = new Audio(`/audio/${encodeURIComponent(word.trim())}.mp3`)
    _audio.onended  = () => { _audio = null; resolve() }
    _audio.onerror  = () => { _audio = null; resolve() }
    _audio.play().catch(() => resolve())
  })
}

function playTone(freq, dur = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.22, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
  } catch (_) {}
}

const playCorrect = () => { playTone(660, 0.25); setTimeout(() => playTone(880, 0.35), 220) }
const playWrong   = () => { playTone(220, 0.2); setTimeout(() => playTone(180, 0.25), 200) }
const playDone    = () => { [523,659,784,1047].forEach((f,i) => setTimeout(()=>playTone(f,0.35),i*120)) }

// ── Shuffle ─────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── 干扰项词库 ───────────────────────────────────────────────
const ALL_SYLLABLES = [
  'b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','y','z',
  'ch','sh','th','wh','ng','ck',
  'bl','cl','fl','fr','dr','tr','cr','br','sp','st','sl','sn','sw','tw','sk','sm',
  'a','e','i','o','u',
  'ai','ay','ee','ea','oa','oo','ow','oi','oy','ou','ie','ue','au','aw',
  'ar','or','ir','ur','er','qu',
  'ke','me','ne','le','be','re','ve','te','se','pe','de','ge','he','we',
  'ly','ty','ry','fy','gy','py','by',
]

function buildPool(correctSyllables) {
  const distractors = shuffle(
    ALL_SYLLABLES.filter(s => !correctSyllables.includes(s))
  ).slice(0, 2)
  return shuffle([...correctSyllables, ...distractors]).map(text => ({
    id: `${text}-${Math.random()}`,
    text,
    used: false,
  }))
}

// ── Progress ─────────────────────────────────────────────────
function saveResult(unitKey, score, total) {
  try {
    const prev = JSON.parse(localStorage.getItem('phonics_progress') || '{}')
    const best = prev[unitKey]?.bestScore || 0
    prev[unitKey] = { bestScore: Math.max(best, score), completed: true, total }
    localStorage.setItem('phonics_progress', JSON.stringify(prev))
  } catch (_) {}
}

// ── Reducer ─────────────────────────────────────────────────
const initialState = { pool: [], cursor: 0, feedback: null }

function gameReducer(state, action) {
  switch (action.type) {
    case 'INIT_ROUND':
      return { ...state, pool: action.pool, cursor: 0, feedback: null }
    case 'CLICK_POOL': {
      const { poolId, clickedText, correctText } = action
      const isCorrect = clickedText === correctText
      return {
        ...state,
        pool: state.pool.map(p =>
          p.id === poolId ? { ...p, used: isCorrect ? true : p.used } : p
        ),
        cursor: isCorrect ? state.cursor + 1 : state.cursor,
        feedback: isCorrect ? 'right' : 'wrong',
      }
    }
    case 'RESET_FEEDBACK':
      return { ...state, feedback: null }
    default:
      return state
  }
}

// ── Component ────────────────────────────────────────────────
export default function PhonicsCombineGame({
  unitKey,
  unitTitle,
  unitSubtitleZh,
  allWords,
  onComplete,
  onBack,
}) {
  const validWords = useMemo(
    () => allWords.filter(w => Array.isArray(w.syllables) && w.syllables.length >= 1),
    [allWords]
  )
  const queue = useMemo(
    () => shuffle(validWords.length ? validWords : allWords).slice(0, 10),
    [allWords, validWords]
  )

  const [current, setCurrent] = useState(0)
  const [score, setScore]     = useState(0)
  const [wordResults, setWordResults] = useState([])
  const [playing, setPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false) // 全部完成标志

  const w = queue[current]
  const syllables = w?.syllables || []

  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    pool: w ? buildPool(w.syllables) : [],
  })
  const { pool, cursor, feedback } = state

  const audioWordRef = useRef(null)
  const replayRef = useRef(null)
  const hasPlayedDoneRef = useRef(false)

  // ── 音频播放 ──────────────────────────────────────────────
  useEffect(() => {
    if (isComplete) return
    if (!w) return
    const word = w.word
    if (audioWordRef.current === word) return

    audioWordRef.current = word
    setPlaying(true)
    speakWord(word).finally(() => {
      setPlaying(false)
      if (audioWordRef.current === word) {
        audioWordRef.current = null
      }
    })
  }, [current, w?.word, isComplete])

  // ── 切题时重建候选池 ──────────────────────────────────────
  const prevCurrentRef = useRef(current)
  useEffect(() => {
    if (isComplete) return
    if (prevCurrentRef.current === current) return
    prevCurrentRef.current = current
    if (!w) return
    dispatch({ type: 'INIT_ROUND', pool: buildPool(w.syllables) })
  }, [current, isComplete])

  // ── feedback 清除 ─────────────────────────────────────────
  useEffect(() => {
    if (feedback !== 'right') return
    if (cursor >= syllables.length) return // 填满时不重置，等自动处理
    const t = setTimeout(() => dispatch({ type: 'RESET_FEEDBACK' }), 600)
    return () => clearTimeout(t)
  }, [feedback, cursor, syllables.length])

  // ── 全部填满 → 处理完成或下一题 ───────────────────────────
  useEffect(() => {
    if (isComplete) return
    if (feedback !== 'right') return
    if (cursor !== syllables.length) return

    const t = setTimeout(() => {
      const next = current + 1
      const newScore = score + 1
      setWordResults(r => [...r, { word: w.word, correct: true }])
      setScore(newScore)

      if (next >= queue.length) {
        // 最后一个单词完成，不跳转，显示完成状态
        saveResult(unitKey, newScore, queue.length)
        setIsComplete(true)
        if (!hasPlayedDoneRef.current) {
          playDone()
          hasPlayedDoneRef.current = true
        }
      } else {
        prevCurrentRef.current = -1
        setCurrent(next)
      }
    }, 900)
    return () => clearTimeout(t)
  }, [feedback, cursor, current, score, queue.length, syllables.length, w, isComplete])

  // ── Play again ───────────────────────────────────────────
  const handleReplay = useCallback(() => {
    if (!w) return
    stopAudio()
    const word = w.word
    replayRef.current = word
    setPlaying(true)
    speakWord(word).finally(() => {
      if (replayRef.current === word) {
        replayRef.current = null
        setPlaying(false)
      }
    })
  }, [w?.word])

  // ── Skip ─────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (!w) return
    stopAudio()
    audioWordRef.current = null
    const next = current + 1
    setWordResults(r => [...r, { word: w.word, correct: false }])
    if (next >= queue.length) {
      saveResult(unitKey, score, queue.length)
      setIsComplete(true)
      if (!hasPlayedDoneRef.current) {
        playDone()
        hasPlayedDoneRef.current = true
      }
    } else {
      prevCurrentRef.current = -1
      setCurrent(next)
    }
  }, [w?.word, current, score, queue.length])

  // ── Reset ────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    dispatch({ type: 'INIT_ROUND', pool: buildPool(syllables) })
  }, [syllables])

  // ── 点击候选块 ───────────────────────────────────────────
  const handlePoolClick = useCallback((poolId, clickedText) => {
    if (isComplete) return
    if (feedback === 'right') return
    const correctText = syllables[cursor]
    if (!correctText) return
    dispatch({ type: 'CLICK_POOL', poolId, clickedText, correctText })
    if (clickedText === correctText) playCorrect()
    else playWrong()
  }, [feedback, syllables, cursor, isComplete])

  // ── 槽位样式 ─────────────────────────────────────────────
  function slotClass(idx) {
    const cls = ['combine-slot']
    if (idx < cursor) {
      cls.push('filled')
      if (feedback === 'right') cls.push('correct')
    }
    if (feedback === 'wrong' && idx === cursor) cls.push('wrong')
    if (idx === cursor && feedback !== 'right') cls.push('cursor')
    return cls.join(' ')
  }

  // ── 完成状态渲染 ──────────────────────────────────────────
  if (isComplete) {
    const safeScore = score || 0
    const safeTotal = queue.length || 1
    const pct = Math.round((safeScore / safeTotal) * 100)

    return (
      <div className="spelling-scene">
        {/* Header */}
        <div className="spelling-header">
          <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
          <span className="spelling-title">{unitTitle}</span>
          <span className="spelling-score">🧩 {score} pts</span>
        </div>

        {/* Progress bar - 100% */}
        <div className="spelling-progress-bar">
          <div className="spelling-progress-fill" style={{ width: '100%' }} />
        </div>

        {/* Congratulations 显示在拼读规则位置 */}
        <div className="phase-tag phase-correct" style={{ fontSize: '1.5rem', padding: '12px 24px' }}>
          🎉 Congratulations!
        </div>

        {/* 完成统计卡片 */}
        <div className="spell-card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏆</div>
          <div className="spell-def" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
            Challenge Complete!
          </div>
          <div style={{ fontSize: '2rem', color: '#4caf50', marginBottom: '10px' }}>
            {safeScore} / {safeTotal}
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', marginBottom: '10px' }}>
            <div style={{ width: pct + '%', height: '100%', background: '#4caf50', borderRadius: '5px' }} />
          </div>
          <div style={{ color: '#666' }}>{pct}% correct</div>
        </div>

        {/* 返回按钮 */}
        <div className="chop-actions" style={{ marginTop: '30px' }}>
          <button className="btn btn-primary" onClick={onComplete}>
            ← Back to Menu
          </button>
        </div>
      </div>
    )
  }

  if (!w) return null

  return (
    <div className="spelling-scene">
      {/* Header */}
      <div className="spelling-header">
        <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
        <span className="spelling-title">{unitTitle}</span>
        <span className="spelling-score">🧩 {score} pts</span>
      </div>

      {/* Progress bar */}
      <div className="spelling-progress-bar">
        <div className="spelling-progress-fill"
          style={{ width: `${((current + 1) / queue.length) * 100}%` }} />
      </div>

      {/* Phase tag */}
      <div className={`phase-tag ${feedback === 'right' ? 'phase-correct' : ''} ${feedback === 'wrong' ? 'phase-wrong' : ''}`}>
        {feedback === 'right' ? '✨ Correct!'
          : feedback === 'wrong' ? '❌ Try again!'
          : `Q${current + 1} / ${queue.length}`}
      </div>

      {/* 单词卡片 */}
      <div className="spell-card">
        <div className="spell-def">{w.definition}</div>
        <div className="spell-phonetic">{w.phonetic}</div>
      </div>

      {/* Play again */}
      <button className="challenge-replay-btn" onClick={handleReplay} disabled={playing}>
        🔊 {playing ? 'Playing...' : 'Play again'}
      </button>

      {/* 单词音素槽 */}
      <div className="combine-slots">
        {syllables.map((syl, i) => (
          <div key={i} className={slotClass(i)}>
            {i < cursor
              ? <span className="combine-slot-text">{syl}</span>
              : <span className="combine-slot-placeholder">
                  {i === cursor ? '↓' : '_'}
                </span>
            }
          </div>
        ))}
      </div>

      {/* 进度 */}
      <div className="combine-hint">{cursor} / {syllables.length}</div>

      {/* 候选池 */}
      <div className="combine-pool">
        <div className="combine-pool-label">Tap the correct phoneme</div>
        <div className="combine-pool-items">
          {pool.map(item => (
            <button
              key={item.id}
              className={`combine-piece${item.used ? ' used' : ''}${feedback === 'wrong' && !item.used ? ' shake' : ''}`}
              onClick={() => !item.used && feedback !== 'right' && handlePoolClick(item.id, item.text)}
              disabled={item.used || feedback === 'right'}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="chop-actions">
        <button className="btn btn-secondary" onClick={handleReset}>🔄 Reset</button>
        <button className="btn btn-primary" onClick={handleSkip}>
          {current + 1 >= queue.length ? 'See Results →' : 'Skip →'}
        </button>
      </div>
    </div>
  )
}

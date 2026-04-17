/**
 * PhonicsChopGame — 切分模式
 * 展示完整单词，点击字母块之间的缝隙来"砍"出音节边界
 * syllables 字段定义正确切分
 */

import { useState, useEffect, useCallback } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function playTone(freq, duration = 0.4) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(); osc.stop(ctx.currentTime + duration)
  } catch (e) {}
}

const playCorrect = () => playTone(880, 0.4)
const playWrong  = () => playTone(220, 0.3)

export default function PhonicsChopGame({ unitKey, unitTitle, allWords, onComplete, onBack }) {
  // 过滤有 syllables 的词（至少1个音节）
  const pool = allWords.filter(w => Array.isArray(w.syllables) && w.syllables.length >= 1)
  const queue = shuffle(pool.length ? pool : allWords).slice(0, 10)

  const [current,  setCurrent]  = useState(0)
  const [score,    setScore]    = useState(0)
  const [finished, setFinished] = useState(false)
  const [wordResults, setWordResults] = useState([])
  const [cuts,    setCuts]      = useState([])   // 当前已切位置
  const [feedback,setFeedback]  = useState(null)
  const [shake,   setShake]    = useState(false)

  const w = queue[current]
  const syllables = w?.syllables || []

  // 计算正确切分位置（字符索引）
  function correctCutPositions(syls) {
    const positions = []
    let pos = 0
    for (let i = 0; i < syls.length - 1; i++) {
      pos += syls[i].length
      positions.push(pos)
    }
    return positions
  }

  const correctCuts = correctCutPositions(syllables)

  // 换题时重置
  useEffect(() => {
    setCuts([])
    setFeedback(null)
  }, [current])

  // 结束保存进度
  useEffect(() => {
    if (!finished) return
    try {
      const prev = JSON.parse(localStorage.getItem('phonics_progress') || '{}')
      const best = prev[unitKey]?.bestScore || 0
      prev[unitKey] = { bestScore: Math.max(best, score), completed: true, total: queue.length }
      localStorage.setItem('phonics_progress', JSON.stringify(prev))
    } catch (e) {}
  }, [finished])

  // 切分完成自动下一题
  useEffect(() => {
    if (feedback !== 'correct') return
    const t = setTimeout(() => {
      if (current + 1 >= queue.length) setFinished(true)
      else setCurrent(c => c + 1)
    }, 1100)
    return () => clearTimeout(t)
  }, [feedback, current])

  // 点击缝隙 toggle 切分
  const handleGapClick = useCallback((gapIdx) => {
    if (feedback === 'correct') return
    const newCuts = cuts.includes(gapIdx)
      ? cuts.filter(c => c !== gapIdx)
      : [...cuts, gapIdx].sort((a, b) => a - b)
    setCuts(newCuts)

    if (newCuts.length === correctCuts.length) {
      const match = newCuts.every((c, i) => c === correctCuts[i])
      if (match) {
        setFeedback('correct')
        setScore(s => s + 1)
        setWordResults(r => [...r, { word: w.word, correct: true }])
        playCorrect()
      } else {
        setFeedback('wrong')
        setWordResults(r => [...r, { word: w.word, correct: false }])
        setShake(true)
        playWrong()
        setTimeout(() => { setShake(false); setCuts([]) }, 700)
      }
    }
  }, [cuts, feedback, correctCuts, w])

  const handleSkip = () => {
    if (current + 1 >= queue.length) setFinished(true)
    else setCurrent(c => c + 1)
  }

  // 将单词按 cuts 切分成片段
  function buildChunks(word, cutList) {
    if (!cutList.length) return [word]
    const result = []
    let last = 0
    for (const cut of cutList) {
      result.push(word.slice(last, cut))
      last = cut
    }
    result.push(word.slice(last))
    return result
  }

  // 缝隙在两个 chunk 之间的字符位置（累计到上一个 chunk 末尾）
  function gapAt(chunks, afterIdx) {
    return chunks.slice(0, afterIdx + 1).join('').length
  }

  if (finished) {
    const pct = Math.round((score / queue.length) * 100)
    return (
      <div className="result-screen">
        <div className="result-card">
          <h2 className="result-title">🎉 Chop Complete!</h2>
          <div className="result-score">{score} / {queue.length}</div>
          <div className="result-bar"><div className="result-bar-fill" style={{ width: pct + '%' }} /></div>
          <p className="result-pct">{pct}% correct</p>
          <button className="btn btn-primary" onClick={onComplete}>Back to Menu</button>
        </div>
      </div>
    )
  }

  if (!w) return null

  const chunks = buildChunks(w.word, cuts)

  return (
    <div className="spelling-scene">
      <div className="spelling-header">
        <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
        <span className="spelling-title">{unitTitle}</span>
        <span className="spelling-score">✂️ {score} pts</span>
      </div>
      <div className="spelling-progress-bar">
        <div className="spelling-progress-fill" style={{ width: `${(current / queue.length) * 100}%` }} />
      </div>

      <div className={`phase-tag ${feedback === 'correct' ? 'phase-correct' : ''}`}>
        {feedback === 'correct' ? '✨ Correct!'
          : feedback === 'wrong' ? 'Try again — click the gaps!'
          : `Q${current + 1} / ${queue.length}`}
      </div>

      {/* 单词 + 缝隙区域 */}
      <div className={`chop-word-area ${shake ? 'shake' : ''}`}>
        <div className="chop-word-display">
          {chunks.map((chunk, i) => (
            <div key={i} className="chop-chunk">
              <span className="chop-chunk-text">{chunk}</span>
              {i < chunks.length - 1 && (
                <div
                  className={`chop-gap ${cuts.includes(gapAt(chunks, i)) ? 'cut' : ''}`}
                  onClick={() => handleGapClick(gapAt(chunks, i))}
                  title="Click to cut"
                >
                  <div className="chop-gap-line" />
                  {cuts.includes(gapAt(chunks, i)) && (
                    <div className="chop-gap-blade">✂️</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 错误后显示答案 */}
        {feedback === 'wrong' && (
          <div className="chop-answer-hint">
            {syllables.map((syl, i) => (
              <span key={i} className="chop-syl-badge">{syl}</span>
            ))}
          </div>
        )}
      </div>

      {/* 操作区 */}
      <div className="chop-actions">
        <button className="btn btn-secondary" onClick={() => { setCuts([]); setFeedback(null) }}>
          🔄 Reset
        </button>
        <button className="btn btn-primary" onClick={handleSkip}>
          {current + 1 >= queue.length ? 'See Results →' : 'Skip →'}
        </button>
      </div>

      <div className="chop-progress-hint">
        {feedback === 'correct'
          ? <span style={{ color: '#22c55e', fontWeight: 600 }}>✨ Correct!</span>
          : `${cuts.length} / ${correctCuts.length} cuts — tap the gaps between letters`}
      </div>
    </div>
  )
}

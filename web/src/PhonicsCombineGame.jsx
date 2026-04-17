/**
 * PhonicsCombineGame — 拼合模式
 * 散落的音素块（ch/sh/ai/ee 等）拖拽到目标槽，组合成单词
 * syllables 字段定义音素块（如 ["ch","air"] for "chair"）
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
const playWrong  = () => { playTone(220, 0.25); setTimeout(() => playTone(180, 0.25), 250) }

let _pieceCounter = 0
function newPieceId() { return `piece-${Date.now()}-${_pieceCounter++}` }

export default function PhonicsCombineGame({ unitKey, unitTitle, allWords, onComplete, onBack }) {
  // 过滤有 syllables 且至少2个块的词
  const pool = allWords.filter(w => Array.isArray(w.syllables) && w.syllables.length >= 2)
  const queue = shuffle(pool.length ? pool : allWords).slice(0, 10)

  const [current,   setCurrent]   = useState(0)
  const [score,     setScore]     = useState(0)
  const [finished,  setFinished]  = useState(false)
  const [wordResults, setWordResults] = useState([])
  const [slots,     setSlots]     = useState([])   // [{id, text, filled}]
  const [poolItems, setPoolItems] = useState([])   // [{id, text}]
  const [feedback,  setFeedback]  = useState(null)
  const [draggedId, setDraggedId] = useState(null)

  const w = queue[current]
  const chunks = w?.syllables || []

  // 初始化一轮
  function initRound() {
    const shuffled = shuffle([...chunks])
    setPoolItems(shuffled.map(text => ({ id: newPieceId(), text })))
    setSlots(chunks.map(text => ({ id: newPieceId(), text, filled: null })))
    setFeedback(null)
  }

  // 换题时重新初始化
  useEffect(() => { if (w) initRound() }, [current])

  // 结束保存
  useEffect(() => {
    if (!finished) return
    try {
      const prev = JSON.parse(localStorage.getItem('phonics_progress') || '{}')
      const best = prev[unitKey]?.bestScore || 0
      prev[unitKey] = { bestScore: Math.max(best, score), completed: true, total: queue.length }
      localStorage.setItem('phonics_progress', JSON.stringify(prev))
    } catch (e) {}
  }, [finished])

  // 正确答案后自动下一题
  useEffect(() => {
    if (feedback !== 'correct') return
    const t = setTimeout(() => {
      if (current + 1 >= queue.length) setFinished(true)
      else setCurrent(c => c + 1)
    }, 1100)
    return () => clearTimeout(t)
  }, [feedback, current])

  // 检查是否全部填满且正确
  function checkComplete() {
    const filled = slots.map(s => s.filled)
    if (filled.some(f => f === null)) return
    const joined = filled.join('')
    if (joined.toLowerCase() === w.word.toLowerCase()) {
      setFeedback('correct')
      setScore(s => s + 1)
      setWordResults(r => [...r, { word: w.word, correct: true }])
      playCorrect()
    } else {
      setFeedback('wrong')
      setWordResults(r => [...r, { word: w.word, correct: false }])
      playWrong()
      // 延迟后重置槽位
      setTimeout(() => {
        // 把已填的块退回池
        const toReturn = slots.map(s => s.filled).filter(Boolean)
        setSlots(ss => ss.map(s => ({ ...s, filled: null })))
        setPoolItems(p => [...p, ...toReturn.map(t => ({ id: newPieceId(), text: t }))])
        setFeedback(null)
      }, 900)
    }
  }

  // ── 拖拽：词块 → 槽位 ──────────────────────────
  const handlePoolDragStart = (e, item) => {
    setDraggedId(item.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.setData('text/source', 'pool')
  }

  const handleSlotDragStart = (e, slotId, text) => {
    setDraggedId(slotId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', slotId)
    e.dataTransfer.setData('text/source', 'slot')
    e.dataTransfer.setData('text/text', text)
  }

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  // 放置到槽位
  const handleDropOnSlot = (e, targetSlotId) => {
    e.preventDefault()
    const source = e.dataTransfer.getData('text/source')
    const sourceId = e.dataTransfer.getData('text/plain')

    if (source === 'pool') {
      const item = poolItems.find(p => p.id === sourceId)
      if (!item) return
      // 目标槽若已有块，退回池
      setSlots(prev => {
        const target = prev.find(s => s.id === targetSlotId)
        let extra = []
        if (target?.filled) extra = [{ id: newPieceId(), text: target.filled }]
        return prev.map(s => s.id === targetSlotId
          ? { ...s, filled: item.text }
          : s
        ).concat(extra.length ? extra : [])
      })
      setPoolItems(prev => prev.filter(p => p.id !== item.id))
    } else if (source === 'slot') {
      // 交换两个槽
      const text = e.dataTransfer.getData('text/text')
      setSlots(prev => prev.map(s => {
        if (s.id === targetSlotId) {
          const targetFilled = s.filled
          // 找源槽并清空
          return { ...s, filled: text }
        }
        if (s.id === sourceId) {
          const target = prev.find(ss => ss.id === targetSlotId)
          return { ...s, filled: target?.filled || null }
        }
        return s
      }))
    }
    setDraggedId(null)
    setTimeout(checkComplete, 60)
  }

  // 放置回池
  const handleDropOnPool = (e) => {
    e.preventDefault()
    if (e.dataTransfer.getData('text/source') !== 'slot') return
    const slotId = e.dataTransfer.getData('text/plain')
    const text = e.dataTransfer.getData('text/text')
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, filled: null } : s))
    setPoolItems(prev => [...prev, { id: newPieceId(), text }])
    setDraggedId(null)
  }

  // 点击词块 → 放入第一个空槽
  const handlePoolClick = useCallback((item) => {
    const empty = slots.find(s => s.filled === null)
    if (!empty) return
    // 槽有块则退回
    if (empty.filled) {
      setPoolItems(p => [...p, { id: newPieceId(), text: empty.filled }])
    }
    setSlots(prev => prev.map(s => s.id === empty.id ? { ...s, filled: item.text } : s))
    setPoolItems(prev => prev.filter(p => p.id !== item.id))
    setTimeout(checkComplete, 60)
  }, [slots])

  const handleSkip = () => {
    if (current + 1 >= queue.length) setFinished(true)
    else setCurrent(c => c + 1)
  }

  if (finished) {
    const pct = Math.round((score / queue.length) * 100)
    return (
      <div className="result-screen">
        <div className="result-card">
          <h2 className="result-title">🎉 Combine Complete!</h2>
          <div className="result-score">{score} / {queue.length}</div>
          <div className="result-bar"><div className="result-bar-fill" style={{ width: pct + '%' }} /></div>
          <p className="result-pct">{pct}% correct</p>
          <button className="btn btn-primary" onClick={onComplete}>Back to Menu</button>
        </div>
      </div>
    )
  }

  if (!w) return null

  return (
    <div className="spelling-scene">
      <div className="spelling-header">
        <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
        <span className="spelling-title">{unitTitle}</span>
        <span className="spelling-score">🧩 {score} pts</span>
      </div>
      <div className="spelling-progress-bar">
        <div className="spelling-progress-fill" style={{ width: `${(current / queue.length) * 100}%` }} />
      </div>

      <div className="phase-tag">
        {feedback === 'correct' ? '✨ Correct!'
          : feedback === 'wrong' ? 'Try again!'
          : `Q${current + 1} / ${queue.length}`}
      </div>

      {/* 单词定义 */}
      <div className="spell-def" style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 500, textAlign: 'center' }}>
        {w.definition}
      </div>

      {/* 目标槽 */}
      <div className={`combine-slots ${feedback === 'wrong' ? 'shake' : ''}`}>
        {slots.map((slot, i) => (
          <div
            key={slot.id}
            className={`combine-slot ${slot.filled ? 'filled' : ''} ${feedback === 'correct' ? 'correct' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnSlot(e, slot.id)}
            draggable={!!slot.filled}
            onDragStart={(e) => slot.filled && handleSlotDragStart(e, slot.id, slot.filled)}
          >
            {slot.filled
              ? <span className="combine-slot-text">{slot.filled}</span>
              : <span className="combine-slot-placeholder">?</span>}
          </div>
        ))}
      </div>

      <div className="combine-hint">{chunks.length} pieces — drag or click to fill</div>

      {/* 词池 */}
      <div
        className="combine-pool"
        onDragOver={handleDragOver}
        onDrop={handleDropOnPool}
      >
        <div className="combine-pool-label">Pieces — drag to slots above</div>
        {poolItems.map(item => (
          <div
            key={item.id}
            className="combine-piece"
            draggable
            onDragStart={(e) => handlePoolDragStart(e, item)}
            onClick={() => handlePoolClick(item)}
            title="Drag or click"
          >
            {item.text}
          </div>
        ))}
        {poolItems.length === 0 && !feedback && (
          <div className="combine-pool-empty">All placed!</div>
        )}
      </div>

      {/* 操作 */}
      <div className="chop-actions">
        <button className="btn btn-secondary" onClick={initRound}>🔄 Reset</button>
        <button className="btn btn-primary" onClick={handleSkip}>
          {current + 1 >= queue.length ? 'See Results →' : 'Skip →'}
        </button>
      </div>
    </div>
  )
}

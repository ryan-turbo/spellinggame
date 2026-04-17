/**
 * PhonicsLearnView — Phonics Learn 页面
 * 参考 pindushu.com 交互：
 * - 大字母/音素 块，点击发音
 * - 下方音标
 * - 下方 3 个示例单词，点击发音
 */

import { useState, useEffect } from 'react'

function speak(text, lang = 'en-GB') {
  if (!text) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = 0.85
  speechSynthesis.cancel()
  speechSynthesis.speak(u)
}

export default function PhonicsLearnView({ unitKey, unitTitle, allWords, onComplete, onBack }) {
  const [current, setCurrent] = useState(0)
  const w = allWords[current]
  const total = allWords.length

  // 自动读当前词
  useEffect(() => {
    if (!w) return
    const t = setTimeout(() => speak(w.word), 200)
    return () => clearTimeout(t)
  }, [current, w])

  // 上一条/下一条
  const prev = () => setCurrent(c => Math.max(0, c - 1))
  const next = () => setCurrent(c => Math.min(total - 1, c + 1))

  // 提取 definition 中的示例词
  // 例如: "b → /b/ (bat, ball, bed)" → ["bat","ball","bed"]
  function extractExamples(def) {
    if (!def) return []
    const m = def.match(/\(([^)]+)\)/)
    if (!m) return []
    return m[1].split(/,\s*/).slice(0, 3)
  }

  // 获取主音素：单词的第一个字母（大写）
  function getPhoneme(word) {
    return word ? word[0].toUpperCase() : ''
  }

  if (!w) return (
    <div className="spelling-scene" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>No words in this unit.</p>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onBack}>← Back</button>
    </div>
  )

  const examples = extractExamples(w.definition)
  const phoneme = getPhoneme(w.word)

  return (
    <div className="spelling-scene phonics-learn-scene">
      {/* Header */}
      <div className="spelling-header">
        <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
        <span className="spelling-title">{unitTitle}</span>
        <span className="spelling-score">{current + 1}/{total}</span>
      </div>

      {/* Progress */}
      <div className="spelling-progress-bar">
        <div className="spelling-progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* Main card */}
      <div className="phonics-learn-card">
        {/* Big phoneme letter */}
        <div
          className="phonics-phoneme-btn"
          onClick={() => speak(w.word)}
          title="Click to hear"
        >
          <span className="phonics-phoneme-letter">{phoneme}</span>
          <span className="phonics-phoneme-hint">🔊</span>
        </div>

        {/* Word */}
        <div className="phonics-learn-word" onClick={() => speak(w.word)}>
          {w.word}
        </div>

        {/* Phonetic */}
        <div className="phonics-learn-phonetic">
          {w.phonetic || ''}
        </div>

        {/* Rule / definition note */}
        <div className="phonics-learn-rule">
          {w.definition || ''}
        </div>

        {/* Example words */}
        {examples.length > 0 && (
          <div className="phonics-learn-examples">
            <div className="phonics-learn-examples-label">Example words:</div>
            <div className="phonics-learn-example-list">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  className="phonics-learn-example-btn"
                  onClick={() => speak(ex.trim())}
                >
                  {ex.trim()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="phonics-learn-nav">
        <button
          className="btn btn-secondary"
          onClick={prev}
          disabled={current === 0}
        >
          ← Prev
        </button>

        {/* Dot indicators */}
        <div className="phonics-learn-dots">
          {allWords.map((_, i) => (
            <div
              key={i}
              className={`phonics-learn-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
            />
          ))}
        </div>

        {current < total - 1 ? (
          <button className="btn btn-primary" onClick={next}>
            Next →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onComplete}>
            ✓ Done
          </button>
        )}
      </div>
    </div>
  )
}

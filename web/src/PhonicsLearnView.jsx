/**
 * PhonicsLearnView — Phonics Learn 页面
 * - 点击大字母 → 发字母音
 * - 点击主词中每个字母 → 发对应字母音
 * - 主词旁 speaker 按钮 → 发整个单词
 * - 下方 3 个次示例单词 → 点击发音
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

  // 提取 definition 中的示例词
  function extractExamples(def) {
    if (!def) return []
    const m = def.match(/\(([^)]+)\)/)
    if (!m) return []
    return m[1].split(/,\s*/).slice(0, 3)
  }

  // 从 syllables 获取字母对应的音素
  // syllables: ["b","a","t"] 对应 word: "bat"
  function getPhonemeForLetter(word, syllables, letterIdx) {
    if (!syllables || !syllables.length) return word[letterIdx] || ''
    let pos = 0
    for (const syl of syllables) {
      const len = syl.length
      if (letterIdx < pos + len) {
        return syl  // 这个字母落在当前音素块内
      }
      pos += len
    }
    return word[letterIdx] || ''
  }

  // 主词中每个字母的音素
  function getLetterPhonemes(word, syllables) {
    const letters = word.split('')
    return letters.map((letter, i) => getPhonemeForLetter(word, syllables, i))
  }

  // 点击字母 → 发音素
  const handleLetterClick = (phoneme) => {
    speak(phoneme)
  }

  // 点击主词整体 → 发完整单词
  const handleWordSpeak = () => {
    speak(w.word)
  }

  // 点击次示例 → 发示例词
  const handleExampleSpeak = (ex) => {
    speak(ex.trim())
  }

  if (!w) return (
    <div className="spelling-scene" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>No words in this unit.</p>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onBack}>← Back</button>
    </div>
  )

  const examples = extractExamples(w.definition)
  const phonemes = getLetterPhonemes(w.word, w.syllables)

  return (
    <div className="spelling-scene phonics-learn-scene">
      {/* Header */}
      <div className="spelling-header">
        <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
        <span className="spelling-title">{unitTitle}</span>
        <span className="spelling-score">{current + 1}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="spelling-progress-bar">
        <div className="spelling-progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* ── 主学习卡片 ────────────────────────────── */}
      <div className="phonics-learn-card">

        {/* 1. 大字母按钮 → 发字母音 */}
        <div
          className="phonics-phoneme-btn"
          onClick={() => speak(w.syllables?.[0] || w.word[0])}
          title="Click to hear letter sound"
        >
          <span className="phonics-phoneme-letter">{w.word[0].toUpperCase()}</span>
          <span className="phonics-phoneme-hint">🔊 letter sound</span>
        </div>

        {/* 2. 音标 */}
        <div className="phonics-learn-phonetic">{w.phonetic || ''}</div>

        {/* 3. 发音规则说明 */}
        <div className="phonics-learn-rule">{w.definition || ''}</div>

        {/* 4. 主单词：每个字母可点击 + 旁侧 speaker 按钮 */}
        <div className="phonics-learn-mainword-row">
          <div className="phonics-learn-word">
            {w.word.split('').map((letter, i) => (
              <span
                key={i}
                className="phonics-letter-btn"
                onClick={() => handleLetterClick(phonemes[i] || letter)}
                title={`${letter} → /${phonemes[i] || letter}/`}
              >
                {letter}
              </span>
            ))}
          </div>
          <button
            className="phonics-word-speak-btn"
            onClick={handleWordSpeak}
            title="Hear the full word"
          >
            🔊
          </button>
        </div>

        {/* 5. 字母音标提示行 */}
        <div className="phonics-letter-ipa-row">
          {phonemes.map((ph, i) => (
            <span key={i} className="phonics-letter-ipa">{ph}</span>
          ))}
        </div>

        {/* 6. 次示例单词（点击发音） */}
        {examples.length > 0 && (
          <div className="phonics-learn-examples">
            <div className="phonics-learn-examples-label">Example words:</div>
            <div className="phonics-learn-example-list">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  className="phonics-learn-example-btn"
                  onClick={() => handleExampleSpeak(ex)}
                >
                  {ex.trim()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 导航 */}
      <div className="phonics-learn-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          ← Prev
        </button>

        <div className="phonics-learn-dots">
          {allWords.map((_, i) => (
            <div
              key={i}
              className={`phonics-learn-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
              onClick={() => setCurrent(i)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>

        {current < total - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}>
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

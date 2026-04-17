/**
 * PhonicsLearnView — Phonics Learn 页面
 *
 * 交互：
 * - 点击大字母 → 发字母音（用真实词映射）
 * - 点击主词中每个字母 → 发对应字母音（用真实词映射）
 * - 主词旁 speaker 按钮 → 发完整单词
 * - 下方发音规则 + 3 个示例单词
 */

import { useState } from 'react'

// ============================================================
// IPA → 真实词映射（TTS 读这个词，发出对应 IPA 音）
// 核心原则：用词的首音 = IPA 音
// ============================================================
const IPA_TO_WORD = {
  // 辅音
  'b': 'bat',    // /b/ — bat 的首音是 /b/ ✅
  'd': 'dog',    // /d/
  'f': 'fish',   // /f/
  'g': 'go',     // /g/
  'h': 'hat',    // /h/
  'j': 'jam',    // /dʒ/ (j = dʒ)
  'k': 'cat',    // /k/
  'l': 'lion',   // /l/
  'm': 'moon',   // /m/
  'n': 'net',    // /n/
  'p': 'pig',    // /p/
  'r': 'red',    // /r/
  's': 'sun',    // /s/
  't': 'top',    // /t/
  'v': 'van',    // /v/
  'w': 'wet',    // /w/
  'x': 'fox',    // /ks/ (x 末音)
  'y': 'yes',    // /j/
  'z': 'zebra',  // /z/

  // 特殊字母组合（单个 IPA 符号不够，用词）
  'ŋ': 'sing',       // /ŋ/ — sing 末音 /ŋ/
  'ɹ': 'run',        // /ɹ/ — run 首音 /r/（英式 r）
  'ʃ': 'ship',       // /ʃ/
  'ʒ': 'measure',    // /ʒ/
  'θ': 'think',      // /θ/ — think 首音
  'ð': 'this',       // /ð/ — this 首音

  // 短元音
  'æ': 'cat',        // /æ/ — cat 中间音
  'e': 'bed',        // /e/ — bed 中间音
  'ɪ': 'sit',        // /ɪ/ — sit 中间音
  'ɒ': 'hot',        // /ɒ/ — hot 中间音（英式）
  'ʌ': 'cup',        // /ʌ/ — cup 中间音

  // 长元音 / 双元音
  'iː': 'see',       // /iː/
  'uː': 'moon',      // /uː/ — moon 中间音
  'ɑː': 'car',       // /ɑː/
  'ɔː': 'door',      // /ɔː/
  'ɜː': 'bird',      // /ɜː/

  // 双元音
  'eɪ': 'day',       // /eɪ/
  'aɪ': 'fly',       // /aɪ/
  'ɔɪ': 'boy',       // /ɔɪ/
  'aʊ': 'cow',       // /aʊ/
  'əʊ': 'go',        // /əʊ/
  'ɪə': 'ear',       // /ɪə/
  'eə': 'hair',      // /eə/
  'ʊə': 'tour',      // /ʊə/

  // 字母组合（syllables 中的值）
  'ch': 'chip',      // /tʃ/
  'sh': 'ship',      // /ʃ/
  'th': 'think',     // /θ/
  'TH': 'this',      // /ð/
  'ph': 'fish',      // /f/
  'wh': 'wet',       // /w/
  'ng': 'sing',      // /ŋ/
  'ck': 'duck',      // /k/
  'ee': 'see',       // /iː/
  'oo': 'moon',      // /uː/
  'ea': 'see',       // /iː/
  'ai': 'day',       // /eɪ/
  'ay': 'day',       // /eɪ/
  'oa': 'go',        // /əʊ/
  'ow': 'go',        // /əʊ/ (go 型)
  'ou': 'cow',       // /aʊ/
  'oy': 'boy',       // /ɔɪ/
  'er': 'bird',      // /ɜː/
  'ir': 'bird',      // /ɜː/
  'ur': 'bird',      // /ɜː/
  'ar': 'car',       // /ɑː/
  'or': 'door',      // /ɔː/
  'aw': 'door',      // /ɔː/
  'air': 'hair',     // /eə/
  'ear': 'ear',      // /ɪə/
}

// 特殊字母组合（大写开头）
const UPPER_COMBO = { 'TH': IPA_TO_WORD['TH'], 'Ch': IPA_TO_WORD['ch'] }

// ============================================================
// 辅音字母名 → IPA 映射
// ============================================================
const CONSONANT_MAP = {}
const cons = 'bcdfgklmnprstvwxyz'
const c2i = {
  b:'b',c:'k',d:'d',f:'f',g:'g',h:'h',j:'dʒ',
  k:'k',l:'l',m:'m',n:'n',p:'p',r:'ɹ',s:'s',
  t:'t',v:'v',w:'w',x:'ks',y:'j',z:'z'
}
cons.split('').forEach(l => {
  CONSONANT_MAP[l] = c2i[l]
  CONSONANT_MAP[l.toUpperCase()] = c2i[l]
})

// 元音字母名 → IPA（默认短元音）
const VOWEL_MAP = {
  a:'æ', e:'e', i:'ɪ', o:'ɒ', u:'ʌ',
  A:'æ', E:'e', I:'ɪ', O:'ɒ', U:'ʌ',
}

// ============================================================
// 核心函数
// ============================================================

// 根据字母/syllable 值找 IPA → 真实词 → TTS
function getIPA(letterOrChunk) {
  if (!letterOrChunk) return ''
  const k = letterOrChunk.toLowerCase()
  return IPA_TO_WORD[k] ? k : letterOrChunk  // 返回 IPA key 或原始值
}

// 发音素（通过真实词 TTS）
function speakPhoneme(ipa) {
  speechSynthesis.cancel()
  const word = IPA_TO_WORD[ipa] || IPA_TO_WORD[ipa.toLowerCase()] || ipa
  const utter = new SpeechSynthesisUtterance(word)
  utter.lang = 'en-GB'
  utter.rate = 0.8
  speechSynthesis.speak(utter)
}

// 发完整单词
function speakWord(word) {
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(word)
  u.lang = 'en-GB'
  u.rate = 0.85
  speechSynthesis.speak(u)
}

// 发示例词
function speakExample(ex) {
  speakWord(ex.trim())
}

// syllables → IPA 列表
function syllablesToIPA(syllables) {
  if (!syllables) return []
  return syllables.map(s => {
    const k = s.toLowerCase()
    return IPA_TO_WORD[k] ? k : s
  })
}

// 提取 definition 中的示例词
function extractExamples(def) {
  if (!def) return []
  const m = def.match(/\(([^)]+)\)/)
  if (!m) return []
  return m[1].split(/,\s*/).slice(0, 3)
}

// ============================================================
// 组件
// ============================================================
export default function PhonicsLearnView({ unitKey, unitTitle, allWords, onComplete, onBack }) {
  const [current, setCurrent] = useState(0)
  const w = allWords[current]
  const total = allWords.length

  if (!w) return (
    <div className="spelling-scene" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>No words in this unit.</p>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onBack}>← Back</button>
    </div>
  )

  const examples = extractExamples(w.definition)
  const ipaList = syllablesToIPA(w.syllables || [])

  // 大字母对应的 IPA（第一个音素）
  const firstIPA = ipaList[0] || CONSONANT_MAP[w.word[0]] || VOWEL_MAP[w.word[0]] || w.word[0]

  // 主词每个字母对应的 IPA（对齐 syllables）
  function getIPAForIdx(idx) {
    if (!w.syllables || !w.syllables.length) {
      // fallback: 按字母
      const l = w.word[idx]
      return CONSONANT_MAP[l] || VOWEL_MAP[l] || l
    }
    return ipaList[idx] || ''
  }

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

      {/* ── 主学习卡片 ─────────────────────────────── */}
      <div className="phonics-learn-card">

        {/* 1. 大字母按钮 */}
        <div
          className="phonics-phoneme-btn"
          onClick={() => speakPhoneme(firstIPA)}
          title="Click to hear letter sound"
        >
          <span className="phonics-phoneme-letter">{w.word[0].toUpperCase()}</span>
          <span className="phonics-phoneme-hint">🔊 click me</span>
        </div>

        {/* 2. 字母音 IPA */}
        <div className="phonics-learn-ipa">/{firstIPA}/</div>

        {/* 3. 发音规则（恢复） */}
        {w.definition && (
          <div className="phonics-learn-rule">{w.definition}</div>
        )}

        {/* 4. 主单词（每个字母可点击 + speaker 按钮） */}
        <div className="phonics-learn-mainword-row">
          <div className="phonics-learn-word">
            {w.word.split('').map((letter, i) => {
              const ipa = getIPAForIdx(i)
              return (
                <span
                  key={i}
                  className="phonics-letter-btn"
                  onClick={() => speakPhoneme(ipa)}
                  title={`${letter} → /${ipa}/`}
                >
                  {letter}
                </span>
              )
            })}
          </div>
          <button
            className="phonics-word-speak-btn"
            onClick={() => speakWord(w.word)}
            title="Hear full word"
          >
            🔊
          </button>
        </div>

        {/* 5. 每个字母的 IPA 音标 */}
        <div className="phonics-letter-ipa-row">
          {(w.syllables || w.word.split('')).map((syl, i) => {
            const ipa = ipaList[i] || ''
            return (
              <span key={i} className="phonics-letter-ipa" style={{ minWidth: 44, textAlign: 'center' }}>
                /{ipa}/
              </span>
            )
          })}
        </div>

        {/* 6. 示例单词 */}
        {examples.length > 0 && (
          <div className="phonics-learn-examples">
            <div className="phonics-learn-examples-label">Example words:</div>
            <div className="phonics-learn-example-list">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  className="phonics-learn-example-btn"
                  onClick={() => speakExample(ex)}
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

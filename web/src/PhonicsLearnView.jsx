/**
 * PhonicsLearnView — Phonics Learn 页面
 *
 * 交互逻辑：
 * - 点击大字母 → 发字母音（SSML phoneme）
 * - 点击主词中每个字母 → 发对应字母音（SSML phoneme）
 * - 主词旁 speaker 按钮 → 发完整单词（TTS）
 * - 下方 3 个次示例单词 → 点击发音（TTS）
 *
 * 字母音标映射（ARPAbet → IPA 对照）
 */
import { useState } from 'react'

// 字母名 → ARPAbet 发音（用于 SSML <phoneme alphabet="ipa">）
// key: 小写字母 | 特殊: ch/sh/th/ph/wh/ng/ck/ee/oo/ai/oa/oi/ou/er/aw/ay/ey
const LETTER_TO_ARPABET = {
  // 辅音
  b: 'b', c: 'k', d: 'd', f: 'f', g: 'g',
  h: 'h', j: 'dʒ', k: 'k', l: 'l', m: 'm',
  n: 'n', p: 'p', q: 'kw', r: 'ɹ', s: 's',
  t: 't', v: 'v', w: 'w', x: 'ks', y: 'j', z: 'z',
  // 特殊字母组合音（Phonics 常见规则）
  ch: 'tʃ', sh: 'ʃ', th: 'θ', TH: 'ð',
  ph: 'f', wh: 'w', ng: 'ŋ', ck: 'k',
  // 元音字母组合
  ee: 'iː', oo: 'uː', ea: 'iː', ai: 'eɪ',
  ay: 'eɪ', oa: 'əʊ', ow: 'əʊ', ou: 'aʊ',
  oy: 'ɔɪ', er: 'ɜː', ir: 'ɜː', ur: 'ɜː',
  ar: 'ɑː', or: 'ɔː', aw: 'ɔː', air: 'eə',
  // 短元音（对应 syllables 中的值）
  a: 'æ', e: 'e', i: 'ɪ', o: 'ɒ', u: 'ʌ',
  // 长元音
  a_e: 'eɪ', e_e: 'iː', i_e: 'aɪ', o_e: 'əʊ', u_e: 'juː',
  // 字母组合
  ie: 'aɪ', ue: 'juː', iei: 'aɪiː',
}

// 辅音字母名对应 ARPAbet（大小写均可查）
const CONS_ARPABET = {}
// IPA → 可发音的英文单词映射（浏览器 TTS 读词更准）
const IPA_TO_WORD = {
  'b': 'bee', 'd': 'dee', 'f': 'ef', 'g': 'jee',
  'h': 'aitch', 'j': 'jay', 'k': 'kay', 'l': 'el',
  'm': 'em', 'n': 'en', 'p': 'pee', 'r': 'ar',
  's': 'ess', 't': 'tee', 'v': 'vee', 'w': 'double-u',
  'x': 'ex', 'z': 'zee',
  'æ': 'at', 'e': 'red', 'ɪ': 'sit', 'ɒ': 'lot', 'ʌ': 'cup',
  'iː': 'see', 'uː': 'oo', 'ɑː': 'car', 'ɔː': 'door',
  'ʃ': 'ship', 'tʃ': 'chip', 'θ': 'thin', 'ð': 'this',
  'ŋ': 'sing', 'dʒ': 'jam', 'ɹ': 'run',
  // 元音组合
  'eɪ': 'day', 'aɪ': 'eye', 'ɔɪ': 'boy', 'aʊ': 'cow',
  'əʊ': 'go', 'ɪə': 'ear', 'eə': 'air', 'ʊə': 'pure',
  'ɜː': 'her',
}

function initMaps() {
  const cons = 'bcdfgklmnprstvwxyz'
  const c2a = { b:'b',c:'k',d:'d',f:'f',g:'g',h:'h',j:'dʒ',k:'k',l:'l',m:'m',n:'n',p:'p',r:'ɹ',s:'s',t:'t',v:'v',w:'w',x:'ks',y:'j',z:'z' }
  const v2a = { a:'æ',e:'e',i:'ɪ',o:'ɒ',u:'ʌ' }
  cons.split('').forEach(l => { CONS_ARPABET[l] = c2a[l] })
  cons.split('').forEach(l => { CONS_ARPABET[l.toUpperCase()] = c2a[l] })
  Object.entries(v2a).forEach(([k,v]) => { CONS_ARPABET[k] = v; CONS_ARPABET[k.toUpperCase()] = v })
}
initMaps()

// 返回 ARPAbet 发音文本，用于 SSML <phoneme alphabet="ipa">
function getARPAbet(letter) {
  return CONS_ARPABET[letter] || LETTER_TO_ARPABET[letter] || letter
}

// 发音素（ARPAbet → 真实词 → TTS）
function speakLetter(ar) {
  speakPhonicsSound(ar)
}

// 发字母音（用 IPA_TO_WORD 找真实词来发音，比读符号更准）
function speakPhonicsSound(arpa) {
  speechSynthesis.cancel()
  if (!arpa) return
  // 优先找真实英文词
  const word = IPA_TO_WORD[arpa] || IPA_TO_WORD[arpa.toLowerCase()] || arpa
  const utter = new SpeechSynthesisUtterance(word)
  utter.lang = 'en-GB'
  utter.rate = 0.75
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
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(ex.trim())
  u.lang = 'en-GB'
  u.rate = 0.85
  speechSynthesis.speak(u)
}

// 提取 definition 中的示例词
function extractExamples(def) {
  if (!def) return []
  const m = def.match(/\(([^)]+)\)/)
  if (!m) return []
  return m[1].split(/,\s*/).slice(0, 3)
}

// syllables 中获取第 i 个音素
function getPhonemeAt(word, syllables, idx) {
  if (!syllables || !syllables.length) return word[idx] || ''
  let pos = 0
  for (const syl of syllables) {
    const len = syl.length
    if (idx < pos + len) return syl
    pos += len
  }
  return word[idx] || ''
}

// syllables → ARPAbet 列表
function syllablesToARPAbet(syllables) {
  if (!syllables) return []
  return syllables.map(syl => {
    const key = syl.toLowerCase()
    return LETTER_TO_ARPABET[key] || syl
  })
}

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
  // 主词的音素列表（ARPAbet）
  const phonemeARPAList = syllablesToARPAbet(w.syllables || [])
  // 大字母对应的音素
  const firstARPAL = phonemeARPAList[0] || getARPAbet(w.word[0]) || ''

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
        <div
          className="spelling-progress-fill"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* ── 主学习卡片 ────────────────────────────── */}
      <div className="phonics-learn-card">

        {/* 1. 大字母 → 发音素 */}
        <div
          className="phonics-phoneme-btn"
          onClick={() => {
            if (firstARPAL) {
              speakPhonicsSound(firstARPAL)
            }
          }}
          title="Click to hear letter sound"
        >
          <span className="phonics-phoneme-letter">{w.word[0].toUpperCase()}</span>
          <span className="phonics-phoneme-hint">🔊 letter sound</span>
        </div>

        {/* 2. 字母音 IPA 音标（大字母下方） */}
        <div className="phonics-learn-ipa">/{firstARPAL}/</div>

        {/* 3. 主单词：每个字母可点击 + 旁侧 speaker */}
        <div className="phonics-learn-mainword-row">
          <div className="phonics-learn-word">
            {w.word.split('').map((letter, i) => {
              const ar = phonemeARPAList[i] || getARPAbet(letter)
              return (
                <span
                  key={i}
                  className="phonics-letter-btn"
                  onClick={() => speakLetter(ar || letter)}
                  title={`${letter} → /${ar}/`}
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

        {/* 4. 每个字母的音标（对齐显示） */}
        <div className="phonics-letter-ipa-row">
          {phonemeARPAList.map((ar, i) => (
            <span key={i} className="phonics-letter-ipa" style={{ minWidth: 44, textAlign: 'center' }}>
              /{ar}/
            </span>
          ))}
        </div>

        {/* 5. 次示例单词 */}
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
          <button
            className="btn btn-primary"
            onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
          >
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

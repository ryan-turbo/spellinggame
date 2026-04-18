/**
 * PhonicsLearnView — 点击字母/音素播放对应的音素演示音频
 *
 * 音频策略：每个音素对应 ph_{key}.mp3（ffmpeg 截取词 onset，辅音80ms）
 * 字母高亮：主单词 syllables[0] 标红；示例词中 focus letter 标红
 * IPA标注：每个 syllable key → IPA符号对照表
 */

// ── syllable → IPA 符号 ─────────────────────────────────────────
const SYLLABLE_IPA = {
  // 辅音字母
  b: 'b',  c: 'k',  d: 'd',  f: 'f',  g: 'ɡ',  h: 'h',
  j: 'dʒ', k: 'k',  l: 'l',  m: 'm',  n: 'n',  p: 'p',
  r: 'r',  s: 's',  t: 't',  v: 'v',  w: 'w',  x: 'ks',
  y: 'j',  z: 'z',
  // 辅音组合
  ch: 'tʃ', sh: 'ʃ', ph: 'f',  th: 'θ',  TH: 'ð',
  wh: 'w',  ng: 'ŋ',  nk: 'ŋk', ck: 'k',
  bl: 'bl', cl: 'kl', fl: 'fl', fr: 'fr', dr: 'dr',
  tr: 'tr', cr: 'kr', br: 'br', sp: 'sp', st: 'st',
  sl: 'sl', sn: 'sn', sw: 'sw', tw: 'tw',
  kn: 'n',  wr: 'r',  sch: 'sk', spr: 'spr', str: 'str',
  // 短元音（闭音节）
  a: 'æ',    e: 'e',    i: 'ɪ',    o: 'ɒ',    u: 'ʌ',
  // 长元音/元音字母名
  ai: 'eɪ',  ay: 'eɪ',  ee: 'iː',  ea: 'iː',  oa: 'əʊ',
  ar: 'ɑː',  or: 'ɔː',
  // 元音组合
  oo: 'uː',  ow: 'əʊ',  oi: 'ɔɪ',  oy: 'ɔɪ',
  ou: 'aʊ',  ir: 'ɜː',  ur: 'ɜː',  er: 'ɜː',
  // Magic E / 长元音
  are: 'eə', aw: 'ɔː',  air: 'eə', eer: 'ɪə',
  // 其他音节
  ble: 'bəl', bit: 'bɪt', cil: 'sɪl', tic: 'tɪk',
  ty:  'ti',  est: 'est', ve:  'v',   te:  't',
  am:  'æm',  en:  'en',  um:  'ʌm',  im:  'ɪm',
  in:  'ɪn',  on:  'ɒn',  me:  'miː', ne:  'niː',
  fan: 'fæn', had: 'hæd',
  pen: 'pen', ke:  'k',   ta:  't',   tal: 'tɔː',
  mb:  'mb',  rab: 'ræb', tas: 'tæs', hos: 'hɒs',
  la:  'lə',  pi:  'p',   bt:  'bt',  brel: 'brel',
}

// ── 97 syllables → 音素音频文件 ─────────────────────────────────
const SYLLABLE_AUDIO = {
  a:    '/audio/phonics/ph_a.mp3',
  ai:   '/audio/phonics/ph_ai.mp3',
  am:   '/audio/phonics/ph_am.mp3',
  ar:   '/audio/phonics/ph_ar.mp3',
  are:  '/audio/phonics/ph_are.mp3',
  ay:   '/audio/phonics/ph_ay.mp3',
  b:    '/audio/phonics/ph_b.mp3',
  bit:  '/audio/phonics/ph_bit.mp3',
  bl:   '/audio/phonics/ph_bl.mp3',
  ble:  '/audio/phonics/ph_ble.mp3',
  br:   '/audio/phonics/ph_br.mp3',
  brel: '/audio/phonics/ph_brel.mp3',
  bt:   '/audio/phonics/ph_bt.mp3',
  c:    '/audio/phonics/ph_c.mp3',
  ch:   '/audio/phonics/ph_ch.mp3',
  cil:  '/audio/phonics/ph_cil.mp3',
  ck:   '/audio/phonics/ph_ck.mp3',
  cl:   '/audio/phonics/ph_cl.mp3',
  cr:   '/audio/phonics/ph_cr.mp3',
  d:    '/audio/phonics/ph_d.mp3',
  dr:   '/audio/phonics/ph_dr.mp3',
  e:    '/audio/phonics/ph_e.mp3',
  ea:   '/audio/phonics/ph_ea.mp3',
  ee:   '/audio/phonics/ph_ee.mp3',
  en:   '/audio/phonics/ph_en.mp3',
  er:   '/audio/phonics/ph_er.mp3',
  est:  '/audio/phonics/ph_est.mp3',
  f:    '/audio/phonics/ph_f.mp3',
  fan:  '/audio/phonics/ph_fan.mp3',
  fl:   '/audio/phonics/ph_fl.mp3',
  fr:   '/audio/phonics/ph_fr.mp3',
  g:    '/audio/phonics/ph_g.mp3',
  h:    '/audio/phonics/ph_h.mp3',
  hos:  '/audio/phonics/ph_hos.mp3',
  i:    '/audio/phonics/ph_i.mp3',
  ir:   '/audio/phonics/ph_ir.mp3',
  j:    '/audio/phonics/ph_j.mp3',
  k:    '/audio/phonics/ph_k.mp3',
  ke:   '/audio/phonics/ph_ke.mp3',
  kn:   '/audio/phonics/ph_kn.mp3',
  l:    '/audio/phonics/ph_l.mp3',
  la:   '/audio/phonics/ph_la.mp3',
  m:    '/audio/phonics/ph_m.mp3',
  mb:   '/audio/phonics/ph_mb.mp3',
  me:   '/audio/phonics/ph_me.mp3',
  n:    '/audio/phonics/ph_n.mp3',
  ne:   '/audio/phonics/ph_ne.mp3',
  ng:   '/audio/phonics/ph_ng.mp3',
  nk:   '/audio/phonics/ph_nk.mp3',
  o:    '/audio/phonics/ph_o.mp3',
  oa:   '/audio/phonics/ph_oa.mp3',
  oi:   '/audio/phonics/ph_oi.mp3',
  oo:   '/audio/phonics/ph_oo.mp3',
  or:   '/audio/phonics/ph_or.mp3',
  ou:   '/audio/phonics/ph_ou.mp3',
  ow:   '/audio/phonics/ph_ow.mp3',
  oy:   '/audio/phonics/ph_oy.mp3',
  p:    '/audio/phonics/ph_p.mp3',
  pen:  '/audio/phonics/ph_pen.mp3',
  ph:   '/audio/phonics/ph_ph.mp3',
  pi:   '/audio/phonics/ph_pi.mp3',
  pl:   '/audio/phonics/ph_pl.mp3',
  qu:   '/audio/phonics/ph_qu.mp3',
  r:    '/audio/phonics/ph_r.mp3',
  rab:  '/audio/phonics/ph_rab.mp3',
  s:    '/audio/phonics/ph_s.mp3',
  sch:  '/audio/phonics/ph_sch.mp3',
  sh:   '/audio/phonics/ph_sh.mp3',
  sl:   '/audio/phonics/ph_sl.mp3',
  sn:   '/audio/phonics/ph_sn.mp3',
  sp:   '/audio/phonics/ph_sp.mp3',
  spr:  '/audio/phonics/ph_spr.mp3',
  st:   '/audio/phonics/ph_st.mp3',
  str:  '/audio/phonics/ph_str.mp3',
  sw:   '/audio/phonics/ph_sw.mp3',
  t:    '/audio/phonics/ph_t.mp3',
  ta:   '/audio/phonics/ph_ta.mp3',
  tal:  '/audio/phonics/ph_tal.mp3',
  tas:  '/audio/phonics/ph_tas.mp3',
  te:   '/audio/phonics/ph_te.mp3',
  th:   '/audio/phonics/ph_th.mp3',
  TH:   '/audio/phonics/ph_TH.mp3',
  tic:  '/audio/phonics/ph_tic.mp3',
  tr:   '/audio/phonics/ph_tr.mp3',
  tw:   '/audio/phonics/ph_tw.mp3',
  ty:   '/audio/phonics/ph_ty.mp3',
  u:    '/audio/phonics/ph_u.mp3',
  um:   '/audio/phonics/ph_um.mp3',
  ur:   '/audio/phonics/ph_ur.mp3',
  v:    '/audio/phonics/ph_v.mp3',
  ve:   '/audio/phonics/ph_ve.mp3',
  w:    '/audio/phonics/ph_w.mp3',
  wh:   '/audio/phonics/ph_wh.mp3',
  wr:   '/audio/phonics/ph_wr.mp3',
  x:    '/audio/phonics/ph_x.mp3',
  y:    '/audio/phonics/ph_y.mp3',
  z:    '/audio/phonics/ph_z.mp3',
}

// ── Audio Engine ─────────────────────────────────────────────
let _audio = null

function stopAudio() {
  if (_audio) {
    try { _audio.pause() } catch (_) {}
    _audio.src = ''
    _audio = null
  }
}

function playAudio(src, maxDurationSec = null) {
  return new Promise((resolve) => {
    stopAudio()
    _audio = new Audio()
    _audio.src = src
    let settled = false
    let timeoutId = null
    const settle = () => { 
      if (!settled) { 
        settled = true 
        if (timeoutId) clearTimeout(timeoutId)
        resolve() 
      } 
    }
    _audio.onerror  = settle
    _audio.onended   = settle
    _audio.onstall  = settle
    _audio.onwaiting = settle
    _audio.play().then(() => { 
      // 如果设置了最大时长，自动停止
      if (maxDurationSec) {
        timeoutId = setTimeout(() => {
          _audio.pause()
          settle()
        }, maxDurationSec * 1000)
      }
      /* 播放成功，onended 会触发 settle */ 
    }).catch(settle)
  })
}

// 播放音素音频，成功返回 true，失败返回 false
async function tryPlayPhonemeAudio(syl) {
  const src = SYLLABLE_AUDIO[syl]
  if (!src) return false
  try {
    speechSynthesis.cancel()
    // 音素音频只播放 0.3 秒（提取开头部分作为音素）
    await playAudio(src, 0.3)
    return true
  } catch (_) {
    return false
  }
}

// 播放音素音频：优先用音频文件，失败时用 TTS
async function speakPhoneme(syl) {
  const played = await tryPlayPhonemeAudio(syl)
  if (!played) {
    // 音频文件不存在或播放失败，用 TTS 读出该音素
    const utter = new SpeechSynthesisUtterance(syl)
    utter.lang = 'en-GB'
    utter.rate = 0.85
    speechSynthesis.speak(utter)
  }
}

// 播放单词音频：优先用音频文件，失败时用 TTS
async function speakWord(word) {
  const src = `/audio/${word.replace(/ /g, '_')}.mp3`
  let played = false
  try {
    speechSynthesis.cancel()
    await playAudio(src)
    played = true
  } catch (_) {}
  if (!played) {
    // 音频文件不存在或播放失败，用 TTS
    const utter = new SpeechSynthesisUtterance(word)
    utter.lang = 'en-GB'
    speechSynthesis.speak(utter)
  }
}

// 播放示例词音频
async function speakExample(word) {
  const src = `/audio/${word.replace(/ /g, '_')}.mp3`
  try {
    speechSynthesis.cancel()
    await playAudio(src)
  } catch (_) {
    // 示例词播放失败，静默处理，不 fallback
  }
}

// ── Helpers ──────────────────────────────────────────────────
function extractExamples(definition) {
  if (!definition) return []
  const m = definition.match(/\(([^)]+)\)/)
  if (!m) return []
  return m[1].split(/,\s*/).slice(0, 4)
}

function extractFocusLetter(definition) {
  if (!definition) return null
  const m = definition.match(/^([a-zA-Z]{2,4})\s*→/)
  if (m) return m[1]
  const fm = definition.match(/([a-zA-Z]?)/)
  return fm ? fm[1] : null
}

function splitWordByFocus(word, focusLetter) {
  if (!focusLetter || !word) return [{ text: word, hl: false }]
  const fl = focusLetter.toLowerCase()
  const wl = word.toLowerCase()
  const parts = []
  let i = 0
  while (i < wl.length) {
    if (wl.slice(i, i + fl.length) === fl) {
      parts.push({ text: word.slice(i, i + fl.length), hl: true })
      i += fl.length
    } else {
      parts.push({ text: word[i], hl: false })
      i += 1
    }
  }
  return parts
}

// 获取音素的 IPA 表示
function getIpa(syl) {
  return SYLLABLE_IPA[syl] || syl
}

// ── Component ─────────────────────────────────────────────────
import { useState, useEffect } from 'react'

export default function PhonicsLearnView({ unitKey, unitTitle, unitSubtitleZh, unitSubtitle, allWords, onComplete, onBack }) {
  const [current, setCurrent] = useState(0)
  const w = allWords[current]
  const total = allWords.length

  useEffect(() => () => stopAudio(), [])

  if (!w) return (
    <div className="spelling-scene" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: '#94a3b8' }}>No words in this unit.</p>
      <button className="btn btn-primary" onClick={onBack}>← Back</button>
    </div>
  )

  const syllables = w.syllables || String(w.word).split('')
  const examples = extractExamples(w.definition)
  const focusLetter = extractFocusLetter(w.definition)
  const focusSyllable = syllables[0] // 焦点音素 = 第一个syllable
  const wordFirstLetter = String(w.word || '')[0] || ''

  // 主单词按音素分段
  const mainWordParts = syllables.map((syl, i) => ({
    syl,
    isFocus: i === 0,
    text: String(w.word || '').slice(
      syllables.slice(0, i).reduce((acc, s) => acc + s.length, 0),
      syllables.slice(0, i + 1).reduce((acc, s) => acc + s.length, 0)
    ),
  }))

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

      {/* 学习卡片 */}
      <div className="phonics-learn-card">

        {/* 规则说明 + 中文副标题同行 */}
        {w.definition && (
          <div className="phonics-learn-rule">
            {w.definition}
            {unitSubtitleZh && <span className="phonics-learn-rule-zh"> · {unitSubtitleZh}</span>}
          </div>
        )}

        {/* 主视觉：焦点字母大按钮 + IPA */}
        <div className="phonics-phoneme-btn" onClick={() => speakPhoneme(focusSyllable)}>
          <span className="phonics-phoneme-letter">{wordFirstLetter.toUpperCase()}</span>
          <span className="phonics-phoneme-ipa">/{getIpa(focusSyllable)}/</span>
          <span className="phonics-phoneme-hint">🔊 tap to hear</span>
        </div>

        {/* 主单词音素分解：字母+IPA上下对齐成一列 */}
        <div className="phonics-learn-mainword-row">
          <div className="phonics-learn-word">
            {mainWordParts.map((part, i) => {
              const hasAudio = !!SYLLABLE_AUDIO[part.syl]
              return (
                <span
                  key={i}
                  className={`phonics-syllable-btn${part.isFocus ? ' focus' : ''}${hasAudio ? '' : ' no-audio'}`}
                  onClick={() => speakPhoneme(part.syl)}
                  title={part.isFocus ? `Focus: /${getIpa(part.syl)}/` : `/${getIpa(part.syl)}/`}
                >
                  <span className={`syllable-letter${part.isFocus ? ' focus' : ''}`}>{part.text}</span>
                  <span className={`syllable-ipa${part.isFocus ? ' focus' : ''}`}>/{getIpa(part.syl)}/</span>
                </span>
              )
            })}
          </div>
          <button className="phonics-word-speak-btn" onClick={() => speakWord(w.word)} title="Hear full word">
            🔊
          </button>
        </div>

        {/* 示例词（焦点字母标红） */}
        {examples.length > 0 && (
          <div className="phonics-learn-examples">
            <div className="phonics-learn-examples-label">Example words:</div>
            <div className="phonics-learn-example-list">
              {examples.map((ex, i) => {
                const exClean = ex.trim()
                const parts = splitWordByFocus(exClean, focusLetter)
                return (
                  <button
                    key={i}
                    className="phonics-learn-example-btn"
                    onClick={() => speakExample(exClean)}
                  >
                    {parts.map((p, j) =>
                      p.hl
                        ? <span key={j} className="ex-hl">{p.text}</span>
                        : <span key={j}>{p.text}</span>
                    )}
                  </button>
                )
              })}
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

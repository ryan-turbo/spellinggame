/**
 * PhonicsLearnView — Phonics Learn 页面
 *
 * 交互逻辑：
 * - 点击大字母按钮 → 播放该字母音的音频
 * - 点击主词中每个字母/syllable块 → 播放对应音素音频
 * - speaker按钮 → 发完整单词（用 /audio/{word}.mp3）
 * - 示例词按钮 → 发示例词音频
 *
 * 音频来源：
 * - 音素：/audio/phonics/ph_{syllable}.mp3（预录音素音频）
 * - 单词：/audio/{word}.mp3（已有完整词音频）
 * - fallback：浏览器 TTS（仅用于无音频的音素）
 */

// ── Syllable → Audio File Map ──────────────────────────────────
// Built from: public/audio/phonics/ph_*.mp3 + public/audio/*.mp3
// 覆盖率：92/93 syllables have audio (only 'pi' generated from 'hospital')
export const SYLLABLE_AUDIO_MAP = {
  'a':     '/audio/phonics/ph_a.mp3',
  'ai':    '/audio/phonics/ph_ai.mp3',
  'am':    '/audio/phonics/ph_am.mp3',
  'ar':    '/audio/phonics/ph_ar.mp3',
  'are':   '/audio/phonics/ph_are.mp3',
  'ay':    '/audio/phonics/ph_ay.mp3',
  'b':     '/audio/phonics/ph_b.mp3',
  'bit':   '/audio/phonics/ph_bit.mp3',
  'bl':    '/audio/phonics/ph_bl.mp3',
  'ble':   '/audio/phonics/ph_ble.mp3',
  'br':    '/audio/phonics/ph_br.mp3',
  'brel':  '/audio/phonics/ph_brel.mp3',
  'bt':    '/audio/phonics/ph_bt.mp3',
  'c':     '/audio/phonics/ph_c.mp3',
  'ch':    '/audio/phonics/ph_ch.mp3',
  'cil':   '/audio/phonics/ph_cil.mp3',
  'ck':    '/audio/phonics/ph_ck.mp3',
  'cl':    '/audio/phonics/ph_cl.mp3',
  'cr':    '/audio/phonics/ph_cr.mp3',
  'd':     '/audio/phonics/ph_d.mp3',
  'dr':    '/audio/phonics/ph_dr.mp3',
  'e':     '/audio/phonics/ph_e.mp3',
  'ea':    '/audio/phonics/ph_ea.mp3',
  'ee':    '/audio/phonics/ph_ee.mp3',
  'en':    '/audio/phonics/ph_en.mp3',
  'er':    '/audio/phonics/ph_er.mp3',
  'est':   '/audio/phonics/ph_est.mp3',
  'f':     '/audio/phonics/ph_f.mp3',
  'fan':   '/audio/phonics/ph_fan.mp3',
  'fl':    '/audio/phonics/ph_fl.mp3',
  'fr':    '/audio/phonics/ph_fr.mp3',
  'g':     '/audio/phonics/ph_g.mp3',
  'h':     '/audio/phonics/ph_h.mp3',
  'hos':   '/audio/phonics/ph_hos.mp3',
  'i':     '/audio/phonics/ph_i.mp3',
  'ir':    '/audio/phonics/ph_ir.mp3',
  'j':     '/audio/phonics/ph_j.mp3',
  'k':     '/audio/phonics/ph_k.mp3',
  'ke':    '/audio/phonics/ph_ke.mp3',
  'kn':    '/audio/phonics/ph_kn.mp3',
  'l':     '/audio/phonics/ph_l.mp3',
  'la':    '/audio/phonics/ph_la.mp3',
  'm':     '/audio/phonics/ph_m.mp3',
  'mb':    '/audio/phonics/ph_mb.mp3',
  'me':    '/audio/phonics/ph_me.mp3',
  'n':     '/audio/phonics/ph_n.mp3',
  'ne':    '/audio/phonics/ph_ne.mp3',
  'ng':    '/audio/phonics/ph_ng.mp3',
  'nk':    '/audio/phonics/ph_nk.mp3',
  'o':     '/audio/phonics/ph_o.mp3',
  'oa':    '/audio/phonics/ph_oa.mp3',
  'oi':    '/audio/phonics/ph_oi.mp3',
  'oo':    '/audio/phonics/ph_oo.mp3',
  'or':    '/audio/phonics/ph_or.mp3',
  'ou':    '/audio/phonics/ph_ou.mp3',
  'ow':    '/audio/phonics/ph_ow.mp3',
  'oy':    '/audio/phonics/ph_oy.mp3',
  'p':     '/audio/phonics/ph_p.mp3',
  'pen':   '/audio/phonics/ph_pen.mp3',
  'ph':    '/audio/phonics/ph_ph.mp3',
  'pi':    '/audio/phonics/ph_pi.mp3',
  'pl':    '/audio/phonics/ph_pl.mp3',
  'qu':    '/audio/phonics/ph_qu.mp3',
  'r':     '/audio/phonics/ph_r.mp3',
  'rab':   '/audio/phonics/ph_rab.mp3',
  's':     '/audio/phonics/ph_s.mp3',
  'sch':   '/audio/phonics/ph_sch.mp3',
  'sh':    '/audio/phonics/ph_sh.mp3',
  'sl':    '/audio/phonics/ph_sl.mp3',
  'sn':    '/audio/phonics/ph_sn.mp3',
  'spr':   '/audio/phonics/ph_spr.mp3',
  'st':    '/audio/phonics/ph_st.mp3',
  'str':   '/audio/phonics/ph_str.mp3',
  't':     '/audio/phonics/ph_t.mp3',
  'ta':    '/audio/phonics/ph_ta.mp3',
  'tal':   '/audio/phonics/ph_tal.mp3',
  'tas':   '/audio/phonics/ph_tas.mp3',
  'te':    '/audio/phonics/ph_te.mp3',
  'th':    '/audio/phonics/ph_th.mp3',
  'tic':   '/audio/phonics/ph_tic.mp3',
  'tr':    '/audio/phonics/ph_tr.mp3',
  'ty':    '/audio/phonics/ph_ty.mp3',
  'u':     '/audio/phonics/ph_u.mp3',
  'um':    '/audio/phonics/ph_um.mp3',
  'ur':    '/audio/phonics/ph_ur.mp3',
  'v':     '/audio/phonics/ph_v.mp3',
  've':    '/audio/phonics/ph_ve.mp3',
  'w':     '/audio/phonics/ph_w.mp3',
  'wh':    '/audio/phonics/ph_wh.mp3',
  'wr':    '/audio/phonics/ph_wr.mp3',
  'x':     '/audio/phonics/ph_x.mp3',
  'y':     '/audio/phonics/ph_y.mp3',
  'z':     '/audio/phonics/ph_z.mp3',
}

// ── Audio Playback ────────────────────────────────────────────

let _audio = null

function stopAudio() {
  if (_audio) {
    _audio.pause()
    _audio.currentTime = 0
  }
}

function playAudio(src) {
  return new Promise((resolve) => {
    stopAudio()
    _audio = new Audio()
    _audio.src = src
    _audio.onended = resolve
    _audio.onerror = resolve
    _audio.play().catch(resolve)  // ignore autoplay errors
  })
}

// 发音素（优先用音频文件，fallback 用 TTS）
async function speakPhoneme(syllable) {
  const src = SYLLABLE_AUDIO_MAP[syllable]
  if (src) {
    await playAudio(src)
  } else {
    // Fallback: browser TTS
    try {
      const utter = new SpeechSynthesisUtterance(syllable)
      utter.lang = 'en-GB'
      utter.rate = 0.8
      speechSynthesis.speak(utter)
    } catch (e) {
      console.warn('[PhonicsLearn] TTS fallback failed for:', syllable)
    }
  }
}

// 发完整单词（用音频文件）
async function speakWord(word) {
  const src = `/audio/${encodeURIComponent(word)}.mp3`
  await playAudio(src)
}

// 发示例词（用音频文件）
async function speakExample(word) {
  const src = `/audio/${encodeURIComponent(word.trim())}.mp3`
  await playAudio(src)
}

// ── Helpers ──────────────────────────────────────────────────

function extractExamples(definition) {
  if (!definition) return []
  const m = definition.match(/\(([^)]+)\)/)
  if (!m) return []
  return m[1].split(/,\s*/).slice(0, 3)
}

// ── Component ─────────────────────────────────────────────────

import { useState, useEffect } from 'react'

export default function PhonicsLearnView({ unitKey, unitTitle, allWords, onComplete, onBack }) {
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const w = allWords[current]
  const total = allWords.length

  // Stop audio on unmount
  useEffect(() => {
    return () => stopAudio()
  }, [])

  if (!w) return (
    <div className="spelling-scene" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>No words in this unit.</p>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onBack}>← Back</button>
    </div>
  )

  const syllables = w.syllables || w.word.split('')
  const examples = extractExamples(w.definition)

  // 大字母用第一个 syllable
  const firstSyl = syllables[0] || w.word[0]

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

        {/* 1. 大字母按钮（点击播放第一个音素） */}
        <div
          className="phonics-phoneme-btn"
          onClick={() => speakPhoneme(firstSyl)}
          title={`Play /${firstSyl}/ sound`}
        >
          <span className="phonics-phoneme-letter">{w.word[0].toUpperCase()}</span>
          <span className="phonics-phoneme-hint">🔊 tap me</span>
        </div>

        {/* 2. 发音规则文字 */}
        {w.definition && (
          <div className="phonics-learn-rule">{w.definition}</div>
        )}

        {/* 3. 主单词（每个 syllable 块可点击） */}
        <div className="phonics-learn-mainword-row">
          <div className="phonics-learn-word">
            {syllables.map((syl, i) => {
              const hasAudio = !!SYLLABLE_AUDIO_MAP[syl]
              return (
                <span
                  key={i}
                  className={`phonics-syllable-btn${hasAudio ? '' : ' no-audio'}`}
                  onClick={() => speakPhoneme(syl)}
                  title={`${syl} — ${hasAudio ? 'audio' : 'TTS fallback'}`}
                >
                  {syl}
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

        {/* 4. 每个 syllable 对应的 IPA 标注 */}
        <div className="phonics-letter-ipa-row">
          {syllables.map((syl, i) => (
            <span key={i} className="phonics-letter-ipa" style={{ minWidth: 44, textAlign: 'center' }}>
              {SYLLABLE_AUDIO_MAP[syl] ? `/${syl}/` : `/${syl}/?`}
            </span>
          ))}
        </div>

        {/* 5. 示例单词 */}
        {examples.length > 0 && (
          <div className="phonics-learn-examples">
            <div className="phonics-learn-examples-label">Example words:</div>
            <div className="phonics-learn-example-list">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  className="phonics-learn-example-btn"
                  onClick={() => speakExample(ex.trim())}
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

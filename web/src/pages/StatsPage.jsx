/**
 * 单词成果统计页面
 * 可视化展示：准确率、总词数、单元进度、趋势图
 */
import { useState, useEffect, useRef } from 'react'
import { VOCAB } from '../data/pu2_vocab'

// ─── 进度存储（增强版）────────────────────────────
const STATS_KEY = 'pu2_stats'

export const loadStats = () => {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return getEmptyStats()
    return JSON.parse(raw)
  } catch {
    return getEmptyStats()
  }
}

export const saveStats = (stats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export const getEmptyStats = () => ({
  totalAttempts: 0,
  totalCorrect: 0,
  sessions: [],         // [{date, unit, score, total, correct, words:[]}]
  wordAttempts: {},     // { word: {attempts, correct} }
  unitBest: {},         // { u1: {score, total, date} }
  masteredWords: {},    // { u1: ['word1', 'word2'] }
  firstVisit: null,
})

/** 每次闯关结束后调用 */
export const recordGameResult = ({ unitKey, score, total, wordResults }) => {
  const s = loadStats()
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]

  s.totalAttempts += total
  s.totalCorrect += score
  if (!s.firstVisit) s.firstVisit = dateStr

  // 记录 session
  s.sessions.push({
    date: dateStr,
    time: now.toISOString(),
    unit: unitKey,
    score,
    total,
    correct: score,
  })
  if (s.sessions.length > 200) s.sessions = s.sessions.slice(-200)

  // 逐词记录
  ;(wordResults || []).forEach(r => {
    if (!s.wordAttempts[r.word]) s.wordAttempts[r.word] = { attempts: 0, correct: 0 }
    s.wordAttempts[r.word].attempts++
    if (r.correct) s.wordAttempts[r.word].correct++
  })

  // 单元最佳成绩
  const prev = s.unitBest[unitKey]
  if (!prev || score > prev.score) {
    s.unitBest[unitKey] = { score, total, date: dateStr }
  }

  saveStats(s)
}

/** 标记掌握/取消掌握 */
export const toggleMastered = (unitKey, word) => {
  const s = loadStats()
  if (!s.masteredWords[unitKey]) s.masteredWords[unitKey] = []
  const list = s.masteredWords[unitKey]
  const idx = list.indexOf(word)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(word)
  saveStats(s)
  return s
}

// ─── 图表组件（轻量手绘实现，无依赖）────────────────
function BarChart({ data, width = 360, height = 200, color = '#3b82f6' }) {
  if (!data.length) return <div className="chart-empty">No data yet</div>
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barW = (width - 40) / data.length
  const chartH = height - 40
  return (
    <svg width={width} height={height} className="bar-chart">
      {/* Y轴线 */}
      <line x1="35" y1="10" x2="35" y2={chartH} stroke="#e2e8f0" strokeWidth="1" />
      {/* X轴线 */}
      <line x1="35" y1={chartH} x2={width} y2={chartH} stroke="#e2e8f0" strokeWidth="1" />
      {data.map((d, i) => {
        const barH = Math.max(4, (d.value / maxVal) * (chartH - 20))
        const x = 35 + i * barW + 2
        const y = chartH - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={Math.max(4, barW - 4)} height={barH}
              fill={d.color || color} rx="3" className="bar-rect" />
            {d.label && (
              <text x={x + (barW - 4) / 2} y={chartH + 14}
                textAnchor="middle" fontSize="10" fill="#64748b">
                {d.label}
              </text>
            )}
            {d.value !== undefined && (
              <text x={x + (barW - 4) / 2} y={y - 4}
                textAnchor="middle" fontSize="9" fill="#94a3b8">
                {d.value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function DonutChart({ percent, size = 120, color = '#3b82f6', label }) {
  const r = (size - 16) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(1, Math.max(0, percent)) / 100)
  return (
    <div className="donut-wrap">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>
          {Math.round(percent)}%
        </text>
      </svg>
      {label && <div className="donut-label">{label}</div>}
    </div>
  )
}

// ─── 进度条 ─────────────────────────────────────────
function ProgressBar({ value, max, color = '#3b82f6', height = 12 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="prog-bar-wrap" style={{ height }}>
      <div className="prog-bar-fill" style={{ width: pct + '%', background: color }} />
    </div>
  )
}

// ─── 单元星级组件 ───────────────────────────────────
function UnitStar({ unitKey, best }) {
  const stars = best ? Math.min(3, Math.ceil(best.score / 4)) : 0
  return (
    <div className="unit-stars-row">
      {[1, 2, 3].map(s => (
        <span key={s} className={`star ${s <= stars ? 'lit' : ''}`}>★</span>
      ))}
    </div>
  )
}

// ─── 主统计页面 ─────────────────────────────────────
export default function StatsPage({ onBack }) {
  const [stats, setStats] = useState(loadStats)
  const refresh = () => setStats(loadStats())

  const unitKeys = ['u1','u2','u3','u4','u5','u6','u7','u8','u9']
  const totalWords = unitKeys.reduce((a, k) => a + (VOCAB[k]?.words?.length || 0), 0)
  const completedUnits = unitKeys.filter(k => (stats.unitBest[k] || {}).score > 0).length
  const accuracy = stats.totalAttempts > 0
    ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 0
  const masteredCount = Object.values(stats.masteredWords).flat().length

  // 近7天趋势（从 sessions 聚合）
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const trendData = last7Days.map(date => {
    const daySessions = stats.sessions.filter(s => s.date === date)
    const correct = daySessions.reduce((a, s) => a + s.correct, 0)
    const total = daySessions.reduce((a, s) => a + s.total, 0)
    return {
      date,
      label: date.slice(5), // MM-DD
      value: total > 0 ? Math.round((correct / total) * 100) : 0,
      sessions: daySessions.length,
    }
  })

  // 单词掌握热力图数据（按正确率）
  const wordAccuracy = Object.entries(stats.wordAttempts)
    .map(([word, d]) => ({ word, pct: Math.round((d.correct / d.attempts) * 100), ...d }))
    .sort((a, b) => b.pct - a.pct)
  const hardWords = wordAccuracy.filter(w => w.pct < 60).slice(0, 10)
  const easyWords = wordAccuracy.filter(w => w.pct >= 80).slice(0, 10)

  // 7天练习次数柱状
  const barData = trendData.map(d => ({
    label: d.label,
    value: d.sessions,
    color: d.sessions > 0 ? '#3b82f6' : '#e2e8f0',
  }))

  // 最近7次闯关记录
  const recentSessions = [...stats.sessions].reverse().slice(0, 7)

  const noData = stats.totalAttempts === 0

  return (
    <div className="stats-page">
      <div className="stats-header">
        <button className="icon-btn back-btn" onClick={onBack}>← Back</button>
        <h1 className="stats-title">📊 My Progress</h1>
      </div>

      {noData ? (
        <div className="stats-empty">
          <div className="stats-empty-icon">📈</div>
          <h2>No data yet</h2>
          <p>Complete some challenges to see your stats!</p>
          <button className="btn btn-primary" onClick={onBack}>Start Learning</button>
        </div>
      ) : (
        <>
          {/* ── 概览卡片 ── */}
          <div className="stats-overview">
            <div className="stat-card">
              <DonutChart percent={accuracy} color="#3b82f6" label="Accuracy" />
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{completedUnits}<span className="stat-max">/9</span></div>
              <div className="stat-label">Units Done</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{masteredCount}<span className="stat-max">/{totalWords}</span></div>
              <div className="stat-label">Words Mastered</div>
            </div>
          </div>

          {/* ── 7天练习柱状图 ── */}
          <div className="stats-section">
            <h2 className="stats-section-title">Practice Frequency (Last 7 Days)</h2>
            <BarChart data={barData} width={380} height={180} color="#3b82f6" />
          </div>

          {/* ── 7天准确率趋势 ── */}
          <div className="stats-section">
            <h2 className="stats-section-title">Accuracy Trend (Last 7 Days)</h2>
            <div className="trend-grid">
              {trendData.map(d => (
                <div key={d.date} className={`trend-day ${d.sessions === 0 ? 'empty' : ''}`}>
                  <div className="trend-day-label">{d.label}</div>
                  <div className="trend-day-value" style={{ color: d.sessions > 0 ? '#3b82f6' : '#cbd5e1' }}>
                    {d.sessions > 0 ? d.value + '%' : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 单元进度 ── */}
          <div className="stats-section">
            <h2 className="stats-section-title">Unit Progress</h2>
            <div className="unit-progress-list">
              {unitKeys.map(key => {
                const unit = VOCAB[key]
                const best = stats.unitBest[key]
                const unitWords = unit?.words?.length || 0
                if (!unit) return null
                return (
                  <div key={key} className="unit-progress-row">
                    <div className="up-left">
                      <span className="up-key">{key.toUpperCase()}</span>
                      <span className="up-title">{unit.title}</span>
                    </div>
                    <div className="up-mid">
                      <ProgressBar value={best?.score || 0} max={10} color="#3b82f6" />
                    </div>
                    <div className="up-right">
                      <UnitStar unitKey={key} best={best} />
                      <span className="up-score">{best ? `${best.score}/10` : '—'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── 易错词 & 熟练词 ── */}
          {wordAccuracy.length > 0 && (
            <div className="stats-section stats-two-col">
              <div className="stats-col">
                <h2 className="stats-section-title">Needs Practice 🔴</h2>
                {hardWords.length ? (
                  <div className="word-list">
                    {hardWords.map(w => (
                      <div key={w.word} className="word-accuracy-row">
                        <span className="war-word">{w.word}</span>
                        <div className="war-bar-wrap">
                          <div className="war-bar" style={{ width: w.pct + '%', background: '#ef4444' }} />
                        </div>
                        <span className="war-pct">{w.pct}%</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="stats-empty-hint">Keep practicing!</p>}
              </div>
              <div className="stats-col">
                <h2 className="stats-section-title">Mastered 🟢</h2>
                {easyWords.length ? (
                  <div className="word-list">
                    {easyWords.map(w => (
                      <div key={w.word} className="word-accuracy-row">
                        <span className="war-word">{w.word}</span>
                        <div className="war-bar-wrap">
                          <div className="war-bar" style={{ width: w.pct + '%', background: '#22c55e' }} />
                        </div>
                        <span className="war-pct">{w.pct}%</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="stats-empty-hint">No mastered words yet</p>}
              </div>
            </div>
          )}

          {/* ── 最近闯关记录 ── */}
          {recentSessions.length > 0 && (
            <div className="stats-section">
              <h2 className="stats-section-title">Recent Sessions</h2>
              <div className="session-list">
                {recentSessions.map((s, i) => (
                  <div key={i} className="session-row">
                    <span className="session-date">{s.date}</span>
                    <span className="session-unit">{s.unit?.toUpperCase()}</span>
                    <span className="session-score" style={{ color: s.correct >= 8 ? '#22c55e' : s.correct >= 5 ? '#eab308' : '#ef4444' }}>
                      {s.correct}/{s.total}
                    </span>
                    <div className="session-bar-wrap">
                      <div className="session-bar"
                        style={{ width: Math.round((s.correct / s.total) * 100) + '%',
                          background: s.correct >= 8 ? '#22c55e' : s.correct >= 5 ? '#eab308' : '#ef4444' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 数据总览 ── */}
          <div className="stats-section stats-footer">
            <p>
              {stats.firstVisit && `Learning since ${stats.firstVisit} · `}
              {stats.totalAttempts} attempts · {stats.totalCorrect} correct
            </p>
            <button className="btn btn-sm btn-giveup"
              onClick={() => {
                if (confirm('Reset all progress data?')) {
                  localStorage.removeItem(STATS_KEY)
                  refresh()
                }
              }}>
              Reset Stats
            </button>
          </div>
        </>
      )}
    </div>
  )
}

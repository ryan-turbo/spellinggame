/**
 * 单词成果统计页面 - 全新设计
 * 布局：顶部概览 → 7天趋势 → 单元进度(可展开) → 易错词
 */
import { useState, useEffect } from 'react'
import { VOCAB } from '../data/pu2_vocab'

// ─── 进度存储 ───────────────────────────────────────
const STATS_KEY = 'pu2_stats'

export const loadStats = () => {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return getEmptyStats()
    return JSON.parse(raw)
  } catch { return getEmptyStats() }
}

export const saveStats = (stats) => localStorage.setItem(STATS_KEY, JSON.stringify(stats))

export const getEmptyStats = () => ({
  totalAttempts: 0, totalCorrect: 0,
  sessions: [], wordAttempts: {}, unitBest: {}, masteredWords: {}, firstVisit: null,
})

/** 闯关结束记录 */
export const recordGameResult = ({ unitKey, score, total, wordResults }) => {
  const s = loadStats()
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]

  s.totalAttempts += total
  s.totalCorrect += score
  if (!s.firstVisit) s.firstVisit = dateStr

  s.sessions.push({ date: dateStr, time: now.toISOString(), unit: unitKey, score, total, correct: score })
  if (s.sessions.length > 200) s.sessions = s.sessions.slice(-200)

  ;(wordResults || []).forEach(r => {
    if (!s.wordAttempts[r.word]) s.wordAttempts[r.word] = { attempts: 0, correct: 0 }
    s.wordAttempts[r.word].attempts++
    if (r.correct) s.wordAttempts[r.word].correct++
  })

  const prev = s.unitBest[unitKey]
  if (!prev || score > prev.score) s.unitBest[unitKey] = { score, total, date: dateStr }

  saveStats(s)
}

// ─── 图表组件 ───────────────────────────────────────
function DonutChart({ percent, size = 100, color = '#3b82f6', label }) {
  const r = (size - 12) / 2
  const cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(1, Math.max(0, percent)) / 100)
  return (
    <div className="donut-wrap">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="20" fontWeight="800" fill={color}>{Math.round(percent)}%</text>
      </svg>
      {label && <div className="donut-label">{label}</div>}
    </div>
  )
}

// 合并柱状图：次数+准确率
function CombinedBarChart({ data, width = 380, height = 160 }) {
  if (!data.length || data.every(d => d.sessions === 0)) {
    return <div className="chart-empty">No data yet</div>
  }
  const maxSessions = Math.max(...data.map(d => d.sessions), 1)
  const barW = (width - 40) / data.length
  const chartH = height - 50

  return (
    <svg width={width} height={height} className="bar-chart">
      <line x1="35" y1="10" x2="35" y2={chartH} stroke="#e2e8f0" strokeWidth="1" />
      <line x1="35" y1={chartH} x2={width} y2={chartH} stroke="#e2e8f0" strokeWidth="1" />
      {data.map((d, i) => {
        const x = 35 + i * barW + 2
        const barH = d.sessions > 0 ? Math.max(8, (d.sessions / maxSessions) * (chartH - 30)) : 0
        const y = chartH - barH
        const accH = d.sessions > 0 ? (d.accuracy / 100) * barH : 0
        const accY = chartH - accH
        return (
          <g key={i}>
            {/* 次数柱 - 蓝色 */}
            <rect x={x} y={y} width={Math.max(6, barW - 6)} height={barH} fill="#3b82f6" rx="3" />
            {/* 准确率柱 - 绿色叠在上面 */}
            {d.sessions > 0 && (
              <rect x={x} y={accY} width={Math.max(6, barW - 6)} height={accH} fill="#22c55e" rx="3" />
            )}
            {d.label && (
              <text x={x + (barW - 6) / 2} y={chartH + 14} textAnchor="middle" fontSize="10" fill="#64748b">{d.label}</text>
            )}
            {d.sessions > 0 && (
              <text x={x + (barW - 6) / 2} y={y - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.sessions}</text>
            )}
          </g>
        )
      })}
      <text x="8" y={chartH / 2} fontSize="9" fill="#94a3b8" transform={`rotate(-90 8 ${chartH / 2})`}>sessions</text>
    </svg>
  )
}

// ─── 单元进度展开卡片 ─────────────────────────────────
function UnitProgressCard({ unitKey, unit, stats, unitMastered }) {
  const [expanded, setExpanded] = useState(false)
  const best = stats.unitBest[unitKey]
  const words = unit?.words || []
  const totalWords = words.length

  // 统计该单元单词的准确率
  const wordStats = words.map(w => {
    const attempts = stats.wordAttempts[w.word]
    const pct = attempts ? Math.round((attempts.correct / attempts.attempts) * 100) : 0
    const mastered = unitMastered?.includes(w.word)
    return { word: w.word, pct, mastered, attempts: attempts?.attempts || 0 }
  })

  const masteredList = wordStats.filter(w => w.pct >= 80 || w.mastered)
  const needPracticeList = wordStats.filter(w => w.pct < 60 && w.attempts > 0)
  const learningList = wordStats.filter(w => w.pct >= 60 && w.pct < 80)

  const masteredPct = totalWords ? Math.round((masteredList.length / totalWords) * 100) : 0
  const needPct = totalWords ? Math.round((needPracticeList.length / totalWords) * 100) : 0

  const stars = best ? Math.min(3, Math.ceil(best.score / 4)) : 0

  return (
    <div className={`unit-card-expandable ${expanded ? 'expanded' : ''}`}>
      <div className="unit-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="unit-card-left">
          <span className="unit-key-badge">{unitKey.toUpperCase()}</span>
          <span className="unit-title-text">{unit?.title || ''}</span>
        </div>
        <div className="unit-card-right">
          <div className="unit-stars">{[1,2,3].map(s => <span key={s} className={s <= stars ? 'star-lit' : ''}>★</span>)}</div>
          <span className="unit-score">{best ? `${best.score}/10` : '—'}</span>
          <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="unit-progress-mini">
        <div className="prog-bar-segment mastered" style={{ width: masteredPct + '%' }} />
        <div className="prog-bar-segment learning" style={{ width: (100 - masteredPct - needPct) + '%' }} />
        <div className="prog-bar-segment need" style={{ width: needPct + '%' }} />
      </div>
      <div className="unit-progress-labels">
        <span className="label mastered">✓ {masteredList.length} mastered</span>
        <span className="label learning">{learningList.length} learning</span>
        <span className="label need">⚠ {needPracticeList.length} need practice</span>
      </div>

      {/* 展开详情 */}
      {expanded && (
        <div className="unit-card-details">
          {masteredList.length > 0 && (
            <div className="detail-section">
              <h4>✓ Mastered ({masteredList.length})</h4>
              <div className="word-tags">
                {masteredList.map(w => <span key={w.word} className="word-tag mastered">{w.word}</span>)}
              </div>
            </div>
          )}
          {learningList.length > 0 && (
            <div className="detail-section">
              <h4>📖 Learning ({learningList.length})</h4>
              <div className="word-tags">
                {learningList.map(w => <span key={w.word} className="word-tag learning">{w.word}</span>)}
              </div>
            </div>
          )}
          {needPracticeList.length > 0 && (
            <div className="detail-section">
              <h4>⚠ Need Practice ({needPracticeList.length})</h4>
              <div className="word-tags">
                {needPracticeList.map(w => <span key={w.word} className="word-tag need">{w.word} <small>{w.pct}%</small></span>)}
              </div>
            </div>
          )}
          {totalWords === 0 && <p className="no-words">No words in this unit</p>}
        </div>
      )}
    </div>
  )
}

// ─── 主页面 ─────────────────────────────────────────
export default function StatsPage({ onBack }) {
  const [stats, setStats] = useState(loadStats)
  const refresh = () => setStats(loadStats())

  const unitKeys = ['u1','u2','u3','u4','u5','u6','u7','u8','u9']
  const totalWords = unitKeys.reduce((a, k) => a + (VOCAB[k]?.words?.length || 0), 0)
  const completedUnits = unitKeys.filter(k => (stats.unitBest[k] || {}).score > 0).length
  const accuracy = stats.totalAttempts > 0 ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 0
  const masteredCount = Object.values(stats.masteredWords).flat().length

  // 7天数据
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
      date, label: date.slice(5),
      sessions: daySessions.length,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
    }
  })

  // 易错词
  const wordAccuracy = Object.entries(stats.wordAttempts)
    .map(([word, d]) => ({ word, pct: Math.round((d.correct / d.attempts) * 100), ...d }))
    .sort((a, b) => a.pct - b.pct)
  const hardWords = wordAccuracy.filter(w => w.pct < 60 && w.attempts >= 2).slice(0, 8)

  const noData = stats.totalAttempts === 0

  return (
    <div className="stats-page">
      <div className="stats-header">
        <button className="icon-btn back-btn" onClick={onBack}>←</button>
        <h1 className="stats-title">🏆 My Progress</h1>
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
          {/* ── 顶部核心指标 ── */}
          <div className="stats-overview-grid">
            <div className="stat-card highlight">
              <DonutChart percent={accuracy} size={90} color="#3b82f6" />
              <div className="stat-info">
                <div className="stat-value">{accuracy}%</div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-big-num">{stats.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-big-num">{completedUnits}<span className="stat-max">/9</span></div>
              <div className="stat-label">Units Done</div>
            </div>
            <div className="stat-card">
              <div className="stat-big-num">{masteredCount}<span className="stat-max">/{totalWords}</span></div>
              <div className="stat-label">Words Mastered</div>
            </div>
          </div>

          {/* ── 7天趋势（合并版） ── */}
          <div className="stats-section section-trend">
            <h2 className="stats-section-title">📅 Last 7 Days</h2>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot blue"></span> Practice Count</span>
              <span className="legend-item"><span className="legend-dot green"></span> Accuracy %</span>
            </div>
            <CombinedBarChart data={trendData} width={440} height={180} />
          </div>

          {/* ── 单元进度（可展开） ── */}
          <div className="stats-section section-units">
            <h2 className="stats-section-title">📚 Unit Progress</h2>
            <div className="unit-cards-list">
              {unitKeys.map(key => {
                const unit = VOCAB[key]
                if (!unit) return null
                return (
                  <UnitProgressCard
                    key={key}
                    unitKey={key}
                    unit={unit}
                    stats={stats}
                    unitMastered={stats.masteredWords[key]}
                  />
                )
              })}
            </div>
          </div>

          {/* ── 易错词 ── */}
          {hardWords.length > 0 && (
            <div className="stats-section section-hard">
              <h2 className="stats-section-title">⚠️ Needs More Practice</h2>
              <div className="hard-words-grid">
                {hardWords.map(w => (
                  <div key={w.word} className="hard-word-card">
                    <span className="hw-word">{w.word}</span>
                    <span className="hw-pct" style={{ color: w.pct < 40 ? '#ef4444' : '#f59e0b' }}>{w.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="stats-footer">
            <p>{stats.firstVisit && `Since ${stats.firstVisit} · `}{stats.totalAttempts} attempts</p>
            <button className="btn btn-sm btn-giveup"
              onClick={() => { if (confirm('Reset all progress?')) { localStorage.removeItem(STATS_KEY); refresh() } }}>
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  )
}

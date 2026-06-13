/**
 * 单词成果统计页面 - shadcn 风格重构
 * 布局：顶部概览 → 7天趋势 → 单元进度(可展开) → 易错词
 */
import { useState } from 'react'
import { VOCAB } from '../data/pu2_vocab'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { cn } from '../lib/utils'
import { ArrowLeft, TrendingUp, BookOpen, Award, AlertTriangle, ChevronDown, ChevronRight, Star, Trash2 } from 'lucide-react'

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
function DonutChart({ percent, size = 100, color = '#6a5fc1', label }) {
  const r = (size - 12) / 2
  const cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(1, Math.max(0, percent)) / 100)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="20" fontWeight="800" fill={color}>{Math.round(percent)}%</text>
      </svg>
      {label && <div className="text-[10px] text-text-light">{label}</div>}
    </div>
  )
}

function CombinedBarChart({ data, width = 440, height = 180 }) {
  if (!data.length || data.every(d => d.sessions === 0)) {
    return <div className="text-center py-6 text-text-light text-sm">No data yet</div>
  }
  const maxSessions = Math.max(...data.map(d => d.sessions), 1)
  const barW = (width - 40) / data.length
  const chartH = height - 50

  return (
    <svg width={width} height={height} className="block overflow-visible w-full max-w-[440px] h-[180px] mx-auto">
      <line x1="35" y1="10" x2="35" y2={chartH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="35" y1={chartH} x2={width} y2={chartH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {data.map((d, i) => {
        const x = 35 + i * barW + 2
        const barH = d.sessions > 0 ? Math.max(8, (d.sessions / maxSessions) * (chartH - 30)) : 0
        const y = chartH - barH
        const accH = d.sessions > 0 ? (d.accuracy / 100) * barH : 0
        const accY = chartH - accH
        return (
          <g key={i}>
            <rect x={x} y={y} width={Math.max(6, barW - 6)} height={barH} fill="#6a5fc1" rx="3" />
            {d.sessions > 0 && (
              <rect x={x} y={accY} width={Math.max(6, barW - 6)} height={accH} fill="#c2ef4e" rx="3" />
            )}
            {d.label && (
              <text x={x + (barW - 6) / 2} y={chartH + 14} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.label}</text>
            )}
            {d.sessions > 0 && (
              <text x={x + (barW - 6) / 2} y={y - 4} textAnchor="middle" fontSize="9" fill="#6b7280">{d.sessions}</text>
            )}
          </g>
        )
      })}
      <text x="8" y={chartH / 2} fontSize="9" fill="#6b7280" transform={`rotate(-90 8 ${chartH / 2})`}>sessions</text>
    </svg>
  )
}

// ─── 单元进度展开卡片 ─────────────────────────────────
function UnitProgressCard({ unitKey, unit, stats, unitMastered }) {
  const [expanded, setExpanded] = useState(false)
  const best = stats.unitBest[unitKey]
  const words = unit?.words || []
  const totalWords = words.length

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
    <div className={cn(
      "bg-bg-elevated rounded-[10px] overflow-hidden transition-all duration-150 shadow-[0_0_0_1px_transparent] hover:shadow-[0_0_0_1px_var(--color-border)]",
      expanded && "bg-surface shadow-[0_0_0_1px_var(--color-primary),var(--shadow-glow)]"
    )}>
      <div className="flex items-center justify-between p-3.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2.5">
          <Badge variant="default" className="text-[10px]">{unitKey.toUpperCase()}</Badge>
          <span className="text-sm font-semibold text-text">{unit?.title || ''}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-sm">
            {[1,2,3].map(s => (
              <span key={s} className={s <= stars ? "text-coral" : "text-text-muted"}>★</span>
            ))}
          </div>
          <span className="text-[11px] text-text-light min-w-[40px] text-right">{best ? `${best.score}/10` : '—'}</span>
          <span className="text-[10px] text-text-light">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-[5px] bg-black/20 rounded-[3px] flex mx-4 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
        <div className="h-full bg-accent" style={{ width: masteredPct + '%' }} />
        <div className="h-full bg-primary" style={{ width: (100 - masteredPct - needPct) + '%' }} />
        <div className="h-full bg-danger" style={{ width: needPct + '%' }} />
      </div>
      <div className="flex justify-between px-4 py-2 text-[10px]">
        <span className="flex items-center gap-1 text-accent">✓ {masteredList.length} mastered</span>
        <span className="flex items-center gap-1 text-primary">{learningList.length} learning</span>
        <span className="flex items-center gap-1 text-danger">⚠ {needPracticeList.length} need</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border">
          {masteredList.length > 0 && (
            <div className="mt-3.5">
              <h4 className="text-xs font-semibold text-text-soft mb-2">✓ Mastered ({masteredList.length})</h4>
              <div className="flex flex-wrap gap-1">
                {masteredList.map(w => (
                  <Badge key={w.word} variant="success" className="rounded-[14px] px-2.5 py-1 text-[11px]">{w.word}</Badge>
                ))}
              </div>
            </div>
          )}
          {learningList.length > 0 && (
            <div className="mt-3.5">
              <h4 className="text-xs font-semibold text-text-soft mb-2">📖 Learning ({learningList.length})</h4>
              <div className="flex flex-wrap gap-1">
                {learningList.map(w => (
                  <Badge key={w.word} variant="default" className="rounded-[14px] px-2.5 py-1 text-[11px]">{w.word}</Badge>
                ))}
              </div>
            </div>
          )}
          {needPracticeList.length > 0 && (
            <div className="mt-3.5">
              <h4 className="text-xs font-semibold text-text-soft mb-2">⚠ Need Practice ({needPracticeList.length})</h4>
              <div className="flex flex-wrap gap-1">
                {needPracticeList.map(w => (
                  <Badge key={w.word} variant="destructive" className="rounded-[14px] px-2.5 py-1 text-[11px]">
                    {w.word} <small className="text-[9px] opacity-70 ml-1">{w.pct}%</small>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {totalWords === 0 && <p className="text-xs text-text-light text-center py-2.5">No words in this unit</p>}
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

  const wordAccuracy = Object.entries(stats.wordAttempts)
    .map(([word, d]) => ({ word, pct: Math.round((d.correct / d.attempts) * 100), ...d }))
    .sort((a, b) => a.pct - b.pct)
  const hardWords = wordAccuracy.filter(w => w.pct < 60 && w.attempts >= 2).slice(0, 8)

  const noData = stats.totalAttempts === 0

  return (
    <div className="max-w-[500px] mx-auto px-4 pb-12 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-[22px]">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-[22px] font-bold tracking-[-0.3px] text-text">
          <Trophy size={20} className="inline mr-1.5 text-coral" />
          My Progress
        </h1>
      </div>

      {noData ? (
        <div className="text-center py-12 px-5 text-text-soft">
          <div className="text-[56px] mb-4"><TrendingUp size={56} className="mx-auto text-text-muted" /></div>
          <h2 className="text-lg mb-2 text-text font-semibold">No data yet</h2>
          <p className="mb-5 text-[15px]">Complete some challenges to see your stats!</p>
          <Button onClick={onBack}>Start Learning</Button>
        </div>
      ) : (
        <>
          {/* Overview Grid */}
          <div className="grid grid-cols-2 gap-3 mb-[22px]">
            <Card className="col-span-2 flex items-center justify-center gap-[18px] p-[18px] bg-primary-light border border-[rgba(106,95,193,0.2)]">
              <DonutChart percent={accuracy} size={90} color="#6a5fc1" />
              <div className="flex flex-col">
                <div className="text-[32px] font-bold text-primary leading-none">{accuracy}%</div>
                <div className="text-xs text-text-soft">Accuracy</div>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-4">
              <Award size={28} className="text-primary" />
              <div className="flex flex-col">
                <div className="text-[32px] font-bold text-primary leading-none">{stats.totalAttempts}</div>
                <div className="text-xs text-text-soft">Total Attempts</div>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-4">
              <BookOpen size={28} className="text-accent" />
              <div className="flex flex-col">
                <div className="text-[32px] font-bold text-primary leading-none">
                  {completedUnits}<span className="text-sm text-text-light font-normal">/9</span>
                </div>
                <div className="text-xs text-text-soft">Units Done</div>
              </div>
            </Card>

            <Card className="flex items-center gap-3 p-4">
              <Star size={28} className="text-coral" />
              <div className="flex flex-col">
                <div className="text-[32px] font-bold text-primary leading-none">
                  {masteredCount}<span className="text-sm text-text-light font-normal">/{totalWords}</span>
                </div>
                <div className="text-xs text-text-soft">Words Mastered</div>
              </div>
            </Card>
          </div>

          {/* 7 Day Trend */}
          <Card className="mb-3.5 p-[18px]">
            <h2 className="text-[13px] font-semibold text-text mb-3.5">
              <TrendingUp size={14} className="inline mr-1.5" /> Last 7 Days
            </h2>
            <div className="flex gap-4 mb-2.5 justify-center">
              <span className="text-[11px] text-text-soft flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[3px] bg-primary" /> Practice Count
              </span>
              <span className="text-[11px] text-text-soft flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[3px] bg-accent" /> Accuracy %
              </span>
            </div>
            <CombinedBarChart data={trendData} width={440} height={180} />
          </Card>

          {/* Unit Progress */}
          <Card className="mb-3.5 p-[18px]">
            <h2 className="text-[13px] font-semibold text-text mb-3.5">
              <BookOpen size={14} className="inline mr-1.5" /> Unit Progress
            </h2>
            <div className="flex flex-col gap-2.5">
              {unitKeys.map(key => {
                const unit = VOCAB[key]
                if (!unit) return null
                return (
                  <UnitProgressCard
                    key={key} unitKey={key} unit={unit} stats={stats}
                    unitMastered={stats.masteredWords[key]}
                  />
                )
              })}
            </div>
          </Card>

          {/* Hard Words */}
          {hardWords.length > 0 && (
            <Card className="mb-3.5 p-[18px] bg-danger-bg shadow-[0_0_0_1px_rgba(250,127,170,0.2)]">
              <h2 className="text-[13px] font-semibold text-text mb-3.5">
                <AlertTriangle size={14} className="inline mr-1.5 text-danger" /> Needs More Practice
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {hardWords.map(w => (
                  <div key={w.word} className="bg-surface shadow-[0_0_0_1px_rgba(250,127,170,0.15)] rounded-[10px] p-2.5 text-center">
                    <span className="block text-xs font-semibold text-text mb-1">{w.word}</span>
                    <span className="text-sm font-bold" style={{ color: w.pct < 40 ? '#ef4444' : '#f59e0b' }}>
                      {w.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between py-3.5">
            <p className="text-[11px] text-text-light">
              {stats.firstVisit && `Since ${stats.firstVisit} · `}{stats.totalAttempts} attempts
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { if (confirm('Reset all progress?')) { localStorage.removeItem(STATS_KEY); refresh() } }}
            >
              <Trash2 size={12} /> Reset
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

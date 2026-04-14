
// ─── 辅助：单元闪卡浏览 ─────────────────────────────
function UnitFlashcardView({ unitKey, VOCAB, progress, refresh }) {
  const unit = VOCAB[unitKey]
  const words = (unit?.words || []).map(w => ({ ...w, unitTitle: unit.title }))
  const [idx, setIdx] = useState(0)
  const [mastered, setMastered] = useState(() => {
    const p = loadProgress()
    return p[unitKey]?.masteredWords || []
  })
  const saveM = useCallback((list) => {
    const p = loadProgress()
    p[unitKey] = { ...p[unitKey], masteredWords: list }
    saveProgress(p); refresh()
  }, [unitKey, refresh])
  const toggleM = () => {
    const word = words[idx].word
    const next = mastered.includes(word) ? mastered.filter(x => x !== word) : [...mastered, word]
    setMastered(next); saveM(next)
  }
  if (!words.length) return null
  return (
    <div className="app flashcard-standalone">
      <FlashCard word={words[idx]} unitTitle={words[idx].unitTitle} index={idx} total={words.length} onSpeak={speak} />
      <div className="flashcard-controls">
        <button className="btn btn-secondary" onClick={() => setIdx(i => Math.max(0, i - 1))}>← Prev</button>
        <button className={`btn ${mastered.includes(words[idx].word) ? 'btn-gold' : 'btn-primary'}`} onClick={toggleM}>
          {mastered.includes(words[idx].word) ? '✓ Mastered' : 'Mark Mastered'}
        </button>
        <button className="btn btn-secondary" onClick={() => setIdx(i => Math.min(words.length - 1, i + 1))}>Next →</button>
      </div>
    </div>
  )
}

// ─── 辅助：浏览全部词库 ────────────────────────────
function BrowseAllView({ VOCAB, progress, onBack, onFlashcard, onChallenge }) {
  const [filter, setFilter] = useState('all')
  const unitKeys = ['u1','u2','u3','u4','u5','u6','u7','u8','u9']
  const allWords = unitKeys.flatMap(k => VOCAB[k]?.words?.map(w => ({...w, unitKey: k})) || [])
  const visible = filter === 'all' ? allWords : (VOCAB[filter]?.words?.map(w => ({...w, unitKey: filter})) || [])
  return (
    <div className="browse-all-view">
      <div className="browse-header">
        <button className="icon-btn" onClick={onBack}>← Back</button>
        <h2>All Words</h2>
      </div>
      <div className="unit-tabs">
        {[{ key:'all', label:'All' }, ...unitKeys.map(k => ({key:k, label:k.toUpperCase()}))].map(tab => (
          <button key={tab.key} className={`tab-btn ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}>{tab.label}</button>
        ))}
      </div>
      <div className="browse-grid">
        {visible.map((w) => (
          <div key={w.word} className="word-chip"
            onClick={() => onFlashcard(w.unitKey)}>
            <img src={`/images/${w.word}.png`} alt={w.word} className="word-chip-img"
              onError={e => { e.target.style.opacity='0.2' }} />
            <span className="word-chip-name">{w.word}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

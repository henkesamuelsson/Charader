import { useState } from 'react'
import { themes } from '../cards/themes.js'

const STEPS = ['Spelare', 'Namn', 'Teman', 'Inställningar']

function ProgressBar({ currentStep }) {
  return (
    <div className="wizard-progress">
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? '1' : 'initial' }}>
          <div className={`wizard-step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}>
            <div className="wizard-step-circle">
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className="wizard-step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`wizard-connector ${i < currentStep ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function ThemeStep({ selected, onChange }) {
  const [expanded, setExpanded] = useState(new Set())

  function toggleTheme(id) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    onChange(next)
  }

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    const all = new Set()
    themes.forEach(t => {
      all.add(t.id)
      t.subcategories?.forEach(s => all.add(s.id))
    })
    onChange(all)
  }

  function clearAll() { onChange(new Set()) }

  const allIds = []
  themes.forEach(t => { allIds.push(t.id); t.subcategories?.forEach(s => allIds.push(s.id)) })
  const allSelected = allIds.every(id => selected.has(id))

  return (
    <div>
      <div className="theme-select-actions">
        <button className="theme-action-btn" onClick={allSelected ? clearAll : selectAll}>
          {allSelected ? 'Rensa alla' : 'Välj alla'}
        </button>
        {selected.size > 0 && (
          <span className="theme-count-badge">{selected.size} valda</span>
        )}
      </div>

      <div className="theme-grid">
        {themes.map(theme => {
          const isSelected = selected.has(theme.id)
          const isExpanded = expanded.has(theme.id)
          const hasSubs = !!theme.subcategories?.length

          return (
            <div key={theme.id} className="theme-item-wrapper">
              <button
                className={`theme-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  toggleTheme(theme.id)
                  if (hasSubs && !isExpanded) toggleExpand(theme.id)
                }}
              >
                <span className="theme-chip-emoji">{theme.emoji}</span>
                <span className="theme-chip-label">{theme.label}</span>
                {hasSubs && (
                  <span
                    className={`theme-chip-arrow ${isExpanded ? 'open' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleExpand(theme.id) }}
                  >▾</span>
                )}
              </button>

              {hasSubs && isExpanded && (
                <div className="subcategory-grid">
                  {theme.subcategories.map(sub => (
                    <button
                      key={sub.id}
                      className={`theme-chip sub-chip ${selected.has(sub.id) ? 'selected' : ''}`}
                      onClick={() => toggleTheme(sub.id)}
                    >
                      <span className="theme-chip-emoji">{sub.emoji}</span>
                      <span className="theme-chip-label">{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SetupScreen({ onStart }) {
  const [step, setStep] = useState(0)
  const [playerCount, setPlayerCount] = useState(3)
  const [names, setNames] = useState([])
  const [selectedThemes, setSelectedThemes] = useState(new Set(['general']))
  const [roundCount, setRoundCount] = useState(3)
  const [useTimer, setUseTimer] = useState(false)
  const [timerDuration, setTimerDuration] = useState(30)

  function handleCountNext() {
    setNames(Array.from({ length: playerCount }, (_, i) => names[i] || ''))
    setStep(1)
  }

  function handleThemesNext() {
    if (selectedThemes.size === 0) { alert('Välj minst ett tema.'); return }
    setStep(3)
  }

  function handleStart() {
    const players = names.map((name, i) => ({
      name: name.trim() || `Spelare ${i + 1}`,
      score: 0
    }))
    onStart({ players, roundsPerPlayer: roundCount, useTimer, timerDuration, selectedThemes })
  }

  return (
    <div>
      <ProgressBar currentStep={step} />

      {step === 0 && (
        <div className="wizard-card">
          <h2>Hur många spelar?</h2>
          <p className="hint">Välj antal spelare (1–10)</p>
          <div className="stepper">
            <button className="stepper-btn" onClick={() => setPlayerCount(c => Math.max(1, c - 1))}>−</button>
            <span className="stepper-value">{playerCount}</span>
            <button className="stepper-btn" onClick={() => setPlayerCount(c => Math.min(10, c + 1))}>+</button>
          </div>
          <button className="btn btn-primary" onClick={handleCountNext}>Fortsätt →</button>
        </div>
      )}

      {step === 1 && (
        <div className="wizard-card">
          <h2>Vad heter spelarna?</h2>
          <p className="hint">Fyll i namn eller använd standardnamnen</p>
          <div className="player-inputs">
            {names.map((name, i) => (
              <div key={i} className="player-input-row">
                <span className="player-input-number">{i + 1}</span>
                <input
                  type="text"
                  placeholder={`Spelare ${i + 1}`}
                  value={name}
                  onChange={e => {
                    const updated = [...names]
                    updated[i] = e.target.value
                    setNames(updated)
                  }}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
          <div className="wizard-nav">
            <button className="btn btn-secondary" onClick={() => setStep(0)}>← Tillbaka</button>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Fortsätt →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-card">
          <h2>Välj teman</h2>
          <p className="hint">Välj ett eller flera teman för kortleken</p>
          <ThemeStep selected={selectedThemes} onChange={setSelectedThemes} />
          <div className="wizard-nav" style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Tillbaka</button>
            <button className="btn btn-primary" onClick={handleThemesNext}>Fortsätt →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard-card">
          <h2>Spelinställningar</h2>
          <p className="hint">Anpassa spelet efter er smak</p>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Rundor per spelare</div>
              <div className="toggle-sublabel">Hur många varv var och en kör</div>
            </div>
            <div className="stepper" style={{ margin: 0, padding: '4px' }}>
              <button className="stepper-btn" style={{ width: 36, height: 36, fontSize: '1.2rem' }}
                onClick={() => setRoundCount(c => Math.max(1, c - 1))}>−</button>
              <span className="stepper-value" style={{ fontSize: '1.4rem', minWidth: '48px' }}>{roundCount}</span>
              <button className="stepper-btn" style={{ width: 36, height: 36, fontSize: '1.2rem' }}
                onClick={() => setRoundCount(c => Math.min(20, c + 1))}>+</button>
            </div>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Timer</div>
              <div className="toggle-sublabel">Tidsgräns per runda</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={useTimer} onChange={e => setUseTimer(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          {useTimer && (
            <div className="timer-extra">
              <label>Sekunder per runda</label>
              <div className="stepper" style={{ margin: '0 auto' }}>
                <button className="stepper-btn" onClick={() => setTimerDuration(d => Math.max(5, d - 5))}>−</button>
                <span className="stepper-value">{timerDuration}</span>
                <button className="stepper-btn" onClick={() => setTimerDuration(d => Math.min(300, d + 5))}>+</button>
              </div>
            </div>
          )}

          <div className="wizard-nav" style={{ marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Tillbaka</button>
            <button className="btn btn-primary" onClick={handleStart}>🎭 Starta spelet!</button>
          </div>
        </div>
      )}
    </div>
  )
}

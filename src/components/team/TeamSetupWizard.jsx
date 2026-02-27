import { useState } from 'react'
import ThemeStep from '../ThemeStep.jsx'

const STEPS = ['Läge', 'Lag', 'Spelare', 'Teman', 'Inställningar']

function ProgressBar({ currentStep }) {
  return (
    <div className="wizard-progress">
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? '1' : 'initial' }}>
          <div className={`wizard-step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}>
            <div className="wizard-step-circle">{i < currentStep ? '✓' : i + 1}</div>
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

export default function TeamSetupWizard({ onStart, onBack }) {
  const [step, setStep] = useState(0)
  const [gameMode, setGameMode] = useState(null)
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState([])
  const [selectedThemes, setSelectedThemes] = useState(new Set(['general']))
  const [roundCount, setRoundCount] = useState(2)
  const [timerMinutes, setTimerMinutes] = useState(0.20)

  // Steg 1 – Spelläge
  function handleModeSelect(mode) {
    setGameMode(mode)
    setStep(1)
  }

  // Steg 2 – Antal lag & lagnamn
  function handleTeamCountNext() {
    const updated = Array.from({ length: teamCount }, (_, i) => ({
      name: teams[i]?.name || `Lag ${i + 1}`,
      players: teams[i]?.players || ['', ''] // min 2 spelare
    }))
    setTeams(updated)
    setStep(2)
  }

  function updateTeamName(i, value) {
    setTeams(prev => prev.map((t, idx) => idx === i ? { ...t, name: value } : t))
  }

  // Steg 3 – Spelare per lag
  function updatePlayerCount(teamIdx, delta) {
    setTeams(prev => prev.map((t, i) => {
      if (i !== teamIdx) return t
      const next = [...t.players]
      if (delta > 0 && next.length < 10) next.push('')
      else if (delta < 0 && next.length > 2) next.pop() // min 2
      return { ...t, players: next }
    }))
  }

  function updatePlayerName(teamIdx, playerIdx, value) {
    setTeams(prev => prev.map((t, i) => {
      if (i !== teamIdx) return t
      const next = [...t.players]
      next[playerIdx] = value
      return { ...t, players: next }
    }))
  }

  function handlePlayersNext() {
    const updated = teams.map((t, ti) => ({
      ...t,
      players: t.players.map((p, pi) => p.trim() || `${t.name || `Lag ${ti + 1}`} S${pi + 1}`)
    }))
    setTeams(updated)
    setStep(3)
  }

  // Steg 4 – Teman
  function handleThemesNext() {
    if (selectedThemes.size === 0) { alert('Välj minst ett tema.'); return }
    setStep(4)
  }

  // Steg 5 – Inställningar → Starta
  function handleStart() {
    const finalTeams = teams.map(t => ({ ...t, score: 0 }))
    onStart({
      gameMode,
      teams: finalTeams,
      roundCount,
      timerSeconds: Math.round(timerMinutes * 60),
      selectedThemes
    })
  }

  return (
    <div>
      <ProgressBar currentStep={step} />

      {/* Steg 1 – Spelläge */}
      {step === 0 && (
        <div className="wizard-card">
          <h2>Välj spelläge</h2>
          <p className="hint">Hur vill ni spela lagspelet?</p>

          <div className="mode-cards">
            <button className="mode-card" onClick={() => handleModeSelect('standard')}>
              <span className="mode-card-emoji">⏱️</span>
              <span className="mode-card-title">Standard</span>
              <span className="mode-card-desc">En spelare charadar per turn med egen timer. Lagen alternerar.</span>
            </button>
            <button className="mode-card" onClick={() => handleModeSelect('hotseat')}>
              <span className="mode-card-emoji">🔥</span>
              <span className="mode-card-title">Hot Seat</span>
              <span className="mode-card-desc">Laget delar en timer. Byt charadör vid varje rätt svar eller skip!</span>
            </button>
          </div>

          <button className="btn btn-ghost" onClick={onBack}>← Tillbaka</button>
        </div>
      )}

      {/* Steg 2 – Antal lag & lagnamn */}
      {step === 1 && (
        <div className="wizard-card">
          <h2>Hur många lag?</h2>
          <p className="hint">Välj antal lag (2–5) och ge dem namn</p>

          <div className="stepper" style={{ marginBottom: 24 }}>
            <button className="stepper-btn" onClick={() => setTeamCount(c => Math.max(2, c - 1))}>−</button>
            <span className="stepper-value">{teamCount}</span>
            <button className="stepper-btn" onClick={() => setTeamCount(c => Math.min(5, c + 1))}>+</button>
          </div>

          <div className="player-inputs">
            {Array.from({ length: teamCount }, (_, i) => (
              <div key={i} className="player-input-row">
                <span className="player-input-number">🏳️</span>
                <input
                  type="text"
                  placeholder={`Lag ${i + 1}`}
                  value={teams[i]?.name || ''}
                  onChange={e => {
                    setTeams(prev => {
                      const next = Array.from({ length: teamCount }, (_, idx) =>
                        prev[idx] || { name: '', players: ['', ''] }
                      )
                      next[i] = { ...next[i], name: e.target.value }
                      return next
                    })
                  }}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <div className="wizard-nav">
            <button className="btn btn-secondary" onClick={() => setStep(0)}>← Tillbaka</button>
            <button className="btn btn-primary" onClick={handleTeamCountNext}>Fortsätt →</button>
          </div>
        </div>
      )}

      {/* Steg 3 – Spelare per lag */}
      {step === 2 && (
        <div className="wizard-card">
          <h2>Spelare i varje lag</h2>
          <p className="hint">Minst 2 spelare per lag, max 10</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
            {teams.map((team, ti) => (
              <div key={ti} className="team-players-section">
                <div className="team-players-header">
                  <span className="team-players-name">{team.name || `Lag ${ti + 1}`}</span>
                  <div className="stepper" style={{ margin: 0, padding: '3px' }}>
                    <button className="stepper-btn" style={{ width: 32, height: 32, fontSize: '1.1rem' }}
                      onClick={() => updatePlayerCount(ti, -1)}>−</button>
                    <span className="stepper-value" style={{ fontSize: '1.2rem', minWidth: '40px' }}>{team.players.length}</span>
                    <button className="stepper-btn" style={{ width: 32, height: 32, fontSize: '1.1rem' }}
                      onClick={() => updatePlayerCount(ti, 1)}>+</button>
                  </div>
                </div>
                <div className="player-inputs" style={{ marginBottom: 0 }}>
                  {team.players.map((p, pi) => (
                    <div key={pi} className="player-input-row">
                      <span className="player-input-number">{pi + 1}</span>
                      <input
                        type="text"
                        placeholder={`Spelare ${pi + 1}`}
                        value={p}
                        onChange={e => updatePlayerName(ti, pi, e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="wizard-nav">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Tillbaka</button>
            <button className="btn btn-primary" onClick={handlePlayersNext}>Fortsätt →</button>
          </div>
        </div>
      )}

      {/* Steg 4 – Teman */}
      {step === 3 && (
        <div className="wizard-card">
          <h2>Välj teman</h2>
          <p className="hint">Välj ett eller flera teman för kortleken</p>
          <ThemeStep selected={selectedThemes} onChange={setSelectedThemes} />
          <div className="wizard-nav" style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Tillbaka</button>
            <button className="btn btn-primary" onClick={handleThemesNext}>Fortsätt →</button>
          </div>
        </div>
      )}

      {/* Steg 5 – Inställningar */}
      {step === 4 && (
        <div className="wizard-card">
          <h2>Spelinställningar</h2>
          <p className="hint">Anpassa spelet efter er smak</p>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Antal omgångar</div>
              <div className="toggle-sublabel">Hur många omgångar spelar ni</div>
            </div>
            <div className="stepper" style={{ margin: 0, padding: '4px' }}>
              <button className="stepper-btn" style={{ width: 36, height: 36, fontSize: '1.2rem' }}
                onClick={() => setRoundCount(c => Math.max(1, c - 1))}>−</button>
              <span className="stepper-value" style={{ fontSize: '1.4rem', minWidth: '48px' }}>{roundCount}</span>
              <button className="stepper-btn" style={{ width: 36, height: 36, fontSize: '1.2rem' }}
                onClick={() => setRoundCount(c => Math.min(10, c + 1))}>+</button>
            </div>
          </div>

          <div className="toggle-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="toggle-label">Timer per tur</div>
              <div className="toggle-sublabel">Minuter (obligatorisk i lagspel)</div>
            </div>
            <div className="stepper" style={{ margin: 0, padding: '4px' }}>
              <button className="stepper-btn" style={{ width: 36, height: 36, fontSize: '1.2rem' }}
                onClick={() => setTimerMinutes(m => Math.max(1, m - 1))}>−</button>
              <span className="stepper-value" style={{ fontSize: '1.4rem', minWidth: '48px' }}>{timerMinutes} min</span>
              <button className="stepper-btn" style={{ width: 36, height: 36, fontSize: '1.2rem' }}
                onClick={() => setTimerMinutes(m => Math.min(10, m + 1))}>+</button>
            </div>
          </div>

          <div className="wizard-nav" style={{ marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Tillbaka</button>
            <button className="btn btn-primary" onClick={handleStart}>🏆 Starta lagspelet!</button>
          </div>
        </div>
      )}
    </div>
  )
}

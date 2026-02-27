import { useState } from 'react'
import ThemeStep from './ThemeStep.jsx'

const STEPS = ['Spelare', 'Namn', 'Teman', 'Inställningar']

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

      {/* Steg 1 – Antal spelare */}
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

      {/* Steg 2 – Namn */}
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

      {/* Steg 3 – Teman */}
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

      {/* Steg 4 – Inställningar */}
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

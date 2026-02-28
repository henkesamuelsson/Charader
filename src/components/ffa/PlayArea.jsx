import { useState, useMemo, useRef } from 'react'
import { buildCardPool } from '../../cards/themes.js'
import Scoreboard from './Scoreboard.jsx'
import Timer from '../Timer.jsx'
import GameOver from './GameOver.jsx'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PlayArea({ initialPlayers, roundsPerPlayer, useTimer, timerDuration, selectedThemes, onRestart }) {
  const [players, setPlayers] = useState(initialPlayers)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentCard, setCurrentCard] = useState(null)
  const [phase, setPhase] = useState('ready')
  const [awaitingGuess, setAwaitingGuess] = useState(false)
  const [guessedPlayerIndex, setGuessedPlayerIndex] = useState(null)
  const [timerRunning, setTimerRunning] = useState(false)

  const cardPool = useMemo(() => buildCardPool(selectedThemes), [selectedThemes])
  const deckRef = useRef(shuffleArray(cardPool))
  const deckIndexRef = useRef(0)

  const otherPlayers = players
    .map((p, i) => ({ ...p, index: i }))
    .filter((_, i) => i !== currentPlayerIndex)

  function getNextCard() {
    if (deckIndexRef.current >= deckRef.current.length) {
      deckRef.current = shuffleArray(cardPool)
      deckIndexRef.current = 0
    }
    return deckRef.current[deckIndexRef.current++]
  }

  function handleShowCard() {
    setCurrentCard(getNextCard())
    setPhase('playing')
    if (useTimer) setTimerRunning(true)
  }

  function handleEndRound() {
    setTimerRunning(false)
    if (!awaitingGuess) {
      setAwaitingGuess(true)
      setGuessedPlayerIndex(null)
      return
    }
    const updated = players.map((p, i) => {
      if (guessedPlayerIndex !== 'none' && guessedPlayerIndex !== null && i === parseInt(guessedPlayerIndex)) return { ...p, score: p.score + 3 }
      if (guessedPlayerIndex !== 'none' && guessedPlayerIndex !== null && i === currentPlayerIndex) return { ...p, score: p.score + 1 }
      return p
    })
    setPlayers(updated)
    setAwaitingGuess(false)
    advanceTurn(updated)
  }

  function handleNextTurn() {
    if (awaitingGuess) { alert('Du måste bekräfta gissningen först.'); return }
    advanceTurn(players)
  }

  function advanceTurn(currentPlayers) {
    let nextIndex = currentPlayerIndex + 1
    let nextRound = currentRound
    if (nextIndex >= currentPlayers.length) { nextIndex = 0; nextRound = currentRound + 1 }
    if (nextRound > roundsPerPlayer) { setPhase('gameover'); return }
    setCurrentPlayerIndex(nextIndex)
    setCurrentRound(nextRound)
    setCurrentCard(null)
    setPhase('ready')
    setTimerRunning(false)
  }

  function handleTimerExpire() {
    setTimerRunning(false)
    setAwaitingGuess(true)
    setGuessedPlayerIndex(null)
    setPhase('awaiting-guess')
  }

  function handlePlayAgain() {
    setPlayers(initialPlayers.map(p => ({ ...p, score: 0 })))
    setCurrentPlayerIndex(0)
    setCurrentRound(1)
    setCurrentCard(null)
    setPhase('ready')
    setAwaitingGuess(false)
    setTimerRunning(false)
    deckRef.current = shuffleArray(cardPool)
    deckIndexRef.current = 0
  }

  if (phase === 'gameover') {
    return <GameOver players={players} onRestart={onRestart} onPlayAgain={handlePlayAgain} />
  }

  return (
    <div id="play-area">
      <div className="current-player-banner">
        <span className="turn-label">Spelare:</span>
        <span className="player-name-highlight">{players[currentPlayerIndex].name}</span>
      </div>

      {useTimer && (
        <Timer duration={timerDuration} running={timerRunning} onExpire={handleTimerExpire} />
      )}

      <div className="card-display">
        {currentCard ? (
          <>
            <span className="card-word">{currentCard.word}</span>
            <span className="card-theme-label">{currentCard.theme}</span>
          </>
        ) : (
          <span className="card-placeholder">Tryck på knappen för att se kortet</span>
        )}
      </div>

      {phase === 'ready' && (
        <button className="btn btn-primary" onClick={handleShowCard}>🃏 Visa kort</button>
      )}

      {phase === 'playing' && !awaitingGuess && (
        <button className="btn btn-secondary" onClick={handleEndRound}>✓ Rätt gissat!</button>
      )}

      {awaitingGuess && (
        <div className="guess-section">
          <label>Vem gissade rätt?</label>
          <div className="guess-player-grid">
            {otherPlayers.map(p => (
              <button
                key={p.index}
                className={`guess-player-chip ${guessedPlayerIndex === p.index.toString() ? 'selected' : ''}`}
                onClick={() => setGuessedPlayerIndex(p.index.toString())}
              >
                {p.name}
              </button>
            ))}
            <button
              className={`guess-player-chip guess-player-none ${guessedPlayerIndex === 'none' ? 'selected' : ''}`}
              onClick={() => setGuessedPlayerIndex('none')}
            >
              Ingen gissade rätt
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleEndRound}>✓ Bekräfta</button>
        </div>
      )}

      <Scoreboard
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        currentRound={currentRound}
        roundsPerPlayer={roundsPerPlayer}
      />

      {!awaitingGuess && phase !== 'ready' && (
        <button className="btn btn-ghost" onClick={handleNextTurn}>Hoppa över → Nästa spelare</button>
      )}
    </div>
  )
}

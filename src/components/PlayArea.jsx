import { useState, useMemo, useRef } from 'react'
import { buildCardPool } from '../cards/themes.js'
import Scoreboard from './Scoreboard.jsx'
import Timer from './Timer.jsx'
import GameOver from './GameOver.jsx'

export default function PlayArea({ initialPlayers, roundsPerPlayer, useTimer, timerDuration, selectedThemes, onRestart }) {
  const [players, setPlayers] = useState(initialPlayers)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentCard, setCurrentCard] = useState(null)
  const [phase, setPhase] = useState('ready') // ready | playing | awaiting-guess | gameover
  const [awaitingGuess, setAwaitingGuess] = useState(false)
  const [guessedPlayerIndex, setGuessedPlayerIndex] = useState(null)
  const [timerRunning, setTimerRunning] = useState(false)

  // Bygg kortpoolen en gång från valda teman
  const cardPool = useMemo(() => buildCardPool(selectedThemes), [selectedThemes])
  const deckRef = useRef(shuffleArray(cardPool))
  const deckIndexRef = useRef(0)

  const otherPlayers = players
    .map((p, i) => ({ ...p, index: i }))
    .filter((_, i) => i !== currentPlayerIndex)

  function shuffleArray(array) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
     [arr[i], arr[j]] = [arr[j], arr[i]]
  }
    return arr
  }

  function handleShowCard() {
  // Om vi gått igenom hela leken, blanda om
  if (deckIndexRef.current >= deckRef.current.length) {
    deckRef.current = shuffleArray(cardPool)
    deckIndexRef.current = 0
  }
    const card = deckRef.current[deckIndexRef.current]
    deckIndexRef.current++
    setCurrentCard(card)
    setPhase('playing')
  if (useTimer) setTimerRunning(true)
  }

  function handleEndRound() {
    setTimerRunning(false)
    if (!awaitingGuess) {
      setAwaitingGuess(true)
      setGuessedPlayerIndex(otherPlayers[0]?.index ?? 'none')
      return
    }
    const updated = players.map((p, i) => {
      if (guessedPlayerIndex !== 'none' && i === parseInt(guessedPlayerIndex)) return { ...p, score: p.score + 3 }
      if (guessedPlayerIndex !== 'none' && i === currentPlayerIndex) return { ...p, score: p.score + 1 }
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
    setGuessedPlayerIndex(otherPlayers[0]?.index ?? 'none')
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
        {currentCard
          ? <span className="card-word">{currentCard}</span>
          : <span className="card-placeholder">Tryck på knappen för att se kortet</span>
        }
      </div>
      
      {/* Kommentera ut nedanstående rad för att dölja "kort kvar"-räknaren */}
      {/* <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: -6 }}>
        {cardPool.length - deckIndexRef.current} kort kvar i leken
      </div> */}

      {phase === 'ready' && (
        <button className="btn btn-primary" onClick={handleShowCard}>🃏 Visa kort</button>
      )}

      {phase === 'playing' && !awaitingGuess && (
        <button className="btn btn-secondary" onClick={handleEndRound}>✋ Avsluta runda</button>
      )}

      {awaitingGuess && (
        <div className="guess-section">
          <label>Vem gissade rätt?</label>
          <select
            value={guessedPlayerIndex ?? 'none'}
            onChange={e => setGuessedPlayerIndex(e.target.value)}
          >
            {otherPlayers.map(p => (
              <option key={p.index} value={p.index}>{p.name}</option>
            ))}
            <option value="none">Ingen gissade rätt</option>
          </select>
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

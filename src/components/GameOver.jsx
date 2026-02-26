import { useEffect, useRef } from 'react'
import Scoreboard from './Scoreboard.jsx'

export default function GameOver({ players, onRestart, onPlayAgain }) {
  const fanfareRef = useRef(null)

  useEffect(() => {
    fanfareRef.current = new Audio('/sounds/fanfare.mp3')
    fanfareRef.current.volume = 1.0
    fanfareRef.current.play().catch(() => {})
  }, [])

  const highestScore = Math.max(...players.map(p => p.score))
  const winners = players.filter(p => p.score === highestScore)
  const isDrawn = winners.length > 1

  return (
    <div id="play-area">
      <div className="game-over-card">
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{isDrawn ? '🤝' : '🎉'}</div>
        <h2>{isDrawn ? 'Oavgjort!' : 'Vi har en vinnare!'}</h2>

        {isDrawn ? (
          <>
            <span className="winner-name">{winners.map(p => p.name).join(' & ')}</span>
            <p className="winner-score">Delar på segern med {highestScore} poäng</p>
          </>
        ) : (
          <>
            <span className="winner-name">{winners[0].name}</span>
            <p className="winner-score">{highestScore} poäng</p>
          </>
        )}

        <div className="game-over-buttons">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            🔄 Kör igen! (samma spelare)
          </button>
          <button className="btn btn-secondary" onClick={onRestart}>
            ⚙️ Starta om (nya inställningar)
          </button>
        </div>
      </div>

      <Scoreboard
        players={players}
        currentPlayerIndex={0}
        currentRound={1}
        roundsPerPlayer={1}
      />
    </div>
  )
}

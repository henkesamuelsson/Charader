import { useState, useMemo, useRef, useEffect } from 'react'
import { buildCardPool } from '../../cards/themes.js'
import TeamScoreboard from './TeamScoreboard.jsx'
import HandoffScreen from './HandoffScreen.jsx'
import PenaltyCountdown from './PenaltyCountdown.jsx'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Bygg Standard turn-ordning för en omgång: zip-merge av lag, fair-shufflad per lag
function buildStandardTurnOrder(teams) {
  const maxTurns = Math.max(...teams.map(t => t.players.length))
  const shuffledTeams = teams.map(t => {
    let queue = shuffleArray([...t.players])
    while (queue.length < maxTurns) queue.push(...shuffleArray([...t.players]))
    return { ...t, queue: queue.slice(0, maxTurns) }
  })
  const order = []
  for (let turn = 0; turn < maxTurns; turn++) {
    for (let ti = 0; ti < teams.length; ti++) {
      order.push({ teamIndex: ti, playerName: shuffledTeams[ti].queue[turn] })
    }
  }
  return order
}

export default function TeamPlayArea({ gameMode, teams: initialTeams, timerSeconds, roundCount, selectedThemes, onRestart }) {
  const cardPool = useMemo(() => buildCardPool(selectedThemes), [selectedThemes])
  const deckRef = useRef(shuffleArray(cardPool))
  const deckIndexRef = useRef(0)

  // === STANDARD STATE ===
  const [currentRound, setCurrentRound] = useState(1)
  const turnOrderRef = useRef(buildStandardTurnOrder(initialTeams))
  const [turnOrderIndex, setTurnOrderIndex] = useState(0)

  // === HOT SEAT STATE ===
  const hotSeatQueuesRef = useRef(initialTeams.map(() => ({ queue: [] })))

  function nextHotSeatPlayer(teamIndex) {
    const q = hotSeatQueuesRef.current[teamIndex]
    if (q.queue.length === 0) q.queue = shuffleArray([...initialTeams[teamIndex].players])
    return q.queue.shift()
  }

  const [hotSeatTeamIndex, setHotSeatTeamIndex] = useState(0)
  const [hotSeatCurrentPlayer, setHotSeatCurrentPlayer] = useState(() => nextHotSeatPlayer(0))
  const [hotSeatNextPlayer, setHotSeatNextPlayer] = useState(null) // för handoff-skärm

  // === GEMENSAM STATE ===
  const [teams, setTeams] = useState(initialTeams.map(t => ({ ...t, score: 0 })))
  const [currentCard, setCurrentCard] = useState(null)
  // phase: 'handoff' | 'playing' | 'card-handoff' | 'penalty' | 'gameover'
  // card-handoff = mellansteg i hotseat efter rätt/skip innan nästa kort
  const [phase, setPhase] = useState('handoff')
  const [timeLeft, setTimeLeft] = useState(timerSeconds)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef(null)

  const timerSoundRef = useRef(null)
  const fanfareRef = useRef(null)
  useEffect(() => {
    timerSoundRef.current = new Audio('/sounds/kitchen-timer.mp3')
    fanfareRef.current = new Audio('/sounds/fanfare.mp3')
  }, [])

  // === TIMER ===
  useEffect(() => {
    if (!timerRunning) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimerExpire()
          return 0
        }
        if (prev === 11 && timerSoundRef.current) timerSoundRef.current.play().catch(() => {})
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  function stopTimer() {
    clearInterval(timerRef.current)
    setTimerRunning(false)
  }

  function handleTimerExpire() {
    stopTimer()
    advanceTurn()
  }

  // === KORT ===
  function getNextCard() {
    if (deckIndexRef.current >= deckRef.current.length) {
      deckRef.current = shuffleArray(cardPool)
      deckIndexRef.current = 0
    }
    return deckRef.current[deckIndexRef.current++]
  }

  // === REDO – starta tur ===
  function handleReady() {
    setCurrentCard(getNextCard())
    setTimeLeft(timerSeconds)
    setTimerRunning(true)
    setPhase('playing')
  }

  // === RÄTT SVAR ===
  function handleCorrect() {
    const activeTeamIndex = gameMode === 'standard'
      ? turnOrderRef.current[turnOrderIndex].teamIndex
      : hotSeatTeamIndex

    setTeams(prev => prev.map((t, i) =>
      i === activeTeamIndex ? { ...t, score: t.score + 1 } : t
    ))

    if (gameMode === 'standard') {
      setCurrentCard(getNextCard())
    } else {
      // Hot Seat: visa handoff-skärm med nästa spelare innan nytt kort
      const next = nextHotSeatPlayer(hotSeatTeamIndex)
      setHotSeatNextPlayer(next)
      // stopTimer() <-- Vi testar låta Timer gå hela tiden.
      setPhase('card-handoff')
    }
  }

  // === SKIP ===
  function handleSkip() {
    if (gameMode === 'hotseat') {
      const next = nextHotSeatPlayer(hotSeatTeamIndex)
      setHotSeatNextPlayer(next)
    }
    setPhase('penalty')
  }

  // === EFTER PENALTY – nästa spelare intar plats ===
  function handlePenaltyDone() {
    if (gameMode === 'hotseat') {
      setPhase('card-handoff')
    } else {
      setTimerRunning(true)
      setPhase('playing')
      setCurrentCard(getNextCard())
    }
  }

  // === CARD HANDOFF KLAR (hotseat) – ny spelare har intagit plats ===
  function handleCardHandoffReady() {
    setHotSeatCurrentPlayer(hotSeatNextPlayer)
    setHotSeatNextPlayer(null)
    setTimerRunning(true)
    setPhase('playing')
    setCurrentCard(getNextCard())
  }

  // === ADVANCE TURN (timer slut) ===
  function advanceTurn() {
    if (gameMode === 'standard') {
      const nextIndex = turnOrderIndex + 1
      if (nextIndex >= turnOrderRef.current.length) {
        // Omgången klar
        if (currentRound >= roundCount) {
          setPhase('gameover')
          fanfareRef.current?.play().catch(() => {})
        } else {
          setCurrentRound(r => r + 1)
          turnOrderRef.current = buildStandardTurnOrder(initialTeams)
          setTurnOrderIndex(0)
          setPhase('handoff')
        }
      } else {
        setTurnOrderIndex(nextIndex)
        setPhase('handoff')
      }
    } else {
      // Hot Seat: nästa lag
      const nextTeam = hotSeatTeamIndex + 1
      if (nextTeam >= teams.length) {
        if (currentRound >= roundCount) {
          setPhase('gameover')
          fanfareRef.current?.play().catch(() => {})
        } else {
          setCurrentRound(r => r + 1)
          setHotSeatTeamIndex(0)
          const firstPlayer = nextHotSeatPlayer(0)
          setHotSeatCurrentPlayer(firstPlayer)
          setPhase('handoff')
        }
      } else {
        setHotSeatTeamIndex(nextTeam)
        const firstPlayer = nextHotSeatPlayer(nextTeam)
        setHotSeatCurrentPlayer(firstPlayer)
        setPhase('handoff')
      }
    }
  }

  // === HANDOFF-TEXT ===
  function getHandoffContent() {
    if (gameMode === 'standard') {
      const current = turnOrderRef.current[turnOrderIndex]
      if (!current) return { message: 'Spelet är slut!', subMessage: '' }
      return {
        message: `${teams[current.teamIndex]?.name}s tur!`,
        subMessage: `Charadör: ${current.playerName}`
      }
    } else {
      return {
        message: `${teams[hotSeatTeamIndex]?.name}s tur!`,
        subMessage: `Startar med: ${hotSeatCurrentPlayer}`
      }
    }
  }

  // === GAME OVER ===
  if (phase === 'gameover') {
    const highScore = Math.max(...teams.map(t => t.score))
    const winners = teams.filter(t => t.score === highScore)
    const isDrawn = winners.length > 1
    return (
      <div id="play-area">
        <div className="game-over-card">
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{isDrawn ? '🤝' : '🏆'}</div>
          <h2>{isDrawn ? 'Oavgjort!' : 'Vi har ett vinnande lag!'}</h2>
          {isDrawn
            ? <><span className="winner-name">{winners.map(t => t.name).join(' & ')}</span>
                <p className="winner-score">Delar på segern med {highScore} poäng</p></>
            : <><span className="winner-name">{winners[0].name}</span>
                <p className="winner-score">{highScore} poäng</p></>
          }
          <div className="game-over-buttons">
            <button className="btn btn-secondary" onClick={onRestart}>⚙️ Tillbaka till start</button>
          </div>
        </div>
        <TeamScoreboard teams={teams} currentTeamIndex={-1} />
      </div>
    )
  }

  const activeTeamIndex = gameMode === 'standard'
    ? turnOrderRef.current[turnOrderIndex]?.teamIndex ?? 0
    : hotSeatTeamIndex

  const activePlayerName = gameMode === 'standard'
    ? turnOrderRef.current[turnOrderIndex]?.playerName ?? ''
    : hotSeatCurrentPlayer

  const handoffContent = getHandoffContent()
  const timerWarning = timeLeft <= 10
  const timerPercent = (timeLeft / timerSeconds) * 100

  return (
    <div id="play-area">
      {/* Banner */}
      <div className="current-player-banner">
        <span className="turn-label">{teams[activeTeamIndex]?.name} · Omgång {currentRound}/{roundCount}</span>
        <span className="player-name-highlight">{activePlayerName}</span>
      </div>

      {/* Timer bar – visas alltid när en tur är aktiv */}
      {['playing', 'card-handoff', 'penalty'].includes(phase) && (
        <div className="team-timer-bar-wrap">
          <div className="team-timer-bar" style={{
            width: `${timerPercent}%`,
            background: timerWarning ? 'var(--danger)' : 'var(--brand)'
          }} />
          <span className={`team-timer-number ${timerWarning ? 'warning' : ''}`}>{timeLeft}s</span>
        </div>
      )}

      {/* Kortyta */}
      <div className="card-display" style={{ minHeight: 160 }}>
        {phase === 'handoff' && (
          <HandoffScreen
            message={handoffContent.message}
            subMessage={handoffContent.subMessage}
            onReady={handleReady}
          />
        )}
        {phase === 'card-handoff' && (
          <HandoffScreen
            message={`Nästa: ${hotSeatNextPlayer}`}
            subMessage="Spring fram och tryck Redo!"
            buttonLabel="Redo! →"
            onReady={handleCardHandoffReady}
          />
        )}
        {phase === 'penalty' && (
          <PenaltyCountdown seconds={5} onDone={handlePenaltyDone} />
        )}
        {phase === 'playing' && (
          <span className="card-word">{currentCard}</span>
        )}
      </div>

      {/* Knappar */}
      {phase === 'playing' && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCorrect}>
            ✓ Rätt!
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleSkip}>
            Skip
          </button>
        </div>
      )}

      <TeamScoreboard teams={teams} currentTeamIndex={activeTeamIndex} />
    </div>
  )
}

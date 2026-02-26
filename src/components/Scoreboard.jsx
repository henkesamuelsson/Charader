const MEDALS = ['🥇', '🥈', '🥉']

export default function Scoreboard({ players, currentPlayerIndex, currentRound, roundsPerPlayer }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="scoreboard-card">
      <h3>Poäng</h3>
      <ul className="score-list">
        {sorted.map((player, index) => (
          <li
            key={player.name}
            className={`score-item ${player.name === players[currentPlayerIndex].name ? 'active-player' : ''}`}
          >
            <span className="score-name">
              <span>{MEDALS[index] || ''}</span>
              <span>{player.name}</span>
            </span>
            <span className="score-pts">{player.score} p</span>
          </li>
        ))}
      </ul>
      <span className="round-badge">Runda {currentRound} av {roundsPerPlayer}</span>
    </div>
  )
}

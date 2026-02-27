export default function TeamScoreboard({ teams, currentTeamIndex }) {
  const sorted = [...teams].map((t, i) => ({ ...t, originalIndex: i }))
    .sort((a, b) => b.score - a.score)

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <div className="scoreboard-card">
      <h3>Poäng</h3>
      <ul className="score-list">
        {sorted.map((team, index) => (
          <li key={team.name}
            className={`score-item ${team.originalIndex === currentTeamIndex ? 'active-player' : ''}`}>
            <span className="score-name">
              <span>{medals[index]}</span>
              <span>{team.name}</span>
            </span>
            <span className="score-pts">{team.score} p</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

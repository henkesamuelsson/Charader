import { useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import PlayArea from './components/PlayArea.jsx'

export default function App() {
  const [gameConfig, setGameConfig] = useState(null)

  return (
    <div id="app-wrapper">
      <header className="app-header">
        <h1>🎭 Charader!</h1>
      </header>

      {!gameConfig ? (
        <SetupScreen onStart={setGameConfig} />
      ) : (
        <PlayArea
          initialPlayers={gameConfig.players}
          roundsPerPlayer={gameConfig.roundsPerPlayer}
          useTimer={gameConfig.useTimer}
          timerDuration={gameConfig.timerDuration}
          onRestart={() => setGameConfig(null)}
        />
      )}

      <footer>Utvecklat av Henrik &nbsp;·&nbsp; v1.1</footer>
    </div>
  )
}

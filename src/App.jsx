import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import SetupScreen from './components/SetupScreen.jsx'
import PlayArea from './components/PlayArea.jsx'
import TeamSetupWizard from './components/team/TeamSetupWizard.jsx'
import TeamPlayArea from './components/team/TeamPlayArea.jsx'

// view: 'welcome' | 'ffa-setup' | 'ffa-play' | 'team-setup' | 'team-play'

export default function App() {
  const [view, setView] = useState('welcome')
  const [ffaConfig, setFfaConfig] = useState(null)
  const [teamConfig, setTeamConfig] = useState(null)

  function handleFfaStart(config) {
    setFfaConfig(config)
    setView('ffa-play')
  }

  function handleTeamStart(config) {
    setTeamConfig(config)
    setView('team-play')
  }

  return (
    <div id="app-wrapper">
      <header className="app-header">
        <h1>🎭 Charader!</h1>
      </header>

      {view === 'welcome' && (
        <WelcomeScreen
          onAllaMotAlla={() => setView('ffa-setup')}
          onLagspel={() => setView('team-setup')}
        />
      )}

      {view === 'ffa-setup' && (
        <SetupScreen onStart={handleFfaStart} />
      )}

      {view === 'ffa-play' && ffaConfig && (
        <PlayArea
          initialPlayers={ffaConfig.players}
          roundsPerPlayer={ffaConfig.roundsPerPlayer}
          useTimer={ffaConfig.useTimer}
          timerDuration={ffaConfig.timerDuration}
          selectedThemes={ffaConfig.selectedThemes}
          onRestart={() => setView('welcome')}
        />
      )}

      {view === 'team-setup' && (
        <TeamSetupWizard
          onStart={handleTeamStart}
          onBack={() => setView('welcome')}
        />
      )}

      {view === 'team-play' && teamConfig && (
        <TeamPlayArea
          gameMode={teamConfig.gameMode}
          teams={teamConfig.teams}
          timerSeconds={teamConfig.timerSeconds}
          roundCount={teamConfig.roundCount}
          selectedThemes={teamConfig.selectedThemes}
          onRestart={() => setView('welcome')}
        />
      )}

      <footer>Utvecklat av Henrik &nbsp;·&nbsp; v2.1 Beta</footer>
    </div>
  )
}

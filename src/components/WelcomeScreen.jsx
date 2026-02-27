export default function WelcomeScreen({ onAllaMotAlla, onLagspel }) {
  return (
    <div className="welcome-screen">
      {/* <p className="welcome-tagline">Vad vill ni spela?</p> */}
      {/* MimeTime - ska de bli mitt nya varumärke? */}


      <div className="welcome-options">
        <button className="welcome-card" onClick={onAllaMotAlla}>
          <span className="welcome-card-emoji">🎭</span>
          <span className="welcome-card-title">Alla mot Alla</span>
          <span className="welcome-card-desc">Spela alla mot alla. En visar, resten gissar, alla tävlar om poängen.</span>
        </button>

        <button className="welcome-card" onClick={onLagspel}>
          <span className="welcome-card-emoji">🏆</span>
          <span className="welcome-card-title">Lagspel (Beta)</span>
          <span className="welcome-card-desc">Tävla i lag! Välj mellan Standard och Hot Seat.</span>
        </button>
      </div>
    </div>
  )
}

export default function HandoffScreen({ message, subMessage, buttonLabel, onReady }) {
  return (
    <div className="handoff-screen">
      <div className="handoff-emoji">🎭</div>
      <div className="handoff-message">{message}</div>
      {subMessage && <div className="handoff-submessage">{subMessage}</div>}
      <button className="btn btn-primary handoff-btn" onClick={onReady}>
        {buttonLabel || 'Redo! →'}
      </button>
    </div>
  )
}

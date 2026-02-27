import { useState, useEffect } from 'react'

export default function PenaltyCountdown({ seconds = 5, onDone }) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    if (timeLeft <= 0) { onDone(); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  return (
    <div className="penalty-screen">
      <div className="penalty-hourglass">⏳</div>
      <div className="penalty-number">{timeLeft}</div>
      <div className="penalty-label">Vänta...</div>
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'

export default function Timer({ duration, running, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const timerSoundRef = useRef(null)

  useEffect(() => {
    timerSoundRef.current = new Audio('/sounds/kitchen-timer.mp3')
    timerSoundRef.current.volume = 1.0
  }, [])

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration, running])

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire()
          return 0
        }
        if (prev === 11 && timerSoundRef.current) {
          timerSoundRef.current.play().catch(() => {})
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  if (!running && timeLeft === duration) return null

  const expired = timeLeft === 0

  return (
    <div className="timer-card">
      {expired
        ? <span className="timer-expired-text">⏰ Tiden är slut!</span>
        : <span className={`timer-number ${timeLeft <= 10 ? 'warning' : ''}`}>{timeLeft}</span>
      }
    </div>
  )
}

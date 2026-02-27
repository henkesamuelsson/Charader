import { useRef } from 'react'

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * useFairShuffle(items)
 * Returnerar en funktion next() som alltid ger nästa item
 * enligt fair-shuffle: alla items används innan någon upprepas.
 */
export function useFairShuffle(items) {
  const queueRef = useRef([])

  function next() {
    if (queueRef.current.length === 0) {
      queueRef.current = shuffleArray([...items])
    }
    return queueRef.current.shift()
  }

  function reset() {
    queueRef.current = []
  }

  return { next, reset }
}

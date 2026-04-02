import { useEffect, useRef, useState } from 'react'

export function useAnimatedValue(target, duration = 400) {
  const [display, setDisplay] = useState(target)
  const startRef = useRef(target)
  const startTimeRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = startRef.current
    const to = target
    if (from === to) return

    startTimeRef.current = null

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = Math.round(from + (to - from) * eased)
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        startRef.current = to
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return display
}

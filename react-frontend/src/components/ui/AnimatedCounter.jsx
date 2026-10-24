import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

// Counts up from 0 the first time it scrolls into view.
export default function AnimatedCounter({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix },
    })
    return () => controls.stop()
  }, [inView, to, suffix, duration])

  return <span ref={ref}>0{suffix}</span>
}

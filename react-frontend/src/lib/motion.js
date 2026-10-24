// Central Framer Motion presets so every page animates with the same "feel".
export const ease = [0.22, 1, 0.36, 1] // smooth, premium ease-out

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease } },
}

export const slideUp = (delay = 0, distance = 32) => ({
  hidden: { opacity: 0, y: distance },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay } },
})

export const scaleIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease, delay } },
})

// Parent variant: children using fadeIn/slideUp animate one after another.
export const stagger = (staggerChildren = 0.09, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

// Route-level transition used by <PageTransition>.
export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
}

// Reusable "animate when scrolled into view" props:  <motion.div {...inView} />
export const inView = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
}

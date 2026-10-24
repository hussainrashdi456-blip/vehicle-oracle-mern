import { motion } from 'framer-motion'
import { pageVariants } from '../../lib/motion'

export default function PageTransition({ children }) {
  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.main>
  )
}

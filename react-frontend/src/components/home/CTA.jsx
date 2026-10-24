import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { inView, scaleIn } from '../../lib/motion'

export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <motion.div variants={scaleIn()} {...inView}
        className="relative overflow-hidden rounded-3xl bg-hero-gradient px-8 py-14 text-center text-white shadow-card">
        <div className="absolute inset-0 bg-grid-white [background-size:40px_40px] opacity-60" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to find out what your car is worth?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sky-50/90">Free, instant and no sign-up required.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="mt-8 inline-block">
            <Link to="/predict" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-sky-600 shadow-xl">
              Get my valuation <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

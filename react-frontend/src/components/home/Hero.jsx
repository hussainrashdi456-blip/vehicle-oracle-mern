import { motion } from 'framer-motion'
import { BadgeCheck, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react'
import ValuationForm from '../valuation/ValuationForm'
import { ease, slideUp, stagger } from '../../lib/motion'

const points = ['No sign-up needed', 'Explained by AI, not a black box', 'Built on real Pakistani listings']

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* decorative layers */}
      <div className="absolute inset-0 bg-grid-white [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <motion.div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-white/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-900/30 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div variants={stagger(0.12, 0.1)} initial="hidden" animate="show" className="text-white">
          <motion.span variants={slideUp(0, 16)}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            <Sparkles size={16} /> AI-powered · trained on 50,000+ listings
          </motion.span>

          <motion.h1 variants={slideUp(0, 40)} className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Know what your car is{' '}
            <span className="relative inline-block">
              really worth.
              <motion.span className="absolute -bottom-1 left-0 h-1.5 rounded-full bg-white/70"
                initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.9, duration: 0.8, ease }} />
            </span>
          </motion.h1>

          <motion.p variants={slideUp()} className="mt-6 max-w-xl text-lg text-sky-50/90">
            Get an instant, data-driven valuation for any used car in Pakistan, with a clear breakdown of what moves the price.
          </motion.p>

          <motion.ul variants={stagger(0.1)} className="mt-8 space-y-3">
            {points.map((p) => (
              <motion.li key={p} variants={slideUp(0, 16)} className="flex items-center gap-3 font-medium">
                <BadgeCheck className="text-white" size={22} /> {p}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.25 }} className="relative flex justify-center lg:justify-end">
          <ValuationForm />
          {/* floating chips (desktop only) */}
          <motion.div className="absolute -top-5 right-8 hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xl lg:flex"
            animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <TrendingUp size={18} className="text-emerald-500" /> Fair market price
          </motion.div>
          <motion.div className="absolute -bottom-5 left-8 hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xl lg:flex"
            animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <ShieldCheck size={18} className="text-sky-500" /> Explainable AI
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

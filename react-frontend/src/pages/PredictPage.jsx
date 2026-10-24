import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import ValuationForm from '../components/valuation/ValuationForm'
import { ease } from '../lib/motion'

export default function PredictPage() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 bg-grid-white [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-5 py-10 sm:py-14">
        <Link to="/" className="mb-6 flex items-center gap-1.5 self-start text-sm font-semibold text-white/90 hover:text-white">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="flex w-full justify-center">
          <ValuationForm />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 text-center text-sm text-white/80">
          Powered by XGBoost, trained on real Pakistani used-car listings.
        </motion.p>
      </div>
    </section>
  )
}

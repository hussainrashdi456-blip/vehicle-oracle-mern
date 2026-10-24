import { motion } from 'framer-motion'
import { Cpu, LineChart, ListChecks } from 'lucide-react'
import { ease, inView, slideUp, stagger } from '../../lib/motion'

const steps = [
  { icon: ListChecks, title: 'Tell us about your car', text: 'Pick the make and model, year, mileage and location. Optional specs sharpen the estimate.' },
  { icon: Cpu, title: 'Our AI does the maths', text: 'An XGBoost model trained on real Pakistani listings weighs every factor in seconds.' },
  { icon: LineChart, title: 'See the price and why', text: 'Get an estimated market value plus the factors that pushed it up or down.' },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <motion.div variants={stagger(0.1)} {...inView} className="text-center">
        <motion.p variants={slideUp(0, 16)} className="text-sm font-bold uppercase tracking-widest text-sky-500">How it works</motion.p>
        <motion.h2 variants={slideUp(0, 24)} className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Three steps to a fair price
        </motion.h2>
      </motion.div>

      <motion.div variants={stagger(0.15, 0.1)} {...inView} className="relative mt-14 grid gap-8 md:grid-cols-3">
        {/* connector line draws itself across the cards */}
        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease, delay: 0.3 }}
          style={{ originX: 0 }} className="absolute left-[16%] right-[16%] top-9 hidden h-0.5 bg-gradient-to-r from-sky-200 via-sky-400 to-sky-200 md:block" />
        {steps.map(({ icon: Icon, title, text }, i) => (
          <motion.div key={title} variants={slideUp(0, 40)} className="relative text-center">
            <motion.div whileHover={{ rotate: -6, scale: 1.08 }}
              className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-soft">
              <Icon size={30} />
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold text-sky-600 shadow">{i + 1}</span>
            </motion.div>
            <h3 className="mt-5 text-lg font-bold text-slate-800">{title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-slate-500">{text}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

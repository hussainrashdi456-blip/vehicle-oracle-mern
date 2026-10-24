import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getStats } from '../../services/api'

export default function Stats() {
  const [stats, setStats] = useState([
    { label: 'Cars Analysed', value: 0, prefix: '', suffix: '+' },
    { label: 'Average Price', value: 0, prefix: 'PKR ', suffix: '' },
    { label: 'Brands', value: 0, prefix: '', suffix: '' },
    { label: 'Models', value: 0, prefix: '', suffix: '' },
  ])

  useEffect(() => {
    // Backend se asal data fetch karein
    getStats().then((data) => {
      if(!data || data.error) return;
      setStats([
        { label: 'Cars Analysed', value: data.total_cars, prefix: '', suffix: '+' },
        { label: 'Average Price', value: data.avg_price.toLocaleString(), prefix: 'PKR ', suffix: '' },
        { label: 'Brands', value: data.brands, prefix: '', suffix: '' },
        { label: 'Models', value: data.models, prefix: '', suffix: '' },
      ])
    }).catch((err) => console.error("Stats load failed:", err))
  }, [])

  return (
    <section className="relative z-10 -mt-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-5xl grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-xl shadow-sky-900/5 sm:grid-cols-4 sm:p-8"
      >
        {stats.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center justify-center text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {s.prefix}{s.value}{s.suffix}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-500">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
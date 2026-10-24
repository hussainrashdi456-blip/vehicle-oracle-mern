import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

// Shared look for every input "shell" (matches the AutoTrader reference).
export const shell = (error, tint = false) =>
  `relative flex h-12 items-stretch overflow-hidden rounded-lg border transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100 ${
    error ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 hover:border-slate-300'
  } ${tint && !error ? 'bg-sky-50' : error ? '' : 'bg-white'}`

export const inputCls =
  'h-full w-full bg-transparent px-3.5 text-[15px] font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400'

export default function Field({ label, htmlFor, error, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {children}
      {/* error message slides in/out instead of popping */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-center gap-1 overflow-hidden text-xs font-medium text-rose-600"
          >
            <AlertCircle size={13} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

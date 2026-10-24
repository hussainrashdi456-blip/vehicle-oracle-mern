import { Car } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row">
        <span className="flex items-center gap-2 font-semibold text-slate-700">
          <Car size={18} className="text-sky-500" /> Vehicle Oracle
        </span>
        <span>Final Year Project · AI-powered used-car valuation for Pakistan</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}

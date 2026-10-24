import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Car, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext' // <-- Import Add kiya

const links = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Get Valuation' },
  { to: '/damage', label: 'Damage Check' },
  { to: '/history', label: 'History' }, // <-- History Add ki
  { to: '/compare' , label: 'Compare' },
  { to: '/trends', label: 'Trends' },
  { to: '/marketplace', label: 'Marketplace' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const shadow = useTransform(scrollY, [0, 80], ['0 0 0 rgba(14,165,233,0)', '0 10px 30px rgba(14,165,233,0.15)'])
  const bg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.95)'])
  
  // Auth hook
  const { user, logout } = useAuth(); 

  return (
    <motion.header style={{ boxShadow: shadow, backgroundColor: bg }}
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-slate-200/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-soft">
            <Car size={20} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-800">
            Vehicle<span className="text-sky-500">Oracle</span>
          </span>
        </Link>

        {user?.email === 'admin@vehicleoracle.com' && (
             <li>
                <NavLink to="/admin" className="...">Admin</NavLink>
            </li>
        )}

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              {l.to ? (
                <NavLink to={l.to} end className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {l.label}
                </NavLink>
              ) : (
                <span className="flex cursor-not-allowed items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-400">
                  {l.label}<span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase">Soon</span>
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Right Side: Login/Logout Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">Hi, {user.name}</span>
              <button onClick={logout} className="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-sky-600">
              Login / Sign Up
            </Link>
          )}
        </div>

        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 md:hidden">
            <ul className="space-y-1 p-4">
              {links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <NavLink to={l.to} end onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-semibold text-slate-700 hover:bg-sky-50">{l.label}</NavLink>
                  ) : (
                    <span className="block px-3 py-2.5 font-semibold text-slate-400">{l.label} · soon</span>
                  )}
                </li>
              ))}
              
              {/* Mobile Login/Logout */}
              <li className="pt-4 border-t border-slate-100 mt-2">
                {user ? (
                   <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left rounded-lg px-3 py-2.5 font-semibold text-rose-500">Logout</button>
                ) : (
                   <Link to="/login" onClick={() => setOpen(false)} className="block w-full rounded-lg bg-sky-500 px-3 py-2.5 text-center font-bold text-white">Login / Sign Up</Link>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
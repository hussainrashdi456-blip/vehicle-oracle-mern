import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { inputCls, shell } from './Field'

/**
 * Searchable dropdown (type to filter, arrow keys + Enter, Esc to close).
 * options: [{ value, label, meta? }]
 */
export default function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  leftIcon: LeftIcon,
  rightAddon, // optional node shown in a bordered box on the right (e.g. map pin)
  error,
  maxResults = 50,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const wrapRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value) ?? null

  const results = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const filtered = tokens.length
      ? options.filter((o) => tokens.every((t) => o.label.toLowerCase().includes(t)))
      : options
    return filtered.slice(0, maxResults)
  }, [options, query, maxResults])

  // close on outside click
  useEffect(() => {
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // keep highlighted row visible while arrowing
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const openList = () => {
    setOpen(true)
    setQuery('')
    setActive(0)
  }
  const choose = (o) => {
    onChange(o.value)
    setOpen(false)
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) return openList()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className={shell(error)}>
        {LeftIcon && <LeftIcon size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />}
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={open ? query : selected?.label ?? ''}
          placeholder={open && selected ? selected.label : placeholder}
          onFocus={openList}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
          className={`${inputCls} ${LeftIcon ? 'pl-11' : ''} ${rightAddon ? '' : 'pr-9'}`}
        />
        {rightAddon ? (
          <span className="flex w-12 shrink-0 items-center justify-center border-l border-slate-200 text-sky-500">{rightAddon}</span>
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            {/* rotation lives on an inner element so it doesn't override the centering transform */}
            <motion.span animate={{ rotate: open ? 180 : 0 }} className="block">
              <ChevronDown size={18} />
            </motion.span>
          </span>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="thin-scroll absolute z-30 mt-2 max-h-64 w-full origin-top overflow-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-2xl"
          >
            {results.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No matches found</li>}
            {results.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} /* keep input focus */
                onClick={() => choose(o)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm ${
                  i === active ? 'bg-sky-50 text-sky-700' : 'text-slate-700'
                } ${o.value === value ? 'font-semibold' : ''}`}
              >
                <span className="truncate">{o.label}</span>
                {o.meta && <span className="shrink-0 text-xs text-slate-400">{o.meta}</span>}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

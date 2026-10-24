import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { Calendar, Car, Check, ChevronDown, MapPin, SlidersHorizontal } from 'lucide-react'
import Field, { inputCls, shell } from '../ui/Field'
import { formatSpaced } from '../../lib/format'
import { predictPrice, getCarOptions, getCarDetails } from '../../services/api'
import { useAuth } from '../../context/AuthContext' // Auth Import kiya

const YEARS = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => 2025 - i) // model trained on 1990-2025
const MAX_KM = 500_000
const FEATURES = [
  'ABS', 'Air Bags', 'Air Conditioning', 'Alloy Rims', 'AM/FM Radio', 'CD Player', 'DVD Player', 'Immobilizer Key',
  'Keyless Entry', 'Navigation System', 'Power Locks', 'Power Mirrors', 'Power Steering', 'Power Windows', 'Sun Roof', 'Cool Box',
]
const DEFAULT_FEATURES = ['Air Conditioning', 'Power Steering', 'Power Windows', 'Power Locks', 'AM/FM Radio', 'Air Bags']

const initial = {
  brand: '', model: '', year: '', mileage: '', location: '',
  bodyType: 'Sedan', engine: 1300, fuel: 'Petrol', transmission: 'Manual', features: DEFAULT_FEATURES,
}

export default function ValuationForm() {
  const navigate = useNavigate()
  const shake = useAnimationControls()
  const { user } = useAuth() // User ki details get ki
  
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [showMore, setShowMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // 1. Global Options (Saare Brands, Provinces waghaira)
  const [options, setOptions] = useState({ brand_models: {}, provinces: [], body_types: [], fuels: [], transmissions: [] });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // 2. Specific Options (Sirf us khaas model ke liye)
  const [specificOptions, setSpecificOptions] = useState({ body_types: [], fuels: [], transmissions: [] });

  useEffect(() => {
    getCarOptions().then((data) => {
      setOptions(data);
      setLoadingOptions(false);
    }).catch((err) => {
      console.error(err);
      setLoadingOptions(false);
    });
  }, []);

  const brandList = useMemo(() => Object.keys(options.brand_models || {}).sort(), [options.brand_models]);
  const modelList = useMemo(() => {
    if (!form.brand || !options.brand_models) return [];
    return options.brand_models[form.brand] || [];
  }, [form.brand, options.brand_models]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const clearError = (k) => setErrors((e) => ({ ...e, [k]: undefined }))

  const handleBrandChange = (e) => {
    set({ brand: e.target.value, model: '' })
    setSpecificOptions({ body_types: [], fuels: [], transmissions: [] })
    clearError('brand')
  }

  const handleModelChange = async (e) => {
    const selectedModel = e.target.value;
    set({ model: selectedModel });
    clearError('model');
    
    if (selectedModel && form.brand) {
      try {
        const details = await getCarDetails(form.brand, selectedModel);
        
        setSpecificOptions({
          body_types: details.available_body_types || [],
          fuels: details.available_fuels || [],
          transmissions: details.available_transmissions || []
        });

        set({
          engine: details.engine || 1300,
          bodyType: details.available_body_types?.[0] || 'Sedan',
          fuel: details.available_fuels?.[0] || 'Petrol',
          transmission: details.available_transmissions?.[0] || 'Manual'
        });
      } catch (err) {
        console.error("Details load nahi hui:", err);
      }
    }
  }

  const validate = () => {
    const e = {}
    if (!form.brand) e.brand = 'Please choose a brand'
    if (!form.model) e.model = 'Please choose a model'
    if (!form.year) e.year = 'Select the registration year'
    if (form.mileage === '' ) e.mileage = 'Enter the mileage'
    if (!form.location) e.location = 'Choose where the car is registered'
    const cc = Number(form.engine)
    if (!(cc >= 600 && cc <= 5000)) e.engine = 'Engine must be 600–5000 cc'
    setErrors(e)
    if (e.engine && !showMore) setShowMore(true)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setApiError('')
    if (!validate()) return shake.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } })

    const payload = {
      Brand: form.brand,
      Model: form.model,
      Year: Number(form.year),
      Mileage_Cleaned: Number(form.mileage),
      Engine_Cleaned: Number(form.engine),
      Fuel: form.fuel,
      Transmission: form.transmission,
      Province: form.location,
      'Body Type': form.bodyType,
      Feature_Count: form.features.length,
    }
    setLoading(true)
    
    try {
      // 1. AI se price predict karwayein
      const result = await predictPrice(payload)

      // 2. Agar user login hai, toh History save karein
      if (user) {
        await fetch('http://localhost:5000/api/save-prediction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            brand: form.brand,
            model: form.model,
            year: Number(form.year),
            price: result.price,
            details: payload
          })
        }).catch(err => console.log("History save failed", err))
      }

      // 3. Result page par navigate karein
      navigate('/result', { state: { input: payload, label: `${form.brand} ${form.model}`, result } })
      
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const reset = () => {
    setForm(initial); 
    setErrors({}); 
    setApiError(''); 
    setShowMore(false);
    setSpecificOptions({ body_types: [], fuels: [], transmissions: [] });
  }
  
  const toggleFeature = (f) =>
    set({ features: form.features.includes(f) ? form.features.filter((x) => x !== f) : [...form.features, f] })

  if (loadingOptions) {
    return (
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-card sm:p-8 flex items-center justify-center h-[400px]">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
            className="h-8 w-8 rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      animate={shake}
      noValidate
      className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-card sm:p-8"
    >
      <h2 className="mb-7 text-center text-[26px] font-extrabold tracking-tight text-slate-800">
        Get a FREE <span className="text-sky-500">Car Valuation</span>
      </h2>

      <div className="space-y-5">
        {/* --- BRAND & MODEL --- */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Make (Brand)" htmlFor="brand" error={errors.brand}>
            <div className={shell(errors.brand, true)}>
              <Car size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select id="brand" value={form.brand} onChange={handleBrandChange}
                className={`${inputCls} cursor-pointer appearance-none pl-10 pr-8`}>
                <option value="">Select brand</option>
                {brandList.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </Field>

          <Field label="Model" htmlFor="model" error={errors.model}>
            <div className={shell(errors.model)}>
              <select id="model" value={form.model} onChange={handleModelChange}
                disabled={!form.brand}
                className={`${inputCls} cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:bg-slate-50`}>
                <option value="">{form.brand ? "Select model" : "Pick brand first"}</option>
                {modelList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Registration Year" htmlFor="year" error={errors.year}>
            <div className={shell(errors.year, true)}>
              <Calendar size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select id="year" value={form.year} onChange={(e) => { set({ year: e.target.value }); clearError('year') }}
                className={`${inputCls} cursor-pointer appearance-none pl-11 pr-8`}>
                <option value="">Select year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </Field>

          <Field label="Mileage" htmlFor="mileage" error={errors.mileage}>
            <div className={shell(errors.mileage)}>
              <input id="mileage" inputMode="numeric" placeholder="e.g. 45 000"
                value={form.mileage === '' ? '' : formatSpaced(form.mileage)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                  set({ mileage: digits === '' ? '' : Math.min(Number(digits), MAX_KM) })
                  clearError('mileage')
                }}
                className={inputCls} />
              <span className="flex w-14 shrink-0 items-center justify-center border-l border-slate-200 text-sm text-slate-500">km</span>
            </div>
          </Field>
        </div>

        <Field label="Location" htmlFor="location" error={errors.location}>
          <div className={shell(errors.location)}>
             <MapPin size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
             <select id="location" value={form.location} onChange={(e) => { set({ location: e.target.value }); clearError('location') }}
                className={`${inputCls} cursor-pointer appearance-none pl-10 pr-8`}>
                <option value="">City or province</option>
                {(options.provinces || []).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </Field>

        {/* Optional specs - collapsed */}
        <div>
          <button type="button" onClick={() => setShowMore((s) => !s)}
            className="flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700">
            <SlidersHorizontal size={16} />
            {showMore ? 'Hide extra details' : 'Add more details for a sharper estimate'}
            <motion.span animate={{ rotate: showMore ? 180 : 0 }}><ChevronDown size={16} /></motion.span>
          </button>

          <AnimatePresence initial={false}>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"
              >
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Body Type" id="body" value={form.bodyType} 
                      options={specificOptions.body_types.length > 0 ? specificOptions.body_types : options.body_types} 
                      onChange={(v) => set({ bodyType: v })} />
                      
                    <Field label="Engine (cc)" htmlFor="engine" error={errors.engine}>
                      <div className={shell(errors.engine)}>
                        <input id="engine" type="number" min={600} max={5000} step={50} value={form.engine}
                          onChange={(e) => { set({ engine: e.target.value }); clearError('engine') }} className={inputCls} />
                        <span className="flex w-14 shrink-0 items-center justify-center border-l border-slate-200 text-sm text-slate-500">cc</span>
                      </div>
                    </Field>
                    
                    <SelectField label="Fuel" id="fuel" value={form.fuel} 
                      options={specificOptions.fuels.length > 0 ? specificOptions.fuels : options.fuels} 
                      onChange={(v) => set({ fuel: v })} />
                      
                    <SelectField label="Transmission" id="trans" value={form.transmission} 
                      options={specificOptions.transmissions.length > 0 ? specificOptions.transmissions : options.transmissions} 
                      onChange={(v) => set({ transmission: v })} />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">Features</span>
                      <motion.span key={form.features.length} initial={{ scale: 1.3, color: '#0ea5e9' }} animate={{ scale: 1, color: '#64748b' }}
                        className="text-xs font-semibold">{form.features.length} selected</motion.span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FEATURES.map((f) => {
                        const on = form.features.includes(f)
                        return (
                          <motion.button type="button" key={f} onClick={() => toggleFeature(f)} whileTap={{ scale: 0.92 }} layout
                            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                              on ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300'}`}>
                            {on && <Check size={12} />} {f}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {apiError && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{apiError}</motion.p>
        )}
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-5 items-center gap-4">
        <button type="button" onClick={reset} className="col-span-2 py-3 text-[15px] font-semibold text-sky-600 transition hover:text-sky-800">
          Reset
        </button>
        <motion.button type="submit" disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
          className="col-span-3 flex h-12 items-center justify-center gap-2 rounded-md bg-sky-400 text-[15px] font-bold text-white shadow-soft transition-colors hover:bg-sky-500 disabled:cursor-wait disabled:opacity-80">
          {loading ? (
            <>
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 0.8 }}
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
              Valuing your car…
            </>
          ) : 'Continue'}
        </motion.button>
      </div>

      <p className="mt-6 text-center text-[13px] leading-relaxed text-slate-600">
        By continuing I understand and agree with Vehicle Oracle’s <a href="#" className="text-sky-600 hover:underline">Terms &amp; Conditions</a> and{' '}
        <a href="#" className="text-sky-600 hover:underline">Privacy Policy</a>.
      </p>
    </motion.form>
  )
}

function SelectField({ label, id, value, options, onChange }) {
  return (
    <Field label={label} htmlFor={id}>
      <div className={shell(false)}>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} cursor-pointer appearance-none pr-8`}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
      </div>
    </Field>
  )
}
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Car, Loader2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { getCarOptions, predictPrice } from '../services/api'
import { formatSpaced } from '../lib/format'

export default function ComparePage() {
  const [options, setOptions] = useState({ brand_models: {}, provinces: [] })
  const [cars, setCars] = useState([
    { id: 1, brand: '', model: '', year: 2020, mileage: 50000, province: '', price: null, loading: false },
    { id: 2, brand: '', model: '', year: 2020, mileage: 50000, province: '', price: null, loading: false }
  ])
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    getCarOptions().then(setOptions).catch(console.error)
  }, [])

  const addCar = () => {
    if (cars.length < 3) {
      setCars([...cars, { id: Date.now(), brand: '', model: '', year: 2020, mileage: 50000, province: '', price: null, loading: false }])
    }
  }

  const removeCar = (id) => {
    if (cars.length > 2) setCars(cars.filter(c => c.id !== id))
  }

  const updateCar = (id, field, value) => {
    setCars(cars.map(c => {
      if (c.id === id) {
        // Agar brand change ho, toh model reset kar dein
        if (field === 'brand') return { ...c, brand: value, model: '' }
        return { ...c, [field]: value }
      }
      return c
    }))
  }

  const handleCompare = async () => {
    setIsComparing(true)
    const updatedCars = await Promise.all(cars.map(async (car) => {
      if (!car.brand || !car.model || !car.province) return car
      
      try {
        const payload = {
          Brand: car.brand,
          Model: car.model,
          Year: Number(car.year),
          Mileage_Cleaned: Number(car.mileage),
          Engine_Cleaned: 1300, // Default engine
          Fuel: "Petrol",       // Default fuel
          Transmission: "Manual",
          Province: car.province,
          'Body Type': "Sedan",
          Feature_Count: 5
        }
        const result = await predictPrice(payload)
        return { ...car, price: result.price, loading: false }
      } catch (err) {
        return { ...car, price: 0, loading: false }
      }
    }))
    
    setCars(updatedCars)
    setIsComparing(false)
  }

  // Sab se sasti gaari dhoondein
  const validPrices = cars.map(c => c.price).filter(p => p !== null && p > 0)
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800">Compare Cars</h1>
          <p className="text-slate-500 mt-2">Compare the estimated market value of 2 or 3 cars side by side.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car, index) => (
            <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 relative">
              
              {cars.length > 2 && (
                <button onClick={() => removeCar(car.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                  <X size={20} />
                </button>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-700">Car {index + 1}</h3>
              </div>

              <div className="space-y-3">
                <select value={car.brand} onChange={(e) => updateCar(car.id, 'brand', e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none">
                  <option value="">Select Brand</option>
                  {Object.keys(options.brand_models || {}).sort().map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select value={car.model} onChange={(e) => updateCar(car.id, 'model', e.target.value)}
                  disabled={!car.brand}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50">
                  <option value="">Select Model</option>
                  {(options.brand_models?.[car.brand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Year" value={car.year} onChange={(e) => updateCar(car.id, 'year', e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                  <input type="number" placeholder="Mileage" value={car.mileage} onChange={(e) => updateCar(car.id, 'mileage', e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>

                <select value={car.province} onChange={(e) => updateCar(car.id, 'province', e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none">
                  <option value="">Select City/Province</option>
                  {(options.provinces || []).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Price Display */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                {car.price === null ? (
                  <p className="text-slate-400 text-sm">Price not calculated yet</p>
                ) : car.price === minPrice ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Best Value</p>
                    <p className="text-2xl font-extrabold text-emerald-600">PKR {car.price.toLocaleString()}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Estimated Price</p>
                    <p className="text-2xl font-extrabold text-sky-600">PKR {car.price.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {cars.length < 3 && (
            <button onClick={addCar} className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-sky-500 hover:text-sky-500 transition-colors min-h-[300px]">
              <Plus size={32} className="mb-2" />
              <span className="font-semibold">Add Car</span>
            </button>
          )}
        </div>

        <div className="mt-10 text-center">
          <button onClick={handleCompare} disabled={isComparing}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto">
            {isComparing ? <><Loader2 className="animate-spin" size={20} /> Comparing...</> : 'Compare Prices'}
          </button>
        </div>
      </div>
    </PageTransition>
  )
}
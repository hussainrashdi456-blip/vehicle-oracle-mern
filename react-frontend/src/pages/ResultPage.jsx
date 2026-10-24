import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatSpaced } from '../lib/format'
import PageTransition from '../components/layout/PageTransition'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  if (!state) {
    navigate('/predict')
    return null
  }

  const { input, label, result } = state
  const price = result.price
  // Lacs mein convert karein (1 lac = 100,000)
  const priceInLacs = (price / 100000).toFixed(1)
  
  const factors = result.explanation?.top_factors || []
  const chartData = factors.map(f => ({
    name: f.feature.replace('_Cleaned', '').replace('Car_Age', 'Age'),
    value: Math.abs(f.importance),
    raw: f.importance
  }))

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
        
        <button onClick={() => navigate('/predict')} className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors">
          <ArrowLeft size={16} /> Value another car
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Left Side: Price Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-gradient-to-br from-sky-600 to-sky-900 p-8 text-white shadow-xl shadow-sky-900/20"
          >
            <p className="text-sm font-semibold text-sky-100 mb-2">Estimated market value</p>
            <h1 className="text-4xl font-extrabold tracking-tight mb-1">PKR {price.toLocaleString()}</h1>
            <p className="text-lg font-medium text-sky-200 mb-8">≈ {priceInLacs} Lacs</p>
            
            <div className="space-y-3 border-t border-sky-700/50 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-sky-200">Vehicle</span>
                <span className="font-semibold text-right">{label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sky-200">Year</span>
                <span className="font-semibold">{input.Year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sky-200">Mileage</span>
                <span className="font-semibold">{formatSpaced(input.Mileage_Cleaned)} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sky-200">Location</span>
                <span className="font-semibold">{input.Province}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Dynamic SHAP Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white p-8 shadow-card border border-slate-100 flex flex-col"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-1">Why this price?</h3>
            <p className="text-sm text-slate-500 mb-6">AI analysis of this specific car's features</p>
            
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(val, name, props) => [`PKR ${Math.abs(props.payload.raw).toLocaleString()}`, props.payload.raw > 0 ? 'Increases Price' : 'Decreases Price']} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.raw > 0 ? '#0ea5e9' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#0ea5e9]"></div> Increases Price</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#f43f5e]"></div> Decreases Price</div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </PageTransition>
  )
}
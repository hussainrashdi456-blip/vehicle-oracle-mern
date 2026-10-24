import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Car, MapPin, PieChart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts'
import PageTransition from '../components/layout/PageTransition'

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#eab308'];

export default function TrendsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/trends')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading market trends...</div>
  }

  if (!data) {
    return <div className="text-center py-20 text-rose-500">Failed to load data.</div>
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800">Market Trends</h1>
          <p className="text-slate-500 mt-2">Insights from our dataset of {data.year_trend?.length ? 'thousands of' : ''} Pakistani used cars.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* 1. Year vs Average Price (Line Chart) */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} 
            className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-sky-500" />
              <h2 className="text-lg font-bold text-slate-800">Average Car Price by Year</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.year_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis 
                    axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}}
                    tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} 
                  />
                  <Tooltip 
                    formatter={(val) => [`PKR ${val.toLocaleString()}`, 'Avg Price']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="avgPrice" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 2. Top 5 Brands (Bar Chart) */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}
            className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Car size={20} className="text-orange-500" />
              <h2 className="text-lg font-bold text-slate-800">Top 5 Brands by Average Price</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.brand_trend} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="brand" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={80} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(val) => [`PKR ${val.toLocaleString()}`, 'Avg Price']}
                  />
                  <Bar dataKey="avgPrice" fill="#f97316" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 3. Body Types (Pie Chart) */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}
            className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <PieChart size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-800">Most Common Body Types</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={data.body_types} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={5}>
                    {data.body_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} cars`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 4. Provinces (Horizontal Bar) */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}}
            className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={20} className="text-violet-500" />
              <h2 className="text-lg font-bold text-slate-800">Top Provinces by Listings</h2>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.provinces} margin={{ top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} formatter={(val) => [`${val} cars`, 'Listings']} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.provinces.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  )
}
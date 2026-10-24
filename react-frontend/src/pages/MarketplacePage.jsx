import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Upload, X } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { useAuth } from '../context/AuthContext'
import { formatSpaced } from '../lib/format'

export default function MarketplacePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({ title: '', price: '', year: 2020, city: '', description: '' })
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchListings = () => {
    fetch('http://localhost:5000/api/listings')
      .then(res => res.json())
      .then(data => {
        setListings(data)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) return alert("Please select an image")
    
    setSubmitting(true)
    const data = new FormData()
    data.append('title', formData.title)
    data.append('price', formData.price)
    data.append('year', formData.year)
    data.append('city', formData.city)
    data.append('description', formData.description)
    data.append('userId', user?.id)
    data.append('image', image)

    try {
      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        body: data
      })
      if (res.ok) {
        setShowForm(false)
        setFormData({ title: '', price: '', year: 2020, city: '', description: '' })
        setImage(null)
        fetchListings() // Refresh list
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Marketplace</h1>
            <p className="text-slate-500 mt-2">Buy and sell used cars in Pakistan.</p>
          </div>
          {user ? (
            <button onClick={() => setShowForm(!showForm)} className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
              {showForm ? <X size={20} /> : <Plus size={20} />} 
              {showForm ? 'Cancel' : 'Post an Ad'}
            </button>
          ) : (
            <p className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-lg">Log in to post your car</p>
          )}
        </div>

        {/* Add Listing Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-card mb-10 border border-slate-100">
            <h2 className="text-xl font-bold mb-4">Post a New Listing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Car Title (e.g. 2018 Toyota Corolla)" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
                <input type="number" placeholder="Price (PKR)" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
                <input type="number" placeholder="Year" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
                <input type="text" placeholder="City (e.g. Karachi)" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
              <textarea placeholder="Description (Condition, mileage, etc.)" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none h-24"></textarea>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition">
                  <Upload size={18} className="text-slate-600" />
                  <span className="text-sm font-semibold text-slate-600">{image ? image.name : 'Upload Image'}</span>
                  <input type="file" accept="image/*" required onChange={e => setImage(e.target.files[0])} className="hidden" />
                </label>
                <button type="submit" disabled={submitting} className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-2 rounded-lg font-bold ml-auto transition disabled:opacity-50">
                  {submitting ? 'Posting...' : 'Post Ad'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-card text-slate-500">No cars listed yet. Be the first to post!</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((car) => (
              <motion.div key={car._id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="h-48 bg-slate-200 relative">
                  <img src={`http://localhost:5000${car.imageUrl}`} alt={car.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold text-slate-800 shadow-sm">
                    {car.year}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{car.title}</h3>
                  <p className="text-2xl font-extrabold text-sky-600 mb-3">PKR {formatSpaced(car.price)}</p>
                  <div className="flex items-center text-slate-500 text-sm mb-4">
                    <MapPin size={14} className="mr-1" /> {car.city}
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2">{car.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
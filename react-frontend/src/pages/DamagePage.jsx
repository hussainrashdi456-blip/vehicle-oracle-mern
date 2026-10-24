import { useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { detectDamage } from '../services/api'

export default function DamagePage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleImageChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setResult(null)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const data = await detectDamage(file)
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to analyze image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">AI Car Damage Assessment</h1>
          <p className="text-slate-500 mt-2">Upload photos to get instant AI damage detection.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Side: Upload Form */}
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <UploadCloud size={18} /> Upload Damage Photo
            </h3>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-500 font-semibold">Click to browse or drag & drop</p>
                <p className="text-xs text-slate-400">SVG, PNG, JPG (MAX. 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>

            {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</p>}

            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-6 w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : 'Analyze Damage'}
            </button>
          </div>

          {/* Right Side: Preview & Results */}
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 min-h-[400px] flex flex-col">
            {!preview && !result && (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <UploadCloud size={48} className="mb-4 opacity-50" />
                  <p>Upload a damage photo to get started</p>
               </div>
            )}

            {preview && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700">Analysis Result</h3>
                <div className="relative rounded-xl overflow-hidden bg-slate-100">
                  <img src={preview} alt="Uploaded car" className="w-full h-auto object-contain max-h-[300px]" />
                </div>

                {result && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-3 mt-4">
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${result.damage_detected ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {result.damage_detected ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                      <div>
                        <p className="font-bold">{result.damage_detected ? "Objects Detected" : "No Damage Detected"}</p>
                        <p className="text-sm opacity-80">{result.message}</p>
                      </div>
                    </div>

                    {result.detections && result.detections.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Detected Items:</h4>
                        <ul className="space-y-2">
                          {result.detections.map((d, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span className="capitalize font-medium text-slate-600">{d.label}</span>
                              <span className="text-slate-500">{(d.confidence * 100).toFixed(1)}% Match</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  )
}
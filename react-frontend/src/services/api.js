// All network access lives here. Step 3 wires the real backend:
// React -> POST {VITE_API_URL}/api/predict (Node/Express) -> FastAPI -> XGBoost
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 1. Price Prediction API
export async function predictPrice(payload) {
  if (USE_MOCK) return mockPredict(payload)

  try {
    const res = await axios.post(`${API_URL}/api/predict`, payload)
    return res.data // { price, explanation: { top_factors: [...] } }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error(error.message || `Prediction failed`)
  }
}

// 2. Home Page Stats API
export const getStats = async () => {
  const res = await axios.get(`${API_URL}/api/stats`)
  return res.data
}

// 3. Dropdown Options API (Brands, Models, etc.)
export const getCarOptions = async () => {
  const res = await axios.get(`${API_URL}/api/car-options`)
  return res.data
}

// 4. Dev-only stand-in (Mock Data)
async function mockPredict(p) {
  await new Promise((r) => setTimeout(r, 1100))
  const age = 2025 - p.Year
  const base = 1_000_000 + p.Engine_Cleaned * 2600
  const price = Math.max(250_000, base * Math.pow(0.93, age) - p.Mileage_Cleaned * 6 + p.Feature_Count * 18_000)
  return {
    mock: true,
    price,
    explanation: {
      top_factors: [
        { feature: 'Model', importance: 0.34 },
        { feature: 'Car_Age', importance: 0.27 },
        { feature: 'Engine_Cleaned', importance: 0.15 },
        { feature: 'Brand', importance: 0.1 },
        { feature: 'Mileage_Cleaned', importance: 0.06 },
      ],
    },
  }
}

export const getCarDetails = async (brand, model) => {
  const res = await fetch(`${API_URL}/api/car-details?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`)
  if (!res.ok) throw new Error('Details fetch failed')
  return res.json()
}


export const detectDamage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_URL}/api/detect-damage`, {
    method: 'POST',
    body: formData,
  })
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Detection failed (${res.status})`)
  }
  return res.json()
}
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageTransition from './components/layout/PageTransition'
import HomePage from './pages/HomePage'
import PredictPage from './pages/PredictPage'
import ResultPage from './pages/ResultPage'
import LoginPage from './pages/LoginPage'     // Naya Import
import HistoryPage from './pages/HistoryPage' // Naya Import
import { AuthProvider } from './context/AuthContext' 
import ComparePage from './pages/ComparePage'
import TrendsPage from './pages/TrendsPage';
import MarketplacePage from './pages/MarketplacePage';
import AdminPage from './pages/AdminPage';




export default function App() {
  const location = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/predict" element={<PageTransition><PredictPage /></PageTransition>} />
              <Route path="/result" element={<PageTransition><ResultPage /></PageTransition>} />
              
              {/* Naye Routes */}
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/history" element={<PageTransition><HistoryPage /></PageTransition>} />
              <Route path="/compare" element={<PageTransition><ComparePage /></PageTransition>} />
              <Route path="/marketplace" element={<PageTransition><MarketplacePage /></PageTransition>} />
              <Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
              <Route path="/trends" element={<PageTransition><TrendsPage /></PageTransition>} />
              <Route path="*" element={<PageTransition><HomePage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  )
}
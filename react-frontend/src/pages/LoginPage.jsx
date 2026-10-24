import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      login(data.user, data.token);
      navigate('/'); // Login ke baad home par bhej dein
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white p-8 rounded-2xl shadow-card w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          
          {error && <p className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-4 text-center">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="Full Name" required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                onChange={(e) => setFormData({...formData, name: e.target.value})} />
            )}
            <input type="email" placeholder="Email" required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="password" placeholder="Password" required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
              
            <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          
          <p className="text-center text-sm text-slate-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-sky-600 font-semibold hover:underline">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
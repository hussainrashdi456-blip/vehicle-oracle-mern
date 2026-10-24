import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatSpaced } from '../lib/format';
import PageTransition from '../components/layout/PageTransition';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetch(`http://localhost:5000/api/history/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => console.log(err));
  }, [user, navigate]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading history...</div>;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Your Prediction History</h1>
        
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-card">
            <Clock size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No predictions saved yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item._id} className="bg-white p-6 rounded-2xl shadow-card flex justify-between items-center border-l-4 border-sky-500">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{item.brand} {item.model}</h3>
                  <p className="text-slate-500 text-sm">{item.year} • {item.details.Mileage_Cleaned ? formatSpaced(item.details.Mileage_Cleaned) : 0} km • {item.details.Province}</p>
                  <p className="text-xs text-slate-400 mt-2">Saved on {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-sky-600">PKR {item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
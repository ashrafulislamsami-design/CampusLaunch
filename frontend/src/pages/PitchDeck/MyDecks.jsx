import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Upload, Trash2, BarChart2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

export default function MyDecks() {
  const { token } = useContext(AuthContext);
  const [decks, setDecks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDecks(); }, []);

  const fetchDecks = () => {
    fetch(`${API}/api/decks/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setDecks(Array.isArray(d) ? d : []); setLoading(false); });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deck?')) return;
    const res = await fetch(`${API}/api/decks/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { toast.success('Deck deleted'); fetchDecks(); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="jewel-teal p-10 mb-8 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-teal-50 font-serif-custom mb-2">My Pitch Decks</h1>
            <p className="text-teal-200 text-sm">Upload, track versions, and view review scores.</p>
          </div>
          <Link to="/decks/upload"
            className="flex items-center gap-2 bg-white/10 text-teal-50 border-2 border-white/20 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 hover:bg-white/20 transition"
            style={{ borderRadius: '8px 20px 8px 20px' }}>
            <Plus size={12} /> Upload Deck
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl border-2 border-dashed border-stone-200" />)}
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-16 placard bg-stone-50 border-2 border-dashed border-stone-200"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <FileText size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-400 font-black text-sm uppercase tracking-widest">No decks uploaded yet.</p>
          <Link to="/decks/upload" className="text-teal-600 underline text-xs mt-1 inline-block">Upload your first deck →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {decks.map(deck => (
            <div key={deck._id}
              className="placard bg-white border-2 border-stone-200 shadow-[3px_4px_0px_#d97706] p-5 flex items-center justify-between"
              style={{ borderRadius: '12px 28px 12px 28px' }}>
              <div className="flex-1">
                <h3 className="font-black text-amber-900 font-serif-custom text-lg">{deck.title}</h3>
                <p className="text-stone-500 text-xs mt-0.5">
                  v{deck.currentVersion} · {deck.totalReviews} reviews
                  {deck.latestAvgScore && ` · Avg: ${deck.latestAvgScore}/5`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/decks/${deck._id}/report`}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 border-2 border-teal-200 px-3 py-1.5 hover:border-teal-400 transition"
                  style={{ borderRadius: '6px 16px 6px 16px' }}>
                  <BarChart2 size={11} /> Report
                </Link>
                <Link to={`/decks/${deck._id}/version`}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-50 border-2 border-amber-200 px-3 py-1.5 hover:border-amber-400 transition"
                  style={{ borderRadius: '6px 16px 6px 16px' }}>
                  <Upload size={11} /> New Version
                </Link>
                <button onClick={() => handleDelete(deck._id)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 border-2 border-red-200 px-3 py-1.5 hover:border-red-400 transition"
                  style={{ borderRadius: '6px 16px 6px 16px' }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
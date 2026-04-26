import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL as API, SOCKET_URL as ORIGIN } from '../../config';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const CRITERIA = [
  { key: 'problemClarity',    label: 'Problem Clarity' },
  { key: 'solutionQuality',   label: 'Solution Quality' },
  { key: 'marketOpportunity', label: 'Market Opportunity' },
  { key: 'businessModel',     label: 'Business Model Strength' },
  { key: 'teamStrength',      label: 'Team Strength' },
  { key: 'slideDesign',       label: 'Slide Design Quality' },
];

const RECOMMENDATIONS = [
  { value: 'needs-work',       label: '⚒ Needs Work' },
  { value: 'good-potential',   label: '🌱 Good Potential' },
  { value: 'competition-ready',label: '🏆 Competition Ready' },
];

export default function ReviewDeck() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [deck, setDeck]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [criteria, setCriteria] = useState(() =>
    Object.fromEntries(CRITERIA.map(c => [c.key, { score: 3, comment: '' }]))
  );
  const [overallComment, setOverallComment]   = useState('');
  const [recommendation, setRecommendation]   = useState('needs-work');

  useEffect(() => {
    fetch(`${API}/decks/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setDeck(d); setLoading(false); });
  }, [id]);

  const setScore   = (key, score)   => setCriteria(p => ({ ...p, [key]: { ...p[key], score } }));
  const setComment = (key, comment) => setCriteria(p => ({ ...p, [key]: { ...p[key], comment } }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res  = await fetch(`${API}/decks/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ version: deck.currentVersion, criteria, overallComment, recommendation })
      });
      const data = await res.json();
      if (res.ok) { toast.success('Review submitted!'); navigate(`/decks/${id}/report`); }
      else toast.error(data.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="text-center py-20 text-stone-400 animate-pulse font-black text-xs uppercase tracking-widest">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="jewel-teal p-8 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-teal-50 font-serif-custom mb-1">Review Deck</h1>
          <p className="text-teal-200">{deck?.title} · Version {deck?.currentVersion}</p>
        </div>
      </div>

      {/* View PDF link */}
      {deck?.versions?.length > 0 && (
        <a href={`${ORIGIN}${deck.versions[deck.versions.length - 1].filePath}`}
           target="_blank" rel="noreferrer"
           className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-700 border-2 border-teal-200 px-4 py-2 hover:border-teal-500 transition"
           style={{ borderRadius: '8px 20px 8px 20px' }}>
          📄 Open PDF in new tab
        </a>
      )}

      {/* Criteria scoring */}
      <div className="space-y-4">
        {CRITERIA.map(({ key, label }) => (
          <div key={key}
            className="placard bg-white border-2 border-stone-200 shadow-[3px_4px_0px_#d97706] p-5 relative overflow-hidden"
            style={{ borderRadius: '12px 28px 12px 28px' }}>
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3">{label}</h4>
              {/* Star selector */}
              <div className="flex gap-1 text-2xl mb-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setScore(key, n)}
                    className={n <= criteria[key].score ? 'text-amber-400' : 'text-stone-300 hover:text-amber-300'}>
                    ★
                  </button>
                ))}
                <span className="text-xs text-stone-400 font-bold ml-2 self-center">{criteria[key].score}/5</span>
              </div>
              <textarea
                className="w-full border-2 border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium focus:border-amber-400 focus:outline-none transition resize-none"
                style={{ borderRadius: '6px 16px 6px 16px' }}
                rows={2}
                placeholder={`Comment on ${label.toLowerCase()}…`}
                value={criteria[key].comment}
                onChange={e => setComment(key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Overall */}
      <div className="placard bg-white border-2 border-stone-200 shadow-[3px_4px_0px_#d97706] p-5"
           style={{ borderRadius: '12px 28px 12px 28px' }}>
        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3">Overall Comment</h4>
        <textarea
          className="w-full border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium focus:border-amber-400 focus:outline-none transition resize-none min-h-[80px]"
          style={{ borderRadius: '8px 20px 8px 20px' }}
          placeholder="Summarize your overall impression…"
          value={overallComment}
          onChange={e => setOverallComment(e.target.value)}
        />
      </div>

      {/* Recommendation */}
      <div className="placard bg-white border-2 border-stone-200 shadow-[3px_4px_0px_#d97706] p-5"
           style={{ borderRadius: '12px 28px 12px 28px' }}>
        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3">Recommendation</h4>
        <div className="flex flex-wrap gap-3">
          {RECOMMENDATIONS.map(({ value, label }) => (
            <button key={value} onClick={() => setRecommendation(value)}
              className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all
                ${recommendation === value
                  ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md -translate-y-0.5'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-amber-400'}`}
              style={{ borderRadius: '8px 20px 8px 20px' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full flex items-center justify-center gap-3 bg-amber-900 text-amber-50 font-black py-4 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition shadow-[4px_6px_0px_#78350f] disabled:opacity-50"
        style={{ borderRadius: '8px 32px 8px 32px' }}>
        <Send size={16} />
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}
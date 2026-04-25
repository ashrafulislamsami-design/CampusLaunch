import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, Filter, Briefcase, Zap } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const EXPERTISE_OPTIONS = ['tech', 'marketing', 'finance', 'law', 'product', 'design', 'operations', 'fundraising'];

function StarDisplay({ rating }) {
  const rounded = Math.round(rating || 0);
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(rounded)}
      <span className="text-stone-200">{'★'.repeat(5 - rounded)}</span>
    </span>
  );
}

export default function MentorList() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expertise, setExpertise] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sessionType, setSessionType] = useState('');

  useEffect(() => { fetchMentors(); }, [expertise, minRating, sessionType]);

  const fetchMentors = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (expertise) params.set('expertise', expertise);
    if (minRating) params.set('minRating', minRating);
    if (sessionType) params.set('sessionType', sessionType);
    try {
      const res = await fetch(`${API}/api/mentors?${params}`);
      const data = await res.json();
      setMentors(data.mentors || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8">

      {/* Hero Banner */}
      <div className="mb-12 jewel-teal p-10 sm:p-14 shadow-xl relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.04] bg-black"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="md:w-2/3">
            <h1 className="text-5xl font-black mb-4 font-serif-custom text-teal-50 drop-shadow-md tracking-tight">
              Mentor Directory
            </h1>
            <p className="text-teal-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
              Book 1-on-1 sessions with experienced entrepreneurs and professionals. Get guidance tailored to your startup journey.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
            <Users size={80} className="text-teal-100 opacity-60" />
          </div>
        </div>
      </div>

      {/* Live count */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
        <span className="tracking-widest text-[10px] uppercase font-bold text-amber-900/40">
          {mentors.length} Mentors Available
        </span>
      </div>

      {/* Filters */}
      <div className="placard p-8 border-t-4 border-amber-400 bg-stone-50/50 flex flex-col md:flex-row gap-6 items-center shadow-xl mb-12">
        <div className="flex items-center gap-2 text-stone-500 font-black uppercase tracking-widest text-[10px] mr-2">
          <Filter size={14} /> Filters:
        </div>

        {/* Expertise */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Expertise</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setExpertise('')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${expertise === '' ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md -translate-y-0.5' : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
              style={{ borderRadius: '8px 20px 8px 20px' }}
            >
              All
            </button>
            {EXPERTISE_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setExpertise(e)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 capitalize ${expertise === e ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md -translate-y-0.5' : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
                style={{ borderRadius: '8px 20px 8px 20px' }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Min Rating */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Min Rating</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMinRating('')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${minRating === '' ? 'bg-teal-800 border-teal-800 text-teal-50 shadow-md -translate-y-0.5' : 'bg-white border-stone-200 text-stone-500 hover:border-teal-400 hover:text-teal-900'}`}
              style={{ borderRadius: '8px 20px 8px 20px' }}
            >
              Any
            </button>
            {[3, 3.5, 4, 4.5].map(r => (
              <button
                key={r}
                onClick={() => setMinRating(String(r))}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${minRating === String(r) ? 'bg-teal-800 border-teal-800 text-teal-50 shadow-md -translate-y-0.5' : 'bg-white border-stone-200 text-stone-500 hover:border-teal-400 hover:text-teal-900'}`}
                style={{ borderRadius: '8px 20px 8px 20px' }}
              >
                {r}+★
              </button>
            ))}
          </div>
        </div>

        {/* Session Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Session Type</label>
          <div className="flex gap-2">
            {[{ val: '', label: 'All' }, { val: 'free', label: 'Free' }, { val: 'paid', label: 'Paid' }].map(opt => (
              <button
                key={opt.val}
                onClick={() => setSessionType(opt.val)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${sessionType === opt.val ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md -translate-y-0.5' : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
                style={{ borderRadius: '8px 20px 8px 20px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200"></div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20 placard bg-stone-50 border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
          <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No mentors match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map(mentor => (
            <div
              key={mentor._id}
              className="placard p-8 group flex flex-col justify-between bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] hover:-translate-y-1 hover:shadow-[6px_8px_0px_#d97706] transition-all relative overflow-hidden"
              style={{ borderRadius: '12px 32px 12px 32px' }}
            >
              {/* Icon */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 border-2 border-sky-300 rounded-xl flex items-center justify-center shadow-sm transform -rotate-3 group-hover:rotate-0 transition">
                    <Users size={26} className="icon-tactile text-sky-900" />
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1.5 border-2 uppercase tracking-widest ${mentor.sessionType === 'free' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`} style={{ borderRadius: '4px 12px 4px 12px' }}>
                    {mentor.sessionType === 'free' ? 'Free' : `$${mentor.sessionPriceUSD}`}
                  </span>
                </div>

                <h3 className="text-xl font-black text-amber-900 mb-1 font-serif-custom">{mentor.name}</h3>
                <p className="text-stone-500 text-xs font-sans-custom font-medium mb-4 flex items-center gap-1">
                  <Briefcase size={11} /> {mentor.jobDetails}
                </p>

                {/* Stars */}
                <div className="flex items-center gap-2 mb-4">
                  <StarDisplay rating={mentor.averageRating} />
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">({mentor.totalRatings} reviews)</span>
                </div>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.expertise.map(e => (
                    <span key={e} className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-black px-2.5 py-1 capitalize uppercase tracking-widest" style={{ borderRadius: '4px 8px 4px 8px' }}>
                      {e}
                    </span>
                  ))}
                </div>

                {mentor.bio && (
                  <p className="text-stone-600 text-xs font-sans-custom leading-relaxed line-clamp-2 mb-6">{mentor.bio}</p>
                )}
              </div>

              <Link
                to={`/mentors/${mentor._id}/book`}
                className="w-full text-center bg-sky-800 text-sky-50 font-black py-3 uppercase tracking-widest text-[10px] border-2 border-transparent hover:bg-sky-100 hover:text-sky-900 hover:border-sky-400 transition flex items-center justify-center gap-2"
                style={{ borderRadius: '8px 24px 8px 24px' }}
              >
                <Zap size={12} /> Book Session
              </Link>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
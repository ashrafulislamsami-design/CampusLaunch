import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Calendar } from 'lucide-react';

const API = 'http://localhost:5000';

export default function EventArchive() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/hub/archive`)
      .then(r => r.json())
      .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="jewel-teal p-10 mb-10 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-teal-50 font-serif-custom mb-3">Event Archive</h1>
          <p className="text-teal-200 text-lg">Past competitions, winners, and memorable moments from the Bangladesh startup ecosystem.</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-stone-400">No archived events yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(ev => (
            <div key={ev._id}
              className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
              style={{ borderRadius: '12px 32px 12px 32px' }}>
              <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 mb-3">
                  <Calendar size={11} /> {new Date(ev.date).toLocaleDateString()}
                </span>
                <h3 className="text-xl font-black text-amber-900 font-serif-custom mb-2">{ev.title}</h3>
                {ev.winners && (
                  <p className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                    <Award size={13} className="text-amber-500" /> Winner: {ev.winners}
                  </p>
                )}
                {ev.runnerUp && (
                  <p className="text-sm text-stone-600 mt-0.5">Runner-up: {ev.runnerUp}</p>
                )}
                {ev.summary && (
                  <p className="text-stone-500 text-xs mt-3 italic border-l-4 border-amber-300 pl-3 line-clamp-2">{ev.summary}</p>
                )}
                <Link to={`/events/${ev._id}`}
                  className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest text-teal-700 underline hover:text-teal-900">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
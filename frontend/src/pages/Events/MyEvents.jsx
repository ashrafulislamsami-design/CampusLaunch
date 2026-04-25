import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, CheckCircle2, Clock, Users } from 'lucide-react';

const API = 'http://localhost:5000';

export default function MyEvents() {
  const { token } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [myCreated, setMyCreated]         = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/hub/my-registrations`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/hub/my-events`,        { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([regs, created]) => {
      setRegistrations(Array.isArray(regs) ? regs : []);
      setMyCreated(Array.isArray(created) ? created : []);
    }).finally(() => setLoading(false));
  }, []);

  const STATUS_COLORS = { registered: 'bg-teal-100 text-teal-800', waitlisted: 'bg-amber-100 text-amber-800', 'checked-in': 'bg-green-100 text-green-800' };

  if (loading) return <div className="text-center py-20 text-stone-400 animate-pulse font-black text-xs uppercase tracking-widest">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* My Registrations */}
      <div>
        <h2 className="text-3xl font-black text-amber-900 font-serif-custom mb-6">My Registrations</h2>
        {registrations.length === 0 ? (
          <div className="text-center py-12 text-stone-400 placard bg-stone-50 border-2 border-dashed border-stone-200" style={{ borderRadius: '12px 32px 12px 32px' }}>
            <p className="font-black text-sm uppercase tracking-widest">No registrations yet.</p>
            <Link to="/events" className="text-teal-600 underline text-xs mt-1 inline-block">Browse events →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map(reg => {
              const ev = reg.eventId;
              if (!ev) return null;
              return (
                <div key={reg._id} className="placard bg-white border-2 border-stone-200 shadow-[3px_4px_0px_#d97706] p-5 flex items-center justify-between"
                     style={{ borderRadius: '12px 28px 12px 28px' }}>
                  <div>
                    <h3 className="font-black text-amber-900 text-lg font-serif-custom">{ev.title}</h3>
                    <p className="text-stone-500 text-xs flex items-center gap-1.5 mt-0.5">
                      <Calendar size={11} /> {new Date(ev.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[reg.status] || 'bg-stone-100 text-stone-600'}`}>
                      {reg.status}
                    </span>
                    <Link to={`/events/${ev._id}`}
                      className="text-[10px] font-black uppercase tracking-widest text-amber-900 border-2 border-amber-300 px-3 py-1 hover:border-amber-500 transition"
                      style={{ borderRadius: '6px 16px 6px 16px' }}>
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Events I Organized */}
      {myCreated.length > 0 && (
        <div>
          <h2 className="text-3xl font-black text-amber-900 font-serif-custom mb-6">Events I Organized</h2>
          <div className="space-y-3">
            {myCreated.map(ev => (
              <div key={ev._id} className="placard bg-white border-2 border-stone-200 shadow-[3px_4px_0px_#d97706] p-5 flex items-center justify-between"
                   style={{ borderRadius: '12px 28px 12px 28px' }}>
                <div>
                  <h3 className="font-black text-amber-900 text-lg font-serif-custom">{ev.title}</h3>
                  <p className="text-stone-500 text-xs flex items-center gap-1.5 mt-0.5">
                    <Calendar size={11} /> {new Date(ev.date).toLocaleDateString()} · {ev.status}
                  </p>
                </div>
                <Link to={`/events/${ev._id}`}
                  className="text-[10px] font-black uppercase tracking-widest bg-amber-900 text-amber-50 px-4 py-2 border-2 border-amber-900 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition"
                  style={{ borderRadius: '8px 20px 8px 20px' }}>
                  Manage
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
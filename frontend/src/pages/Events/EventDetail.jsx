import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, MapPin, Video, Users, Tag, Edit3, Trash2, CheckCircle2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

export default function EventDetail() {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [myReg, setMyReg]     = useState(null);
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => { fetchEvent(); fetchMyReg(); }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API}/api/hub/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) setEvent(await res.json());
    } finally { setLoading(false); }
  };

  const fetchMyReg = async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${API}/api/hub/my-registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const found = Array.isArray(data) ? data.find(r => r.eventId?._id === id || r.eventId === id) : null;
      setMyReg(found || null);
    } catch (_) {}
  };

  const handleRsvp = async () => {
    setRsvpLoading(true);
    try {
      const res  = await fetch(`${API}/api/hub/${id}/rsvp`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchMyReg(); fetchEvent(); }
      else toast.error(data.message);
    } finally { setRsvpLoading(false); }
  };

  const handleCancelRsvp = async () => {
    if (!confirm('Cancel your registration?')) return;
    const res = await fetch(`${API}/api/hub/${id}/rsvp`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { toast.success('Registration cancelled'); setMyReg(null); fetchEvent(); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this event?')) return;
    const res = await fetch(`${API}/api/hub/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { toast.success('Event deleted'); navigate('/events'); }
  };

  const handleFeedback = async () => {
    const res = await fetch(`${API}/api/hub/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating, comment })
    });
    if (res.ok) toast.success('Feedback submitted!');
    else toast.error('Failed to submit feedback');
  };

  const handleCalendar = () => {
    if (!event) return;
    const dateStr = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 8);
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue || event.meetLink || '')}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="flex justify-center py-20 text-stone-400 animate-pulse font-black text-xs uppercase tracking-widest">Loading…</div>;
  if (!event)  return <div className="text-center py-20 text-stone-400">Event not found.</div>;

  const isOrganizer = user && event.organizerId === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Banner */}
      {event.bannerImage && (
        <img src={`${API}${event.bannerImage}`} alt="banner"
          className="w-full h-56 object-cover rounded-3xl border-2 border-stone-200" />
      )}

      {/* Hero card */}
      <div className="placard bg-white border-2 border-stone-200 shadow-[5px_7px_0px_#d97706] p-8 relative overflow-hidden"
           style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-teal-50 text-teal-800 border-2 border-teal-200 mb-3"
                    style={{ borderRadius: '4px 12px 4px 12px' }}>
                {event.eventType?.replace('-', ' ')}
              </span>
              <h1 className="text-4xl font-black text-amber-900 font-serif-custom leading-tight mb-1">{event.title}</h1>
              <p className="text-stone-500 text-sm">{event.organizerName} · {event.hostingOrg}</p>
            </div>
            {isOrganizer && (
              <div className="flex gap-2">
                <Link to={`/events/${id}/edit`}
                  className="flex items-center gap-1.5 bg-amber-900 text-amber-50 text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-amber-900 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition"
                  style={{ borderRadius: '8px 20px 8px 20px' }}>
                  <Edit3 size={11} /> Edit
                </Link>
                <button onClick={handleDelete}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-red-200 hover:border-red-400 transition"
                  style={{ borderRadius: '8px 20px 8px 20px' }}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {[
              { icon: Calendar, label: 'Date',   value: new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' }) },
              { icon: event.format === 'online' ? Video : MapPin, label: 'Location', value: event.venue || event.meetLink || event.format },
              { icon: Users, label: 'Capacity',  value: event.capacityLimit > 0 ? `${event.registrationCount || 0} / ${event.capacityLimit}` : 'Unlimited' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-stone-50 border-2 border-stone-200 p-3" style={{ borderRadius: '8px 16px 8px 16px' }}>
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Icon size={11} className="text-teal-700" /> {label}
                </p>
                <p className="text-stone-700 text-xs font-bold">{value}</p>
              </div>
            ))}
          </div>

          {event.registrationDeadline && (
            <p className="text-xs text-red-600 font-bold mt-3">
              Registration deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
            </p>
          )}

          <p className="text-stone-600 text-sm font-medium leading-relaxed mt-5 border-l-4 border-amber-300 pl-4 italic">
            {event.description}
          </p>

          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {event.tags.map(t => (
                <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RSVP + Calendar */}
      <div className="flex flex-wrap gap-3">
        {myReg ? (
          <>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-800 bg-teal-50 border-2 border-teal-200 px-5 py-3"
                  style={{ borderRadius: '8px 20px 8px 20px' }}>
              <CheckCircle2 size={13} /> {myReg.status === 'waitlisted' ? 'On Waitlist' : 'Registered'}
            </span>
            <button onClick={handleCancelRsvp}
              className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 border-2 border-red-200 px-5 py-3 hover:border-red-400 transition"
              style={{ borderRadius: '20px 8px 20px 8px' }}>
              Cancel RSVP
            </button>
          </>
        ) : event.status !== 'completed' ? (
          <button onClick={handleRsvp} disabled={rsvpLoading}
            className="bg-amber-900 text-amber-50 font-black text-[10px] uppercase tracking-widest px-8 py-3 border-2 border-amber-900 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition shadow-[3px_4px_0px_#78350f] disabled:opacity-50"
            style={{ borderRadius: '8px 24px 8px 24px' }}>
            {rsvpLoading ? '…' : '✦ Register Now'}
          </button>
        ) : null}

        <button onClick={handleCalendar}
          className="text-[10px] font-black uppercase tracking-widest bg-teal-100 text-teal-900 border-2 border-teal-300 px-5 py-3 hover:bg-teal-200 transition"
          style={{ borderRadius: '24px 8px 24px 8px' }}>
          Add to Calendar
        </button>
      </div>

      {/* Archive results */}
      {event.status === 'completed' && (event.winners || event.summary) && (
        <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-4">Event Results</h3>
          {event.winners  && <p className="text-sm font-bold text-stone-700 mb-1">🏆 Winner: {event.winners}</p>}
          {event.runnerUp && <p className="text-sm font-bold text-stone-700 mb-1">🥈 Runner-up: {event.runnerUp}</p>}
          {event.summary  && <p className="text-stone-600 text-sm italic mt-2 border-l-4 border-amber-300 pl-3">{event.summary}</p>}
        </div>
      )}

      {/* Feedback (for completed events) */}
      {event.status === 'completed' && myReg?.status === 'checked-in' && (
        <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-4">Leave Feedback</h3>
          <div className="flex gap-1 text-2xl mb-4">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}
                className={n <= rating ? 'text-amber-400' : 'text-stone-300'}>★</button>
            ))}
          </div>
          <textarea
            className="w-full border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none transition resize-none min-h-[80px]"
            style={{ borderRadius: '8px 20px 8px 20px' }}
            placeholder="Share your experience…"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button onClick={handleFeedback}
            className="mt-3 w-full bg-amber-900 text-amber-50 font-black py-2.5 text-[10px] uppercase tracking-widest border-2 border-amber-900 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}>
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}
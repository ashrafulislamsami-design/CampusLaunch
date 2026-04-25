import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Search, Filter, MapPin, Video, Calendar, Users,
  Clock, Tag, Rocket, Plus, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const TYPE_OPTIONS  = ['All', 'pitch-competition', 'hackathon', 'workshop', 'networking', 'webinar', 'other'];
const FORMAT_OPTIONS = ['All', 'online', 'in-person', 'hybrid'];
const STATUS_OPTIONS = ['All', 'upcoming', 'live', 'completed'];

const TYPE_COLORS = {
  'pitch-competition': 'bg-amber-100 text-amber-900 border-amber-300',
  'hackathon':         'bg-teal-100  text-teal-900  border-teal-300',
  'workshop':          'bg-stone-100 text-stone-700 border-stone-300',
  'networking':        'bg-amber-50  text-amber-700 border-amber-200',
  'webinar':           'bg-teal-50   text-teal-700  border-teal-200',
  'other':             'bg-stone-50  text-stone-600 border-stone-200',
};

const STATUS_COLORS = {
  'upcoming':  'bg-teal-100  text-teal-800',
  'live':      'bg-green-100 text-green-800',
  'completed': 'bg-stone-100 text-stone-600',
  'cancelled': 'bg-red-100   text-red-700',
};

function EventCard({ event, token, onRsvp }) {
  const [registering, setRegistering] = useState(false);

  const handleRsvp = async () => {
    if (!token) { toast.error('Please log in to register'); return; }
    setRegistering(true);
    try {
      const res  = await fetch(`${API}/api/hub/${event._id}/rsvp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); onRsvp && onRsvp(); }
      else toast.error(data.message || 'Failed to register');
    } finally { setRegistering(false); }
  };

  return (
    <div
      className="placard p-8 group flex flex-col justify-between bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] hover:-translate-y-1 hover:shadow-[6px_8px_0px_#d97706] transition-all relative overflow-hidden"
      style={{ borderRadius: '12px 32px 12px 32px' }}
    >
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />

      <div>
        {/* Type icon + status */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 rounded-xl flex items-center justify-center shadow-sm transform -rotate-3 group-hover:rotate-0 transition">
            <Rocket size={26} className="text-amber-900" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status] || ''}`}>
            {event.status}
          </span>
        </div>

        <h3 className="text-2xl font-black text-amber-900 mb-1 font-serif-custom leading-tight line-clamp-2">
          {event.title}
        </h3>
        <p className="text-stone-500 text-xs font-black uppercase tracking-widest mb-4">
          {event.organizerName} · {event.hostingOrg || 'CampusLaunch'}
        </p>

        {/* Meta */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-3 text-stone-700 font-medium">
            <div className="p-1.5 bg-stone-100 rounded-lg text-teal-700"><Calendar size={14} /></div>
            <span className="text-sm font-bold text-amber-900">
              {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-700 font-medium">
            <div className="p-1.5 bg-stone-100 rounded-lg text-amber-700">
              {event.format === 'online' ? <Video size={14} /> : <MapPin size={14} />}
            </div>
            <span className="text-sm">{event.format === 'online' ? 'Online' : event.venue || event.format}</span>
          </div>
          {event.capacityLimit > 0 && (
            <div className="flex items-center gap-3 text-stone-700 font-medium">
              <div className="p-1.5 bg-stone-100 rounded-lg text-teal-700"><Users size={14} /></div>
              <span className="text-sm">Capacity: <span className="font-bold text-amber-900">{event.capacityLimit}</span></span>
            </div>
          )}
        </div>

        {/* Type badge */}
        <span
          className={`inline-block px-3 py-1 border-2 text-[10px] font-black tracking-widest uppercase mb-4 capitalize ${TYPE_COLORS[event.eventType] || TYPE_COLORS['other']}`}
          style={{ borderRadius: '4px 8px 4px 8px' }}
        >
          {event.eventType?.replace('-', ' ')}
        </span>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 relative z-10">
        <Link
          to={`/events/${event._id}`}
          className="flex-1 text-center bg-amber-900 text-amber-50 font-black py-3 uppercase tracking-widest text-[10px] border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition flex items-center justify-center gap-2"
          style={{ borderRadius: '8px 24px 8px 24px' }}
        >
          Details <ExternalLink size={11} />
        </Link>
        {event.status !== 'completed' && (
          <button
            onClick={handleRsvp}
            disabled={registering}
            className="flex-1 text-center bg-teal-100 text-teal-900 font-black py-3 uppercase tracking-widest text-[10px] border-2 border-teal-300 hover:bg-teal-200 transition disabled:opacity-50"
            style={{ borderRadius: '24px 8px 24px 8px' }}
          >
            {registering ? '...' : 'RSVP'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function EventHub() {
  const { token, user } = useContext(AuthContext);
  const [events, setEvents]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [type, setType]       = useState('All');
  const [format, setFormat]   = useState('All');
  const [status, setStatus]   = useState('All');
  const [page, setPage]       = useState(1);

  useEffect(() => { fetchEvents(); }, [page, type, format, status]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchEvents(); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEvents = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.set('search', search);
    if (type   !== 'All') params.set('type',   type);
    if (format !== 'All') params.set('format', format);
    if (status !== 'All') params.set('status', status);
    try {
      const res  = await fetch(`${API}/api/hub?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total  || 0);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-paper">

      {/* Hero */}
      <div className="mb-12">
        <div
          className="text-center md:text-left mb-10 overflow-hidden relative p-12 jewel-teal shadow-xl"
          style={{ borderRadius: '16px 48px 16px 48px' }}
        >
          <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="md:w-2/3">
              <h1 className="text-5xl font-black mb-4 font-serif-custom text-teal-50 drop-shadow-md tracking-tight">
                The Event Hub
              </h1>
              <p className="text-teal-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
                Discover pitch competitions, hackathons, workshops, and networking events across the Bangladesh startup ecosystem.
              </p>
            </div>
            <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
              <Rocket size={80} className="text-teal-100 opacity-60 transform rotate-12" />
            </div>
          </div>
        </div>

        {/* Stats + Create button */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="tracking-widest text-[10px] uppercase font-bold text-amber-900/40">
              {total} Active Events
            </span>
          </div>
          {(user?.role === 'Organizer' || user?.role === 'Mentor') && (
            <Link
              to="/events/create"
              className="flex items-center gap-2 bg-amber-900 text-amber-50 text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-amber-900 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition shadow-[2px_3px_0px_#78350f]"
              style={{ borderRadius: '8px 20px 8px 20px' }}
            >
              <Plus size={12} /> Create Event
            </Link>
          )}
        </div>

        {/* Filter hub */}
        <div className="placard p-8 border-t-4 border-amber-400 bg-stone-50/50 flex flex-col gap-6 shadow-xl mb-12">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"><Search size={20} /></span>
            <input
              type="text"
              placeholder="Search events by title, tags, or organizer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-stone-200 focus:border-amber-400 focus:ring-0 text-stone-800 font-bold tracking-tight rounded-2xl shadow-inner transition-all hover:border-stone-300"
            />
          </div>

          {/* Type filter */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-stone-500 font-black uppercase tracking-widest text-[10px]">
              <Filter size={13} /> Event Type:
            </div>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setPage(1); }}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest capitalize transition-all border-2
                    ${type === t
                      ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md -translate-y-0.5'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
                  style={{ borderRadius: '8px 20px 8px 20px' }}
                >
                  {t.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Format + Status */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Format:</p>
              <div className="flex gap-2">
                {FORMAT_OPTIONS.map(f => (
                  <button key={f}
                    onClick={() => { setFormat(f); setPage(1); }}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest capitalize border-2 transition-all
                      ${format === f ? 'bg-teal-800 border-teal-800 text-teal-50' : 'bg-white border-stone-200 text-stone-500 hover:border-teal-400'}`}
                    style={{ borderRadius: '6px 16px 6px 16px' }}
                  >{f}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Status:</p>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button key={s}
                    onClick={() => { setStatus(s); setPage(1); }}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest capitalize border-2 transition-all
                      ${status === s ? 'bg-teal-800 border-teal-800 text-teal-50' : 'bg-white border-stone-200 text-stone-500 hover:border-teal-400'}`}
                    style={{ borderRadius: '6px 16px 6px 16px' }}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-72 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 placard bg-stone-50 border-dashed border-2 border-stone-200"
               style={{ borderRadius: '16px 48px 16px 48px' }}>
            <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No events match your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(ev => (
                <EventCard key={ev._id} event={ev} token={token} onRsvp={fetchEvents} />
              ))}
            </div>
            {total > 9 && (
              <div className="flex justify-center gap-3 mt-12">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 border-stone-200 bg-white text-stone-500 hover:border-amber-400 hover:text-amber-900 transition disabled:opacity-30"
                  style={{ borderRadius: '8px 20px 8px 20px' }}>← Prev</button>
                <span className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-amber-900 text-amber-50 border-2 border-amber-900"
                  style={{ borderRadius: '20px 8px 20px 8px' }}>Page {page}</span>
                <button disabled={events.length < 9} onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 border-stone-200 bg-white text-stone-500 hover:border-amber-400 hover:text-amber-900 transition disabled:opacity-30"
                  style={{ borderRadius: '20px 8px 20px 8px' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useMemo, useContext } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { listEvents } from '../../services/pitchService';
import PitchArenaHero from '../../components/pitch/PitchArenaHero';
import EventCard from '../../components/pitch/EventCard';
import CreateEventModal from '../../components/pitch/CreateEventModal';
import MyPitchEvents from '../../components/pitch/MyPitchEvents';

const FILTERS = ['all', 'registration_open', 'live', 'results_published'];
const FILTER_LABELS = { all: 'All', registration_open: 'Upcoming', live: 'Live Now', results_published: 'Past' };

const SkeletonCard = () => (
  <div className="placard overflow-hidden animate-pulse">
    <div className="h-32 bg-stone-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-stone-200 rounded w-2/3" />
      <div className="h-4 bg-stone-200 rounded w-full" />
      <div className="h-10 bg-stone-200 rounded" />
    </div>
  </div>
);

const PitchArenaPage = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await listEvents();
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events.filter(e => e.status !== 'draft');
    if (filter === 'results_published') return events.filter(e => ['ended', 'results_published'].includes(e.status));
    if (filter === 'registration_open') return events.filter(e => ['registration_open', 'registration_closed'].includes(e.status));
    return events.filter(e => e.status === filter);
  }, [events, filter]);

  const liveEvents = useMemo(() => events.filter(e => e.status === 'live'), [events]);

  const stats = useMemo(() => ({
    totalEvents: events.filter(e => e.status !== 'draft').length,
    totalTeams: events.reduce((sum, e) => sum + (e.registeredTeamsCount || 0), 0),
    totalPrize: events.reduce((sum, e) => sum + (e.prizeMoney?.first || 0) + (e.prizeMoney?.second || 0) + (e.prizeMoney?.third || 0), 0)
  }), [events]);

  const isOrganizer = user?.role === 'Organizer';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PitchArenaHero stats={stats} />

      {/* Live Now highlight */}
      {liveEvents.length > 0 && (
        <section className="mb-10" aria-label="Live events">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-600">Live Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.map(e => <EventCard key={e._id} event={e} />)}
          </div>
        </section>
      )}

      {/* Filter tabs */}
      <nav className="flex gap-2 mb-6 overflow-x-auto pb-2" role="tablist" aria-label="Event filters">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md -translate-y-0.5'
                : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'
            }`}
            style={{ borderRadius: '8px 20px 8px 20px' }}
          >
            {FILTER_LABELS[f]}
            {f === 'live' && liveEvents.length > 0 && (
              <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Event grid */}
      <section aria-label="Events">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 placard bg-stone-50 border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
            <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No events found</p>
            <p className="text-stone-400 text-sm mt-2">Check back later for exciting pitch events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(e => <EventCard key={e._id} event={e} />)}
          </div>
        )}
      </section>

      <MyPitchEvents />

      {/* Organizer FAB */}
      {isOrganizer && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-amber-900 text-amber-50 rounded-full shadow-xl hover:bg-amber-800 transition-all flex items-center justify-center z-40 hover:scale-110"
          aria-label="Create new event"
        >
          <Plus size={28} />
        </button>
      )}

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchEvents()}
        />
      )}
    </div>
  );
};

export default PitchArenaPage;

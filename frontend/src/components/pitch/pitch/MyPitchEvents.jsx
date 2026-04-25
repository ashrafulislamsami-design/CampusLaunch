import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Award } from 'lucide-react';
import { getMyEvents } from '../../services/pitchService';
import EventStatusBadge from './EventStatusBadge';

const MyPitchEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch my events');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading || events.length === 0) return null;

  return (
    <section className="mt-12">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 mb-4 w-full text-left"
      >
        <Award size={20} className="text-amber-700" />
        <span className="text-sm font-bold uppercase tracking-widest text-stone-600">
          My Pitch Events ({events.length})
        </span>
        <span className="text-xs text-stone-400">{collapsed ? '▸ Show' : '▾ Hide'}</span>
      </button>

      {!collapsed && (
        <div className="space-y-3">
          {events.map((reg) => (
            <div
              key={reg._id}
              className="placard p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-[3px_4px_0px_#b45309] hover:translate-y-[3px] transition-all"
              onClick={() => navigate(`/pitch-arena/event/${reg.event?._id}`)}
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-stone-900 truncate">{reg.event?.title}</p>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <Calendar size={12} />
                  {reg.event?.eventDate ? new Date(reg.event.eventDate).toLocaleDateString() : ''}
                  <span className="mx-1">·</span>
                  Team: {reg.team?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <EventStatusBadge status={reg.event?.status} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  reg.status === 'approved' ? 'bg-teal-100 text-teal-800'
                  : reg.status === 'rejected' ? 'bg-red-100 text-red-700'
                  : 'bg-stone-100 text-stone-600'
                }`}>
                  {reg.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyPitchEvents;

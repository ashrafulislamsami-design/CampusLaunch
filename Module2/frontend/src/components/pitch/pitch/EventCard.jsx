import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy } from 'lucide-react';
import EventStatusBadge from './EventStatusBadge';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const date = new Date(event.eventDate);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const totalPrize = (event.prizeMoney?.first || 0) + (event.prizeMoney?.second || 0) + (event.prizeMoney?.third || 0);

  const getAction = () => {
    switch (event.status) {
      case 'registration_open': return { label: 'Register', path: `/pitch-arena/event/${event._id}` };
      case 'live': return { label: 'Watch Live', path: `/pitch-arena/event/${event._id}/audience` };
      case 'results_published': return { label: 'View Results', path: `/pitch-arena/event/${event._id}/results` };
      default: return { label: 'View Details', path: `/pitch-arena/event/${event._id}` };
    }
  };

  const action = getAction();

  const gradients = [
    'from-teal-700 to-teal-900',
    'from-amber-700 to-amber-900',
    'from-indigo-700 to-indigo-900',
    'from-rose-700 to-rose-900',
  ];
  const gradientIdx = event.title.length % gradients.length;

  return (
    <article
      className="placard overflow-hidden group cursor-pointer hover:shadow-[3px_4px_0px_#b45309] hover:translate-y-[4px] hover:translate-x-[3px] transition-all"
      onClick={() => navigate(action.path)}
      tabIndex={0}
      role="button"
      aria-label={`${event.title} - ${action.label}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(action.path)}
    >
      {/* Cover gradient */}
      <div className={`h-32 bg-gradient-to-br ${gradients[gradientIdx]} relative flex items-end p-4`}>
        <div className="absolute top-3 right-3">
          <EventStatusBadge status={event.status} />
        </div>
        {event.status === 'live' && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">
              {event.registeredTeamsCount || 0} teams
            </span>
          </div>
        )}
        <h3 className="text-white font-black font-serif-custom text-lg leading-tight drop-shadow-lg">{event.title}</h3>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-3 mb-4 text-[11px] font-bold text-stone-500">
          <span className="flex items-center gap-1"><Calendar size={13} />{dateStr} · {timeStr}</span>
          <span className="flex items-center gap-1"><Users size={13} />{event.registeredTeamsCount || 0}/{event.maxTeams}</span>
          {totalPrize > 0 && (
            <span className="flex items-center gap-1 text-amber-700"><Trophy size={13} />{totalPrize.toLocaleString()} {event.prizeMoney?.currency}</span>
          )}
        </div>

        <p className="text-stone-600 text-sm line-clamp-2 mb-5 leading-relaxed">{event.description}</p>

        <button
          className={`w-full text-center font-bold py-2.5 uppercase tracking-widest text-xs border-2 transition-all ${
            event.status === 'live'
              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
              : 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400'
          }`}
          style={{ borderRadius: '8px 20px 8px 20px' }}
          onClick={(e) => { e.stopPropagation(); navigate(action.path); }}
        >
          {action.label}
        </button>
      </div>
    </article>
  );
};

export default React.memo(EventCard);

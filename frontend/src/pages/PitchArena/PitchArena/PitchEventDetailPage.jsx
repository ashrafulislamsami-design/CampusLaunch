import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy, MapPin, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import usePitchEvent from '../../hooks/usePitchEvent';
import { useParams } from 'react-router-dom';
import { startEvent, nextPresenter, endEvent } from '../../services/pitchService';
import EventStatusBadge from '../../components/pitch/EventStatusBadge';
import EventCountdown from '../../components/pitch/EventCountdown';
import TeamRegistrationModal from '../../components/pitch/TeamRegistrationModal';
import Leaderboard from '../../components/pitch/Leaderboard';

const TABS = ['overview', 'teams', 'schedule'];

const PitchEventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { event, registrations, stats, loading, refetchEvent, refetchRegistrations } = usePitchEvent(eventId);

  const [activeTab, setActiveTab] = useState('overview');
  const [showRegister, setShowRegister] = useState(false);

  const isOrganizer = event?.organizer?._id === user?.id || user?.role === 'Organizer';
  const isJudge = event?.judges?.some(j => j._id === user?.id);
  const totalPrize = useMemo(() => (event?.prizeMoney?.first || 0) + (event?.prizeMoney?.second || 0) + (event?.prizeMoney?.third || 0), [event]);
  const approvedRegs = useMemo(() => registrations.filter(r => r.status === 'approved'), [registrations]);
  const isUpcoming = ['registration_open', 'registration_closed', 'draft'].includes(event?.status);

  const handleStartEvent = async () => {
    try {
      await startEvent(eventId);
      toast.success('Event started!');
      refetchEvent();
    } catch (err) {
      toast.error('Failed to start event');
    }
  };

  const handleNextPresenter = async () => {
    try {
      await nextPresenter(eventId);
      toast.success('Advanced to next presenter');
      refetchEvent();
    } catch (err) {
      toast.error('Failed to advance presenter');
    }
  };

  const handleEndEvent = async () => {
    try {
      await endEvent(eventId);
      toast.success('Event ended');
      refetchEvent();
    } catch (err) {
      toast.error('Failed to end event');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 rounded w-2/3" />
        <div className="h-48 bg-stone-200 rounded-xl" />
        <div className="h-32 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-20 text-stone-400 font-bold">Event not found</div>;
  }

  const date = new Date(event.eventDate);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <EventStatusBadge status={event.status} size="lg" />
            <h1 className="text-3xl sm:text-4xl font-black font-serif-custom text-stone-900 mt-3">{event.title}</h1>
            <p className="text-stone-500 mt-1">Organized by {event.organizer?.name || 'Admin'}</p>
          </div>
          <div className="flex gap-3">
            {event.status === 'live' && (
              <>
                {(isJudge || isOrganizer) && (
                  <button onClick={() => navigate(`/pitch-arena/event/${eventId}/room`)} className="gilded-btn text-sm">
                    Join Room
                  </button>
                )}
                <button onClick={() => navigate(`/pitch-arena/event/${eventId}/audience`)} className="px-5 py-2.5 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all" style={{ borderRadius: '8px 20px 8px 20px' }}>
                  Watch Live
                </button>
              </>
            )}
            {event.status === 'results_published' && (
              <button onClick={() => navigate(`/pitch-arena/event/${eventId}/results`)} className="gilded-btn text-sm">
                View Results
              </button>
            )}
          </div>
        </div>

        {/* Info strip */}
        <div className="flex flex-wrap gap-4 text-sm text-stone-600">
          <span className="flex items-center gap-1.5"><Calendar size={15} />{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1.5"><Clock size={15} />{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="flex items-center gap-1.5"><Users size={15} />{approvedRegs.length}/{event.maxTeams} teams</span>
          <span className="flex items-center gap-1.5"><Clock size={15} />{event.presentationDuration} min/team</span>
        </div>
      </header>

      {/* Countdown for upcoming */}
      {isUpcoming && event.eventDate && (
        <div className="placard p-6 mb-8 text-center bg-white">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Event starts in</p>
          <EventCountdown targetDate={event.eventDate} />
        </div>
      )}

      {/* Prize section */}
      {totalPrize > 0 && (
        <div className="placard p-6 mb-8 bg-white">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2"><Trophy size={14} />Prize Money</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{ label: '1st Place', amount: event.prizeMoney.first, emoji: '🥇' },
              { label: '2nd Place', amount: event.prizeMoney.second, emoji: '🥈' },
              { label: '3rd Place', amount: event.prizeMoney.third, emoji: '🥉' }].map(p => (
              <div key={p.label}>
                <span className="text-2xl">{p.emoji}</span>
                <p className="font-black text-amber-900 text-lg mt-1">৳{(p.amount || 0).toLocaleString()}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav className="flex gap-2 mb-6 border-b-2 border-stone-200 pb-2" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab ? 'text-amber-900 border-b-2 border-amber-500 -mb-[2px]' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="placard p-6 bg-white">
            <h3 className="font-bold text-stone-900 mb-3">About This Event</h3>
            <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            {event.eligibility && (
              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Eligibility</p>
                <p className="text-stone-700">{event.eligibility}</p>
              </div>
            )}
          </div>

          {/* Judge panel */}
          {event.judges?.length > 0 && (
            <div className="placard p-6 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2"><UserCheck size={14} />Judges</h3>
              <div className="flex flex-wrap gap-3">
                {event.judges.map(j => (
                  <div key={j._id} className="flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-lg">
                    <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center font-bold text-sm text-amber-900">
                      {j.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-stone-700">{j.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Register button */}
          {event.status === 'registration_open' && (
            <div className="text-center">
              <button
                onClick={() => setShowRegister(true)}
                className="gilded-btn text-lg px-12 py-4"
              >
                Register Your Team
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === 'teams' && (
        <section className="space-y-3">
          {registrations.length === 0 ? (
            <p className="text-center py-12 text-stone-400 font-bold text-sm uppercase tracking-widest">No teams registered yet</p>
          ) : (
            registrations.map((reg, idx) => (
              <div key={reg._id} className="placard p-4 bg-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-xs font-black text-stone-600">{reg.presentationOrder || idx + 1}</span>
                  <div>
                    <p className="font-bold text-stone-900">{reg.team?.name}</p>
                    <p className="text-xs text-stone-500">{reg.team?.problemStatement?.substring(0, 60)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reg.pitchDeckUrl && (
                    <a href={reg.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 font-bold hover:underline">Deck</a>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    reg.status === 'approved' ? 'bg-teal-100 text-teal-800'
                    : reg.status === 'rejected' ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
                  }`}>{reg.status}</span>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'schedule' && (
        <section className="space-y-3">
          {approvedRegs.length === 0 ? (
            <p className="text-center py-12 text-stone-400 font-bold text-sm uppercase tracking-widest">Schedule not available yet</p>
          ) : (
            approvedRegs.map((reg, idx) => {
              const slotTime = new Date(date.getTime() + idx * event.presentationDuration * 60000);
              return (
                <div key={reg._id} className="flex items-center gap-4 p-4 placard bg-white">
                  <div className="text-center">
                    <p className="text-xs font-bold text-stone-400">{slotTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="w-px h-10 bg-stone-200" />
                  <div className="flex-1">
                    <p className="font-bold text-stone-900">{reg.team?.name}</p>
                    <p className="text-xs text-stone-500">{event.presentationDuration} minutes</p>
                  </div>
                  {event.status === 'live' && event.currentPresenterIndex === idx && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest animate-pulse rounded">Presenting</span>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {/* Leaderboard */}
      {(event.showLiveLeaderboard || event.status === 'results_published') && (
        <div className="mt-8 placard p-6 bg-white">
          <Leaderboard eventId={eventId} />
        </div>
      )}

      {/* Organizer controls */}
      {isOrganizer && (
        <div className="fixed bottom-0 left-0 right-0 bg-paper border-t-[3px] border-amber-200 p-4 z-40 flex items-center justify-center gap-4">
          {['registration_open', 'registration_closed'].includes(event.status) && (
            <button onClick={handleStartEvent} className="px-6 py-2.5 bg-teal-700 text-white font-bold text-xs uppercase tracking-widest hover:bg-teal-600 transition-all" style={{ borderRadius: '8px 20px 8px 20px' }}>
              Start Event
            </button>
          )}
          {event.status === 'live' && (
            <>
              <button onClick={handleNextPresenter} className="px-6 py-2.5 bg-amber-700 text-white font-bold text-xs uppercase tracking-widest hover:bg-amber-600 transition-all" style={{ borderRadius: '8px 20px 8px 20px' }}>
                Next Team
              </button>
              <button onClick={handleEndEvent} className="px-6 py-2.5 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all" style={{ borderRadius: '8px 20px 8px 20px' }}>
                End Session
              </button>
            </>
          )}
        </div>
      )}

      {showRegister && (
        <TeamRegistrationModal
          eventId={eventId}
          onClose={() => setShowRegister(false)}
          onRegistered={() => refetchRegistrations()}
        />
      )}
    </div>
  );
};

export default PitchEventDetailPage;

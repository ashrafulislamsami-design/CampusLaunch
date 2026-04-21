import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import usePitchEvent from '../../hooks/usePitchEvent';
import useJitsiRoom from '../../hooks/useJitsiRoom';
import VideoRoom from '../../components/pitch/VideoRoom';
import JudgeScoringPanel from '../../components/pitch/JudgeScoringPanel';
import PitchDeckViewer from '../../components/pitch/PitchDeckViewer';
import PresentationTimer from '../../components/pitch/PresentationTimer';
import EventStatusBadge from '../../components/pitch/EventStatusBadge';

const PitchLiveRoomPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { event, registrations, loading: eventLoading } = usePitchEvent(eventId);
  const { isInRoom, joinRoom, leaveRoom } = useJitsiRoom();

  const [activePanel, setActivePanel] = useState('deck');

  const isJudge = event?.judges?.some(j => j._id === user?.id);
  const isOrganizer = event?.organizer?._id === user?.id || user?.role === 'Organizer';

  const approvedRegs = useMemo(() =>
    registrations.filter(r => r.status === 'approved').sort((a, b) => a.presentationOrder - b.presentationOrder),
    [registrations]
  );
  const currentReg = approvedRegs[event?.currentPresenterIndex] || null;

  const userRole = isOrganizer ? 'presenter' : isJudge ? 'judge' : 'presenter';

  useEffect(() => {
    if (event && !['live', 'judging'].includes(event.status)) {
      toast.error('This event is not currently live');
      navigate(`/pitch-arena/event/${eventId}`);
    }
  }, [event, eventId, navigate]);

  const handleJoinRoom = () => {
    joinRoom();
    toast.success('Joining video room...');
  };

  const handleLeave = () => {
    leaveRoom();
    navigate(`/pitch-arena/event/${eventId}`);
  };

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse text-stone-400 font-bold text-sm uppercase tracking-widest">Loading room...</div>
      </div>
    );
  }

  if (!isInRoom) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-black font-serif-custom text-stone-900 mb-4">Join Live Room</h1>
        <p className="text-stone-500 mb-6">{event?.title}</p>
        {currentReg && (
          <p className="text-sm text-amber-700 font-bold mb-6">
            Currently Presenting: {currentReg.team?.name}
          </p>
        )}
        <button onClick={handleJoinRoom} className="gilded-btn text-lg px-12 py-4">
          Join Video Room
        </button>
        <p className="text-xs text-stone-400 mt-4">You'll need camera and microphone access</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
      {/* Top bar */}
      <div className="fixed top-20 left-0 right-0 z-30 bg-stone-900 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <EventStatusBadge status={event?.status} size="sm" />
          <span className="font-bold text-sm truncate max-w-[200px]">{event?.title}</span>
        </div>
        <div className="flex items-center gap-4">
          {currentReg && (
            <span className="text-xs text-amber-400 font-bold">
              Presenting: {currentReg.team?.name}
            </span>
          )}
          <PresentationTimer durationMinutes={event?.presentationDuration || 5} isActive={event?.status === 'live'} />
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 pt-14 lg:pt-14 p-2 lg:p-4 bg-stone-950">
        <VideoRoom
          roomName={`event-${eventId}`}
          displayName={user?.name}
          userRole={userRole}
          onRoomLeft={handleLeave}
        />
      </div>

      {/* Side panel */}
      <aside className="w-full lg:w-96 bg-paper border-l-[3px] border-amber-200/60 pt-14 lg:pt-14 overflow-y-auto">
        {/* Panel tabs */}
        <div className="flex border-b-[3px] border-amber-200/60">
          {isJudge && (
            <button
              onClick={() => setActivePanel('scoring')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition ${activePanel === 'scoring' ? 'text-amber-900 border-b-2 border-amber-500' : 'text-stone-400'}`}
            >
              Scoring
            </button>
          )}
          <button
            onClick={() => setActivePanel('deck')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition ${activePanel === 'deck' ? 'text-amber-900 border-b-2 border-amber-500' : 'text-stone-400'}`}
          >
            Deck
          </button>
          <button
            onClick={() => setActivePanel('info')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition ${activePanel === 'info' ? 'text-amber-900 border-b-2 border-amber-500' : 'text-stone-400'}`}
          >
            Info
          </button>
        </div>

        <div className="p-4">
          {activePanel === 'scoring' && isJudge && currentReg && (
            <JudgeScoringPanel
              eventId={eventId}
              teamId={currentReg.team?._id}
              teamName={currentReg.team?.name}
              onScored={() => toast.success('Score recorded')}
            />
          )}

          {activePanel === 'deck' && (
            <PitchDeckViewer
              url={currentReg?.pitchDeckUrl}
              filename={currentReg?.pitchDeckOriginalName}
            />
          )}

          {activePanel === 'info' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Event Status</h3>
                <EventStatusBadge status={event?.status} size="lg" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Current Presenter</h3>
                <p className="font-bold text-stone-900">{currentReg?.team?.name || 'None'}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Presentation Order</h3>
                <div className="space-y-1">
                  {approvedRegs.map((r, i) => (
                    <div key={r._id} className={`flex items-center gap-2 text-sm p-2 rounded ${i === event?.currentPresenterIndex ? 'bg-amber-100 font-bold' : ''}`}>
                      <span className="text-xs text-stone-400 w-5">{i + 1}.</span>
                      <span className={i === event?.currentPresenterIndex ? 'text-amber-900' : 'text-stone-600'}>{r.team?.name}</span>
                      {i < event?.currentPresenterIndex && <span className="text-teal-600 text-xs ml-auto">✓</span>}
                      {i === event?.currentPresenterIndex && <span className="text-red-500 text-[10px] font-bold ml-auto animate-pulse">LIVE</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default PitchLiveRoomPage;

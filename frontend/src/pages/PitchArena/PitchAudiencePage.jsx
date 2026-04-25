import { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import usePitchEvent from '../../hooks/usePitchEvent';
import useAudiencePolling from '../../hooks/useAudiencePolling';
import EventStatusBadge from '../../components/pitch/EventStatusBadge';
import LiveViewerCount from '../../components/pitch/LiveViewerCount';
import VideoRoom from '../../components/pitch/VideoRoom';
import AudiencePollPanel from '../../components/pitch/AudiencePollPanel';
import EmojiReactions from '../../components/pitch/EmojiReactions';
import Leaderboard from '../../components/pitch/Leaderboard';

const PitchAudiencePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { event, registrations, stats, loading } = usePitchEvent(eventId);
  const { voteCounts, hasVoted, loading: voteLoading, submitVote } = useAudiencePolling(eventId);

  const approvedRegs = useMemo(() =>
    registrations.filter(r => r.status === 'approved').sort((a, b) => a.presentationOrder - b.presentationOrder),
    [registrations]
  );
  const currentReg = approvedRegs[event?.currentPresenterIndex] || null;
  const teams = approvedRegs.map(r => ({ _id: r.team?._id, name: r.team?.name }));

  useEffect(() => {
    if (event && !['live', 'judging', 'ended', 'results_published'].includes(event.status)) {
      toast.error('This event is not live yet');
      navigate(`/pitch-arena/event/${eventId}`);
    }
  }, [event, eventId, navigate]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-stone-200 rounded-xl" />
          <div className="h-96 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <EventStatusBadge status={event?.status} size="lg" />
          <h1 className="text-xl sm:text-2xl font-black font-serif-custom text-stone-900">{event?.title}</h1>
        </div>
        <LiveViewerCount count={stats.viewerCount} />
      </header>

      {/* Current presenter banner */}
      {currentReg && (
        <div className="bg-stone-900 text-white px-5 py-3 mb-6 flex items-center justify-between" style={{ borderRadius: '12px 32px 12px 32px' }}>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="font-bold text-sm">Currently Presenting:</span>
            <span className="text-amber-400 font-black">{currentReg.team?.name}</span>
          </div>
          <span className="text-xs text-stone-400">
            {(event?.currentPresenterIndex || 0) + 1} of {approvedRegs.length}
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Live video via Jitsi */}
        <div className="lg:col-span-2">
          <div className="placard p-4 bg-white">
            <VideoRoom
              roomName={`event-${eventId}`}
              displayName={user?.name}
              userRole="audience"
              onRoomLeft={() => navigate(`/pitch-arena/event/${eventId}`)}
            />
          </div>
        </div>

        {/* Right - Voting + Reactions + Leaderboard */}
        <div className="space-y-6">
          {event?.allowAudienceVoting && teams.length > 0 && (
            <div className="placard p-5 bg-white">
              <AudiencePollPanel
                teams={teams}
                voteCounts={voteCounts}
                hasVoted={hasVoted}
                onVote={submitVote}
                loading={voteLoading}
              />
            </div>
          )}

          <div className="placard p-5 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Reactions</h3>
            <EmojiReactions />
          </div>

          {event?.showLiveLeaderboard && (
            <div className="placard p-5 bg-white">
              <Leaderboard eventId={eventId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PitchAudiencePage;

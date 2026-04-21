import { useState, useEffect, useCallback } from 'react';
import { submitVote as submitVoteAPI, getVoteCounts } from '../services/pitchService';

export default function useAudiencePolling(eventId) {
  const [voteCounts, setVoteCounts] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchVotes = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data } = await getVoteCounts(eventId);
      setVoteCounts(data);
    } catch (err) {
      console.error('Failed to fetch votes');
    }
  }, [eventId]);

  useEffect(() => {
    fetchVotes();
    const interval = setInterval(fetchVotes, 10000);
    return () => clearInterval(interval);
  }, [fetchVotes]);

  const submitVote = useCallback(async (teamId) => {
    if (hasVoted) return;
    try {
      setLoading(true);
      // Optimistic UI
      setHasVoted(true);
      setVoteCounts(prev =>
        prev.map(v => v.team?._id === teamId ? { ...v, count: v.count + 1 } : v)
      );

      await submitVoteAPI(eventId, teamId);
    } catch (err) {
      if (err.response?.status === 409) {
        setHasVoted(true);
      } else {
        setHasVoted(false);
        fetchVotes();
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, hasVoted, fetchVotes]);

  return { voteCounts, hasVoted, loading, submitVote, refetchVotes: fetchVotes };
}

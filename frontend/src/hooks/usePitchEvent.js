import { useState, useEffect, useCallback } from 'react';
import { getEvent, getRegistrations, getEventStats } from '../services/pitchService';

export default function usePitchEvent(eventId) {
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({ viewerCount: 0, totalVotes: 0, registeredTeams: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data } = await getEvent(eventId);
      setEvent(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event');
    }
  }, [eventId]);

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data } = await getRegistrations(eventId);
      setRegistrations(data);
    } catch (err) {
      console.error('Failed to fetch registrations');
    }
  }, [eventId]);

  const fetchStats = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data } = await getEventStats(eventId);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  }, [eventId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchEvent(), fetchRegistrations(), fetchStats()]);
      setLoading(false);
    };
    load();
  }, [fetchEvent, fetchRegistrations, fetchStats]);

  // Poll for live updates when event is live
  useEffect(() => {
    if (!event || !['live', 'judging'].includes(event.status)) return;
    const interval = setInterval(() => {
      fetchEvent();
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [event?.status, fetchEvent, fetchStats]);

  return {
    event, registrations, stats, loading, error,
    refetchEvent: fetchEvent,
    refetchRegistrations: fetchRegistrations,
    refetchStats: fetchStats,
    setEvent
  };
}

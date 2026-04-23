import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudentProgress } from '../services/curriculumService';

export default function useCurriculumProgress() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getStudentProgress();
      setProgressData(data);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('Failed to load progress');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [fetchProgress]);

  const overallPercentage = useMemo(() => {
    const completed = progressData.filter((p) => p.isCompleted).length;
    return Math.round((completed / 12) * 100);
  }, [progressData]);

  const completedCount = useMemo(() => {
    return progressData.filter((p) => p.isCompleted).length;
  }, [progressData]);

  const isWeekCompleted = useCallback(
    (weekNum) => {
      const p = progressData.find((item) => item.weekNumber === weekNum);
      return p?.isCompleted || false;
    },
    [progressData]
  );

  const getWeekProgress = useCallback(
    (weekNum) => {
      return progressData.find((item) => item.weekNumber === weekNum) || null;
    },
    [progressData]
  );

  const getWeekStatus = useCallback(
    (weekNum) => {
      const p = progressData.find((item) => item.weekNumber === weekNum);
      if (!p) return 'not_started';
      if (p.isCompleted) return 'completed';
      if (p.videoWatched || p.quizSubmitted || p.assignmentSubmitted) return 'in_progress';
      return 'not_started';
    },
    [progressData]
  );

  const updateProgressLocally = useCallback((weekNumber, updates) => {
    setProgressData((prev) => {
      const idx = prev.findIndex((p) => p.weekNumber === weekNumber);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      }
      return [...prev, { weekNumber, ...updates }];
    });
  }, []);

  return {
    progressData,
    loading,
    error,
    overallPercentage,
    completedCount,
    isWeekCompleted,
    getWeekProgress,
    getWeekStatus,
    refetchProgress: fetchProgress,
    updateProgressLocally,
  };
}

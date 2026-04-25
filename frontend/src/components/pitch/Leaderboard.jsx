import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { getLeaderboard } from '../../services/pitchService';

const Leaderboard = ({ eventId }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getLeaderboard(eventId);
        setRankings(data);
      } catch (err) {
        console.error('Leaderboard not available');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) {
    return <div className="animate-pulse h-32 bg-stone-100 rounded-lg" />;
  }

  if (rankings.length === 0) {
    return <p className="text-stone-400 text-xs font-bold uppercase tracking-widest text-center py-4">No scores yet</p>;
  }

  const rankColors = ['text-amber-600', 'text-stone-500', 'text-amber-800'];

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
        <Trophy size={14} /> Leaderboard
      </h3>
      <div className="space-y-2">
        {rankings.map((r, i) => (
          <div key={r.team?._id || i} className={`flex items-center gap-3 p-3 rounded-lg ${i === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-stone-200'}`}>
            <span className={`text-lg font-black w-8 text-center ${rankColors[i] || 'text-stone-400'}`}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${r.rank}`}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-stone-800 truncate">{r.team?.name || 'Team'}</p>
            </div>
            <span className="font-black text-amber-900 text-sm">{r.avgTotal}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Leaderboard;

import { useEffect, useState } from 'react';
import WinnerBadge from './WinnerBadge';

const PODIUM_HEIGHTS = ['h-40', 'h-32', 'h-24'];
const PODIUM_COLORS = ['bg-gradient-to-t from-amber-400 to-amber-300', 'bg-gradient-to-t from-stone-400 to-stone-300', 'bg-gradient-to-t from-amber-700 to-amber-600'];
const PODIUM_ORDER = [1, 0, 2]; // 2nd, 1st, 3rd for visual display

const PodiumDisplay = ({ rankings }) => {
  const [visible, setVisible] = useState(false);
  const top3 = rankings.slice(0, 3);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (top3.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {PODIUM_ORDER.map((idx) => {
        const r = top3[idx];
        if (!r) return <div key={idx} className="w-28" />;

        return (
          <div
            key={r.team?._id || idx}
            className={`flex flex-col items-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${idx * 200}ms` }}
          >
            {/* Team info */}
            <div className="text-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-black text-amber-900">
                {r.team?.name?.charAt(0) || '?'}
              </div>
              <p className="font-bold text-sm text-stone-900 max-w-[120px] truncate">{r.team?.name}</p>
              <p className="text-xs font-black text-amber-700">{r.avgTotal}/100</p>
            </div>

            {/* Podium block */}
            <div className={`w-28 ${PODIUM_HEIGHTS[idx]} ${PODIUM_COLORS[idx]} rounded-t-xl flex items-start justify-center pt-3 shadow-md`}>
              <span className="text-2xl font-black text-white/90 drop-shadow">
                {['🥇', '🥈', '🥉'][idx]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PodiumDisplay;

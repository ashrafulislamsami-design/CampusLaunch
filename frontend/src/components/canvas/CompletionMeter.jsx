import { memo } from 'react';

const CompletionMeter = ({ sections = {}, compact = false }) => {
  const keys = Object.keys(sections);
  const total = keys.length || 9;
  const filled = keys.filter((k) => (sections[k]?.cards || []).length > 0).length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'min-w-[220px]'}`}>
      <div className="flex-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
          <span>{compact ? `${pct}%` : 'Completion'}</span>
          {!compact && <span>{filled}/{total} sections</span>}
        </div>
        <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
      {!compact && (
        <span className="font-black text-teal-800 text-sm tabular-nums">{pct}%</span>
      )}
    </div>
  );
};

export default memo(CompletionMeter);

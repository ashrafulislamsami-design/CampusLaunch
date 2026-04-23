import React from 'react';

const STATUS_CONFIG = {
  draft: { bg: 'bg-stone-100 border-stone-300', text: 'text-stone-600', label: 'Draft' },
  registration_open: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', label: 'Open' },
  registration_closed: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', label: 'Closed' },
  live: { bg: 'bg-red-100 border-red-400', text: 'text-red-700', label: '● LIVE', pulse: true },
  judging: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', label: 'Judging' },
  ended: { bg: 'bg-stone-100 border-stone-300', text: 'text-stone-600', label: 'Ended' },
  results_published: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', label: 'Results' },
};

const EventStatusBadge = ({ status, size = 'sm' }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const sizeClass = size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-2.5 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-widest border ${c.bg} ${c.text} ${sizeClass} ${c.pulse ? 'animate-pulse' : ''}`}
      style={{ borderRadius: '6px 14px 6px 14px' }}
    >
      {c.label}
    </span>
  );
};

export default React.memo(EventStatusBadge);

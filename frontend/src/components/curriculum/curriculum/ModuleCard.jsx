import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import ProgressRing from './ProgressRing';

const MODULE_GROUPS = [
  { weeks: [1, 2], icon: '💡', title: 'Idea Generation & Problem Identification', range: 'Weeks 1-2' },
  { weeks: [3, 4], icon: '🔍', title: 'Market Research Techniques', range: 'Weeks 3-4' },
  { weeks: [5, 6], icon: '📋', title: 'Business Model Canvas Development', range: 'Weeks 5-6' },
  { weeks: [7, 8], icon: '🛠️', title: 'MVP Planning and Building', range: 'Weeks 7-8' },
  { weeks: [9, 10], icon: '💰', title: 'Financial Management & Pricing Strategies', range: 'Weeks 9-10' },
  { weeks: [11, 12], icon: '🎤', title: 'Pitch Deck Creation & Investor Preparation', range: 'Weeks 11-12' },
];

const StatusBadge = ({ status }) => {
  const config = {
    completed: { bg: 'bg-teal-100 border-teal-300', text: 'text-teal-800', label: 'Completed', Icon: CheckCircle },
    in_progress: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', label: 'In Progress', Icon: Clock },
    not_started: { bg: 'bg-stone-100 border-stone-300', text: 'text-stone-500', label: 'Not Started', Icon: BookOpen },
  };
  const c = config[status] || config.not_started;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${c.bg} ${c.text}`} style={{ borderRadius: '6px 14px 6px 14px' }}>
      <c.Icon size={12} />
      {c.label}
    </span>
  );
};

const ModuleCard = ({ groupIndex, getWeekStatus, getGroupProgress }) => {
  const navigate = useNavigate();
  const group = MODULE_GROUPS[groupIndex];
  if (!group) return null;

  const statuses = group.weeks.map((w) => getWeekStatus(w));
  const allCompleted = statuses.every((s) => s === 'completed');
  const anyProgress = statuses.some((s) => s !== 'not_started');
  const groupStatus = allCompleted ? 'completed' : anyProgress ? 'in_progress' : 'not_started';
  const progress = getGroupProgress ? getGroupProgress(group.weeks) : 0;

  const firstIncompleteWeek = group.weeks.find((w) => getWeekStatus(w) !== 'completed') || group.weeks[0];

  const buttonLabel = allCompleted ? 'Review' : anyProgress ? 'Continue' : 'Start';
  const ButtonIcon = allCompleted ? CheckCircle : PlayCircle;

  return (
    <article
      className="placard bg-white p-6 flex flex-col justify-between gap-4 group hover:shadow-[3px_4px_0px_#b45309] hover:translate-y-[4px] hover:translate-x-[3px] transition-all"
      tabIndex={0}
      role="button"
      aria-label={`${group.title} - ${group.range} - ${buttonLabel}`}
      onClick={() => navigate(`/curriculum/week/${firstIncompleteWeek}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/curriculum/week/${firstIncompleteWeek}`)}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl" aria-hidden="true">{group.icon}</span>
          <ProgressRing percentage={progress} size={48} strokeWidth={4} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1 block">{group.range}</span>
        <h3 className="text-lg font-black text-stone-900 font-serif-custom leading-tight mb-3">{group.title}</h3>
        <StatusBadge status={groupStatus} />
      </div>

      <button
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border-2 ${
          allCompleted
            ? 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100'
            : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
        }`}
        style={{ borderRadius: '8px 20px 8px 20px' }}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/curriculum/week/${firstIncompleteWeek}`);
        }}
      >
        <ButtonIcon size={16} />
        {buttonLabel}
      </button>
    </article>
  );
};

export { MODULE_GROUPS };
export default React.memo(ModuleCard);

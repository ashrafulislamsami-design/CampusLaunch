import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ChevronLeft } from 'lucide-react';

const WeekSidebar = ({ currentWeek, getWeekStatus, isOpen, onClose }) => {
  const navigate = useNavigate();

  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  const weekTitles = {
    1: 'Idea Generation',
    2: 'Problem Validation',
    3: 'Market Research',
    4: 'Market Analysis',
    5: 'Business Model Canvas',
    6: 'Lean Canvas',
    7: 'MVP Planning',
    8: 'MVP Building',
    9: 'Financial Planning',
    10: 'Pricing Strategy',
    11: 'Pitch Deck',
    12: 'Investor Prep',
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen lg:h-auto w-72 lg:w-64 bg-paper border-r-[3px] border-amber-200/60 shadow-lg lg:shadow-none transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto`}
        role="navigation"
        aria-label="Week navigation"
      >
        <div className="p-4 border-b-[3px] border-amber-200/60 flex items-center justify-between">
          <button
            onClick={() => navigate('/curriculum')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-amber-900 transition"
          >
            <ChevronLeft size={16} />
            All Modules
          </button>
          <button onClick={onClose} className="lg:hidden text-stone-400 hover:text-stone-600" aria-label="Close sidebar">
            ✕
          </button>
        </div>

        <nav className="p-3">
          <ul className="space-y-1" role="list">
            {weeks.map((w) => {
              const status = getWeekStatus(w);
              const isCurrent = w === currentWeek;

              return (
                <li key={w}>
                  <button
                    onClick={() => { navigate(`/curriculum/week/${w}`); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                      isCurrent
                        ? 'bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold'
                        : 'hover:bg-stone-100 text-stone-600'
                    }`}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {status === 'completed' ? (
                      <CheckCircle size={18} className="text-teal-600 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className={`flex-shrink-0 ${isCurrent ? 'text-amber-600' : 'text-stone-300'}`} />
                    )}
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Week {w}</span>
                      <span className={`block truncate ${isCurrent ? 'font-bold' : 'font-medium'}`}>{weekTitles[w]}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default WeekSidebar;

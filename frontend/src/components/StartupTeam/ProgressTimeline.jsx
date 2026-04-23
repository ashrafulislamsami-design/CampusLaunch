import { CalendarDays, Milestone, Rocket } from 'lucide-react';

const ProgressTimeline = ({ history = [], currentStage = 'Idea', isPublic = false }) => {
  // Always include the initial "Idea" creation as the first point
  const timelinePoints = [
    {
      stage: 'Idea',
      note: 'Startup conceived in the CampusLaunch forge.',
      date: history.length > 0 ? history[0].timestamp : new Date(),
      isInitial: true
    },
    ...history.map(h => ({
      stage: h.newStage,
      note: h.changeNote,
      date: h.timestamp,
      isInitial: false
    }))
  ];

  return (
    <div className={`relative ${isPublic ? 'py-12' : 'p-6'}`}>
      <h3 className={`font-black text-amber-900 font-serif-custom mb-10 border-b-2 border-amber-200 pb-4 ${isPublic ? 'text-4xl text-center' : 'text-xl'}`}>
        {isPublic ? 'The Traction Journey' : 'Journey Progress'}
      </h3>

      <div className="relative">
        {/* Main Gold Thread (Vertical Line) */}
        <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-amber-400 shadow-[0px_0px_10px_#fcd34d] z-0"></div>

        <div className="space-y-12">
          {timelinePoints.map((point, idx) => (
            <div key={idx} className="relative z-10 flex items-start gap-6 group">
              {/* Point Node */}
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl border-4 transition shadow-lg ${idx === timelinePoints.length - 1 ? 'bg-teal-700 border-teal-200 text-teal-50 scale-110' : 'bg-amber-100 border-amber-300 text-amber-800'}`} style={{ borderRadius: '6px 12px 6px 12px' }}>
                 {idx === timelinePoints.length - 1 ? <Rocket size={20} /> : <Milestone size={18} />}
              </div>

              {/* Data Placard */}
              <div className="placard p-6 flex-grow bg-white hover:border-amber-400 transform group-hover:translate-x-2 transition shadow-[4px_6px_0px_#d97706]" style={{ borderRadius: '8px 24px 8px 24px' }}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black text-amber-900 text-lg uppercase tracking-widest font-serif-custom">
                    Stage: {point.stage}
                  </h4>
                  <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                    <CalendarDays size={12} /> {new Date(point.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-stone-600 font-sans-custom font-medium italic text-sm leading-relaxed border-l-2 border-amber-200 pl-4 py-1">
                  {point.note || `Progressing within the ${point.stage} phase.`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline;

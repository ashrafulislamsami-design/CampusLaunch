import React from 'react';

const CurriculumProgressBar = ({ percentage = 0, label = '' }) => {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={label || `Course progress: ${percentage}%`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">{label}</span>
          <span className="text-sm font-black text-amber-900">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: percentage === 100
              ? 'linear-gradient(90deg, #0f766e, #14b8a6)'
              : 'linear-gradient(90deg, #d97706, #f59e0b)',
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(CurriculumProgressBar);

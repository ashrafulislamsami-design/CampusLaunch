import React from 'react';

const ProgressRing = ({ percentage = 0, size = 56, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage === 100) return '#0f766e';
    if (percentage > 0) return '#d97706';
    return '#d1d5db';
  };

  return (
    <svg
      width={size}
      height={size}
      className="transform -rotate-90"
      aria-label={`${percentage}% complete`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-out"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="transform rotate-90 origin-center fill-stone-700 font-bold"
        style={{ fontSize: size * 0.24 }}
      >
        {percentage}%
      </text>
    </svg>
  );
};

export default React.memo(ProgressRing);

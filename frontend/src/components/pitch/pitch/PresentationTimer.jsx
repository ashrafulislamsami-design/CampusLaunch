import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const PresentationTimer = ({ durationMinutes = 5, isActive = true }) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [isActive, secondsLeft]);

  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;
  const isLow = secondsLeft < 60;
  const isExpired = secondsLeft === 0;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 font-mono font-black text-lg rounded-lg border-2 ${
        isExpired ? 'bg-red-100 border-red-400 text-red-700 animate-pulse'
        : isLow ? 'bg-amber-100 border-amber-400 text-amber-800'
        : 'bg-stone-100 border-stone-300 text-stone-800'
      }`}
      aria-label={`${min} minutes ${sec} seconds remaining`}
      role="timer"
    >
      <Clock size={18} />
      {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
    </div>
  );
};

export default PresentationTimer;

import { useState, useEffect } from 'react';

const EventCountdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        ended: false
      };
    };

    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.ended) {
    return <span className="text-amber-700 font-bold text-sm uppercase tracking-widest">Event has started!</span>;
  }

  const blocks = [
    { val: timeLeft.days, label: 'Days' },
    { val: timeLeft.hours, label: 'Hrs' },
    { val: timeLeft.minutes, label: 'Min' },
    { val: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex gap-3" aria-label="Countdown to event">
      {blocks.map((b) => (
        <div key={b.label} className="text-center">
          <div className="w-14 h-14 bg-stone-900 text-white font-black text-xl flex items-center justify-center rounded-lg shadow-md">
            {String(b.val || 0).padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-1 block">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

export default EventCountdown;

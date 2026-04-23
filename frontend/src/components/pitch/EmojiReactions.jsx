import { useState, useCallback } from 'react';

const EMOJIS = ['👏', '🔥', '💡', '🚀'];

const EmojiReactions = () => {
  const [floaters, setFloaters] = useState([]);

  const addReaction = useCallback((emoji) => {
    const id = Date.now() + Math.random();
    const left = 20 + Math.random() * 60;
    setFloaters(prev => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 2000);
  }, []);

  return (
    <div className="relative">
      {/* Floating emojis */}
      <div className="fixed bottom-24 right-8 w-20 h-64 pointer-events-none z-50" aria-hidden="true">
        {floaters.map(f => (
          <span
            key={f.id}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${f.left}%`,
              animation: 'floatUp 2s ease-out forwards',
              bottom: 0
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {/* Emoji buttons */}
      <div className="flex gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => addReaction(emoji)}
            className="w-10 h-10 flex items-center justify-center text-xl bg-stone-100 hover:bg-amber-100 rounded-full transition-all hover:scale-110 active:scale-95"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default EmojiReactions;

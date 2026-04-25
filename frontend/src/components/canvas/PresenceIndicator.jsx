import { memo } from 'react';

const MAX_VISIBLE = 4;

const PresenceIndicator = ({ activeUsers = [], connected = true }) => {
  const users = activeUsers.slice(0, MAX_VISIBLE);
  const more = Math.max(0, activeUsers.length - MAX_VISIBLE);
  return (
    <div className="flex items-center gap-2" aria-label="Active collaborators">
      <div className="flex -space-x-2">
        {users.map((u) => (
          <div
            key={u.userId}
            title={u.userName}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-black text-white shadow-sm"
            style={{ backgroundColor: u.color || '#0f766e' }}
          >
            {(u.userName || '?').charAt(0).toUpperCase()}
          </div>
        ))}
        {more > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-stone-200 text-stone-700 text-[10px] font-black flex items-center justify-center">
            +{more}
          </div>
        )}
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
          connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}
      >
        {connected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};

export default memo(PresenceIndicator);

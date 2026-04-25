import { memo } from 'react';

// Colored left-bar + floating avatar showing which teammate is editing.
const SectionFocusOverlay = ({ focus }) => {
  if (!focus) return null;
  const initial = (focus.userName || '?').charAt(0).toUpperCase();
  return (
    <>
      <div
        className="absolute inset-y-0 left-0 w-1.5 rounded-l-lg"
        style={{ backgroundColor: focus.color || '#0f766e' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white border border-stone-200 rounded-full pl-1 pr-2 py-0.5 shadow-sm text-[10px] font-bold"
        title={`${focus.userName} is editing`}
      >
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]"
          style={{ backgroundColor: focus.color || '#0f766e' }}
        >
          {initial}
        </span>
        <span className="text-stone-700">editing</span>
      </div>
    </>
  );
};

export default memo(SectionFocusOverlay);

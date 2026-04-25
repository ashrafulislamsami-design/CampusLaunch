import { memo } from 'react';
import { CARD_COLORS } from './canvasConstants';

// Tiny 5-swatch picker used inside StickyCard.
const CardColorPicker = ({ value, onChange }) => (
  <div
    className="flex items-center gap-1 bg-white/90 border border-stone-200 rounded-full px-1 py-1 shadow-sm"
    onClick={(e) => e.stopPropagation()}
  >
    {Object.keys(CARD_COLORS).map((key) => (
      <button
        key={key}
        type="button"
        aria-label={`Set card color ${key}`}
        onClick={() => onChange(key)}
        className={`w-4 h-4 rounded-full ${CARD_COLORS[key].dot} border ${
          value === key ? 'border-stone-800 scale-110' : 'border-white'
        } transition`}
      />
    ))}
  </div>
);

export default memo(CardColorPicker);

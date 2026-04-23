import { memo, useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Palette, GripVertical } from 'lucide-react';
import { CARD_COLORS } from './canvasConstants';
import CardColorPicker from './CardColorPicker';

// A single sticky-note card. Tilts slightly for a whiteboard feel and supports
// inline edit, color change, delete and drag-reorder.
function StickyCard({
  card,
  sectionKey,
  readOnly = false,
  onEdit,
  onDelete,
  onColorChange,
  dragHandleProps = {},
  onDragStart,
  onDragOver,
  onDrop
}) {
  const [editing, setEditing] = useState(!card.content);
  const [text, setText] = useState(card.content || '');
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef(null);
  const commitTimerRef = useRef(null);

  useEffect(() => {
    setText(card.content || '');
  }, [card.content]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  // Auto-grow textarea.
  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Debounced commit so we don't spam the network on every keystroke.
  const scheduleCommit = (value) => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      if (value !== card.content) onEdit?.(card._id, sectionKey, value);
    }, 500);
  };

  const commitNow = (value) => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    if (value !== card.content) onEdit?.(card._id, sectionKey, value);
  };

  const rotation = (() => {
    const n = (card._id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((n % 5) - 2) * 0.7; // -1.4 to +1.4 deg
  })();

  const color = CARD_COLORS[card.color] || CARD_COLORS.yellow;

  return (
    <article
      draggable={!readOnly}
      onDragStart={(e) => onDragStart?.(e, card._id)}
      onDragOver={(e) => onDragOver?.(e, card._id)}
      onDrop={(e) => onDrop?.(e, card._id)}
      aria-label={`Sticky card: ${card.content?.slice(0, 40) || 'empty'}`}
      className={`group relative ${color.bg} ${color.border} border-2 rounded-md p-3 shadow-[2px_3px_0_rgba(0,0,0,0.08)] hover:shadow-[3px_5px_0_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all select-none`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Color dot */}
      <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ${color.dot} shadow`} />

      {/* Drag handle */}
      {!readOnly && (
        <div
          {...dragHandleProps}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-70 cursor-grab"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} className="text-stone-600" />
        </div>
      )}

      {editing && !readOnly ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize(e.target);
            scheduleCommit(e.target.value);
          }}
          onBlur={() => {
            setEditing(false);
            commitNow(text);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              setEditing(false);
              commitNow(text);
            }
          }}
          className="w-full bg-transparent outline-none text-[13px] leading-snug resize-none text-stone-800 font-medium"
          rows={Math.max(2, Math.ceil((text.length || 10) / 22))}
          maxLength={280}
          aria-label="Edit card"
        />
      ) : (
        <p
          onClick={() => !readOnly && setEditing(true)}
          className="text-[13px] leading-snug text-stone-800 font-medium cursor-text whitespace-pre-wrap min-h-[1.5rem]"
        >
          {card.content || <span className="italic text-stone-400">Click to add…</span>}
        </p>
      )}

      {!readOnly && (
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker((v) => !v);
              }}
              className="p-1 rounded hover:bg-black/5 text-stone-600"
              aria-label="Change color"
              title="Change color"
            >
              <Palette size={13} />
            </button>
            {showPicker && (
              <div className="absolute top-6 left-0 z-10">
                <CardColorPicker
                  value={card.color}
                  onChange={(c) => {
                    onColorChange?.(card._id, sectionKey, c);
                    setShowPicker(false);
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-1 rounded hover:bg-black/5 text-stone-600"
              aria-label="Edit card"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this card?')) onDelete?.(card._id, sectionKey);
              }}
              className="p-1 rounded hover:bg-red-100 text-red-600"
              aria-label="Delete card"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default memo(StickyCard);

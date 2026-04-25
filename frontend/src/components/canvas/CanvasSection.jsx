import { memo } from 'react';
import { Plus, Lock, Unlock, MessageSquare } from 'lucide-react';
import { SECTION_META, SECTION_PROMPTS } from './canvasConstants';
import DragDropCardList from './DragDropCardList';
import SectionFocusOverlay from './SectionFocusOverlay';

function CanvasSection({
  sectionKey,
  section = { cards: [] },
  focus,
  commentCount = 0,
  readOnly = false,
  currentUserId,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onColorChange,
  onReorder,
  onToggleLock,
  onOpenComments,
  onFocus,
  onBlur
}) {
  const meta = SECTION_META[sectionKey];
  const cards = section.cards || [];
  const lockedBy = section.lockedBy;
  const locked = !!lockedBy;
  const lockedByMe = locked && currentUserId && lockedBy.toString?.() === currentUserId;

  return (
    <section
      aria-label={meta.label}
      className={`relative flex flex-col ${meta.bg} border-2 ${meta.border} rounded-lg overflow-hidden min-h-[180px]`}
      onFocusCapture={() => onFocus?.(sectionKey)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onBlur?.(sectionKey);
      }}
    >
      <SectionFocusOverlay focus={focus} />

      <header className="flex items-center justify-between px-3 py-2 bg-white/40 border-b border-black/5">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className={`font-black uppercase tracking-wider text-[11px] ${meta.accent} truncate`}>
            {meta.label}
          </h3>
          <span className="text-[10px] bg-white/80 text-stone-700 border border-stone-200 rounded-full px-1.5 font-bold">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!readOnly && (
            <button
              type="button"
              onClick={() => onToggleLock?.(sectionKey)}
              className={`p-1 rounded ${locked ? 'text-red-600' : 'text-stone-500'} hover:bg-black/5`}
              aria-label={locked ? 'Unlock section' : 'Lock section'}
              title={locked ? (lockedByMe ? 'Locked by you' : 'Locked') : 'Lock section'}
            >
              {locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenComments?.(sectionKey)}
            className="p-1 rounded text-stone-500 hover:bg-black/5 flex items-center gap-0.5"
            aria-label={`Open comments (${commentCount})`}
            title="Comments"
          >
            <MessageSquare size={13} />
            {commentCount > 0 && (
              <span className="text-[9px] font-bold text-stone-700">{commentCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 px-2 py-2 overflow-y-auto canvas-section-scroll">
        {cards.length === 0 ? (
          <ul className="space-y-1 text-[11px] italic text-stone-500 px-1 pt-1">
            {(SECTION_PROMPTS[sectionKey] || []).map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        ) : (
          <DragDropCardList
            cards={cards}
            sectionKey={sectionKey}
            readOnly={readOnly || (locked && !lockedByMe)}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            onColorChange={onColorChange}
            onReorder={onReorder}
          />
        )}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={() => onAddCard?.(sectionKey)}
          disabled={locked && !lockedByMe}
          className="m-2 mt-0 border-2 border-dashed border-stone-400/70 hover:border-stone-700 hover:bg-white/50 text-stone-600 rounded-md py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Add card to ${meta.label}`}
        >
          <Plus size={13} /> Add card
        </button>
      )}
    </section>
  );
}

export default memo(CanvasSection);

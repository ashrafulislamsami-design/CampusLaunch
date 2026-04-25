import { memo } from 'react';
import { SECTION_KEYS, SECTION_GRID } from './canvasConstants';
import CanvasSection from './CanvasSection';

// Strategyzer-proportioned 5×3 grid holding all 9 BMC sections.
// On mobile, collapses to a single-column stack.
function CanvasGrid({
  sections = {},
  sectionFocus = {},
  commentCounts = {},
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
  return (
    <div
      className="w-full min-h-[520px] md:min-h-[640px] lg:h-[calc(100vh-180px)] bg-white rounded-xl border-2 border-stone-300 shadow-inner p-2 md:p-3"
      role="group"
      aria-label="Business Model Canvas Grid"
    >
      <div
        className="
          grid gap-2
          grid-cols-1 grid-rows-9
          md:grid-cols-5 md:grid-rows-3
          h-full
        "
      >
        {SECTION_KEYS.map((key) => (
          <div key={key} className={`${SECTION_GRID[key]} min-h-[160px]`}>
            <CanvasSection
              sectionKey={key}
              section={sections[key]}
              focus={sectionFocus[key]}
              commentCount={commentCounts[key] || 0}
              readOnly={readOnly}
              currentUserId={currentUserId}
              onAddCard={onAddCard}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onColorChange={onColorChange}
              onReorder={onReorder}
              onToggleLock={onToggleLock}
              onOpenComments={onOpenComments}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(CanvasGrid);

import { useRef } from 'react';
import StickyCard from './StickyCard';

// Lightweight native HTML5 drag-and-drop list (no extra dependency).
// Provides reorder within a single section.
const DragDropCardList = ({
  cards = [],
  sectionKey,
  readOnly = false,
  onEdit,
  onDelete,
  onColorChange,
  onReorder
}) => {
  const draggingIdRef = useRef(null);

  const handleDragStart = (e, id) => {
    draggingIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, overId) => {
    e.preventDefault();
    const draggingId = draggingIdRef.current;
    draggingIdRef.current = null;
    if (!draggingId || draggingId === overId) return;
    const ids = cards.map((c) => c._id);
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(overId);
    if (from === -1 || to === -1) return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, draggingId);
    onReorder?.(sectionKey, next);
  };

  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <StickyCard
          key={card._id}
          card={card}
          sectionKey={sectionKey}
          readOnly={readOnly}
          onEdit={onEdit}
          onDelete={onDelete}
          onColorChange={onColorChange}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

export default DragDropCardList;

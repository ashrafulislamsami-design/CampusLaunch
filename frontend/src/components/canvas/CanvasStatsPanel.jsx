import { memo, useState } from 'react';
import { BarChart3, ChevronRight, ChevronLeft } from 'lucide-react';

const CanvasStatsPanel = ({ sections = {}, activeUsers = [], versionCount = 0, lastSavedAt, commentCounts = {} }) => {
  const [open, setOpen] = useState(false);
  const keys = Object.keys(sections);
  const totalCards = keys.reduce((sum, k) => sum + (sections[k]?.cards?.length || 0), 0);
  const sectionsFilled = keys.filter((k) => (sections[k]?.cards || []).length > 0).length;
  const totalComments = Object.values(commentCounts).reduce((a, b) => a + b, 0);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-2 top-1/2 -translate-y-1/2 z-30 bg-white border-2 border-stone-300 rounded-l-lg px-2 py-3 shadow hover:bg-amber-50"
        aria-label="Open stats panel"
      >
        <ChevronLeft size={14} />
      </button>
    );
  }

  return (
    <aside className="fixed right-2 top-1/2 -translate-y-1/2 z-30 w-56 bg-white border-2 border-stone-300 rounded-lg shadow-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-black uppercase tracking-widest text-stone-700 flex items-center gap-1">
          <BarChart3 size={14} /> Stats
        </h5>
        <button onClick={() => setOpen(false)} aria-label="Close stats" className="p-0.5 hover:bg-stone-100 rounded">
          <ChevronRight size={14} />
        </button>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div className="flex justify-between"><dt className="text-stone-500">Cards</dt><dd className="font-bold">{totalCards}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-500">Sections filled</dt><dd className="font-bold">{sectionsFilled}/9</dd></div>
        <div className="flex justify-between"><dt className="text-stone-500">Collaborators</dt><dd className="font-bold">{activeUsers.length}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-500">Versions</dt><dd className="font-bold">{versionCount}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-500">Comments</dt><dd className="font-bold">{totalComments}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-500">Last saved</dt><dd className="font-bold">{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : '—'}</dd></div>
      </dl>
    </aside>
  );
};

export default memo(CanvasStatsPanel);

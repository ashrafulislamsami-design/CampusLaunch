import { memo } from 'react';
import { Clock, RotateCcw, Eye } from 'lucide-react';

const VersionHistoryItem = ({ version, onPreview, onRestore }) => (
  <div className="border border-stone-200 rounded p-2 hover:bg-amber-50/50 transition">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex w-6 h-6 rounded-full bg-amber-100 border border-amber-300 items-center justify-center text-amber-800 text-[10px] font-black flex-shrink-0">
          v{version.versionNumber}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-bold text-stone-800 truncate">
            {version.label || (version.isAutoSave ? 'Auto-save' : 'Manual save')}
          </div>
          <div className="text-[10px] text-stone-500 flex items-center gap-1">
            <Clock size={10} />
            {new Date(version.savedAt).toLocaleString()} · {version.savedBy?.name || 'System'}
          </div>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={() => onPreview?.(version)}
        className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded flex items-center justify-center gap-1"
      >
        <Eye size={11} /> Preview
      </button>
      <button
        onClick={() => onRestore?.(version)}
        className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-teal-800 hover:bg-teal-900 text-white px-2 py-1 rounded flex items-center justify-center gap-1"
      >
        <RotateCcw size={11} /> Restore
      </button>
    </div>
  </div>
);

export default memo(VersionHistoryItem);

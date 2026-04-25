import { useEffect, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import canvasService from '../../services/canvasService';
import CanvasGrid from './CanvasGrid';

// Read-only preview of a saved canvas version. Reuses CanvasGrid.
const VersionPreviewModal = ({ token, teamId, version, onClose, onRestore }) => {
  const [fullVersion, setFullVersion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    canvasService
      .getVersion(token, teamId, version._id)
      .then((data) => mounted && setFullVersion(data))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [token, teamId, version._id]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Version preview"
      onClick={onClose}
    >
      <div
        className="bg-stone-50 rounded-xl shadow-2xl max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-3 border-b bg-amber-50 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Preview</div>
            <h4 className="font-black text-amber-900 text-lg">
              Version {version.versionNumber}
              {version.label ? <span className="ml-2 font-normal italic text-stone-600">— {version.label}</span> : null}
            </h4>
            <div className="text-xs text-stone-500">
              Saved {new Date(version.savedAt).toLocaleString()}
              {version.savedBy?.name && <> by {version.savedBy.name}</>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRestore?.(version)}
              className="bg-teal-800 text-white px-3 py-1.5 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:bg-teal-900"
            >
              <RotateCcw size={13} /> Restore this version
            </button>
            <button onClick={onClose} aria-label="Close preview" className="p-1 hover:bg-white rounded">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 bg-white">
          {loading || !fullVersion ? (
            <div className="animate-pulse h-[500px] bg-stone-100 rounded" />
          ) : (
            <CanvasGrid sections={fullVersion.sectionsSnapshot || {}} readOnly />
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionPreviewModal;

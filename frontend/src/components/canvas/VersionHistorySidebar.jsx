import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import canvasService from '../../services/canvasService';
import VersionHistoryItem from './VersionHistoryItem';
import VersionPreviewModal from './VersionPreviewModal';

const VersionHistorySidebar = ({ token, teamId, onClose, onRestored }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  const refresh = () => {
    setLoading(true);
    canvasService
      .listVersions(token, teamId)
      .then(setVersions)
      .catch(() => toast.error('Failed to load versions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const handleRestore = async (v) => {
    if (!window.confirm(`Restore v${v.versionNumber} from ${new Date(v.savedAt).toLocaleString()}? This will replace your current canvas (a backup will be saved first).`)) return;
    try {
      const result = await canvasService.restoreVersion(token, teamId, v._id);
      toast.success(`Restored v${v.versionNumber}`);
      onRestored?.(result.canvas);
      refresh();
    } catch {
      toast.error('Restore failed');
    }
  };

  return (
    <aside className="fixed top-0 right-0 h-screen w-full sm:w-[380px] bg-white border-l border-stone-300 shadow-2xl z-40 flex flex-col" aria-label="Version history">
      <header className="px-4 py-3 border-b border-stone-200 bg-amber-50 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Version</div>
          <h4 className="font-black text-amber-900">History</h4>
        </div>
        <button onClick={onClose} aria-label="Close history" className="p-1 hover:bg-white rounded">
          <X size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-14 bg-stone-100 rounded" />
            <div className="h-14 bg-stone-100 rounded" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-8">No saved versions yet.</p>
        ) : (
          versions.map((v) => (
            <VersionHistoryItem
              key={v._id}
              version={v}
              onPreview={setPreview}
              onRestore={handleRestore}
            />
          ))
        )}
      </div>

      {preview && (
        <VersionPreviewModal
          token={token}
          teamId={teamId}
          version={preview}
          onClose={() => setPreview(null)}
          onRestore={handleRestore}
        />
      )}
    </aside>
  );
};

export default VersionHistorySidebar;

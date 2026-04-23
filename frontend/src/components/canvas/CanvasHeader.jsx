import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Save,
  History,
  Share2,
  Download,
  Maximize,
  Minimize,
  ArrowLeft,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import CompletionMeter from './CompletionMeter';
import PresenceIndicator from './PresenceIndicator';

const CanvasHeader = ({
  teamName,
  teamId,
  sections,
  activeUsers,
  connected,
  saving,
  lastSavedAt,
  onSaveVersion,
  onOpenHistory,
  onOpenShare,
  onOpenTemplate,
  onExportPDF,
  onExportPNG,
  exporting,
  fullscreen,
  onToggleFullscreen,
  readOnly
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const saveStatus = saving
    ? 'Saving…'
    : lastSavedAt
    ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Not saved';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b-[3px] border-amber-200/60 shadow-sm">
      <div className="max-w-[1880px] mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {teamId && !readOnly && (
            <Link
              to={`/teams/dashboard/${teamId}`}
              className="p-2 rounded border border-stone-200 text-stone-600 hover:bg-stone-100"
              aria-label="Back to team dashboard"
              title="Back to team"
            >
              <ArrowLeft size={16} />
            </Link>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 rounded-lg flex items-center justify-center text-amber-900">
              <LayoutGrid size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black uppercase tracking-widest text-amber-900 leading-tight">
                Business Model Canvas
              </h1>
              <div className="text-xs text-stone-600 truncate">{teamName || 'Team'}</div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block flex-1 max-w-sm mx-auto">
          <CompletionMeter sections={sections} />
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
          {!readOnly && (
            <PresenceIndicator activeUsers={activeUsers} connected={connected} />
          )}

          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
              saving ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
            }`}
            aria-live="polite"
          >
            {saveStatus}
          </span>

          {!readOnly && (
            <>
              <button
                type="button"
                onClick={onSaveVersion}
                className="px-3 py-1.5 rounded bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                aria-label="Save version"
              >
                <Save size={13} /> <span className="hidden sm:inline">Save Version</span>
              </button>
              <button
                type="button"
                onClick={onOpenHistory}
                className="px-3 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                aria-label="Version history"
              >
                <History size={13} /> <span className="hidden sm:inline">History</span>
              </button>
              <button
                type="button"
                onClick={onOpenTemplate}
                className="px-3 py-1.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                aria-label="Use template"
              >
                <Sparkles size={13} /> <span className="hidden md:inline">Template</span>
              </button>
              <button
                type="button"
                onClick={onOpenShare}
                className="px-3 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                aria-label="Share"
              >
                <Share2 size={13} /> <span className="hidden sm:inline">Share</span>
              </button>
            </>
          )}

          <div ref={exportRef} className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((v) => !v)}
              disabled={exporting}
              className="px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 disabled:opacity-40"
              aria-label="Export"
            >
              <Download size={13} /> <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export'}</span>
              <ChevronDown size={12} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-stone-200 rounded shadow-lg w-40 z-30">
                <button
                  onClick={() => {
                    setExportOpen(false);
                    onExportPDF?.();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-stone-100"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setExportOpen(false);
                    onExportPNG?.();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-stone-100 border-t border-stone-100"
                >
                  Download PNG
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded border border-stone-200 hover:bg-stone-100"
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      <div className="lg:hidden px-4 pb-3">
        <CompletionMeter sections={sections} compact />
      </div>
    </header>
  );
};

export default CanvasHeader;

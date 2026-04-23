import { X, Sparkles } from 'lucide-react';
import { SAMPLE_TEMPLATE, SECTION_META } from './canvasConstants';

// Modal that previews a starter template and lets the user apply it in one click.
const CanvasTemplateModal = ({ onClose, onApply }) => (
  <div
    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Canvas template"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <header className="px-5 py-3 border-b flex items-center justify-between bg-gradient-to-r from-amber-50 to-amber-100">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Template</div>
          <h4 className="font-black text-amber-900 text-lg flex items-center gap-2">
            <Sparkles size={18} /> EdTech Startup Starter
          </h4>
          <p className="text-xs text-stone-600">Pre-fills all 9 sections with a Bangladeshi edtech example. You can edit everything after applying.</p>
        </div>
        <button onClick={onClose} aria-label="Close template" className="p-1 hover:bg-white/50 rounded">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(SAMPLE_TEMPLATE).map(([key, items]) => {
          const meta = SECTION_META[key];
          return (
            <div key={key} className={`${meta.bg} border-2 ${meta.border} rounded p-3`}>
              <div className={`text-[10px] uppercase tracking-widest font-black ${meta.accent} mb-1.5`}>
                {meta.label}
              </div>
              <ul className="space-y-1">
                {items.map((it) => (
                  <li key={it} className="text-xs text-stone-800 bg-white/70 border border-black/5 rounded px-2 py-1">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <footer className="p-3 border-t bg-stone-50 flex items-center justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-100 rounded">
          Cancel
        </button>
        <button
          onClick={onApply}
          className="px-4 py-2 text-sm font-bold text-white bg-teal-800 hover:bg-teal-900 rounded flex items-center gap-1"
        >
          <Sparkles size={14} /> Apply template
        </button>
      </footer>
    </div>
  </div>
);

export default CanvasTemplateModal;

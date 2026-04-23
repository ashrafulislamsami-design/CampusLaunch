import { useState } from 'react';
import { X, Link2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import canvasService from '../../services/canvasService';

const ShareModal = ({ token, teamId, canvas, onClose, onUpdate }) => {
  const [enabled, setEnabled] = useState(!!canvas?.shareEnabled);
  const [shareToken, setShareToken] = useState(canvas?.shareToken || '');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const publicUrl = shareToken ? `${window.location.origin}/canvas/share/${shareToken}` : '';

  const toggle = async () => {
    setBusy(true);
    try {
      if (enabled) {
        await canvasService.disableShare(token, teamId);
        setEnabled(false);
        onUpdate?.({ shareEnabled: false });
        toast.success('Sharing disabled');
      } else {
        const res = await canvasService.enableShare(token, teamId);
        setEnabled(true);
        setShareToken(res.shareToken);
        onUpdate?.({ shareEnabled: true, shareToken: res.shareToken });
        toast.success('Share link generated');
      }
    } catch {
      toast.error('Failed to update sharing');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share canvas"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-3 border-b flex items-center justify-between">
          <h4 className="font-black text-stone-900 flex items-center gap-2">
            <Link2 size={18} /> Share canvas
          </h4>
          <button onClick={onClose} aria-label="Close share" className="p-1 hover:bg-stone-100 rounded">
            <X size={18} />
          </button>
        </header>
        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-600">
            Anyone with the link can view a read-only version of this canvas. You can disable it anytime.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              disabled={busy}
              className={`px-3 py-2 rounded font-bold text-xs uppercase tracking-wider transition ${
                enabled ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-teal-800 hover:bg-teal-900 text-white'
              } disabled:opacity-50`}
            >
              {enabled ? 'Disable sharing' : 'Enable sharing'}
            </button>
            <span className={`text-xs font-bold ${enabled ? 'text-emerald-700' : 'text-stone-500'}`}>
              {enabled ? 'Public link is ON' : 'Currently private'}
            </span>
          </div>
          {enabled && publicUrl && (
            <div className="flex items-center gap-2 border border-stone-300 rounded bg-stone-50 px-2 py-1">
              <input
                readOnly
                value={publicUrl}
                className="flex-1 bg-transparent text-xs outline-none"
                aria-label="Public canvas URL"
              />
              <button onClick={copy} className="p-1 hover:bg-stone-200 rounded" aria-label="Copy link">
                {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

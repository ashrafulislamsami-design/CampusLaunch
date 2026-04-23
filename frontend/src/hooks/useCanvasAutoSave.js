import { useEffect, useRef, useState } from 'react';

// Auto-save every 30 seconds when the dirty flag is set. The caller is
// responsible for flipping `markDirty()` whenever the canvas changes.
export default function useCanvasAutoSave({ onSave, intervalMs = 30000, enabled = true }) {
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(async () => {
      if (!dirtyRef.current || savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      try {
        await onSave({ isAutoSave: true });
        dirtyRef.current = false;
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err?.message || err);
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [onSave, intervalMs, enabled]);

  return {
    markDirty: () => { dirtyRef.current = true; },
    saveNow: async (opts = {}) => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      try {
        await onSave(opts);
        dirtyRef.current = false;
        setLastSavedAt(new Date());
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    lastSavedAt,
    saving
  };
}

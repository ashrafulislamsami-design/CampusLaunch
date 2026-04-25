import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import canvasService from '../services/canvasService';
import { SECTION_KEYS, SAMPLE_TEMPLATE } from '../components/canvas/canvasConstants';
import useCanvasSocket from '../hooks/useCanvasSocket';
import useCanvasAutoSave from '../hooks/useCanvasAutoSave';
import useCanvasPDF from '../hooks/useCanvasPDF';
import CanvasHeader from '../components/canvas/CanvasHeader';
import CanvasGrid from '../components/canvas/CanvasGrid';
import CanvasStatsPanel from '../components/canvas/CanvasStatsPanel';
import SectionComments from '../components/canvas/SectionComments';
import VersionHistorySidebar from '../components/canvas/VersionHistorySidebar';
import CanvasTemplateModal from '../components/canvas/CanvasTemplateModal';
import ShareModal from '../components/canvas/ShareModal';
import CanvasPDFExport from '../components/canvas/CanvasPDFExport';

const emptySections = () =>
  SECTION_KEYS.reduce((acc, key) => {
    acc[key] = { cards: [], lockedBy: null };
    return acc;
  }, {});

const CanvasBuilderPage = () => {
  const { teamId, shareToken } = useParams();
  const { token, user } = useContext(AuthContext);
  const readOnly = !!shareToken;

  const [loading, setLoading] = useState(true);
  const [canvas, setCanvas] = useState(null);
  const [team, setTeam] = useState(null);
  const [sections, setSections] = useState(emptySections());
  const [error, setError] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [openCommentsSection, setOpenCommentsSection] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [versionCount, setVersionCount] = useState(0);

  // Real-time collaboration.
  const { connected, activeUsers, sectionFocus, onEvent, emit } = useCanvasSocket({
    teamId,
    user,
    enabled: !readOnly && !!user?._id
  });

  const { exportToPDF, exportToPNG, exporting } = useCanvasPDF();

  // Load the canvas (authenticated or public).
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const loader = readOnly
      ? canvasService.getPublicCanvas(shareToken)
      : canvasService.getCanvas(token, teamId);
    loader
      .then((data) => {
        if (!mounted) return;
        setCanvas(data.canvas);
        setTeam(data.team);
        setSections(data.canvas?.sections || emptySections());
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err?.response?.data?.message || 'Failed to load canvas';
        setError(msg);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [readOnly, shareToken, teamId, token]);

  // Auto-save: snapshot current sections as a new version every 30s while dirty.
  const doSave = useCallback(
    async ({ isAutoSave = false, label = '' } = {}) => {
      if (readOnly || !teamId) return;
      const created = await canvasService.createVersion(token, teamId, label, isAutoSave);
      setVersionCount((n) => n + 1);
      emit('canvas:saved', { versionId: created._id, savedAt: created.savedAt });
    },
    [readOnly, teamId, token, emit]
  );
  const { markDirty, saveNow, lastSavedAt, saving } = useCanvasAutoSave({
    onSave: doSave,
    enabled: !readOnly
  });

  // Load version count for stats panel.
  useEffect(() => {
    if (readOnly || !teamId) return;
    canvasService.listVersions(token, teamId).then((v) => setVersionCount(v.length)).catch(() => {});
  }, [readOnly, teamId, token]);

  // ----- Card mutations -----
  const replaceSection = (key, updater) =>
    setSections((prev) => {
      const current = prev[key] || { cards: [], lockedBy: null };
      const next = updater(current);
      return { ...prev, [key]: next };
    });

  const handleAddCard = async (key) => {
    if (readOnly) return;
    try {
      const { card } = await canvasService.addCard(token, teamId, key, '', 'yellow');
      replaceSection(key, (s) => ({ ...s, cards: [...(s.cards || []), card] }));
      emit('canvas:card:add', { teamId, sectionKey: key, card });
      markDirty();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add card');
    }
  };

  const handleEditCard = async (cardId, key, content) => {
    if (readOnly) return;
    replaceSection(key, (s) => ({
      ...s,
      cards: s.cards.map((c) => (c._id === cardId ? { ...c, content } : c))
    }));
    try {
      await canvasService.updateCard(token, teamId, cardId, key, { content });
      emit('canvas:card:update', { teamId, sectionKey: key, cardId, content });
      markDirty();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save card');
    }
  };

  const handleDeleteCard = async (cardId, key) => {
    if (readOnly) return;
    replaceSection(key, (s) => ({ ...s, cards: s.cards.filter((c) => c._id !== cardId) }));
    try {
      await canvasService.deleteCard(token, teamId, cardId, key);
      emit('canvas:card:delete', { teamId, sectionKey: key, cardId });
      markDirty();
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleColorChange = async (cardId, key, color) => {
    if (readOnly) return;
    replaceSection(key, (s) => ({
      ...s,
      cards: s.cards.map((c) => (c._id === cardId ? { ...c, color } : c))
    }));
    try {
      await canvasService.updateCard(token, teamId, cardId, key, { color });
      emit('canvas:card:update', { teamId, sectionKey: key, cardId, color });
      markDirty();
    } catch {
      toast.error('Failed to update color');
    }
  };

  const handleReorder = async (key, cardOrder) => {
    if (readOnly) return;
    replaceSection(key, (s) => {
      const byId = new Map(s.cards.map((c) => [c._id, c]));
      return { ...s, cards: cardOrder.map((id) => byId.get(id)).filter(Boolean) };
    });
    try {
      await canvasService.reorderSection(token, teamId, key, cardOrder);
      emit('canvas:card:reorder', { teamId, sectionKey: key, cardOrder });
      markDirty();
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const handleToggleLock = async (key) => {
    if (readOnly) return;
    try {
      const res = await canvasService.toggleLock(token, teamId, key);
      replaceSection(key, (s) => ({ ...s, lockedBy: res.lockedBy }));
      toast.success(res.lockedBy ? 'Section locked' : 'Section unlocked');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cannot toggle lock');
    }
  };

  const handleSaveVersion = async () => {
    const label = window.prompt('Optional label for this version?') || '';
    try {
      await saveNow({ isAutoSave: false, label });
      toast.success('Version saved');
    } catch {
      toast.error('Failed to save version');
    }
  };

  const handleApplyTemplate = async () => {
    if (!window.confirm('Pre-fill the 9 sections with template content? Existing cards will be kept and new ones added below.')) return;
    setTemplateOpen(false);
    try {
      for (const key of SECTION_KEYS) {
        for (const content of SAMPLE_TEMPLATE[key] || []) {
          // eslint-disable-next-line no-await-in-loop
          const { card } = await canvasService.addCard(token, teamId, key, content, 'yellow');
          replaceSection(key, (s) => ({ ...s, cards: [...(s.cards || []), card] }));
        }
      }
      markDirty();
      toast.success('Template applied');
    } catch {
      toast.error('Failed to apply template');
    }
  };

  const handleExportPDF = async () => {
    const keys = Object.keys(sections);
    const filled = keys.filter((k) => (sections[k]?.cards || []).length > 0).length;
    if (filled < 3) {
      toast('Add content to at least 3 sections for a useful export.', { icon: '⚠️' });
    }
    try {
      await exportToPDF({ teamName: team?.name || 'Team' });
    } catch (err) {
      console.error(err);
      toast.error('PDF export failed — try again');
    }
  };

  const handleExportPNG = async () => {
    try {
      await exportToPNG({ teamName: team?.name || 'Team' });
    } catch {
      toast.error('PNG export failed');
    }
  };

  // Fullscreen toggle using the native API.
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {});
    }
  };
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // ----- Incoming real-time events -----
  useEffect(() => {
    if (readOnly) return;
    onEvent('canvas:card:added', ({ sectionKey, card }) => {
      replaceSection(sectionKey, (s) => ({ ...s, cards: [...(s.cards || []), card] }));
    });
    onEvent('canvas:card:updated', ({ sectionKey, cardId, content, color }) => {
      replaceSection(sectionKey, (s) => ({
        ...s,
        cards: s.cards.map((c) =>
          c._id === cardId
            ? { ...c, ...(content !== undefined ? { content } : {}), ...(color ? { color } : {}) }
            : c
        )
      }));
    });
    onEvent('canvas:card:deleted', ({ sectionKey, cardId }) => {
      replaceSection(sectionKey, (s) => ({ ...s, cards: s.cards.filter((c) => c._id !== cardId) }));
    });
    onEvent('canvas:card:reordered', ({ sectionKey, cardOrder }) => {
      replaceSection(sectionKey, (s) => {
        const byId = new Map(s.cards.map((c) => [c._id, c]));
        return { ...s, cards: cardOrder.map((id) => byId.get(id)).filter(Boolean) };
      });
    });
  }, [onEvent, readOnly]);

  // Section focus broadcasts.
  const focusTimerRef = useRef(null);
  const handleSectionFocus = (key) => {
    if (readOnly || !user) return;
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    emit('canvas:section:focus', { teamId, sectionKey: key, userId: user._id, userName: user.name });
  };
  const handleSectionBlur = (key) => {
    if (readOnly || !user) return;
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      emit('canvas:section:blur', { teamId, sectionKey: key, userId: user._id });
    }, 200);
  };

  const updateCommentCount = useCallback((key, count) => {
    setCommentCounts((prev) => ({ ...prev, [key]: count }));
  }, []);

  const totalComments = useMemo(
    () => Object.values(commentCounts).reduce((a, b) => a + b, 0),
    [commentCounts]
  );

  // ----- Render -----

  if (loading) {
    return (
      <div className="max-w-[1880px] mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-stone-200 rounded" />
          <div className="h-[560px] bg-stone-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 bg-white border-2 border-amber-200 rounded-xl text-center">
        <h2 className="text-xl font-black text-amber-900 mb-2">Canvas Unavailable</h2>
        <p className="text-stone-600 text-sm">{error}</p>
        {!readOnly && (
          <Link
            to="/teams/create"
            className="inline-block mt-4 bg-teal-800 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-teal-900"
          >
            Find or create a team
          </Link>
        )}
      </div>
    );
  }

  const teamName = team?.name || 'Team';

  return (
    <div className="min-h-screen bg-stone-50">
      <CanvasHeader
        teamName={teamName}
        teamId={team?._id}
        sections={sections}
        activeUsers={activeUsers}
        connected={connected}
        saving={saving}
        lastSavedAt={lastSavedAt}
        onSaveVersion={handleSaveVersion}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenShare={() => setShareOpen(true)}
        onOpenTemplate={() => setTemplateOpen(true)}
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        exporting={exporting}
        fullscreen={fullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        readOnly={readOnly}
      />

      {!connected && !readOnly && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-center text-xs py-1.5 font-bold">
          Offline — changes will sync when you reconnect.
        </div>
      )}

      <main className="max-w-[1880px] mx-auto px-2 md:px-4 py-4">
        <CanvasGrid
          sections={sections}
          sectionFocus={sectionFocus}
          commentCounts={commentCounts}
          readOnly={readOnly}
          currentUserId={user?._id}
          onAddCard={handleAddCard}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onColorChange={handleColorChange}
          onReorder={handleReorder}
          onToggleLock={handleToggleLock}
          onOpenComments={setOpenCommentsSection}
          onFocus={handleSectionFocus}
          onBlur={handleSectionBlur}
        />
      </main>

      {/* Hidden export clone for crisp PDF/PNG capture. */}
      <CanvasPDFExport sections={sections} teamName={teamName} />

      {!readOnly && (
        <CanvasStatsPanel
          sections={sections}
          activeUsers={activeUsers}
          versionCount={versionCount}
          lastSavedAt={lastSavedAt}
          commentCounts={commentCounts}
        />
      )}

      {openCommentsSection && !readOnly && (
        <SectionComments
          token={token}
          teamId={teamId}
          sectionKey={openCommentsSection}
          currentUserId={user?._id}
          onClose={() => setOpenCommentsSection(null)}
          onCountChange={updateCommentCount}
        />
      )}

      {historyOpen && !readOnly && (
        <VersionHistorySidebar
          token={token}
          teamId={teamId}
          onClose={() => setHistoryOpen(false)}
          onRestored={(c) => {
            setCanvas(c);
            setSections(c.sections);
          }}
        />
      )}

      {templateOpen && !readOnly && (
        <CanvasTemplateModal
          onClose={() => setTemplateOpen(false)}
          onApply={handleApplyTemplate}
        />
      )}

      {shareOpen && !readOnly && (
        <ShareModal
          token={token}
          teamId={teamId}
          canvas={canvas}
          onClose={() => setShareOpen(false)}
          onUpdate={(patch) => setCanvas((c) => ({ ...c, ...patch }))}
        />
      )}
    </div>
  );
};

export default CanvasBuilderPage;

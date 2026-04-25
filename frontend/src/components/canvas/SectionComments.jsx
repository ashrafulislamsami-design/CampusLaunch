import { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import canvasService from '../../services/canvasService';
import { SECTION_META } from './canvasConstants';
import CommentItem from './CommentItem';

const SectionComments = ({ token, teamId, sectionKey, currentUserId, onClose, onCountChange }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!sectionKey) return undefined;
    setLoading(true);
    canvasService
      .listComments(token, teamId, sectionKey)
      .then((data) => {
        if (!mounted) return;
        setComments(data);
        onCountChange?.(sectionKey, data.length);
      })
      .catch(() => mounted && toast.error('Failed to load comments'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey, teamId, token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const created = await canvasService.addComment(token, teamId, sectionKey, text.trim());
      const next = [...comments, created];
      setComments(next);
      onCountChange?.(sectionKey, next.length);
      setText('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = async (id, content) => {
    try {
      const updated = await canvasService.editComment(token, id, content);
      setComments((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch {
      toast.error('Failed to edit');
    }
  };

  const handleDelete = async (id) => {
    try {
      await canvasService.deleteComment(token, id);
      const next = comments.filter((c) => c._id !== id);
      setComments(next);
      onCountChange?.(sectionKey, next.length);
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (!sectionKey) return null;
  const meta = SECTION_META[sectionKey];

  return (
    <aside
      className="fixed top-0 right-0 h-screen w-full sm:w-[380px] bg-white border-l border-stone-300 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right"
      aria-label={`Comments for ${meta?.label}`}
    >
      <header className={`px-4 py-3 border-b border-stone-200 ${meta?.bg || 'bg-stone-100'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Comments</div>
            <h4 className={`font-black ${meta?.accent}`}>{meta?.label}</h4>
          </div>
          <button onClick={onClose} aria-label="Close comments" className="p-1 hover:bg-white/50 rounded">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-14 bg-stone-100 rounded" />
            <div className="h-14 bg-stone-100 rounded" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-8">No comments yet. Start a discussion!</p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <form onSubmit={submit} className="border-t border-stone-200 p-3 flex gap-2 bg-stone-50">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 border border-stone-300 rounded px-3 py-2 text-sm"
          maxLength={1000}
          disabled={posting}
        />
        <button
          type="submit"
          disabled={!text.trim() || posting}
          className="px-3 bg-teal-800 text-white rounded hover:bg-teal-900 disabled:opacity-40"
          aria-label="Post comment"
        >
          <Send size={16} />
        </button>
      </form>
    </aside>
  );
};

export default SectionComments;

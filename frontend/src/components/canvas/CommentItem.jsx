import { memo, useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';

const formatTime = (d) => {
  const date = new Date(d);
  return date.toLocaleString();
};

const CommentItem = ({ comment, currentUserId, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const isAuthor = comment.author?._id === currentUserId;

  const save = async () => {
    if (!text.trim()) return;
    await onEdit?.(comment._id, text.trim());
    setEditing(false);
  };

  return (
    <div className="border-l-2 border-amber-300 pl-3 py-2 bg-amber-50/40 rounded">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-700">
          {comment.author?.name || 'Member'}
          {comment.isEdited && <span className="ml-1 text-[10px] italic text-stone-400">(edited)</span>}
        </span>
        <span className="text-[10px] text-stone-500">{formatTime(comment.createdAt)}</span>
      </div>
      {editing ? (
        <div className="mt-1 flex gap-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border border-stone-300 rounded px-2 py-1 text-sm"
            maxLength={1000}
          />
          <button onClick={save} className="p-1 text-emerald-700" aria-label="Save comment">
            <Check size={16} />
          </button>
          <button onClick={() => setEditing(false)} className="p-1 text-stone-600" aria-label="Cancel edit">
            <X size={16} />
          </button>
        </div>
      ) : (
        <p className="text-sm text-stone-800 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
      )}
      {isAuthor && !editing && (
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-stone-500 hover:text-amber-700 flex items-center gap-0.5"
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this comment?')) onDelete?.(comment._id);
            }}
            className="text-[10px] text-stone-500 hover:text-red-600 flex items-center gap-0.5"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(CommentItem);

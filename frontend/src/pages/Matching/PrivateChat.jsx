import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL as API } from '../../config';
import {
  Send, ArrowLeft, MessageSquare, Loader,
  Pencil, Trash2, Bookmark, BookmarkCheck, Check, X
} from 'lucide-react';
import axios from 'axios';

const PrivateChat = () => {
  const { connectionId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [sending, setSending] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const editInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/private-messages/${connectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data || []);
    } catch (_) {}
  };

  // Init: load partner + messages
  useEffect(() => {
    if (!token || !connectionId) return;

    const init = async () => {
      try {
        setLoading(true);
        const activeRes = await axios.get(`${API}/connections/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const match = activeRes.data.find(c => c.connectionId === connectionId);
        if (match) setPartner(match.partner);

        await fetchMessages();
      } catch (err) {
        console.error('Chat init error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Poll every 4 seconds
    const poll = setInterval(fetchMessages, 4000);
    return () => clearInterval(poll);
  }, [connectionId, token]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      const res = await axios.post(
        `${API}/private-messages/${connectionId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (messageId) => {
    const text = editText.trim();
    if (!text) return;
    try {
      const res = await axios.patch(
        `${API}/private-messages/message/${messageId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => prev.map(m => m._id === messageId ? res.data : m));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await axios.delete(
        `${API}/private-messages/message/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSaveToggle = async (messageId) => {
    try {
      const res = await axios.patch(
        `${API}/private-messages/message/${messageId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => prev.map(m => m._id === messageId ? res.data : m));
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.text);
    setHoveredMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader size={36} className="text-teal-700 animate-spin" />
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest">Loading Chat...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] items-center justify-center gap-4">
        <MessageSquare size={48} className="text-stone-300" />
        <h2 className="text-xl font-black text-stone-700">Connection Not Found</h2>
        <p className="text-stone-400 text-sm">This connection may not exist or may not be accepted yet.</p>
        <Link to="/connections" className="text-teal-700 font-bold underline text-sm">← Back to My Connections</Link>
      </div>
    );
  }

  // Saved messages count
  const savedCount = messages.filter(m => {
    const userIdStr = (user?._id || user?.id)?.toString();
    return m.savedBy?.some(id => id?.toString() === userIdStr);
  }).length;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-80px)] flex flex-col px-4 py-6">
      {/* Header */}
      <div className="bg-teal-900 text-white px-5 py-4 rounded-t-2xl shadow-lg flex items-center gap-3 flex-shrink-0">
        <Link to="/connections" className="p-2 rounded-full hover:bg-teal-800 transition">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 border-2 border-teal-500">
          {partner.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-base tracking-tight truncate">{partner.name}</h2>
          <p className="text-teal-300 text-xs font-bold uppercase tracking-widest truncate">
            {partner.department || partner.university || 'Co-Founder'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {savedCount > 0 && (
            <span className="flex items-center gap-1 text-amber-300 text-[10px] font-black uppercase tracking-widest bg-teal-800 px-2 py-1 rounded-full border border-teal-600">
              <BookmarkCheck size={12} /> {savedCount} Saved
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-widest bg-teal-700 px-3 py-1 rounded-full">
            Connected
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white border-x-2 border-stone-100 px-5 py-5 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-center mt-10">
            <div className="inline-block bg-stone-100 border border-stone-200 text-stone-500 text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full">
              Connection Accepted — Say Hello! 👋
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const userIdStr = (user?._id || user?.id)?.toString();
          const senderIdStr = (msg.sender?._id || msg.sender)?.toString();
          const isMine = senderIdStr === userIdStr;
          const isSaved = msg.savedBy?.some(id => id?.toString() === userIdStr);
          const isEditing = editingId === msg._id;
          const ts = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div
              key={msg._id}
              className={`flex flex-col max-w-[72%] relative group ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
              onMouseEnter={() => setHoveredMsg(msg._id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              {/* Message Action Toolbar — shows on hover */}
              {hoveredMsg === msg._id && !isEditing && (
                <div className={`absolute -top-9 flex items-center gap-1 bg-white border-2 border-stone-200 rounded-xl px-2 py-1.5 shadow-lg z-10 ${isMine ? 'right-0' : 'left-0'}`}>
                  {/* Save for later — anyone */}
                  <button
                    onClick={() => handleSaveToggle(msg._id)}
                    title={isSaved ? 'Unsave' : 'Save for later'}
                    className={`p-1.5 rounded-lg transition ${isSaved ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50'}`}
                  >
                    {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>
                  {/* Edit — sender only */}
                  {isMine && (
                    <button
                      onClick={() => startEdit(msg)}
                      title="Edit message"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {/* Delete — sender only */}
                  {isMine && (
                    <button
                      onClick={() => handleDelete(msg._id)}
                      title="Delete message"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Message Bubble — edit mode or normal */}
              {isEditing ? (
                <div className="flex items-center gap-2 w-full max-w-xs">
                  <input
                    ref={editInputRef}
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEdit(msg._id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 border-2 border-blue-400 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none"
                  />
                  <button onClick={() => handleEdit(msg._id)} className="p-1.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition">
                    <Check size={14} />
                  </button>
                  <button onClick={cancelEdit} className="p-1.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300 transition">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className={`px-4 py-3 text-sm font-medium leading-relaxed relative ${
                    isSaved ? 'ring-2 ring-amber-300' : ''
                  } ${
                    isMine
                      ? 'bg-teal-700 text-white rounded-[18px_18px_4px_18px]'
                      : 'bg-stone-100 text-stone-800 border-2 border-stone-200 rounded-[18px_18px_18px_4px]'
                  }`}
                >
                  {msg.text}
                  {isSaved && (
                    <BookmarkCheck size={10} className="absolute -top-1 -right-1 text-amber-500 bg-white rounded-full" />
                  )}
                </div>
              )}

              {/* Timestamp + edited badge */}
              {ts && !isEditing && (
                <div className="flex items-center gap-1 mt-0.5 px-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{ts}</span>
                  {msg.isEdited && (
                    <span className="text-[9px] text-stone-400 italic">(edited)</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex-shrink-0 bg-stone-50 border-2 border-stone-100 border-t-0 rounded-b-2xl px-4 py-3 flex gap-2 shadow"
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${partner.name}...`}
          className="flex-1 bg-white border-2 border-stone-200 text-stone-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 font-medium"
          autoFocus
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="bg-teal-700 text-white p-3 rounded-xl hover:bg-teal-800 transition disabled:opacity-40 flex-shrink-0"
        >
          {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

export default PrivateChat;

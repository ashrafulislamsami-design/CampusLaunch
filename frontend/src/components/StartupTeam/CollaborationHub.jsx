import { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Send, Link as LinkIcon, FilePlus, ExternalLink, Pin, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/config';

const CollaborationHub = ({ teamId, messages: initialMessages = [], documents = [], onRefresh, isCEO = false, onDeleteDocument }) => {
  const { token, user } = useContext(AuthContext);
  const [activeSubTab, setActiveSubTab] = useState('feed');
  const [msgText, setMsgText] = useState('');
  const [docData, setDocData] = useState({ title: '', url: '', category: 'Google Doc' });
  const [showDocForm, setShowDocForm] = useState(false);
  
  // New state for messaging features
  const [messages, setMessages] = useState(initialMessages);
  const [teamMembers, setTeamMembers] = useState([]);
  const [mentionDropdown, setMentionDropdown] = useState(null);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinned, setShowPinned] = useState(false);
  const textareaRef = useRef(null);

  // Load messages from API on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/messages/${teamId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    const loadTeamMembers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/messages/${teamId}/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data);
        }
      } catch (err) {
        console.error('Failed to load team members:', err);
      }
    };

    const loadPinnedMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/messages/${teamId}/pinned`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPinnedMessages(data);
        }
      } catch (err) {
        console.error('Failed to load pinned messages:', err);
      }
    };

    loadMessages();
    loadTeamMembers();
    loadPinnedMessages();
  }, [teamId, token]);

  // Handle @ mention autocomplete
  const handleTextChange = (e) => {
    const text = e.target.value;
    setMsgText(text);

    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = text.slice(lastAtIndex + 1);
      if (afterAt && !afterAt.includes(' ')) {
        const query = afterAt.toLowerCase();
        const filtered = teamMembers.filter(m =>
          m.name.toLowerCase().includes(query)
        );
        setFilteredMembers(filtered);
        setMentionDropdown({ start: lastAtIndex, query });
      } else if (!afterAt || afterAt.includes(' ')) {
        setMentionDropdown(null);
      }
    } else {
      setMentionDropdown(null);
    }
  };

  const handleSelectMention = (member) => {
    const beforeAt = msgText.slice(0, mentionDropdown.start);
    const afterSpace = msgText.slice(mentionDropdown.start + 1 + mentionDropdown.query.length);
    setMsgText(`${beforeAt}@${member.name} ${afterSpace}`);
    setMentionDropdown(null);
    setFilteredMembers([]);
    if (textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 0);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ teamId, text: msgText })
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages([...messages, newMessage]);
        setMsgText('');
        setMentionDropdown(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handlePinMessage = async (messageId, currentPinStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${messageId}/pin`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedMessage = await res.json();
        setMessages(messages.map(m => m._id === messageId ? updatedMessage : m));
        
        // Reload pinned messages
        const pinnedRes = await fetch(`${API_BASE_URL}/messages/${teamId}/pinned`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pinnedRes.ok) {
          const data = await pinnedRes.json();
          setPinnedMessages(data);
        }
      }
    } catch (err) {
      console.error('Failed to pin message:', err);
    }
  };

  // Render message text with @mention highlighting
  const renderMessageWithMentions = (text) => {
    if (!text || teamMembers.length === 0) return text;
    
    // Build dynamic regex from team member names
    const memberNames = teamMembers.map(m => m.name).join('|');
    const mentionRegex = new RegExp('@(' + memberNames + ')', 'g');
    
    const parts = text.split(mentionRegex);
    return parts.map((part, idx) => {
      // Check if this part is a mention by seeing if it matches a team member name
      if (teamMembers.some(m => m.name === part)) {
        return (
          <span 
            key={idx} 
            className="bg-[#5865f226] text-[#5865f2] font-semibold px-1 rounded hover:bg-[#5865f2] hover:text-white transition-all cursor-pointer"
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/messages/${msgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== msgId));
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const getUploaderLabel = (doc) => {
    if (!doc.uploadedBy) return 'Uploaded by Unknown';
    if (typeof doc.uploadedBy === 'string') {
      return `Uploaded by ${doc.uploadedBy}`;
    }
    return `Uploaded by ${doc.uploadedBy.name || doc.uploadedBy.email || 'Team member'}`;
  };

  const handleDeleteDocument = async (docId) => {
    if (onDeleteDocument) {
      return onDeleteDocument(docId);
    }
    if (!window.confirm('Remove this document from the vault?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(docData)
      });
      if (res.ok) {
        setDocData({ title: '', url: '', category: 'Google Doc' });
        setShowDocForm(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to add document:', err);
    }
  };

  return (
    <div className="placard p-8 bg-[#ebe9e4] relative overflow-hidden flex flex-col min-h-[500px]">
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10 border-b-2 border-amber-300 pb-4">
        <h2 className="text-3xl font-black text-amber-900 font-serif-custom">Collaboration Hub</h2>
        <div className="flex gap-2">
          {activeSubTab === 'feed' && (
            <button
              onClick={() => setShowPinned(!showPinned)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition flex items-center gap-2 ${showPinned ? 'bg-amber-900 text-amber-50' : 'bg-stone-200/50 text-amber-900/60 hover:text-amber-900'}`}
              style={{ borderRadius: '4px 12px 4px 12px' }}
              title="View pinned messages"
            >
              <Pin size={16} /> Pinned
            </button>
          )}
          <div className="flex bg-stone-200/50 p-1 rounded-lg border border-amber-200">
            <button 
              onClick={() => { setActiveSubTab('feed'); setShowPinned(false); }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition ${activeSubTab === 'feed' ? 'bg-amber-900 text-amber-50 shadow-sm' : 'text-amber-900/60 hover:text-amber-900'}`}
              style={{ borderRadius: '4px 12px 4px 12px' }}
            >
              Team Feed
            </button>
            <button 
              onClick={() => setActiveSubTab('vault')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition ${activeSubTab === 'vault' ? 'bg-amber-900 text-amber-50 shadow-sm' : 'text-amber-900/60 hover:text-amber-900'}`}
              style={{ borderRadius: '4px 12px 4px 12px' }}
            >
              Resource Vault
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-grow flex flex-col">
        {activeSubTab === 'feed' ? (
          <div className="flex flex-col h-full">
            {/* Pinned Messages Panel */}
            {showPinned && pinnedMessages.length > 0 && (
              <div className="mb-4 p-4 bg-white border-2 border-amber-400 rounded-lg" style={{borderRadius: '8px 24px 8px 24px'}}>
                <h3 className="font-black text-amber-900 mb-3 flex items-center gap-2">
                  <Pin size={18} /> Pinned Messages
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {pinnedMessages.map((m) => (
                    <div key={m._id} className="bg-amber-50 p-2 border-l-4 border-amber-400">
                      <div className="text-xs font-bold text-amber-900">{m.senderName}</div>
                      <div className="text-sm text-stone-700">{m.text.slice(0, 100)}...</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Feed */}
            <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2">
              {messages.length === 0 && (
                <div className="text-center py-12 text-stone-400 italic border-2 border-dashed border-stone-300 bg-stone-50" style={{borderRadius: '12px 32px 12px 32px'}}>
                  No transmissions recorded yet. Start the conversation.
                </div>
              )}
              {messages.map((m) => (
                <div key={m._id} className={`bg-white border-2 p-4 shadow-[3px_4px_0px_#fcd34d] group relative ${m.isPinned ? 'border-amber-400 bg-amber-50' : 'border-amber-200'}`} style={{borderRadius: '8px 24px 8px 24px'}}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-900 text-sm uppercase tracking-wider">{m.senderName}</span>
                      <span className="text-xs text-teal-900 font-black bg-teal-100/80 px-2 py-1 border border-teal-200 uppercase tracking-widest" style={{borderRadius: '4px 8px 4px 8px'}}>
                        {m.senderRole}
                      </span>
                      {m.isPinned && <Pin size={14} className="text-amber-600" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400 font-bold">{new Date(m.createdAt).toLocaleTimeString()}</span>
                      <button
                        onClick={() => handlePinMessage(m._id, m.isPinned)}
                        className="opacity-0 group-hover:opacity-100 transition text-amber-600 hover:text-amber-800"
                        title={m.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(m._id)}
                        className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600"
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-stone-700 font-medium text-sm leading-relaxed">{renderMessageWithMentions(m.text)}</p>
                </div>
              ))}
            </div>

            {/* Message Input with @ mention autocomplete */}
            <form onSubmit={handleSendMessage} className="mt-auto space-y-2">
              <div className="relative">
                <textarea 
                  ref={textareaRef}
                  value={msgText}
                  onChange={handleTextChange}
                  placeholder="Type @ to mention teammates..."
                  className="w-full px-4 py-3 bg-white border-[3px] border-amber-200 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-0 text-stone-800 font-medium text-sm resize-none"
                  style={{borderRadius: '8px 24px 8px 24px'}}
                  rows="2"
                />
                
                {/* @ Mention Dropdown */}
                {mentionDropdown && filteredMembers.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border-2 border-amber-300 shadow-lg z-50 max-h-[200px] overflow-y-auto" style={{borderRadius: '8px 24px 8px 24px'}}>
                    {filteredMembers.map((member) => (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => handleSelectMention(member)}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 border-b border-amber-100 last:border-b-0"
                      >
                        <div className="font-bold text-amber-900">{member.name}</div>
                        <div className="text-xs text-stone-500">{member.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="gilded-btn w-full flex items-center justify-center gap-2">
                <Send size={20} className="icon-tactile" /> Send
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-amber-900 font-serif-custom">Resource Vault</h3>
              <button 
                onClick={() => setShowDocForm(!showDocForm)}
                className="gilded-btn px-4 py-1.5 text-xs"
              >
                {showDocForm ? 'Close' : '+ Add Link'}
              </button>
            </div>

            {showDocForm && (
              <form onSubmit={handleAddDocument} className="bg-amber-50 border-2 border-amber-200 p-6 shadow-[4px_6px_0px_#d97706] space-y-4 mb-8" style={{borderRadius: '12px 32px 12px 32px'}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-900 mb-1">Title</label>
                    <input 
                      type="text"
                      value={docData.title}
                      onChange={e => setDocData({...docData, title: e.target.value})}
                      required
                      className="w-full px-4 py-2 border-2 border-amber-200 focus:border-amber-400 focus:ring-0 bg-white text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-900 mb-1">Category</label>
                    <select 
                      value={docData.category}
                      onChange={e => setDocData({...docData, category: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-amber-200 focus:border-amber-400 focus:ring-0 bg-white text-sm font-bold"
                    >
                      <option value="Google Doc">Google Doc</option>
                      <option value="Figma">Figma</option>
                      <option value="Drive">Drive</option>
                      <option value="Pitch Deck">Pitch Deck</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-amber-900 mb-1">Link URL</label>
                  <input 
                    type="url"
                    value={docData.url}
                    onChange={e => setDocData({...docData, url: e.target.value})}
                    required
                    placeholder="https://docs.google.com/..."
                    className="w-full px-4 py-2 border-2 border-amber-200 focus:border-amber-400 focus:ring-0 bg-white text-sm font-bold"
                  />
                </div>
                <button type="submit" className="gilded-btn w-full">Commit to Vault</button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.length === 0 && !showDocForm && (
                <div className="col-span-full text-center py-12 text-stone-400 italic border-2 border-dashed border-stone-300 bg-stone-50" style={{borderRadius: '12px 32px 12px 32px'}}>
                  Vault is currently empty.
                </div>
              )}
              {documents.map((doc, idx) => (
                <div key={doc._id || idx} className="placard p-4 bg-white hover:border-amber-400 transition group relative overflow-hidden" style={{borderRadius: '8px 24px 8px 24px'}}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-300 shadow-sm" style={{borderRadius: '6px 12px 6px 12px'}}>
                      <LinkIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-900 text-sm uppercase tracking-tight">{doc.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                        <span>{getUploaderLabel(doc)}</span>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">{doc.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {isCEO && (
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600"
                        title="Remove from vault"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {doc.url && (doc.url.includes('/ai/report/') || doc.url.includes('/api/ai/reports/')) ? (
                      <Link
                        to={(() => {
                          const url = doc.url.trim();
                          if (url.includes('/ai/report/')) {
                            const rawId = url.split('/ai/report/').pop();
                            return `/ai/report/${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
                          }
                          const rawId = url.split('/api/ai/reports/').pop();
                          return `/ai/report/${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
                        })()}
                        className="text-amber-300 group-hover:text-amber-700 transition"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    ) : (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber-300 group-hover:text-amber-700 transition"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationHub;

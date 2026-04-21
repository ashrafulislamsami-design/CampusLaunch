import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Users, LayoutTemplate, KanbanSquare, Pencil, X, ExternalLink, Activity, MessageSquare, Trash2, FileText, Link as LinkIcon, Sparkles } from 'lucide-react';
import BusinessCanvas from '../../components/StartupTeam/BusinessCanvas';
import CollaborationHub from '../../components/StartupTeam/CollaborationHub';
import ProgressTimeline from '../../components/StartupTeam/ProgressTimeline';

const TeamDashboard = () => {
  const { teamId } = useParams();
  const { token } = useContext(AuthContext);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'Member' });
  const [inviteError, setInviteError] = useState('');
  const [activeTab, setActiveTab] = useState('kanban');
  const [roleMessage, setRoleMessage] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // CEO Project Edit State
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editProjectData, setEditProjectData] = useState({ name: '', problemStatement: '', solution: '', stage: '' });

  // Sync state when team is fetched natively
  useEffect(() => {
    if (team) {
      setEditProjectData({
        name: team.name || '',
        problemStatement: team.problemStatement || '',
        solution: team.solution || '',
        stage: team.stage || 'Idea'
      });
    }
  }, [team]);

  // Decode JWT to safely retrieve user ID without additional network fetch
  const getUserId = () => {
    if(!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user?.id || payload.id;
    } catch(e) { return null; }
  };
  const currentUserId = getUserId();
  const isCEO = team?.members?.some(m => (m.userId?._id === currentUserId || m.userId === currentUserId) && m.role === 'CEO');

  const getUploaderLabel = (doc) => {
    if (!doc.uploadedBy) return 'Uploaded by Unknown';
    if (typeof doc.uploadedBy === 'string') {
      return `Uploaded by ${doc.uploadedBy}`;
    }
    return `Uploaded by ${doc.uploadedBy.name || doc.uploadedBy.email || 'Team member'}`;
  };

  const normalizeReportId = (value) => {
    if (!value) return null;
    const cleaned = value.trim().replace(/[^a-zA-Z0-9]/g, '');
    return cleaned.length === 24 ? cleaned : null;
  };

  const getDocumentPath = (url) => {
    if (!url) return null;

    const normalizedUrl = url.trim();
    if (normalizedUrl.includes('/ai/report/')) {
      const reportId = normalizedUrl.split('/ai/report/').pop();
      const cleanId = normalizeReportId(reportId);
      return cleanId ? `/ai/report/${cleanId}` : null;
    }

    if (normalizedUrl.includes('/api/ai/reports/')) {
      const reportId = normalizedUrl.split('/api/ai/reports/').pop();
      const cleanId = normalizeReportId(reportId);
      return cleanId ? `/ai/report/${cleanId}` : null;
    }

    return null;
  };

  const handleDeleteDocument = async (docId) => {
    if (!isCEO) {
      toast.error('Only the CEO can delete saved pitches.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete document');
      toast.success('Pitch document deleted successfully.');
      fetchTeam();
    } catch (err) {
      console.error('Document deletion failed:', err);
      toast.error(err.message || 'Unable to delete document');
    }
  };

  const handleRoleChange = async (memberUserId, newRole) => {
    setUpdatingRole(memberUserId);
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/members/${memberUserId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if(res.ok) {
        setTeam(data);
        setRoleMessage('Role Updated!');
        setTimeout(() => setRoleMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Failed to change role:', err);
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(inviteData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to invite member');
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'Member' });
      fetchTeam();
    } catch (err) {
      setInviteError(err.message);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editProjectData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update project details');
      }
      setShowEditProjectModal(false);
      fetchTeam();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/members/${memberUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRoleMessage('Member Removed');
        setTimeout(() => setRoleMessage(''), 3000);
        fetchTeam();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to remove member');
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleAcceptInvite = async (e) => {
    if (e) e.preventDefault();
    setAcceptingInvite(true);
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/invites/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
        setRoleMessage('Invite Accepted!');
        setTimeout(() => setRoleMessage(''), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to accept invite');
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAcceptingInvite(false);
    }
  };

  // Fetch Team Data
  const fetchTeam = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI Reports linked to this team
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch(`http://localhost:5000/api/ai/reports/team/${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchReports();
    // eslint-disable-next-line
  }, [teamId]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await fetch(`http://localhost:5000/api/teams/${teamId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchTeam(); // Refresh board
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await fetch(`http://localhost:5000/api/teams/${teamId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: newTaskTitle, status: 'To Do' })
      });
      setNewTaskTitle('');
      fetchTeam();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await fetch(`http://localhost:5000/api/teams/${teamId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTeam();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Truly Unify Vault: Combine documents and reports into a single chronological feed
  const unifiedVault = useMemo(() => {
    const docs = (team?.documents || []).map(d => ({ ...d, vaultType: 'document', date: d.createdAt || new Date() }));
    const reps = (reports || []).map(r => ({ ...r, vaultType: 'report', date: r.createdAt }));
    
    return [...docs, ...reps].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [team?.documents, reports]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading workspace...</div>;
  if (!team) return <div className="p-8 text-center text-red-500">Team not found or Unauthorized.</div>;

  // Group tasks for Kanban
  const columns = { 'To Do': [], 'In Progress': [], 'Done': [] };
  team.tasks.forEach(task => { if (columns[task.status]) columns[task.status].push(task); });

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-[1880px] mx-auto py-8 px-4 md:px-12 lg:px-20 flex flex-col md:flex-row gap-8">

      {/* SIDEBAR: Details & Members */}
      <div className="w-full md:w-1/5 space-y-6 flex-shrink-0">
        <div className="placard p-6 relative group">
          {isCEO && (
             <button 
               onClick={() => setShowEditProjectModal(true)} 
               className="absolute top-4 right-4 text-amber-300 hover:text-amber-700 transition"
               title="Edit Project Details"
             >
               <Pencil size={18} />
             </button>
          )}
          <div className="flex items-start justify-between mb-2 pr-6">
            <h2 className="text-2xl font-black text-amber-900 font-serif-custom">{team.name}</h2>
            <a 
              href={`/startup/${team._id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-0.5 text-teal-800 hover:text-teal-50 hover:bg-teal-700 bg-teal-100/50 p-2 border border-teal-200 rounded-lg transition duration-200 shadow-sm"
              title="View Public Pitch"
            >
              <ExternalLink size={16} className="icon-tactile" />
            </a>
          </div>
          <span className="inline-block px-3 py-1 bg-amber-100/50 text-amber-900 border border-amber-300 text-xs font-black tracking-widest uppercase mb-4" style={{borderRadius: '4px 8px 4px 8px'}}>
            Stage: {team.stage}
          </span>
          <p className="text-stone-700 mb-4 font-sans-custom font-medium leading-relaxed">{team.problemStatement}</p>
          {isCEO && (
            <Link 
              to={`/teams/${teamId}/portfolio/edit`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-amber-900 text-amber-50 font-black uppercase tracking-widest text-[10px] hover:bg-amber-800 transition shadow-lg"
              style={{ borderRadius: '8px 24px 8px 24px' }}
            >
              <Sparkles size={16} /> Edit Public Showcase
            </Link>
          )}
        </div>

        <div className="placard p-6">
          <div className="flex justify-between items-center mb-6 border-b-2 border-amber-200/50 pb-4">
            <h3 className="text-xl font-black text-amber-900 flex items-center gap-2 font-serif-custom">
              <Users size={24} className="text-teal-700 icon-tactile" /> Members
            </h3>
            <div className="flex items-center gap-2">
              {roleMessage && <span className="text-[10px] text-teal-800 bg-teal-100/80 px-2 py-1 uppercase tracking-widest font-black border border-teal-200" style={{borderRadius: '4px 8px 4px 8px'}}>{roleMessage}</span>}
              {isCEO && (
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="gilded-btn px-4 py-1.5"
                >
                  + Invite
                </button>
              )}
            </div>
          </div>

          {/* Pending Invite for Current User */}
          {team.members.find(m => m.userId._id === currentUserId && m.status === 'pending') && (
            <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg" style={{borderRadius: '8px 16px 8px 16px'}}>
              <p className="text-sm font-black text-amber-900 mb-3">You have a pending invite to join {team.name}</p>
              <button
                onClick={handleAcceptInvite}
                disabled={acceptingInvite}
                className="w-full px-4 py-2 bg-teal-700 text-teal-50 font-black uppercase tracking-widest rounded hover:bg-teal-800 disabled:opacity-50 transition"
                style={{borderRadius: '4px 8px 4px 8px'}}
              >
                {acceptingInvite ? 'Accepting...' : 'Accept Invite'}
              </button>
            </div>
          )}

          {/* Accepted Members Only */}
          <ul className="space-y-4">
            {team.members
              .filter(m => m.status === 'accepted')
              .map((m) => (
                <li key={m._id} className="flex justify-between items-start gap-3 bg-white border-2 border-stone-200 px-4 py-3 shadow-[2px_3px_0px_#e7e5e4] hover:border-amber-300 transition-colors" style={{borderRadius: '8px 16px 8px 16px'}}>
                  <div className="flex-1 flex flex-col">
                    <span className="text-sm font-black text-stone-900 uppercase tracking-wider break-words">{m.userId?.name || 'User'}</span>
                    <span className="text-[10px] text-stone-400 font-bold break-words">{m.userId?.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isCEO && m.userId._id !== currentUserId ? (
                      <div className="flex items-center gap-1">
                        <select 
                          value={m.role}
                          disabled={updatingRole === m.userId._id}
                          onChange={(e) => handleRoleChange(m.userId._id, e.target.value)}
                          className="text-xs text-amber-900 font-black bg-amber-100/50 px-2 py-1 border border-amber-300 focus:ring-1 focus:ring-amber-500 cursor-pointer disabled:opacity-50 uppercase tracking-widest"
                          style={{borderRadius: '4px 8px 4px 8px'}}
                        >
                          <option value="CTO">CTO</option>
                          <option value="CMO">CMO</option>
                          <option value="Designer">Designer</option>
                          <option value="Member">Member</option>
                        </select>
                        <button 
                          onClick={() => handleRemoveMember(m.userId._id)}
                          className="text-red-400 hover:text-red-600 transition p-1"
                          title="Remove Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-teal-900 font-black bg-teal-100/80 px-2 py-1 border border-teal-200 uppercase tracking-widest" style={{borderRadius: '4px 8px 4px 8px'}}>{m.role}</span>
                    )}
                  </div>
                </li>
              ))}
          </ul>

          {team.members.filter(m => m.status === 'accepted').length === 0 && (
            <p className="text-center text-stone-400 py-4 italic">No accepted members yet</p>
          )}
        </div>

        {/* Journey Traction Placard */}
        <div className="placard p-2 bg-[#fdfbf7]">
          <ProgressTimeline history={team.history} currentStage={team.stage} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">

        {/* Custom Tabs */}
        <div className="flex space-x-2 placard p-2 mb-8 bg-gradient-to-r from-stone-100 to-stone-50">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'kanban' ? 'bg-amber-900 text-amber-50 shadow-[2px_3px_0px_#451a03]' : 'text-amber-900/60 hover:text-amber-900 hover:bg-amber-100/50'}`}
            style={{borderRadius: '8px 24px 8px 24px'}}
          >
            <KanbanSquare size={20} className={activeTab === 'kanban' ? 'text-amber-400' : ''} /> Kanban Board
          </button>
          <button 
            onClick={() => setActiveTab('canvas')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'canvas' ? 'bg-amber-900 text-amber-50 shadow-[2px_3px_0px_#451a03]' : 'text-amber-900/60 hover:text-amber-900 hover:bg-amber-100/50'}`}
            style={{borderRadius: '8px 24px 8px 24px'}}
          >
            <LayoutTemplate size={20} className={activeTab === 'canvas' ? 'text-amber-400' : ''} /> Business Canvas
          </button>
          <button 
            onClick={() => setActiveTab('collab')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'collab' ? 'bg-[#0f766e] text-teal-50 shadow-[2px_3px_0px_#134e4a]' : 'text-[#0f766e]/60 hover:text-[#0f766e] hover:bg-teal-50'}`}
            style={{borderRadius: '8px 24px 8px 24px'}}
          >
            <MessageSquare size={20} className={activeTab === 'collab' ? 'text-teal-400' : ''} /> Collab Hub
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'documents' ? 'bg-purple-900 text-purple-50 shadow-[2px_3px_0px_#581c87]' : 'text-purple-900/60 hover:text-purple-900 hover:bg-purple-100/50'}`}
            style={{borderRadius: '8px 24px 8px 24px'}}
          >
            <FileText size={20} className={activeTab === 'documents' ? 'text-purple-400' : ''} /> Intelligence Hub
          </button>
        </div>

        {/* Kanban Board Container */}
        <div className={`transition-opacity duration-200 ${activeTab === 'kanban' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="placard p-8 mb-8 bg-[#ebe9e4] relative overflow-hidden">
            {/* Brushed metal noise specific to Kanban area */}
            <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] mix-blend-overlay pointer-events-none"></div>
            
            <h3 className="text-3xl font-black text-amber-900 mb-6 flex items-center gap-3 font-serif-custom relative z-10 border-b-2 border-amber-300 pb-4">
              Kanban Board
            </h3>

          {/* Quick Add Task */}
          <form onSubmit={handleAddTask} className="flex gap-4 mb-8 relative z-10">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-5 py-3 bg-white border-[3px] border-amber-200 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-0 text-stone-800 font-medium"
              style={{borderRadius: '8px 24px 8px 24px'}}
            />
            <button type="submit" className="gilded-btn">
              <Plus size={20} className="icon-tactile" /> Expand
            </button>
          </form>

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {Object.keys(columns).map((status) => (
              <div key={status} className="bg-stone-50 border-2 border-stone-200 shadow-[4px_6px_0px_#d6d3d1] p-5 flex flex-col" style={{borderRadius: '12px 32px 12px 32px'}}>
                <h4 className="font-black text-stone-800 mb-4 border-b-2 border-amber-300 pb-2 uppercase tracking-widest text-sm flex items-center justify-between">
                  {status}
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">{columns[status].length}</span>
                </h4>
                <div className="space-y-4 flex-1">
                  {columns[status].map(task => (
                    <div key={task._id} className="bg-white p-4 border-[2px] border-amber-200 shadow-[2px_3px_0px_#fcd34d] relative group text-sm hover:-translate-y-1 hover:shadow-[2px_4px_0px_#fcd34d] transition-all" style={{borderRadius: '4px 12px 4px 12px'}}>
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-amber-950 font-bold leading-relaxed flex-1 pr-2">{task.title}</p>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition flex-shrink-0"
                          title="Delete task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Move Controls */}
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                        className="text-xs font-black uppercase tracking-widest bg-stone-50 border border-stone-200 p-1.5 w-full text-stone-600 focus:ring-0 focus:border-amber-400 transition"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  ))}
                  {columns[status].length === 0 && (
                    <p className="text-xs text-center text-stone-400 font-bold italic py-8 border-2 border-dashed border-stone-200" style={{borderRadius: '4px 12px 4px 12px'}}>Empty Sector</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Business Canvas Container */}
        <div className={`transition-opacity duration-200 ${activeTab === 'canvas' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <BusinessCanvas teamId={teamId} />
        </div>

        {/* Collaboration Container */}
        <div className={`transition-opacity duration-200 ${activeTab === 'collab' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <CollaborationHub 
            teamId={teamId} 
            messages={team.messages} 
            documents={team.documents} 
            onRefresh={fetchTeam}
            isCEO={isCEO}
            onDeleteDocument={handleDeleteDocument}
          />
        </div>

        {/* Unified Strategy & Intelligence Hub */}
        <div className={`transition-opacity duration-300 ${activeTab === 'documents' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <div className="placard p-8 mb-8 bg-gradient-to-br from-stone-200 to-stone-300 relative overflow-hidden shadow-2xl">
            {/* Premium Mesh Gradient Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#8b5cf6,transparent),radial-gradient(circle_at_0%_100%,#0ea5e9,transparent)] pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/dust.png')] pointer-events-none"></div>
            
            <h3 className="text-4xl font-black text-purple-950 mb-8 flex items-center gap-4 font-serif-custom relative z-10">
              <div className="p-3 bg-purple-600/10 rounded-2xl border border-purple-600/20 shadow-inner">
                <FileText size={32} className="text-purple-700 drop-shadow-sm" />
              </div>
              Strategy & Intelligence Hub
              <span className="ml-auto text-xs font-black uppercase tracking-[0.2em] text-purple-900/40 bg-purple-900/5 px-4 py-2 rounded-full border border-purple-900/10">
                Unified Gallery
              </span>
            </h3>

            {unifiedVault.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {unifiedVault.map((item) => (
                  <div 
                    key={item._id} 
                    className="group relative flex flex-col bg-white/60 backdrop-blur-xl border border-white/40 p-8 transition-all duration-500 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden h-full" 
                    style={{borderRadius: '24px 64px 24px 64px'}}
                  >
                    {/* Common Card Header logic */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-black text-purple-950 text-xl tracking-tight leading-tight group-hover:text-purple-600 transition-colors uppercase break-words">
                            {item.vaultType === 'document' ? item.title : (item.ideaData?.solution || 'AI Validation')}
                          </h4>
                          <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${item.vaultType === 'document' ? 'bg-indigo-400' : 'bg-teal-500 animate-pulse'}`}></span>
                             {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`p-3 rounded-2xl transition-all duration-300 ${item.vaultType === 'document' ? 'bg-purple-900/5 group-hover:bg-purple-600 group-hover:text-white' : 'bg-purple-900/5 group-hover:bg-teal-600 group-hover:text-white'}`}>
                          {item.vaultType === 'document' ? <LinkIcon size={24} /> : <Activity size={24} className="text-teal-600 group-hover:text-white" />}
                        </div>
                      </div>

                      {/* Tagging */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className={`text-[10px] font-black px-3 py-1.5 border rounded-full uppercase tracking-widest shadow-sm ${item.vaultType === 'document' ? 'text-purple-700 bg-purple-50 border-purple-100' : 'text-teal-700 bg-teal-50 border-teal-100'}`}>
                          {item.vaultType === 'document' ? (item.category || 'Uploaded File') : 'AI Analysis'}
                        </span>
                      </div>

                      {/* Content Body */}
                      {item.vaultType === 'document' ? (
                        <p className="text-sm text-stone-500 mb-8 font-medium italic border-l-2 border-purple-200 pl-4">
                          {getUploaderLabel(item)}
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 mb-8 items-stretch">
                          <div className="bg-purple-900/5 p-4 rounded-3xl border border-purple-900/5 flex flex-col">
                            <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Market Size</span>
                            <span className="font-black text-teal-800 text-sm break-words leading-tight">{item.aiResponse?.marketSize || 'N/A'}</span>
                          </div>
                          <div className="bg-purple-900/5 p-4 rounded-3xl border border-purple-900/5 flex flex-col justify-center">
                            <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Comp. Count</span>
                            <span className="font-black text-purple-800 text-lg">{item.aiResponse?.competitors?.length || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-4">
                      {item.vaultType === 'document' ? (
                        <div className="flex flex-wrap items-center gap-4">
                          {getDocumentPath(item.url) ? (
                            <Link
                              to={getDocumentPath(item.url)}
                              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black uppercase tracking-[0.1em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                              style={{borderRadius: '12px 32px 12px 32px'}}
                            >
                              <FileText size={18} /> Open Document
                            </Link>
                          ) : (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black uppercase tracking-[0.1em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                              style={{borderRadius: '12px 32px 12px 32px'}}
                            >
                              <ExternalLink size={18} /> Open Document
                            </a>
                          )}
                          {isCEO && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(item._id)}
                              className="p-4 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                              style={{borderRadius: '12px 24px 12px 24px'}}
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={`/ai/report/${item._id}`}
                          className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-stone-800 to-black text-white font-black uppercase tracking-[0.1em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                          style={{borderRadius: '12px 32px 12px 32px'}}
                        >
                          <ExternalLink size={18} /> Full Market Report
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/30 backdrop-blur-sm border-2 border-dashed border-purple-300/50 relative z-10 flex flex-col items-center gap-4" style={{borderRadius: '32px'}}>
                <div className="p-4 bg-purple-100 rounded-full text-purple-600">
                  <FileText size={48} className="opacity-20" />
                </div>
                <p className="text-xl font-bold text-purple-950">Vault is empty</p>
                <p className="text-sm text-purple-900/60 max-w-sm px-6">Combine your uploaded pitch decks with AI validated market reports here. Start by analyzing an idea or uploading a document.</p>
                <Link to="/ai-validator" className="text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline mt-4">Execute AI Validation →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Member</h3>
            {inviteError && <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-4">{inviteError}</div>}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input 
                  type="email" 
                  value={inviteData.email} 
                  onChange={e => setInviteData({...inviteData, email: e.target.value})}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={inviteData.role}
                  onChange={e => setInviteData({...inviteData, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CTO">CTO</option>
                  <option value="CMO">CMO</option>
                  <option value="Designer">Designer</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Details Modal (CEO Only) */}
      {showEditProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Project Details</h3>
              <button onClick={() => setShowEditProjectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="edit-project-form" onSubmit={handleEditProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input 
                    type="text" 
                    value={editProjectData.name} 
                    onChange={e => setEditProjectData({...editProjectData, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                  <textarea 
                    value={editProjectData.problemStatement} 
                    onChange={e => setEditProjectData({...editProjectData, problemStatement: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solution</label>
                  <textarea 
                    value={editProjectData.solution} 
                    onChange={e => setEditProjectData({...editProjectData, solution: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select 
                    value={editProjectData.stage}
                    onChange={e => setEditProjectData({...editProjectData, stage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Testing">Testing</option>
                    <option value="Building MVP">Building MVP</option>
                    <option value="Growing">Growing</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-xl">
              <button 
                type="button" 
                onClick={() => setShowEditProjectModal(false)}
                className="px-5 py-2.5 text-gray-700 font-medium bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-project-form"
                className="px-5 py-2.5 bg-indigo-600 font-medium text-white hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default TeamDashboard;

import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Users, LayoutTemplate, KanbanSquare, Pencil, X, ExternalLink, Activity, MessageSquare, Trash2 } from 'lucide-react';
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
  const isCEO = team?.members.some(m => (m.userId._id === currentUserId || m.userId === currentUserId) && m.role === 'CEO');

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

  useEffect(() => {
    fetchTeam();
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading workspace...</div>;
  if (!team) return <div className="p-8 text-center text-red-500">Team not found or Unauthorized.</div>;

  // Group tasks for Kanban
  const columns = { 'To Do': [], 'In Progress': [], 'Done': [] };
  team.tasks.forEach(task => { if (columns[task.status]) columns[task.status].push(task); });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-6">

      {/* SIDEBAR: Details & Members */}
      <div className="w-full md:w-1/4 space-y-6">
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
      <div className="w-full md:w-3/4">

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
          />
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
  );
};

export default TeamDashboard;

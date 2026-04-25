import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, MessageSquare, GraduationCap, MapPin, Sparkles, CheckCircle, UserCheck, Send, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const CoFounderMatching = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamStatus, setTeamStatus] = useState('');
  const [missingRoles, setMissingRoles] = useState([]);
  const [isFull, setIsFull] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [connections, setConnections] = useState([]);
  const [requestMessages, setRequestMessages] = useState({}); // { userId: "message" }
  const [toast, setToast] = useState(null); // { message, type: 'success'|'warning' }

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/match`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 200) {
          setMatches(res.data.matches || []);
          setTeamStatus(res.data.teamStatus || 'Matching Strategy');
          setMissingRoles(res.data.missingRoles || []);
          setIsFull(res.data.isFull || false);
        }
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchConnections = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/connections`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 200) {
          setConnections(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      }
    };

    if (token) {
      fetchMatches();
      fetchConnections();
    }
  }, [token]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConnect = async (userId) => {
    try {
      setConnecting(userId);
      const customMessage = requestMessages[userId] || 'Hi! I found your profile on the CampusLaunch Matching Hub and think we would be a great co-founder match. I would love to connect and discuss our startup ideas.';
      
      const res = await axios.post(`${API_BASE_URL}/connections/send`, 
        { receiverId: userId, message: customMessage },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.status === 200 || res.status === 201) {
        showToast('Connection request sent successfully!', 'success');
        setConnections([...connections, res.data.connection || res.data]);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error === 'Connection already exists') {
        showToast('You already have a connection with this founder.', 'warning');
      } else {
        console.error('Failed to send connection:', err);
      }
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8">

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm animate-[fadeInDown_0.3s_ease-out] ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
          style={{ minWidth: '280px', maxWidth: '380px' }}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            toast.type === 'success' ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle size={16} className="text-emerald-600" />
              : <Sparkles size={16} className="text-amber-600" />
            }
          </div>
          <p className="flex-1 text-sm font-semibold leading-snug">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {/* Header Banner */}
      <div className="mb-12 relative p-12 jewel-teal shadow-xl overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="md:w-2/3">
            <h1 className="text-5xl font-black mb-4 font-serif-custom text-teal-50 drop-shadow-md tracking-tight">Co-Founder Matching</h1>
            <p className="text-teal-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
              We've analyzed your team architecture. Below are student founders with the precise skills needed to fill your missing roles.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
             <Users size={80} className="text-teal-100 opacity-60" />
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="placard p-8 border-t-4 border-amber-400 mb-12 flex flex-col md:flex-row justify-between items-center bg-[#fdfbf7]">
        <div>
          <h2 className="text-xl font-black text-amber-900 border-l-4 border-amber-400 pl-4 mb-2 uppercase tracking-widest">{teamStatus}</h2>
          <p className="text-stone-500 font-medium">Matching students based on your team's unfilled core positions.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {!isFull && missingRoles?.map(role => (
            <span key={role} className="px-4 py-1.5 bg-amber-100 text-amber-900 border-2 border-amber-300 text-[10px] font-black tracking-widest uppercase" style={{ borderRadius: '4px 12px 4px 12px' }}>
              Missing {role}
            </span>
          ))}
          {isFull && matches.length > 0 && (
             <span className="px-4 py-1.5 bg-indigo-100 text-indigo-900 border-2 border-indigo-300 text-[10px] font-black tracking-widest uppercase" style={{ borderRadius: '4px 12px 4px 12px' }}>
                Strategy Fallback Active
             </span>
          )}
          {matches.length === 0 && (
             <span className="px-4 py-1.5 bg-teal-100 text-teal-900 border-2 border-teal-300 text-[10px] font-black tracking-widest uppercase" style={{ borderRadius: '4px 12px 4px 12px' }}>
                Full Momentum
             </span>
          )}
        </div>
      </div>

      {/* Matching Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matches.map(person => {
            const userIdStr = (user?._id || user?.id)?.toString();
            const existingConnection = connections.find(c => 
              (c.receiver?._id === (person.userId || person._id) && c.sender?._id === userIdStr) ||
              (c.sender?._id === (person.userId || person._id) && c.receiver?._id === userIdStr)
            );
            const isAccepted = existingConnection && existingConnection.status === 'accepted';
            const hasRequested = existingConnection && existingConnection.sender?._id === user?.id && existingConnection.status === 'pending';
            
            return (
            <div key={person.userId || person._id} className="placard p-8 group flex flex-col justify-between hover:border-amber-400 hover:-translate-y-1 transition-all shadow-[4px_6px_0px_#d97706] hover:shadow-[6px_8px_0px_#d97706]" style={{ borderRadius: '12px 32px 12px 32px' }}>
              <div>
                <div className="flex justify-between items-start mb-6">
                   <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 border-2 border-indigo-300 text-indigo-700 rounded-xl flex items-center justify-center shadow-sm transform -rotate-3 group-hover:rotate-0 transition relative">
                      <GraduationCap size={32} className="icon-tactile" />
                   </div>
                   <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full px-4 py-2 flex items-center justify-center font-black text-sm shadow-md whitespace-nowrap">
                      {person.matchScore ? `${person.matchScore}% Match` : 'No Match Data'}
                   </div>
                </div>
                
                <h3 className="text-2xl font-black text-amber-900 mb-1 font-serif-custom">{person.name}</h3>
                <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-widest mb-4">
                  <MapPin size={12} /> {person.university}
                </div>

                <div className="mb-6">
                  <p className="text-stone-400 font-black text-[10px] uppercase tracking-widest mb-2">Core Skills</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {person.skills?.map(skill => (
                      <span key={skill} className="bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 rounded-md border border-stone-200">
                        {skill}
                      </span>
                    ))}
                    {(!person.skills || person.skills.length === 0) && <span className="text-stone-300 italic text-[10px]">No skills listed</span>}
                  </div>

                  {/* Multi-dimensional info pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {person.hoursPerWeek && (
                      <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-1 rounded-full">
                        ⏱ {person.hoursPerWeek}h/wk
                      </span>
                    )}
                    {person.workStyle && (
                      <span className="flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2 py-1 rounded-full capitalize">
                        🏠 {person.workStyle === 'remote' ? 'Online' : person.workStyle === 'in-person' ? 'Offline' : 'Hybrid'}
                      </span>
                    )}
                    {person.ideaStage && (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-full capitalize">
                        🚀 {person.ideaStage}
                      </span>
                    )}
                  </div>

                  {/* Match Reason */}
                  {person.reason && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded italic text-sm text-stone-700 shadow-inner">
                      <p>
                        <span className="font-bold text-indigo-700 not-italic mr-1">Why:</span>
                        {person.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status badge + action button area */}
              {isAccepted ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-center">
                    <span className="bg-emerald-100/50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <UserCheck size={11} /> Connected
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/chat/${existingConnection._id}`)}
                    className="w-full text-center text-white font-black py-4 uppercase tracking-widest text-xs border-2 border-transparent hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
                    style={{ borderRadius: '8px 24px 8px 24px', backgroundColor: '#5865f2', borderColor: '#5865f2' }}
                  >
                    <MessageSquare size={15} /> Message
                  </button>
                </div>
              ) : hasRequested ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-center">
                    <span className="bg-amber-100/50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                      <Sparkles size={11} /> Request Pending
                    </span>
                  </div>
                  <button
                    disabled
                    className="w-full text-center bg-stone-100 text-stone-400 font-black py-4 uppercase tracking-widest text-xs border border-stone-200 transition flex items-center justify-center gap-3 cursor-not-allowed"
                    style={{ borderRadius: '8px 24px 8px 24px' }}
                  >
                    Awaiting Response <CheckCircle size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                   <div className="space-y-2">
                     <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest pl-1">Personal Message (Optional)</p>
                     <textarea
                       className="w-full p-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-xs font-medium focus:border-amber-400 focus:outline-none transition-colors"
                       rows="3"
                       placeholder="Say hello and briefly describe why you'd like to collaborate..."
                       value={requestMessages[person.userId || person._id] || ''}
                       onChange={(e) => setRequestMessages({
                         ...requestMessages,
                         [person.userId || person._id]: e.target.value
                       })}
                     />
                   </div>
                   <button
                    onClick={() => handleConnect(person.userId || person._id)}
                    disabled={connecting === (person.userId || person._id)}
                    className="w-full text-center bg-amber-900 text-amber-50 font-black py-4 uppercase tracking-widest text-xs border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
                    style={{ borderRadius: '8px 24px 8px 24px' }}
                  >
                    {connecting === (person.userId || person._id) ? 'Requesting...' : (
                      <><Send size={14} /> Send Request</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )})}

          {matches.length === 0 && (
             <div className="col-span-full py-20 placard text-center border-dashed border-2 border-stone-200" style={{borderRadius: '16px 48px 16px 48px'}}>
                <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No founders available in the matrix at this moment.</p>
             </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default CoFounderMatching;

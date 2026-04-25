import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MessageSquare, UserCheck, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const ConnectionsDashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('partners');
  const [pending, setPending] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, activeRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/connections/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/connections/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      setPending(pendingRes.data || []);
      setPartners(activeRes.data || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleRespond = async (connectionId, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/connections/respond`,
        { connectionId, status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Failed to respond:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 relative p-10 bg-amber-900 shadow-xl overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 font-serif-custom text-white drop-shadow-md tracking-tight">
              My Connections
            </h1>
            <p className="text-amber-100 text-base font-medium max-w-xl leading-relaxed">
              Manage your co-founder inquiries and message your accepted partners directly.
            </p>
          </div>
          {/* Composite handshake+bubble icon */}
          <div className="flex-shrink-0 bg-white/10 p-5 backdrop-blur-md border border-white/20 rounded-3xl">
            <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-80">
              {/* Left user circle */}
              <circle cx="18" cy="20" r="10" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="16" r="4" fill="white" fillOpacity="0.7"/>
              <path d="M8 30c0-5.523 4.477-8 10-8s10 2.477 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" fillOpacity="0.6"/>
              {/* Right user circle */}
              <circle cx="38" cy="20" r="10" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
              <circle cx="38" cy="16" r="4" fill="white" fillOpacity="0.7"/>
              <path d="M28 30c0-5.523 4.477-8 10-8s10 2.477 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" fillOpacity="0.6"/>
              {/* Message bubble tail at bottom center */}
              <path d="M22 38 Q28 34 34 38 Q28 50 22 38Z" fill="white" fillOpacity="0.75"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-stone-100 p-2 rounded-xl border border-stone-200 w-fit">
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition flex items-center gap-2 ${
            activeTab === 'partners'
              ? 'bg-amber-900 text-amber-50 shadow'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <UserCheck size={14} /> My Partners
          {partners.length > 0 && (
            <span className="bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{partners.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-900 text-amber-50 shadow'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Clock size={14} /> Pending
          {pending.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{pending.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 bg-stone-100 rounded-2xl border-2 border-dashed border-stone-200" />
          ))}
        </div>
      ) : (
        <>
          {/* My Partners Tab */}
          {activeTab === 'partners' && (
            <div>
              {partners.length === 0 ? (
                <div className="py-20 text-center placard border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
                  <UserCheck size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No accepted partners yet</p>
                  <Link to="/matching" className="mt-4 inline-block text-amber-800 underline font-bold text-sm">
                    Find Co-Founders →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners.map(({ connectionId, partner }) => (
                    <div
                      key={connectionId}
                      className="placard p-7 flex flex-col justify-between hover:border-teal-400 hover:-translate-y-1 transition-all shadow-[4px_6px_0px_#0f766e] hover:shadow-[6px_8px_0px_#0f766e]"
                      style={{ borderRadius: '12px 32px 12px 32px' }}
                    >
                      <div>
                        {/* Accepted Badge */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 border-2 border-teal-300 text-teal-700 rounded-xl flex items-center justify-center shadow-sm">
                            <UserCheck size={28} />
                          </div>
                          <span className="bg-emerald-100/50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle size={11} /> Connected
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-amber-900 mb-1 font-serif-custom">{partner.name}</h3>
                        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-4">{partner.university || 'Student'}</p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {partner.skills?.slice(0, 4).map(skill => (
                            <span key={skill} className="bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-600 rounded border border-stone-200">
                              {skill}
                            </span>
                          ))}
                          {(!partner.skills || partner.skills.length === 0) && (
                            <span className="text-stone-300 italic text-[10px]">No skills listed</span>
                          )}
                        </div>
                      </div>

                      {/* MESSAGE Button — blurple */}
                      <button
                        onClick={() => navigate(`/chat/${connectionId}`)}
                        className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 uppercase tracking-widest text-xs hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 border-2 shadow-md"
                        style={{ borderRadius: '8px 20px 8px 20px', backgroundColor: '#5865f2', borderColor: '#5865f2' }}
                      >
                        <MessageSquare size={15} /> Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div>
              {pending.length === 0 ? (
                <div className="py-20 text-center placard border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
                  <Clock size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No pending requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pending.map(conn => (
                    <div
                      key={conn._id}
                      className="placard p-7 flex flex-col justify-between hover:border-amber-400 hover:-translate-y-1 transition-all shadow-[4px_6px_0px_#d97706] hover:shadow-[6px_8px_0px_#d97706]"
                      style={{ borderRadius: '12px 32px 12px 32px' }}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 text-amber-700 rounded-xl flex items-center justify-center shadow-sm">
                            <Clock size={28} />
                          </div>
                          <span className="bg-amber-100/50 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5">
                            <Sparkles size={11} /> Pending
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-amber-900 mb-1 font-serif-custom">{conn.sender?.name}</h3>
                        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-3">{conn.sender?.university || 'Student'}</p>

                        {conn.message && (
                          <p className="text-sm text-stone-600 italic mb-4 p-3 bg-stone-50 border-l-4 border-amber-400 rounded">
                            "{conn.message}"
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {conn.sender?.skills?.slice(0, 4).map(skill => (
                            <span key={skill} className="bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-600 rounded border border-stone-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRespond(conn._id, 'accepted')}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white font-black py-3 text-xs uppercase tracking-widest hover:bg-green-800 transition"
                          style={{ borderRadius: '8px 16px 8px 16px' }}
                        >
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button
                          onClick={() => handleRespond(conn._id, 'rejected')}
                          className="px-5 flex items-center justify-center gap-1 bg-stone-200 text-stone-600 font-black py-3 text-xs uppercase tracking-widest hover:bg-stone-300 transition"
                          style={{ borderRadius: '8px 16px 8px 16px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConnectionsDashboard;

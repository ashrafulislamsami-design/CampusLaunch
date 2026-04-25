import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Clock, CheckCircle, UserCheck, Code2 } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const ConnectionRequests = () => {
  const { token, user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/connections/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 200) {
          setRequests(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRequests();
  }, [token]);

  const handleRespond = async (connectionId, status) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/connections/respond`, 
        { connectionId, status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.status === 200) {
        // Remove from list or update UI
        setRequests(requests.filter(r => r._id !== connectionId));
      }
    } catch (err) {
      console.error(`Failed to ${status} connection:`, err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-12 relative p-12 bg-amber-900 shadow-xl overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="md:w-2/3">
            <h1 className="text-5xl font-black mb-4 font-serif-custom text-white drop-shadow-md tracking-tight">Pending Inquiries</h1>
            <p className="text-amber-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
              Founders who want to build with you. Review their skills and accept connections to unlock messaging.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
             <UserCheck size={80} className="text-amber-100 opacity-60" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200"></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
         <div className="py-20 placard text-center border-dashed border-2 border-stone-200" style={{borderRadius: '16px 48px 16px 48px'}}>
            <Clock size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No Pending Requests At This Time</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map(conn => (
            <div key={conn._id} className="placard p-8 group flex flex-col justify-between hover:border-amber-400 hover:-translate-y-1 transition-all shadow-[4px_6px_0px_#d97706] hover:shadow-[6px_8px_0px_#d97706]" style={{ borderRadius: '12px 32px 12px 32px' }}>
              <div>
                <h3 className="text-2xl font-black text-amber-900 mb-1 font-serif-custom">{conn.sender.name}</h3>
                <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-4">{conn.sender.university}</p>
                
                <div className="mb-6 border-l-4 border-amber-400 pl-3">
                   <p className="text-stone-400 font-black text-[10px] uppercase tracking-widest mb-2">Message</p>
                   <p className="text-sm text-stone-700 italic">"{conn.message}"</p>
                </div>

                <div className="mb-6">
                  <p className="text-stone-400 font-black text-[10px] uppercase tracking-widest mb-2">Core Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {conn.sender.skills?.map(skill => (
                      <span key={skill} className="bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 rounded-md border border-stone-200">
                        {skill}
                      </span>
                    ))}
                    {(!conn.sender.skills || conn.sender.skills.length === 0) && <span className="text-stone-300 italic text-[10px]">No skills listed</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleRespond(conn._id, 'accepted')}
                  className="flex-1 text-center bg-green-600 text-white font-black py-3 uppercase tracking-widest text-xs hover:bg-green-700 transition flex items-center justify-center gap-2"
                  style={{ borderRadius: '8px 16px 8px 16px' }}
                >
                  <CheckCircle size={16} /> Accept
                </button>
                <button 
                  onClick={() => handleRespond(conn._id, 'rejected')}
                  className="px-6 text-center bg-stone-200 text-stone-600 font-black py-3 uppercase tracking-widest text-xs border border-transparent hover:border-stone-400 transition flex items-center justify-center"
                  style={{ borderRadius: '8px 16px 8px 16px' }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionRequests;

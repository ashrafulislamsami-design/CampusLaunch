import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Zap, Plus, CheckCircle, Clock, Code2, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';

const MatchingEngine = () => {
  const { token, user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('matches');

  // Fetch AI-generated matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/match', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 200) {
          setMatches(res.data.matches || res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchConnections = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/connections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setConnections(Array.isArray(data) ? data : []);
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

  // Handle connection request
  const handleConnect = async (userId) => {
    try {
      setConnecting(userId);
      const res = await axios.post('http://localhost:5000/api/connections/send',
        {
          receiverId: userId,
          message: messageText
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.status === 200 || res.status === 201) {
        // Refresh connections
        const connectRes = await axios.get('http://localhost:5000/api/connections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (connectRes.status === 200) {
          setConnections(Array.isArray(connectRes.data) ? connectRes.data : []);
        }
        setMessageText('');
      }
    } catch (err) {
      console.error('Failed to send connection:', err);
    } finally {
      setConnecting(null);
    }
  };

  // Handle accept connection
  const handleAccept = async (connectionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/connections/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ connectionId, status: 'accepted' })
      });

      if (res.ok) {
        // Refresh connections
        const connectRes = await fetch('http://localhost:5000/api/connections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await connectRes.json();
        if (connectRes.ok) {
          setConnections(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error('Failed to accept connection:', err);
    }
  };

  // Count pending connections where user is receiver
  const pendingIncoming = connections.filter(
    c => c.receiver?._id === user?.id && c.status === 'pending'
  ).length;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 relative p-12 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-10 bg-black"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="md:w-2/3">
            <h1 className="text-5xl font-black mb-4 font-serif-custom text-white drop-shadow-md tracking-tight">
              AI Matching Engine
            </h1>
            <p className="text-indigo-100 text-lg font-medium max-w-2xl leading-relaxed">
              Powered by Groq's Llama 3.3 70B. Discover co-founder matches based on complementary skills and interests.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
            <Sparkles size={80} className="text-indigo-100 opacity-60 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 bg-stone-100 p-2 rounded-lg border-2 border-stone-200 w-fit">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-6 py-2 text-sm font-black uppercase tracking-widest transition rounded-lg ${activeTab === 'matches'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-transparent text-stone-600 hover:text-stone-900'
            }`}
        >
          Matches {matches.length > 0 && `(${matches.length})`}
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-6 py-2 text-sm font-black uppercase tracking-widest transition rounded-lg relative ${activeTab === 'connections'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-transparent text-stone-600 hover:text-stone-900'
            }`}
        >
          Connections
          {pendingIncoming > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {pendingIncoming}
            </span>
          )}
        </button>
      </div>

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-stone-200 rounded-2xl border-2 border-dashed border-stone-300"></div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl">
              <Zap size={48} className="mx-auto text-stone-300 mb-4" />
              <h3 className="text-xl font-black text-stone-600 mb-2">No Matches Found</h3>
              <p className="text-stone-500">Complete your profile to get better matches</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {matches.map(match => {
                const existingConnection = connections.find(c =>
                  (c.receiver?._id === match.userId && c.sender?._id === user?.id) ||
                  (c.sender?._id === match.userId && c.receiver?._id === user?.id)
                );

                const isIncoming = existingConnection && existingConnection.receiver?._id === user?.id && existingConnection.status === 'pending';
                const hasRequested = existingConnection && existingConnection.sender?._id === user?.id && existingConnection.status === 'pending';
                const isAccepted = existingConnection && existingConnection.status === 'accepted';

                return (
                  <div
                    key={match.userId}
                    className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-indigo-400 transition-all"
                  >
                    {/* Match Score Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-stone-900">{match.name}</h3>
                        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">
                          {match.department}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full px-4 py-2 flex items-center justify-center font-black text-sm shadow-md whitespace-nowrap">
                        {match.matchScore}% Match
                      </div>
                    </div>

                    {/* University Info */}
                    <div className="mb-4 pb-4 border-b border-stone-200">
                      <p className="text-sm text-stone-600 font-medium">
                        <span className="font-bold text-stone-900">{match.university}</span>
                      </p>
                    </div>

                    {/* Skills */}
                    {match.skills && match.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-black text-stone-700 uppercase tracking-widest mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {match.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {match.skills.length > 3 && (
                            <span className="px-2 py-1 text-xs font-bold text-stone-500">
                              +{match.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Match Reason */}
                    <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded italic text-sm text-stone-700 shadow-inner">
                      <p>
                        <span className="font-bold text-indigo-700 not-italic mr-1">Why:</span>
                        {match.reason}
                      </p>
                    </div>

                    {/* Connect Button */}
                    {isAccepted ? (
                      <button
                        disabled
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-3 rounded-lg opacity-80 cursor-not-allowed"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle size={18} /> MATCHED
                        </span>
                      </button>
                    ) : isIncoming ? (
                      <button
                        onClick={() => handleAccept(existingConnection._id)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-3 rounded-lg hover:shadow-lg transition"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle size={18} /> ACCEPT
                        </span>
                      </button>
                    ) : hasRequested ? (
                      <button
                        disabled
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-3 rounded-lg opacity-50 cursor-not-allowed"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle size={18} /> REQUESTED
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(match.userId)}
                        disabled={connecting === match.userId}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                      >
                        {connecting === match.userId ? 'Requesting...' : (
                          <span className="flex items-center justify-center gap-2">
                            <Plus size={18} /> SEND REQUEST
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          {connections.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl">
              <Clock size={48} className="mx-auto text-stone-300 mb-4" />
              <h3 className="text-xl font-black text-stone-600 mb-2">No Connections Yet</h3>
              <p className="text-stone-500">Start connecting with matches above</p>
            </div>
          ) : (
            <>
              {/* Incoming Connections */}
              {connections.some(c => c.receiver?._id === user?.id && c.status === 'pending') && (
                <div>
                  <h2 className="text-2xl font-black text-stone-900 mb-4 flex items-center gap-2">
                    <Clock size={24} /> Incoming Requests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {connections
                      .filter(c => c.receiver?._id === user?.id && c.status === 'pending')
                      .map(conn => (
                        <div
                          key={conn._id}
                          className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-lg"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-black text-stone-900">{conn.sender.name}</h3>
                              <p className="text-sm text-stone-500">{conn.sender.email}</p>
                            </div>
                            <Clock size={20} className="text-amber-600" />
                          </div>
                          {conn.message && (
                            <p className="text-sm text-stone-700 mb-4 p-3 bg-stone-50 rounded border-l-4 border-amber-400">
                              "{conn.message}"
                            </p>
                          )}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAccept(conn._id)}
                              className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={18} /> Accept
                            </button>
                            <button className="flex-1 bg-stone-300 text-stone-700 font-bold py-2 rounded-lg hover:bg-stone-400 transition">
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Outgoing Connections */}
              {connections.some(c => c.sender?._id === user?.id) && (
                <div>
                  <h2 className="text-2xl font-black text-stone-900 mb-4 flex items-center gap-2">
                    <Plus size={24} /> My Requests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {connections
                      .filter(c => c.sender?._id === user?.id)
                      .map(conn => (
                        <div
                          key={conn._id}
                          className={`bg-white border-2 rounded-2xl p-6 shadow-lg ${conn.status === 'pending' ? 'border-stone-300' : 'border-green-400 bg-green-50'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-black text-stone-900">{conn.receiver.name}</h3>
                              <p className="text-sm text-stone-500">{conn.receiver.email}</p>
                            </div>
                            {conn.status === 'accepted' ? (
                              <CheckCircle size={20} className="text-green-600" />
                            ) : (
                              <Clock size={20} className="text-stone-400" />
                            )}
                          </div>
                          <div className="mb-4 p-2 rounded bg-stone-100">
                            <span className={`text-xs font-bold uppercase tracking-widest ${conn.status === 'pending' ? 'text-stone-600' : 'text-green-700'
                              }`}>
                              Status: {conn.status}
                            </span>
                          </div>
                          {conn.message && (
                            <p className="text-sm text-stone-700 mb-3 p-3 bg-stone-50 rounded border-l-4 border-stone-300">
                              "{conn.message}"
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Accepted Connections */}
              {connections.some(c => c.status === 'accepted') && (
                <div>
                  <h2 className="text-2xl font-black text-stone-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={24} /> Confirmed Matches
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {connections
                      .filter(c => c.status === 'accepted')
                      .map(conn => {
                        const otherUser = conn.sender?._id === user?.id ? conn.receiver : conn.sender;
                        return (
                          <div
                            key={conn._id}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6 shadow-lg"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-black text-stone-900">{otherUser.name}</h3>
                                <p className="text-sm text-stone-500">{otherUser.email}</p>
                              </div>
                              <CheckCircle size={24} className="text-green-600" />
                            </div>
                            <p className="text-sm text-green-700 font-semibold">
                              🎉 You're connected! Ready to collaborate.
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchingEngine;

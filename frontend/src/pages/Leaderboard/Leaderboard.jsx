import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Trophy, Users, Award, Star, TrendingUp, DollarSign, BookOpen, UserCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('university');
  const [universityRankings, setUniversityRankings] = useState([]);
  const [studentRankings, setStudentRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'Organizer';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uniRes, studentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/leaderboard/university'),
        axios.get('http://localhost:5000/api/leaderboard/individual')
      ]);
      setUniversityRankings(uniRes.data);
      setStudentRankings(studentRes.data);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      toast.error('Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNominate = async (studentId) => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/leaderboard/ambassador/${studentId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Nomination error:', err);
      toast.error('Failed to update ambassador status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8">
      {/* Header section with modern glassmorphism */}
      <div className="mb-12 relative p-12 bg-gradient-to-r from-slate-900 to-indigo-900 overflow-hidden shadow-2xl" style={{ borderRadius: '24px 72px 24px 72px' }}>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy size={120} className="text-white" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter font-serif-custom drop-shadow-md flex items-center justify-center md:justify-start gap-4">
            Campus Ecosystem Leaderboard
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl font-medium leading-relaxed italic">
            Celebrating the most active universities and stellar student entrepreneurs across the nation.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab('university')}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md ${
            activeTab === 'university' 
              ? 'bg-indigo-600 text-white translate-y-[-2px]' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Award size={18} /> University Rank
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md ${
            activeTab === 'student' 
              ? 'bg-indigo-600 text-white translate-y-[-2px]' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users size={18} /> Student Stars
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden min-h-[500px]">
        {/* Competition Cycle Banner - Sticky at the top */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-widest">Current Competition Cycle</span>
          </div>
          <div className="text-xs font-bold text-slate-400">
            Week 16: April 20 - April 27, 2026
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] animate-pulse">
            <Trophy size={64} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest">Crunching Numbers...</p>
          </div>
        ) : activeTab === 'university' ? (
          <div className="overflow-x-auto p-4 sm:p-8">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                  <th className="px-6 pb-2">Rank</th>
                  <th className="px-6 pb-2">University</th>
                  <th className="px-6 pb-2 text-center">Teams</th>
                  <th className="px-6 pb-2 text-center">Funding</th>
                  <th className="px-6 pb-2 text-center">Events</th>
                  <th className="px-6 pb-2 text-center">Mentors</th>
                  <th className="px-6 pb-2 text-center">Grads</th>
                  <th className="px-6 pb-2 text-right">Weighted Score</th>
                </tr>
              </thead>
              <tbody>
                {universityRankings.length > 0 ? (
                  universityRankings.map((uni, idx) => {
                    const isTop1 = idx === 0;
                    return (
                      <tr 
                        key={uni.university} 
                        className={`group transition-all duration-300 hover:translate-x-2 ${
                          isTop1 ? 'bg-amber-50/70 border border-amber-200 scale-[1.02] shadow-amber-100 shadow-lg' : 'bg-white/50 border border-slate-100'
                        }`}
                        style={{ borderRadius: isTop1 ? '16px 48px 16px 48px' : '16px 32px 16px 32px' }}
                      >
                        <td className="px-6 py-5 first:rounded-l-[inherit] last:rounded-r-[inherit]">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            isTop1 ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl font-black ${isTop1 ? 'text-amber-900' : 'text-slate-900'}`}>
                              {uni.university}
                            </span>
                            {isTop1 && (
                              <span className="bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter animate-bounce">
                                Leader
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-700 flex items-center justify-center gap-1">
                            <BookOpen size={14} className="text-blue-500" />
                            {uni.activeTeams}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-700 flex items-center justify-center gap-1">
                            <DollarSign size={14} className="text-emerald-500" />
                            {uni.totalFunding.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-700 flex items-center justify-center gap-1">
                            <Star size={14} className="text-amber-500" />
                            {uni.totalEvents}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-700 flex items-center justify-center gap-1">
                            <Users size={14} className="text-indigo-500" />
                            {uni.totalMentorSessions}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-700 flex items-center justify-center gap-1">
                            <Star size={14} className="text-teal-500" />
                            {uni.totalCoursesFinished}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right first:rounded-l-[inherit] last:rounded-r-[inherit]">
                          <div className="flex items-center justify-end gap-2">
                             <TrendingUp size={16} className={isTop1 ? 'text-amber-500' : 'text-indigo-500'} />
                             <span className={`text-2xl font-black ${isTop1 ? 'text-amber-600' : 'text-indigo-600'}`}>
                               {uni.weightedScore.toLocaleString()}
                             </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-400 italic">No rankings available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-8">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                  <th className="px-6 pb-2">Rank</th>
                  <th className="px-6 pb-2">Student Name</th>
                  <th className="px-6 pb-2">University / Dept</th>
                  <th className="px-6 pb-2 text-center">Courses</th>
                  <th className="px-6 pb-2 text-center">Sessions</th>
                  <th className="px-6 pb-2 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {studentRankings.length > 0 ? (
                  studentRankings.map((student, idx) => {
                    const isTop1 = idx === 0;
                    return (
                      <tr 
                        key={student._id} 
                        className={`group transition-all duration-300 hover:translate-x-2 ${
                          isTop1 ? 'bg-amber-50/70 border border-amber-200 scale-[1.02] shadow-amber-100 shadow-lg' : 'bg-white/50 border border-slate-100'
                        }`}
                        style={{ borderRadius: isTop1 ? '16px 48px 16px 48px' : '16px 32px 16px 32px' }}
                      >
                        <td className="px-6 py-5 first:rounded-l-[inherit] last:rounded-r-[inherit]">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            isTop1 ? 'bg-amber-400 text-white shadow-md' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                             <span className={`text-xl font-black ${isTop1 ? 'text-amber-900' : 'text-slate-900'}`}>
                               {student.name}
                             </span>
                             {student.isAmbassador && (
                               <span className="flex items-center gap-1 text-[10px] text-teal-600 font-black uppercase tracking-tighter">
                                 <UserCheck size={12} /> Campus Ambassador
                               </span>
                             )}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-slate-800">{student.university}</div>
                          <div className="text-xs text-slate-400 font-medium">{student.department}</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-700 flex items-center justify-center gap-1 text-lg">
                            <BookOpen size={14} className="text-indigo-500" />
                            {student.coursesFinished || 0}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-700 flex items-center justify-center gap-1 text-lg">
                            <Users size={14} className="text-purple-500" />
                            {student.mentorSessions || 0}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right first:rounded-l-[inherit] last:rounded-r-[inherit]">
                          {isAdmin ? (
                            <button
                              onClick={() => handleNominate(student._id)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                student.isAmbassador 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white' 
                                  : 'bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white'
                              }`}
                            >
                              {student.isAmbassador ? 'Revoke Amb.' : 'Nominate Amb.'}
                            </button>
                          ) : (
                            student.isAmbassador && <Star size={20} className="text-amber-400 ml-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-400 italic">No stellar students recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-center text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
        <TrendingUp size={16} /> Rankings are updated in real-time based on startup activity, mentor interaction, and curriculum progress.
      </p>
      </div>
    </div>
  );
};

export default Leaderboard;

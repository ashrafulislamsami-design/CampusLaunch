import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Rocket, Target, Lightbulb, Users, BarChart3 } from 'lucide-react';
import ProgressTimeline from '../../components/StartupTeam/ProgressTimeline';

const PublicProfile = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicTeam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teams/public/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch team');
        setTeam(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTeam();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Loading pitch deck...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">{error}</div>;
  if (!team) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Startup not found.</div>;

  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Investor Deck Header */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-32 h-32 bg-indigo-600 rounded-3xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition duration-300">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-3xl" />
            ) : (
              <Rocket size={60} className="text-white transform -rotate-3" />
            )}
          </div>
          <h1 className="text-6xl font-black text-gray-900 tracking-tight">
            {team.name}
          </h1>
          <div className="flex justify-center items-center gap-3">
            <span className="px-5 py-2 bg-indigo-100 text-indigo-800 rounded-full font-bold text-sm tracking-wide uppercase shadow-sm">
              Current Stage: {team.stage}
            </span>
          </div>
        </div>

        {/* Pitch Deck Cards */}
        <div className="space-y-8">
          
          {/* Problem Card */}
          <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transform hover:-translate-y-1 transition duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <Target className="text-red-600" size={28} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">The Problem</h2>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              {team.problemStatement}
            </p>
          </div>

          {/* Solution Card */}
          <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transform hover:-translate-y-1 transition duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Lightbulb className="text-indigo-600" size={28} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Our Solution</h2>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              {team.solution}
            </p>
          </div>

          {/* Target Customer Card */}
          {team.targetCustomer && (
            <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transform hover:-translate-y-1 transition duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Users className="text-green-600" size={28} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900">Target Market</h2>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed font-light">
                {team.targetCustomer}
              </p>
            </div>
          )}

          {/* Traction Timeline Section */}
          <div className="bg-[#f7f4ed] border-4 border-amber-300 rounded-[2rem] shadow-[8px_12px_0px_#d97706] overflow-hidden">
            <ProgressTimeline history={team.history} currentStage={team.stage} isPublic={true} />
          </div>

        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <div className="bg-indigo-600 text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <BarChart3 className="mx-auto mb-6 opacity-80" size={48} />
              <h2 className="text-3xl font-bold mb-4">Invest in the Future.</h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
                Interested in supporting {team.name}? Connect with our founders through CampusLaunch to discuss seed opportunities.
              </p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-white text-indigo-600 font-extrabold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition transform"
              >
                Log In to Connect
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;

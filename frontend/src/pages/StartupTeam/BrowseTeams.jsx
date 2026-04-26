import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Rocket, Target, Lightbulb, Users, ArrowRight, Filter, Globe } from 'lucide-react';

import { API_BASE_URL as API } from '@/config';

const TeamCard = ({ team }) => {
  return (
    <div className="placard p-8 group flex flex-col justify-between bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] hover:-translate-y-1 hover:shadow-[6px_8px_0px_#d97706] transition-all relative overflow-hidden"
      style={{ borderRadius: '12px 32px 12px 32px' }}>
      
      {/* Woven texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />

      <div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 text-amber-700 rounded-2xl flex items-center justify-center shadow-sm transform -rotate-3 group-hover:rotate-0 transition overflow-hidden">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <Rocket size={32} className="text-amber-900" />
            )}
          </div>
          <span className="px-3 py-1 border-2 border-teal-300 bg-teal-50 text-teal-900 text-[10px] font-black uppercase tracking-widest rounded-full">
            {team.stage}
          </span>
        </div>

        <h3 className="text-2xl font-black text-amber-900 mb-2 font-serif-custom leading-tight">
          {team.name}
        </h3>
        
        <p className="text-stone-600 text-sm font-medium mb-6 line-clamp-2 italic">
          "{team.problemStatement?.slice(0, 100) || 'No problem statement provided.'}..."
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-stone-700 font-sans-custom font-medium">
            <div className="p-1.5 bg-stone-100 rounded-lg text-amber-700">
              <Lightbulb size={15} />
            </div>
            <span className="text-xs">
              Solution: <span className="font-bold text-stone-800">{team.solution?.slice(0, 50) || 'In development'}...</span>
            </span>
          </div>
          {team.fundingReceived > 0 && (
            <div className="flex items-center gap-3 text-stone-700 font-sans-custom font-medium">
              <div className="p-1.5 bg-stone-100 rounded-lg text-emerald-700">
                <Globe size={15} />
              </div>
              <span className="text-xs">
                Funding: <span className="font-bold text-emerald-700">${team.fundingReceived.toLocaleString()}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <Link
        to={`/startup/${team._id}`}
        className="flex items-center justify-center gap-2 w-full text-center bg-amber-900 text-amber-50 font-black py-4 uppercase tracking-widest text-[10px] border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition relative z-10 shadow-lg"
        style={{ borderRadius: '8px 24px 8px 24px' }}
      >
        View Portfolio <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default function BrowseTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/teams/public${search ? `?search=${search}` : ''}`);
        const data = await res.json();
        setTeams(data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchTeams, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="mb-16 text-center md:text-left relative p-12 jewel-amber shadow-2xl overflow-hidden" 
             style={{ borderRadius: '24px 64px 24px 64px' }}>
          <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="md:w-3/4">
              <h1 className="text-5xl md:text-7xl font-black mb-6 font-serif-custom text-amber-50 drop-shadow-md tracking-tight">
                Startup Showcase
              </h1>
              <p className="text-black-100 text-xl font-sans-custom font-medium max-w-2xl leading-relaxed">
                Explore the next generation of student-led ventures. Discover innovative solutions, track their progress, and connect with the founders of tomorrow.
              </p>
            </div>
            <div className="hidden md:block flex-shrink-0 bg-white/10 p-8 backdrop-blur-md border border-white/20 rounded-[3rem] transform rotate-6 hover:rotate-0 transition duration-500">
              <Rocket size={100} className="text-amber-100 opacity-80" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="placard p-8 border-t-8 border-amber-500 bg-white shadow-2xl mb-12 flex flex-col md:flex-row gap-6 items-center"
             style={{ borderRadius: '16px 40px 16px 40px' }}>
          <div className="relative flex-grow w-full">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400">
              <Search size={24} />
            </span>
            <input
              type="text"
              placeholder="Search by name, problem, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:ring-0 text-stone-800 font-black tracking-tight rounded-3xl shadow-inner transition-all hover:border-stone-300 text-lg"
            />
          </div>
          <button className="gilded-btn px-10 py-5 flex items-center gap-3">
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Discovery Grid */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          <span className="tracking-widest text-[11px] uppercase font-black text-stone-400">
            Showcasing {teams.length} Active Ventures
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-stone-100 rounded-[2rem] border-2 border-dashed border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-32 bg-white border-2 border-dashed border-stone-200 rounded-[3rem]">
            <Rocket size={64} className="mx-auto text-stone-200 mb-6" />
            <h3 className="text-2xl font-black text-stone-400 uppercase tracking-widest">No startups found</h3>
            <p className="text-stone-400 mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {teams.map(team => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

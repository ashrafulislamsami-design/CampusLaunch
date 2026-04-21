import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Rocket, Target, Lightbulb, Users, BarChart3, 
  Award, Globe, Play, Image as ImageIcon, ExternalLink,
  ChevronRight, Calendar, User, Briefcase
} from 'lucide-react';
import ProgressTimeline from '../../components/StartupTeam/ProgressTimeline';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PublicProfile = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicTeam = async () => {
      try {
        const res = await fetch(`${API}/api/teams/public/${id}`);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-red-500 font-bold">{error}</div>;
  if (!team) return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400 font-bold">Startup not found.</div>;

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-stone-900 font-sans-custom pb-24">
      
      {/* ── Hero Banner Section ──────────────────────────────────────── */}
      <div className="relative h-[60vh] overflow-hidden">
        {team.teamPhotoUrl ? (
          <img src={team.teamPhotoUrl} alt="Team" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900 via-stone-900 to-amber-800" />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left w-full md:w-auto">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white p-3 shadow-2xl border-4 border-amber-400/30 transform -rotate-3 hover:rotate-0 transition duration-500 overflow-hidden" 
                 style={{ borderRadius: '24px 48px 24px 48px' }}>
              {team.logoUrl ? (
                <img src={team.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-900">
                  <Rocket size={60} />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Venture Stage: {team.stage}
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl font-serif-custom">
                {team.name}
              </h1>
              <p className="text-amber-100/90 text-lg md:text-xl font-medium italic max-w-2xl leading-relaxed">
                {team.description || "Building the next generation of solutions."}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end pb-4">
            {team.pitchDeckUrl && (
              <a href={team.pitchDeckUrl} target="_blank" rel="noreferrer" className="glass-btn px-8 py-4 flex items-center gap-3 text-white border-2 border-white/30 hover:bg-white hover:text-amber-900 transition font-black uppercase tracking-widest text-xs">
                <FileText size={18} /> Pitch Deck
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* ── Left Column: Narrative & Media ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Mission cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="placard p-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#ef4444] group hover:-translate-y-1 transition" style={{borderRadius: '12px 32px 12px 32px'}}>
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 transform -rotate-6 group-hover:rotate-0 transition">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-black text-stone-900 mb-4 font-serif-custom">The Problem</h3>
              <p className="text-stone-600 leading-relaxed font-medium capitalize-first italic">
                "{team.problemStatement}"
              </p>
            </div>

            <div className="placard p-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] group hover:-translate-y-1 transition" style={{borderRadius: '12px 32px 12px 32px'}}>
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 transform rotate-6 group-hover:rotate-0 transition">
                <Lightbulb size={28} />
              </div>
              <h3 className="text-2xl font-black text-stone-900 mb-4 font-serif-custom">Our Solution</h3>
              <p className="text-stone-600 leading-relaxed font-medium">
                {team.solution}
              </p>
            </div>
          </div>

          <section className="space-y-8">
            <h2 className="text-3xl font-black text-stone-900 flex items-center gap-4 font-serif-custom">
              <ImageIcon className="text-blue-500" /> Product Showcase
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {team.productMedia?.map((media, idx) => (
                <div key={idx} className="group relative overflow-hidden bg-stone-200 aspect-video shadow-2xl border-2 border-stone-200 hover:border-amber-400 transition" 
                     style={{ borderRadius: '16px 48px 16px 48px' }}>
                  {media.mediaType === 'video' ? (
                     <iframe src={media.url} className="w-full h-full pointer-events-auto" frameBorder="0" allowFullScreen></iframe>
                  ) : (
                    <img src={media.url} alt={media.caption} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  )}
                  {media.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 p-4 transform translate-y-full group-hover:translate-y-0 transition duration-300">
                      <p className="text-white text-xs font-black uppercase tracking-widest">{media.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Milestones Timeline */}
          <section className="space-y-8">
            <h2 className="text-3xl font-black text-stone-900 flex items-center gap-4 font-serif-custom">
              <Award className="text-amber-500" /> Achievements & Growth
            </h2>
            <div className="bg-[#f7f4ed] border-4 border-amber-300 p-8 shadow-[8px_12px_0px_#d97706] rounded-[3rem]">
              <div className="mb-12 border-b-2 border-amber-200 pb-8">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-4">Journey Map</h4>
                <ProgressTimeline history={team.history} currentStage={team.stage} isPublic={true} />
              </div>
              
              {team.achievements?.length > 0 && (
                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-6">Key Milestones</h4>
                  {team.achievements.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-white rounded-xl border-2 border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-sm">
                        <Award size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">
                          {item.date ? new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Milestone'}
                        </span>
                        <h5 className="text-xl font-black text-stone-900 mb-2 font-serif-custom">{item.title}</h5>
                        <p className="text-stone-500 text-sm font-medium">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ── Right Column: Info & Team ─────────────────────────────── */}
        <div className="space-y-12">
          
          {/* Business Model Billboard */}
          <div className="placard p-8 bg-stone-900 text-stone-50 shadow-[6px_8px_0px_#1c1917]" style={{borderRadius: '48px 16px 48px 16px'}}>
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block mb-4">Core Strategy</span>
             <h2 className="text-2xl font-black mb-6 font-serif-custom flex items-center gap-3 italic text-amber-50">
               <Briefcase /> Business Model
             </h2>
             <p className="text-stone-400 text-sm leading-relaxed font-medium mb-8">
               {team.businessModel || "Developing sustainable revenue streams through innovation."}
             </p>
             
             {team.fundingRounds?.length > 0 && (
               <div className="pt-8 border-t border-stone-800 space-y-6">
                 <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cap Table Highlights</h4>
                 {team.fundingRounds.map((round, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-stone-800/50 p-4 rounded-2xl border border-stone-700">
                     <div>
                       <span className="text-[10px] font-black text-stone-500 uppercase block">{round.type}</span>
                       <span className="font-bold text-emerald-400">${round.amount?.toLocaleString()}</span>
                     </div>
                     <div className="text-right">
                       <span className="text-[10px] font-black text-stone-500 uppercase block">Source</span>
                       <span className="text-xs font-bold text-stone-300">{round.source}</span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Team Members Spotlight */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3 font-serif-custom">
              <Users className="text-purple-600" /> The Founders
            </h2>
            <div className="space-y-4">
              {team.members.filter(m => m.status === 'accepted').map((member, idx) => (
                <Link to={`/profiles/${member.userId._id}`} key={idx} 
                      className="flex items-center gap-4 p-4 bg-white border-2 border-stone-200 group hover:border-purple-400 transition" 
                      style={{ borderRadius: '12px 32px 12px 32px' }}>
                  <div className="w-14 h-14 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 overflow-hidden group-hover:bg-purple-50 group-hover:border-purple-200 transition">
                    <User size={28} className="group-hover:text-purple-600" />
                  </div>
                  <div className="flex-grow">
                    <h5 className="font-black text-stone-900 group-hover:text-purple-900 transition">{member.userId.name}</h5>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded transition group-hover:bg-purple-100 group-hover:text-purple-700">
                      {member.role}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-stone-300 group-hover:text-purple-600 transform group-hover:translate-x-1 transition" />
                </Link>
              ))}
            </div>
          </section>

          {/* Footer CTA Inside Right Column */}
          <div className="bg-gradient-to-br from-amber-900 to-stone-900 p-8 shadow-2xl relative overflow-hidden" 
               style={{ borderRadius: '24px 64px 24px 64px' }}>
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative z-10 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Connect with {team.name}</h3>
              <p className="text-amber-100/70 text-xs mb-8 leading-relaxed">
                Interested in this venture? Connect with the founders through the CampusLaunch network.
              </p>
              <Link to="/matching" className="gilded-btn w-full py-4 text-xs block text-center">
                Express Interest
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

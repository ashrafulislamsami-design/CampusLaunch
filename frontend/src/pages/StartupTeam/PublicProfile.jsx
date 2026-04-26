import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Rocket, Target, Lightbulb, Users, BarChart3, 
  Globe, Play, Image as ImageIcon, Award, 
  DollarSign, Briefcase, ChevronRight, ExternalLink,
  Download
} from 'lucide-react';
import ProgressTimeline from '../../components/StartupTeam/ProgressTimeline';
import { API_BASE_URL } from '@/config';

const PublicProfile = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicTeam = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/teams/public/${id}`);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Rocket size={48} className="text-amber-600 animate-bounce" />
        <span className="text-stone-400 font-black uppercase tracking-widest text-sm">Initializing Portfolio...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
      <div className="text-center p-8 bg-white border-2 border-red-200 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black text-red-600 mb-2 uppercase tracking-tight">System Error</h2>
        <p className="text-stone-600">{error}</p>
      </div>
    </div>
  );

  if (!team) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
      <div className="text-center">
        <Rocket size={64} className="mx-auto text-stone-200 mb-4" />
        <h3 className="text-xl font-black text-stone-400 uppercase tracking-widest">Startup Not Found</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-24">
      
      {/* ── HERO HEADER ── */}
      <div className="relative h-64 md:h-80 bg-[#0c2a4d] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-1 w-full h-24 bg-gradient-to-t from-[#fcfaf7] to-transparent"></div>
        
        {/* Logo Placement */}
        <div className="max-w-6xl mx-auto px-4 h-full relative">
          <div className="absolute -bottom-12 left-4 md:left-8 w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-[2.5rem] shadow-2xl border-4 border-[#fcfaf7] z-20 overflow-hidden">
             {team.logoUrl ? (
                <img src={team.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-3xl" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center rounded-3xl">
                  <Rocket size={60} className="text-stone-300" />
                </div>
              )}
          </div>
          
          <div className="absolute bottom-4 left-40 md:left-56 text-white pb-2 md:pb-6">
             <div className="bg-amber-500 text-amber-50 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 inline-block shadow-lg">
                Showcase Series 2024
             </div>
             <h1 className="text-4xl md:text-6xl font-black tracking-tight font-serif-custom drop-shadow-md">
               {team.name}
             </h1>
             <p className="text-indigo-200 text-sm md:text-lg italic font-medium opacity-90 mt-1">
               {team.description || "Building the next generation of solutions."}
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ── LEFT COLUMN: MAIN CONTENT ── */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Problem & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem */}
              <div className="placard p-8 bg-white border-b-4 border-red-500/30 hover:border-red-500 transition-all group" style={{borderRadius: '16px 40px 16px 40px'}}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition">
                    <Target size={24} />
                  </div>
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight font-serif-custom">The Problem</h3>
                </div>
                <p className="text-stone-600 font-medium leading-relaxed italic">
                  "{team.problemStatement}"
                </p>
              </div>

              {/* Solution */}
              <div className="placard p-8 bg-white border-b-4 border-amber-500/30 hover:border-amber-50 transition-all group" style={{borderRadius: '40px 16px 40px 16px'}}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition">
                    <Lightbulb size={24} />
                  </div>
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight font-serif-custom">Our Solution</h3>
                </div>
                <p className="text-stone-600 font-medium leading-relaxed">
                  {team.solution}
                </p>
              </div>
            </div>

            {/* Product Showcase Gallery */}
            <section className="space-y-6">
              <h3 className="text-2xl font-black text-stone-900 flex items-center gap-3 uppercase tracking-widest border-l-4 border-teal-500 pl-4">
                <Globe className="text-teal-600" size={28} /> Product Showcase
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {team.productMedia && team.productMedia.length > 0 ? (
                  team.productMedia.map((media, idx) => (
                    <div key={idx} className="placard bg-white border-2 border-stone-100 overflow-hidden group" style={{borderRadius: '12px 32px 12px 32px'}}>
                      {media.mediaType === 'video' ? (
                        <div className="aspect-video bg-stone-900 relative">
                           {/* YouTube Embed Logic */}
                           <iframe 
                             src={media.url.replace('watch?v=', 'embed/')} 
                             className="w-full h-full"
                             title={media.caption || 'Video'}
                             allowFullScreen
                           />
                        </div>
                      ) : (
                        <div className="aspect-video relative overflow-hidden">
                          <img src={media.url} alt={media.caption} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                      )}
                      <div className="p-4 bg-white border-t border-stone-50">
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest italic">{media.caption || 'Media Highlight'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center bg-white border-2 border-dashed border-stone-200 rounded-[2rem]">
                    <ImageIcon size={48} className="mx-auto text-stone-200 mb-4" />
                    <p className="text-stone-400 font-bold uppercase tracking-widest text-sm italic">Product Gallery in development</p>
                  </div>
                )}
              </div>
            </section>

            {/* Achievements & Growth */}
            <section className="space-y-6">
               <h3 className="text-2xl font-black text-stone-900 flex items-center gap-3 uppercase tracking-widest border-l-4 border-amber-500 pl-4">
                <TrendingUpIcon size={28} className="text-amber-600" /> Achievements & Growth
              </h3>
              
              {/* Traction Journey */}
              <div className="bg-amber-50/30 border-4 border-amber-100 rounded-[3rem] shadow-inner overflow-hidden mb-8">
                 <ProgressTimeline history={team.history} currentStage={team.stage} isPublic={true} />
              </div>

              {/* Milestones List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.achievements && team.achievements.length > 0 ? (
                  team.achievements.map((ach, idx) => (
                    <div key={idx} className="placard p-6 bg-white flex items-start gap-4 border-2 border-stone-100 hover:border-amber-300 transition" style={{borderRadius: '8px 24px 8px 24px'}}>
                       <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                          <Award size={20} />
                       </div>
                       <div>
                          <h4 className="font-black text-stone-800 text-sm uppercase mb-1">{ach.title}</h4>
                          <p className="text-[10px] text-stone-400 font-bold mb-2">{new Date(ach.date).toLocaleDateString()}</p>
                          <p className="text-xs text-stone-600 leading-relaxed italic">{ach.description}</p>
                       </div>
                    </div>
                  ))
                ) : (
                   <div className="col-span-2 placard p-6 bg-white border-2 border-dashed border-stone-200 text-center" style={{borderRadius: '12px 32px 12px 32px'}}>
                      <Award size={24} className="mx-auto text-stone-200 mb-2" />
                      <p className="text-xs text-stone-400 font-bold uppercase">No official milestones logged yet</p>
                   </div>
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN: SIDEBAR METADATA ── */}
          <div className="space-y-10">
            
            {/* Business Model Card */}
            <div className="placard p-8 bg-[#1c1917] text-stone-50 border-t-8 border-amber-500 shadow-2xl relative overflow-hidden" style={{borderRadius: '16px 48px 16px 48px'}}>
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Briefcase size={80} />
               </div>
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-6 flex items-center gap-3">
                 <Briefcase size={16} /> Business Model
               </h3>
               <p className="text-stone-300 leading-relaxed font-light italic mb-8 border-l border-stone-700 pl-4">
                 {team.businessModel || "Developing sustainable revenue streams through strategic university and industry partnerships."}
               </p>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-stone-800">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Current Stage</span>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{team.stage}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-stone-800">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Seed Raised</span>
                    <span className="text-xs font-black text-teal-400 uppercase tracking-wider">${team.fundingReceived?.toLocaleString() || '0'}</span>
                  </div>
               </div>
            </div>

            {/* Founders Grid */}
            <section className="space-y-6">
               <h3 className="text-xl font-black text-stone-900 flex items-center gap-3 uppercase tracking-widest">
                <Users className="text-purple-600" size={24} /> The Founders
              </h3>
              <div className="space-y-4">
                {team.members && team.members.filter(m => m.status === 'accepted').map((m, idx) => (
                  <div key={idx} className="placard p-4 bg-white border-2 border-stone-200 flex items-center gap-4 group hover:border-amber-400 transition shadow-sm" style={{borderRadius: '8px 24px 8px 24px'}}>
                     <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-700 transition shadow-inner">
                        <Users size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-stone-800 uppercase tracking-tight">{m.userId?.name || "Founder"}</h4>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.1em]">{m.role}</p>
                     </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Connect CTA */}
            <div className="placard p-8 bg-amber-900 text-amber-50 text-center shadow-2xl group hover:-translate-y-1 transition duration-500" style={{borderRadius: '48px 16px 48px 16px'}}>
               <h3 className="text-xl font-black mb-4 font-serif-custom tracking-tight leading-tight">Connect with {team.name}</h3>
               <p className="text-xs text-amber-100/70 mb-8 leading-relaxed font-medium">Interested in this venture? Connect with the founders through the CampusLaunch network.</p>
               
               <div className="space-y-3">
                 <button 
                   onClick={() => window.location.href = '/login'}
                   className="w-full bg-white text-amber-900 font-black py-4 uppercase tracking-widest text-xs rounded-2xl shadow-lg group-hover:shadow-amber-500/20 transition"
                 >
                   Express Interest
                 </button>
                 {team.pitchDeckUrl && (
                   <a 
                     href={team.pitchDeckUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="w-full flex items-center justify-center gap-2 text-amber-200 font-black py-2 uppercase tracking-[0.2em] text-[9px] hover:text-white transition"
                   >
                     <Download size={14} /> Download Pitch Deck
                   </a>
                 )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Icon for Growth
const TrendingUpIcon = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export default PublicProfile;

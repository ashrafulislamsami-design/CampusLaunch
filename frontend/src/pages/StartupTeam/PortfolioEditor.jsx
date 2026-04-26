import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { 
  Save, ArrowLeft, Image, Video, Award, DollarSign, 
  Trash2, Plus, Sparkles, Layout, Type, FileText,
  Target, Lightbulb, TrendingUp
} from 'lucide-react';

import { API_BASE_URL as API } from '../../config';

export default function PortfolioEditor() {
  const { teamId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    problemStatement: '',
    solution: '',
    businessModel: '',
    teamPhotoUrl: '',
    logoUrl: '',
    pitchDeckUrl: '',
    stage: 'Idea',
    productMedia: [], // { url, mediaType, caption }
    achievements: [], // { title, date, description, awardType }
    fundingRounds: [] // { amount, date, source, type }
  });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API}/teams/${teamId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setTeam(data);
          setFormData({
            name: data.name || '',
            description: data.description || '',
            problemStatement: data.problemStatement || '',
            solution: data.solution || '',
            businessModel: data.businessModel || '',
            teamPhotoUrl: data.teamPhotoUrl || '',
            logoUrl: data.logoUrl || '',
            pitchDeckUrl: data.pitchDeckUrl || '',
            stage: data.stage || 'Idea',
            productMedia: data.productMedia || [],
            achievements: data.achievements || [],
            fundingRounds: data.fundingRounds || []
          });
        } else {
          toast.error(data.message || 'Failed to load team');
          navigate(`/teams/dashboard/${teamId}`);
        }
      } catch (err) {
        console.error(err);
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId, token, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/teams/${teamId}/portfolio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Showcase updated successfully!');
        navigate(`/startup/${teamId}`);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field, defaultValue) => {
    setFormData({ ...formData, [field]: [...formData[field], defaultValue] });
  };

  const removeItem = (field, index) => {
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData({ ...formData, [field]: newList });
  };

  const updateListItem = (field, index, key, value) => {
    const newList = [...formData[field]];
    newList[index][key] = value;
    setFormData({ ...formData, [field]: newList });
  };

  if (loading) return <div className="p-12 text-center text-stone-400 font-black animate-pulse">Initializing Editor...</div>;

  return (
    <div className="min-h-screen bg-[#fdfbf9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-8 border-2 border-stone-200 shadow-[6px_8px_0px_#78350f]" style={{borderRadius: '16px 48px 16px 48px'}}>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-3 bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-900 transition rounded-2xl shadow-inner">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-amber-900 font-serif-custom tracking-tight">Portfolio Editor</h1>
              <p className="text-stone-400 text-xs font-black uppercase tracking-widest mt-1">Refining {formData.name}'s Public Presence</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="gilded-btn px-10 py-4 flex items-center gap-3 text-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : <><Save size={22} /> Save Showcase</>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Core Narrative Section */}
            <section className="placard p-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706]" style={{borderRadius: '12px 32px 12px 32px'}}>
              <h2 className="text-xl font-black text-amber-900 mb-8 flex items-center gap-3 font-serif-custom border-b-2 border-amber-100 pb-4">
                <Type className="text-amber-600" size={24} /> Core Narrative
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Venture Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell the world about your startup's mission and journey..."
                    className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-100 focus:border-amber-400 focus:bg-white rounded-[1.5rem] shadow-inner text-stone-800 font-medium h-32"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                       <Target size={12} className="text-red-500" /> The Problem
                    </label>
                    <textarea 
                      value={formData.problemStatement}
                      onChange={(e) => setFormData({...formData, problemStatement: e.target.value})}
                      className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 focus:border-red-400 focus:bg-white rounded-2xl shadow-inner text-sm h-24"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                       <Lightbulb size={12} className="text-amber-500" /> The Solution
                    </label>
                    <textarea 
                      value={formData.solution}
                      onChange={(e) => setFormData({...formData, solution: e.target.value})}
                      className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 focus:border-amber-400 focus:bg-white rounded-2xl shadow-inner text-sm h-24"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                    <Sparkles size={12} className="text-teal-600" /> Business Model
                  </label>
                  <textarea 
                    value={formData.businessModel}
                    onChange={(e) => setFormData({...formData, businessModel: e.target.value})}
                    placeholder="How does your startup create, deliver, and capture value?"
                    className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-100 focus:border-teal-400 focus:bg-white rounded-2xl shadow-inner text-sm h-28"
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Product Media Gallery */}
            <section className="placard p-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706]" style={{borderRadius: '12px 32px 12px 32px'}}>
              <div className="flex justify-between items-center mb-8 border-b-2 border-amber-100 pb-4">
                <h2 className="text-xl font-black text-amber-900 flex items-center gap-3 font-serif-custom">
                  <Layout className="text-blue-600" size={24} /> Product Showcase
                </h2>
                <button 
                  onClick={() => addItem('productMedia', { url: '', mediaType: 'image', caption: '' })}
                  className="bg-amber-100 text-amber-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-amber-200 transition"
                >
                  + Add Media
                </button>
              </div>

              <div className="space-y-6">
                {formData.productMedia.map((media, idx) => (
                  <div key={idx} className="p-6 bg-stone-50 border-2 border-stone-100 rounded-[2rem] relative group">
                    <button 
                      onClick={() => removeItem('productMedia', idx)}
                      className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 transition shadow-sm rounded-full bg-white opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <select 
                          value={media.mediaType}
                          onChange={(e) => updateListItem('productMedia', idx, 'mediaType', e.target.value)}
                          className="w-full px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold"
                        >
                          <option value="image">📸 Image URL</option>
                          <option value="video">🎥 Video Embed URL</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="URL (e.g., Imgur or Youtube Embed)" 
                          value={media.url}
                          onChange={(e) => updateListItem('productMedia', idx, 'url', e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <input 
                          type="text" 
                          placeholder="Caption / Description" 
                          value={media.caption}
                          onChange={(e) => updateListItem('productMedia', idx, 'caption', e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm h-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements & Awards */}
            <section className="placard p-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706]" style={{borderRadius: '12px 32px 12px 32px'}}>
              <div className="flex justify-between items-center mb-8 border-b-2 border-amber-100 pb-4">
                <h2 className="text-xl font-black text-amber-900 flex items-center gap-3 font-serif-custom">
                  <Award className="text-amber-500" size={24} /> Milestones & Awards
                </h2>
                <button 
                  onClick={() => addItem('achievements', { title: '', date: '', description: '', awardType: '' })}
                  className="bg-amber-100 text-amber-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-amber-200 transition"
                >
                  + Add Milestone
                </button>
              </div>

              <div className="space-y-6">
                {formData.achievements.map((item, idx) => (
                  <div key={idx} className="p-6 bg-amber-50/30 border-2 border-amber-100 rounded-[2rem] relative group border-dashed">
                    <button 
                      onClick={() => removeItem('achievements', idx)}
                      className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Achievement Title (e.g. Winner of Startup Hackathon)" 
                        value={item.title}
                        onChange={(e) => updateListItem('achievements', idx, 'title', e.target.value)}
                        className="px-4 py-2 border rounded-xl text-sm font-bold"
                      />
                      <input 
                        type="date" 
                        value={item.date ? new Date(item.date).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateListItem('achievements', idx, 'date', e.target.value)}
                        className="px-4 py-2 border rounded-xl text-sm"
                      />
                      <textarea 
                        placeholder="Details..." 
                        value={item.description}
                        onChange={(e) => updateListItem('achievements', idx, 'description', e.target.value)}
                        className="md:col-span-2 px-4 py-2 border rounded-xl text-xs h-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Visual Branding Section */}
            <section className="placard p-8 bg-stone-900 text-stone-50 shadow-[6px_8px_0px_#1c1917]" style={{borderRadius: '32px 12px 32px 12px'}}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-3 font-serif-custom border-b border-stone-800 pb-4">
                <Image className="text-amber-400" size={20} /> Visual Identity
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Logo URL</label>
                  <input 
                    type="text" 
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border-2 border-stone-700 rounded-2xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Team Banner Image</label>
                  <input 
                    type="text" 
                    value={formData.teamPhotoUrl}
                    onChange={(e) => setFormData({...formData, teamPhotoUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border-2 border-stone-700 rounded-2xl text-xs font-mono"
                  />
                  <p className="text-[10px] text-stone-500 mt-2 italic px-1">A high-quality group photo or office shot.</p>
                </div>
              </div>
            </section>

            {/* Resources Section */}
            <section className="placard p-8 bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706]" style={{borderRadius: '12px 32px 12px 32px'}}>
              <h2 className="text-lg font-black text-amber-900 mb-6 flex items-center gap-3 font-serif-custom border-b-2 border-amber-50 pb-4">
                <FileText className="text-purple-600" size={20} /> Capital & Pitch
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Pitch Deck URL</label>
                  <input 
                    type="text" 
                    value={formData.pitchDeckUrl}
                    onChange={(e) => setFormData({...formData, pitchDeckUrl: e.target.value})}
                    placeholder="Link to PDF (Google Drive/Dropbox)"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                       <DollarSign size={12} className="text-emerald-600" /> Funding Rounds
                    </label>
                    <button 
                      onClick={() => addItem('fundingRounds', { amount: 0, date: '', source: '', type: 'Seed' })}
                      className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.fundingRounds.map((round, idx) => (
                      <div key={idx} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative group">
                         <button 
                          onClick={() => removeItem('fundingRounds', idx)}
                          className="absolute -top-2 -right-2 p-1.5 bg-white text-red-400 border border-red-100 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number" 
                            placeholder="Amount" 
                            value={round.amount}
                            onChange={(e) => updateListItem('fundingRounds', idx, 'amount', e.target.value)}
                            className="bg-white px-3 py-2 text-xs border rounded-lg font-bold"
                          />
                          <input 
                            type="text" 
                            placeholder="Source" 
                            value={round.source}
                            onChange={(e) => updateListItem('fundingRounds', idx, 'source', e.target.value)}
                            className="bg-white px-3 py-2 text-xs border rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Tips */}
            <div className="bg-amber-900 text-amber-50 p-8 shadow-xl" style={{borderRadius: '48px 16px 48px 16px'}}>
               <TrendingUp className="mb-4 text-amber-300" size={32} />
               <h4 className="text-lg font-black font-serif-custom mb-3">Founders Tip</h4>
               <p className="text-xs text-amber-100/70 leading-relaxed font-medium">
                 Startups with a completed "Problem/Solution" narrative and a public pitch deck receive 3.5x more interest from university mentors and local investors.
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

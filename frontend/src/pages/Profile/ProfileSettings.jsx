import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User as UserIcon, Bookmark, BookOpen, Building, Sparkles, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ProfileSettings = () => {
  const { token, user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    department: '',
    skills: '', // Map array to comma-separated string for easy editing
    ideaStage: '',
    funding: 0,
    pitchEvents: 0,
    mentorSessions: 0
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        university: user.university || '',
        department: user.department || '',
        skills: user.skills ? user.skills.join(', ') : (user.expertise ? user.expertise.join(', ') : ''),
        ideaStage: user.ideaStage || '',
        funding: user.funding || 0,
        pitchEvents: user.pitchEvents || 0,
        mentorSessions: user.mentorSessions || 0
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Saving...');

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      
      // Update AuthContext globally instantly
      setUser(prev => ({ ...prev, ...data }));
      setStatus('Profile updated successfully!');
      setTimeout(() => setStatus(''), 3000);
      
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-gray-500 font-bold">Loading Profile...</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="relative p-10 bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden mb-10" style={{ borderRadius: '16px 48px 16px 48px' }}>
          <div className="absolute inset-0 opacity-10 bg-black"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center font-black text-3xl shadow-xl">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={40} />}
            </div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight font-serif-custom">My Profile</h1>
              <p className="text-indigo-100 font-medium">Manage your personal settings and activity metrics.</p>
            </div>
          </div>
        </div>

        {status && (
          <div className={`mb-6 p-3 rounded font-bold text-sm ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {status}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><UserIcon size={16}/> Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"/>
            </div>
            
            {user.role === 'Student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Building size={16}/> University</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900 shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><BookOpen size={16}/> Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900 shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Sparkles size={16}/> Idea Stage</label>
                  <select name="ideaStage" value={formData.ideaStage} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900 shadow-sm">
                    <option value="">Select Stage</option>
                    <option value="idea">Idea</option>
                    <option value="prototype">Prototype</option>
                    <option value="mvp">MVP</option>
                    <option value="growth">Growth</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Bookmark size={16}/> Interests / Skills <span className="text-xs font-normal text-gray-400 ml-2">(comma separated)</span></label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Graphic Design, Python, Sales" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900"/>
            </div>
          </div>

          {/* Startup Stats Section */}
          <div className="mt-8 p-6 bg-slate-100 rounded-[20px] border border-slate-200 shadow-inner">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" /> Startup Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Funding Received</label>
                <input 
                  type="number" 
                  name="funding" 
                  value={formData.funding} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Pitch Events Joined</label>
                <input 
                  type="number" 
                  name="pitchEvents" 
                  value={formData.pitchEvents} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Mentor Sessions Attended</label>
                <input 
                  type="number" 
                  name="mentorSessions" 
                  value={formData.mentorSessions} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-indigo-700 transition transform hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;

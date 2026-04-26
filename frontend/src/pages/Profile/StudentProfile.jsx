import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL as API } from '../../config';
import ProfileForm from '../../components/profile/ProfileForm';
import toast from 'react-hot-toast';
import {
  Rocket, Edit3, Trash2, CheckCircle2, Clock, Link2,
  Users, Lightbulb, Code2, BookOpen, Award, Eye, EyeOff
} from 'lucide-react';

// ─── Tag colour map ───────────────────────────────────────────────────────────
const TAG_STYLES = {
  'Looking for co-founder': 'bg-amber-100 text-amber-900 border-amber-300',
  'I have an idea':          'bg-teal-50   text-teal-900  border-teal-300',
  'Ready to join a team':    'bg-stone-100 text-stone-700 border-stone-300',
};

// ─── Skill pill (read-only) ───────────────────────────────────────────────────
function SkillBadge({ label, accent = 'amber' }) {
  const cls = accent === 'teal'
    ? 'bg-teal-50 text-teal-800 border-teal-200'
    : 'bg-amber-50 text-amber-900 border-amber-200';
  return (
    <span
      className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${cls}`}
      style={{ borderRadius: '4px 12px 4px 12px' }}
    >
      {label}
    </span>
  );
}

// ─── Project card (read-only) ─────────────────────────────────────────────────
function ProjectCard({ proj }) {
  return (
    <div
      className="bg-stone-50 border-2 border-stone-200 p-4 hover:border-amber-300 transition-colors"
      style={{ borderRadius: '8px 20px 8px 20px' }}
    >
      <p className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1">{proj.title}</p>
      <p className="text-stone-500 text-xs leading-relaxed">{proj.description}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StudentProfile() {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => { fetchMyProfile(); }, []);

  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/profiles/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) { setProfile(null); }
      else { const d = await res.json(); setProfile(d); }
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (formData) => {
    const res = await fetch(`${API}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) { toast.success('Profile created!'); setProfile(data); }
    else toast.error(data.message || 'Error creating profile');
  };

  const handleUpdate = async (formData) => {
    const res = await fetch(`${API}/profiles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) { toast.success('Profile updated!'); setProfile(data); setEditing(false); }
    else toast.error(data.message || 'Error updating profile');
  };

  const handleDelete = async () => {
    if (!confirm('Delete your profile? This cannot be undone.')) return;
    const res = await fetch(`${API}/profiles`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { toast.success('Profile deleted'); setProfile(null); }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="animate-pulse text-stone-400 font-black text-xs uppercase tracking-widest">Loading…</div>
    </div>
  );

  // ── Create mode ──────────────────────────────────────────────────────────
  if (!profile && !editing) return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero banner */}
      <div className="jewel-teal p-10 mb-8 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-teal-50 font-serif-custom mb-2 leading-tight">Build Your Founder Profile</h1>
            <p className="text-teal-200 text-sm font-medium max-w-md leading-relaxed">
              Let co-founders and mentors discover you. Complete your profile to unlock the full network.
            </p>
          </div>
          <Rocket size={72} className="text-teal-200 opacity-40 transform rotate-12 flex-shrink-0" />
        </div>
      </div>
      <ProfileForm onSave={handleCreate} isEdit={false} />
    </div>
  );

  // ── Edit mode ────────────────────────────────────────────────────────────
  if (editing) return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-amber-900 font-serif-custom">Edit Profile</h1>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-500 hover:text-amber-900 border-2 border-stone-200 hover:border-amber-400 px-4 py-2 transition-all"
          style={{ borderRadius: '8px 20px 8px 20px' }}
        >
          ✕ Cancel
        </button>
      </div>
      <ProfileForm initialData={profile} onSave={handleUpdate} isEdit={true} />
    </div>
  );

  // ── View mode ────────────────────────────────────────────────────────────
  const completeness = profile.completeness ?? 0;
  const barColor = completeness < 40 ? '#ef4444' : completeness < 70 ? '#f59e0b' : '#0d9488';

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8 space-y-6">

      {/* ── Hero card ──────────────────────────────────────────────────── */}
      <div
        className="placard bg-white border-2 border-stone-200 shadow-[5px_7px_0px_#d97706] p-8 relative overflow-hidden"
        style={{ borderRadius: '16px 48px 16px 48px' }}
      >
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
          {/* Left: identity */}
          <div className="flex-1">
            {/* Tag */}
            <span
              className={`inline-block px-3 py-1 border-2 text-[10px] font-black uppercase tracking-widest mb-4 ${TAG_STYLES[profile.profileTag] || TAG_STYLES['Ready to join a team']}`}
              style={{ borderRadius: '4px 12px 4px 12px' }}
            >
              {profile.profileTag}
            </span>

            <h1 className="text-4xl font-black text-amber-900 font-serif-custom leading-tight mb-1">
              {profile.name}
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              {[profile.university, profile.department].filter(Boolean).join(' · ')}
              {profile.graduationYear && ` · Class of ${profile.graduationYear}`}
            </p>

            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-widest text-teal-700 hover:text-teal-900 transition-colors"
              >
                <Link2 size={11} /> LinkedIn Profile
              </a>
            )}
          </div>

          {/* Right: meta */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-amber-900 text-amber-50 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 border-2 border-amber-900 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition-all shadow-[2px_3px_0px_#78350f]"
                style={{ borderRadius: '8px 20px 8px 20px' }}
              >
                <Edit3 size={11} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 border-2 border-red-200 hover:border-red-400 transition-all"
                style={{ borderRadius: '8px 20px 8px 20px' }}
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-bold">
              {profile.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
              {profile.isPublic ? 'Public profile' : 'Private profile'}
            </div>
          </div>
        </div>

        {/* Completeness strip */}
        <div className="relative z-10 mt-6 pt-6 border-t-2 border-stone-100">
          <div className="flex justify-between text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-teal-600" /> Profile Completeness</span>
            <span className="text-amber-900">{completeness}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${completeness}%`, backgroundColor: barColor }} />
          </div>
        </div>
      </div>

      {/* ── Two-column body ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Availability */}
        <div
          className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
          style={{ borderRadius: '12px 32px 12px 32px' }}
        >
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
            <Clock size={12} className="text-teal-700" /> Weekly Availability
          </p>
          <p className="text-5xl font-black text-amber-900 font-serif-custom relative z-10">
            {profile.weeklyAvailability}<span className="text-lg font-bold"> hrs/wk</span>
          </p>
        </div>

        {/* Skills */}
        <div
          className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
          style={{ borderRadius: '12px 32px 12px 32px' }}
        >
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
            <Code2 size={12} className="text-teal-700" /> My Skills
          </p>
          <div className="flex flex-wrap gap-2 relative z-10">
            {profile.skills.length > 0
              ? profile.skills.map(s => <SkillBadge key={s} label={s} accent="amber" />)
              : <span className="text-stone-300 text-xs italic">No skills added yet</span>}
          </div>
        </div>
      </div>

      {/* Looking For */}
      {profile.lookingForSkills?.length > 0 && (
        <div
          className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
          style={{ borderRadius: '12px 32px 12px 32px' }}
        >
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
            <Users size={12} className="text-teal-700" /> Looking for in a Co-founder
          </p>
          <div className="flex flex-wrap gap-2 relative z-10">
            {profile.lookingForSkills.map(s => <SkillBadge key={s} label={s} accent="teal" />)}
          </div>
        </div>
      )}

      {/* Motivation */}
      {profile.motivation && (
        <div
          className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
          style={{ borderRadius: '12px 32px 12px 32px' }}
        >
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
            <Rocket size={12} className="text-teal-700" /> Motivation
          </p>
          <p className="text-stone-600 text-sm font-medium leading-relaxed italic border-l-4 border-amber-300 pl-4 relative z-10">
            {profile.motivation}
          </p>
        </div>
      )}

      {/* Startup Idea */}
      {profile.startupIdea && (
        <div
          className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
          style={{ borderRadius: '12px 32px 12px 32px' }}
        >
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
            <Lightbulb size={12} className="text-amber-600" /> Startup Idea
          </p>
          <p className="text-stone-600 text-sm font-medium leading-relaxed relative z-10">{profile.startupIdea}</p>
        </div>
      )}

      {/* Past Projects */}
      {profile.pastProjects?.length > 0 && (
        <div
          className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
          style={{ borderRadius: '12px 32px 12px 32px' }}
        >
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
            <BookOpen size={12} className="text-teal-700" /> Past Projects
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {profile.pastProjects.map((p, i) => <ProjectCard key={i} proj={p} />)}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
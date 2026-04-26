import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Users, Lightbulb, Rocket, Code2, Clock,
  CheckCircle2, ExternalLink, UserCheck, Award
} from 'lucide-react';

import { API_BASE_URL as API } from '../../config';

const SKILL_OPTIONS = [
  'coding', 'design', 'marketing', 'writing', 'finance',
  'sales', 'product', 'data', 'ai/ml', 'legal',
  'operations', 'social media', 'video editing', 'research',
];

const TAG_OPTIONS = [
  { label: 'All',                    value: '' },
  { label: 'Looking for Co-founder', value: 'Looking for co-founder' },
  { label: 'I Have an Idea',          value: 'I have an idea' },
  { label: 'Ready to Join a Team',    value: 'Ready to join a team' },
];

// ─── Tag colour ───────────────────────────────────────────────────────────────
const TAG_STYLES = {
  'Looking for co-founder': 'bg-amber-50 text-amber-900 border-amber-300',
  'I have an idea':          'bg-teal-50  text-teal-900  border-teal-300',
  'Ready to join a team':    'bg-stone-50 text-stone-700 border-stone-300',
};

// ─── Profile Card (mirrors FundingCard's aesthetic exactly) ──────────────────
const ProfileCard = ({ profile }) => {
  const completeness = profile.completeness ?? 0;
  const barColor = completeness < 40 ? '#ef4444' : completeness < 70 ? '#f59e0b' : '#0d9488';

  // Pick icon for tag
  const TagIcon =
    profile.profileTag === 'Looking for co-founder' ? Users :
    profile.profileTag === 'I have an idea'          ? Lightbulb :
    Rocket;

  return (
    <div
      className="placard p-8 group flex flex-col justify-between bg-white border-2 border-stone-200 shadow-[4px_6px_0px_#d97706] hover:-translate-y-1 hover:shadow-[6px_8px_0px_#d97706] transition-all relative overflow-hidden"
      style={{ borderRadius: '12px 32px 12px 32px' }}
    >
      {/* Woven texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />

      <div>
        {/* Header row — icon + tag badge */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 text-amber-700 rounded-xl flex items-center justify-center shadow-sm transform -rotate-3 group-hover:rotate-0 transition">
            <TagIcon size={26} className="text-amber-900" />
          </div>
          <span
            className={`px-3 py-1 border-2 text-[10px] font-black uppercase tracking-widest ${TAG_STYLES[profile.profileTag] || TAG_STYLES['Ready to join a team']}`}
            style={{ borderRadius: '4px 10px 4px 10px' }}
          >
            {profile.profileTag}
          </span>
        </div>

        {/* Name + university */}
        <h3 className="text-2xl font-black text-amber-900 mb-1 font-serif-custom leading-tight">
          {profile.name}
        </h3>
        <p className="text-stone-500 text-xs font-black uppercase tracking-widest mb-4">
          {profile.university || 'University not listed'}
        </p>

        {/* Meta row */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-stone-700 font-sans-custom font-medium">
            <div className="p-1.5 bg-stone-100 rounded-lg text-teal-700">
              <Clock size={15} />
            </div>
            <span className="text-sm">
              Availability: <span className="font-bold text-amber-900">{profile.weeklyAvailability} hrs/week</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-700 font-sans-custom font-medium">
            <div className="p-1.5 bg-stone-100 rounded-lg text-amber-700">
              <Code2 size={15} />
            </div>
            <span className="text-sm">
              Skills: <span className="font-bold text-amber-900">{profile.skills.slice(0, 3).join(', ')}{profile.skills.length > 3 ? ` +${profile.skills.length - 3}` : ''}</span>
            </span>
          </div>
        </div>

        {/* Motivation snippet */}
        {profile.motivation && (
          <div
            className="bg-stone-50/50 p-4 border border-stone-200 mb-4"
            style={{ borderRadius: '8px 16px 8px 16px' }}
          >
            <h4 className="text-[10px] font-black text-amber-900 font-serif-custom uppercase tracking-widest mb-2 flex items-center gap-2">
              <UserCheck size={12} className="text-teal-700" /> Motivation
            </h4>
            <p className="text-stone-600 text-[11px] font-medium leading-relaxed italic line-clamp-3">
              {profile.motivation}
            </p>
          </div>
        )}

        {/* Startup idea snippet */}
        {profile.startupIdea && (
          <div
            className="bg-stone-50/50 p-4 border border-stone-200 mb-4"
            style={{ borderRadius: '8px 16px 8px 16px' }}
          >
            <h4 className="text-[10px] font-black text-amber-900 font-serif-custom uppercase tracking-widest mb-2 flex items-center gap-2">
              <Award size={12} className="text-amber-600" /> Startup Idea
            </h4>
            <p className="text-stone-600 text-[11px] font-medium leading-relaxed line-clamp-2">
              {profile.startupIdea}
            </p>
          </div>
        )}

        {/* Completeness strip */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} /> Completeness
            </span>
            <span>{completeness}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${completeness}%`, backgroundColor: barColor }}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/profiles/${profile.userId}`}
        className="flex items-center justify-center gap-2 w-full text-center bg-amber-900 text-amber-50 font-black py-3 uppercase tracking-widest text-[10px] border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition relative z-10"
        style={{ borderRadius: '8px 24px 8px 24px' }}
      >
        View Profile <ExternalLink size={12} />
      </Link>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BrowseProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedTag, setSelectedTag]       = useState('');
  const [minAvail, setMinAvail]             = useState('');
  const [loading, setLoading]               = useState(false);

  useEffect(() => { fetchProfiles(); }, [page, selectedSkills, selectedTag, minAvail]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchProfiles(); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProfiles = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (selectedSkills.length) params.set('skills', selectedSkills.join(','));
    if (selectedTag)  params.set('tag', selectedTag);
    if (minAvail)     params.set('minAvailability', minAvail);
    if (search)       params.set('search', search);
    try {
      const res  = await fetch(`${API}/profiles?${params}`);
      const data = await res.json();
      setProfiles(data.profiles || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-paper">

      {/* ── Hero banner ──────────────────────────────────────────────── */}
      <div className="mb-12">
        <div
          className="text-center md:text-left mb-10 overflow-hidden relative p-12 jewel-teal shadow-xl"
          style={{ borderRadius: '16px 48px 16px 48px' }}
        >
          <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="md:w-2/3">
              <h1 className="text-5xl font-black mb-4 font-serif-custom text-teal-50 drop-shadow-md tracking-tight">
                The Founder Network
              </h1>
              <p className="text-teal-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
                Discover student entrepreneurs, find your co-founder match, and build something that matters — together.
              </p>
            </div>
            <div className="flex-shrink-0 bg-white/10 p-6 backdrop-blur-md border border-white/20 rounded-3xl">
              <Users size={80} className="text-teal-100 opacity-60 transform rotate-12" />
            </div>
          </div>
        </div>

        {/* Live tracker */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="tracking-widest text-[10px] uppercase font-bold text-amber-900/40">
            Currently tracking {total} student founders in the network
          </span>
        </div>

        {/* ── Filter / Search hub ──────────────────────────────────────── */}
        <div className="placard p-8 border-t-4 border-amber-400 bg-stone-50/50 flex flex-col gap-6 shadow-xl mb-12">

          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
              <Search size={20} />
            </span>
            <input
              type="text"
              placeholder="Search by name, university, idea, or motivation…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-stone-200 focus:border-amber-400 focus:ring-0 text-stone-800 font-bold tracking-tight rounded-2xl shadow-inner transition-all hover:border-stone-300"
            />
          </div>

          {/* Tag filter */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-stone-500 font-black uppercase tracking-widest text-[10px]">
              <Filter size={13} /> Status Tag:
            </div>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => { setSelectedTag(value); setPage(1); }}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2
                    ${selectedTag === value
                      ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-md transform -translate-y-0.5'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
                  style={{ borderRadius: '8px 20px 8px 20px' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Skill filter */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-stone-500 font-black uppercase tracking-widest text-[10px]">
              <Code2 size={13} /> Filter by Skill:
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest capitalize border-2 transition-all
                    ${selectedSkills.includes(skill)
                      ? 'bg-teal-800 border-teal-800 text-teal-50 shadow-[2px_2px_0px_#0f766e]'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-teal-400 hover:text-teal-800'}`}
                  style={{ borderRadius: '6px 16px 6px 16px' }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Availability filter */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> Min hrs/week:
            </span>
            <input
              type="number"
              className="border-2 border-stone-200 bg-white px-4 py-2 text-sm font-bold w-24 focus:border-amber-400 focus:outline-none transition-all"
              style={{ borderRadius: '8px 20px 8px 20px' }}
              value={minAvail}
              onChange={e => { setMinAvail(e.target.value); setPage(1); }}
              min={0}
              placeholder="0"
            />
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div
            className="text-center py-20 placard bg-stone-50 border-dashed border-2 border-stone-200"
            style={{ borderRadius: '16px 48px 16px 48px' }}
          >
            <Users size={40} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 font-black uppercase tracking-widest text-sm">
              No founders match your search filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles.map(profile => (
                <ProfileCard key={profile._id} profile={profile} />
              ))}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 border-stone-200 bg-white text-stone-500 hover:border-amber-400 hover:text-amber-900 transition-all disabled:opacity-30"
                  style={{ borderRadius: '8px 20px 8px 20px' }}
                >
                  ← Prev
                </button>
                <span className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-amber-900 text-amber-50 border-2 border-amber-900"
                  style={{ borderRadius: '20px 8px 20px 8px' }}
                >
                  Page {page}
                </span>
                <button
                  disabled={profiles.length < 12}
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-2 border-stone-200 bg-white text-stone-500 hover:border-amber-400 hover:text-amber-900 transition-all disabled:opacity-30"
                  style={{ borderRadius: '20px 8px 20px 8px' }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
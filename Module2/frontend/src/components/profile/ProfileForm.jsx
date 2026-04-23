import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Code2, Palette, Megaphone, PenLine, BarChart2, Users, PackageSearch,
  Brain, Scale, Settings, Share2, Film, FlaskConical, Lightbulb,
  Target, Rocket, Clock, Link2, BookOpen, Plus, Trash2, CheckCircle2,
  ChevronDown
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const SKILL_OPTIONS = [
  { label: 'Coding',        value: 'coding',        icon: Code2 },
  { label: 'Design',        value: 'design',        icon: Palette },
  { label: 'Marketing',     value: 'marketing',     icon: Megaphone },
  { label: 'Writing',       value: 'writing',       icon: PenLine },
  { label: 'Finance',       value: 'finance',       icon: BarChart2 },
  { label: 'Sales',         value: 'sales',         icon: Users },
  { label: 'Product',       value: 'product',       icon: PackageSearch },
  { label: 'Data',          value: 'data',          icon: Brain },
  { label: 'AI / ML',       value: 'ai/ml',         icon: Brain },
  { label: 'Legal',         value: 'legal',         icon: Scale },
  { label: 'Operations',    value: 'operations',    icon: Settings },
  { label: 'Social Media',  value: 'social media',  icon: Share2 },
  { label: 'Video Editing', value: 'video editing', icon: Film },
  { label: 'Research',      value: 'research',      icon: FlaskConical },
];

const TAG_OPTIONS = [
  { label: 'Looking for Co-founder', value: 'Looking for co-founder', icon: Users,    color: 'amber' },
  { label: 'I Have an Idea',          value: 'I have an idea',          icon: Lightbulb, color: 'teal'  },
  { label: 'Ready to Join a Team',    value: 'Ready to join a team',    icon: Rocket,   color: 'stone' },
];

// ─── Completeness calculator ──────────────────────────────────────────────────

function calcCompleteness(form) {
  const checks = [
    form.university,
    form.department,
    form.skills.length > 0,
    form.lookingForSkills.length > 0,
    form.pastProjects.length > 0,
    form.startupIdea,
    form.weeklyAvailability > 0,
    form.motivation,
    form.profileTag,
    form.linkedinUrl,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }) {
  return (
    <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
         style={{ borderRadius: '12px 32px 12px 32px' }}>
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
      <h3 className="flex items-center gap-2 text-[10px] font-black text-amber-900 font-serif-custom uppercase tracking-widest mb-5 relative z-10">
        {Icon && <Icon size={13} className="text-teal-700" />}
        {title}
      </h3>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Skill pill ───────────────────────────────────────────────────────────────

function SkillPill({ skill, selected, onClick, accent = 'amber' }) {
  const Icon = skill.icon;
  const activeClass = accent === 'teal'
    ? 'bg-teal-800 border-teal-800 text-teal-50 shadow-[2px_3px_0px_#0f766e]'
    : 'bg-amber-900 border-amber-900 text-amber-50 shadow-[2px_3px_0px_#78350f]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all
        ${selected ? activeClass : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
      style={{ borderRadius: '6px 16px 6px 16px' }}
    >
      {Icon && <Icon size={11} />}
      {skill.label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileForm({ initialData = {}, onSave, isEdit = false }) {
  const [form, setForm] = useState({
    university:        initialData.university        || '',
    department:        initialData.department        || '',
    graduationYear:    initialData.graduationYear    || '',
    skills:            initialData.skills            || [],
    lookingForSkills:  initialData.lookingForSkills  || [],
    pastProjects:      initialData.pastProjects      || [],
    startupIdea:       initialData.startupIdea       || '',
    weeklyAvailability: initialData.weeklyAvailability || 0,
    motivation:        initialData.motivation        || '',
    profileTag:        initialData.profileTag        || 'Ready to join a team',
    linkedinUrl:       initialData.linkedinUrl       || '',
    isPublic:          initialData.isPublic !== undefined ? initialData.isPublic : true,
  });

  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);

  const completeness = calcCompleteness(form);

  const toggleSkill = (val, field) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter(s => s !== val)
        : [...prev[field], val],
    }));
  };

  const addProject = () => {
    if (!newProject.title || !newProject.description) {
      toast.error('Both title and description are required');
      return;
    }
    setForm(prev => ({ ...prev, pastProjects: [...prev.pastProjects, { ...newProject }] }));
    setNewProject({ title: '', description: '' });
  };

  const removeProject = idx =>
    setForm(prev => ({ ...prev, pastProjects: prev.pastProjects.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  // Completion colour
  const barColor = completeness < 40 ? '#ef4444' : completeness < 70 ? '#f59e0b' : '#0d9488';

  return (
    <div className="space-y-6">

      {/* ── Progress card ─────────────────────────────────────────── */}
      <div className="jewel-teal p-8 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-1">Profile Completeness</p>
            <p className="text-5xl font-black text-teal-50 font-serif-custom">{completeness}<span className="text-2xl">%</span></p>
          </div>
          <CheckCircle2
            size={56}
            className="text-teal-200 opacity-40"
            strokeWidth={1.5}
          />
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${completeness}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="text-teal-200 text-[10px] mt-2 font-medium">
          {completeness < 50 ? 'Keep going — fill in more details to stand out.' :
           completeness < 80 ? 'Looking good! A few more fields to go.' :
           'Outstanding! Your profile is nearly complete.'}
        </p>
      </div>

      {/* ── Profile Tag ───────────────────────────────────────────── */}
      <Section title="Your Status Tag" icon={Target}>
        <div className="flex flex-wrap gap-3">
          {TAG_OPTIONS.map(({ label, value, icon: Icon }) => {
            const active = form.profileTag === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, profileTag: value })}
                className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all
                  ${active
                    ? 'bg-amber-900 border-amber-900 text-amber-50 shadow-[3px_4px_0px_#78350f] transform -translate-y-0.5'
                    : 'bg-white border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-900'}`}
                style={{ borderRadius: '8px 24px 8px 24px' }}
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Basic Info ────────────────────────────────────────────── */}
      <Section title="Basic Information" icon={BookOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'University',        key: 'university',        placeholder: 'e.g. BUET, DU, NSU' },
            { label: 'Department',        key: 'department',        placeholder: 'e.g. Computer Science' },
            { label: 'Graduation Year',   key: 'graduationYear',    placeholder: '2026', type: 'number' },
            { label: 'LinkedIn URL',      key: 'linkedinUrl',       placeholder: 'https://linkedin.com/in/…' },
          ].map(({ label, key, placeholder, type = 'text' }) => (
            <div key={key}>
              <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">
                {label}
              </label>
              <input
                type={type}
                className="w-full border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-800 focus:border-amber-400 focus:outline-none focus:bg-white transition-all placeholder-stone-300"
                style={{ borderRadius: '8px 20px 8px 20px' }}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}

          {/* Weekly Availability */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">
              Weekly Availability
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0} max={40}
                value={form.weeklyAvailability}
                onChange={e => setForm({ ...form, weeklyAvailability: Number(e.target.value) })}
                className="flex-1 accent-amber-600"
              />
              <span className="text-2xl font-black text-amber-900 font-serif-custom w-20 text-right">
                {form.weeklyAvailability}<span className="text-sm font-bold"> hrs</span>
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── My Skills ─────────────────────────────────────────────── */}
      <Section title="My Skills" icon={Code2}>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map(skill => (
            <SkillPill
              key={skill.value}
              skill={skill}
              selected={form.skills.includes(skill.value)}
              onClick={() => toggleSkill(skill.value, 'skills')}
              accent="amber"
            />
          ))}
        </div>
      </Section>

      {/* ── Looking For ───────────────────────────────────────────── */}
      <Section title="Skills I'm Looking For in a Co-founder" icon={Users}>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map(skill => (
            <SkillPill
              key={skill.value}
              skill={skill}
              selected={form.lookingForSkills.includes(skill.value)}
              onClick={() => toggleSkill(skill.value, 'lookingForSkills')}
              accent="teal"
            />
          ))}
        </div>
      </Section>

      {/* ── Motivation ────────────────────────────────────────────── */}
      <Section title="Motivation" icon={Rocket}>
        <textarea
          className="w-full border-2 border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-800 focus:border-amber-400 focus:outline-none focus:bg-white transition-all placeholder-stone-300 min-h-[100px] resize-none"
          style={{ borderRadius: '8px 24px 8px 24px' }}
          value={form.motivation}
          onChange={e => setForm({ ...form, motivation: e.target.value })}
          placeholder="What drives you as a student entrepreneur? What problem are you trying to solve?"
        />
      </Section>

      {/* ── Startup Idea ──────────────────────────────────────────── */}
      <Section title="Startup Idea (optional)" icon={Lightbulb}>
        <textarea
          className="w-full border-2 border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-800 focus:border-amber-400 focus:outline-none focus:bg-white transition-all placeholder-stone-300 min-h-[80px] resize-none"
          style={{ borderRadius: '8px 24px 8px 24px' }}
          value={form.startupIdea}
          onChange={e => setForm({ ...form, startupIdea: e.target.value })}
          placeholder="Briefly describe your startup idea…"
        />
      </Section>

      {/* ── Past Projects ─────────────────────────────────────────── */}
      <Section title="Past Projects" icon={PackageSearch}>
        <div className="space-y-3 mb-4">
          {form.pastProjects.map((proj, idx) => (
            <div
              key={idx}
              className="bg-stone-50 border-2 border-stone-200 p-4 flex justify-between items-start"
              style={{ borderRadius: '8px 20px 8px 20px' }}
            >
              <div>
                <p className="text-xs font-black text-amber-900 uppercase tracking-wider">{proj.title}</p>
                <p className="text-stone-500 text-xs mt-1">{proj.description}</p>
              </div>
              <button onClick={() => removeProject(idx)} className="text-red-400 hover:text-red-600 ml-4 mt-0.5 flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none transition-all placeholder-stone-300"
            style={{ borderRadius: '8px 20px 8px 20px' }}
            placeholder="Project title"
            value={newProject.title}
            onChange={e => setNewProject({ ...newProject, title: e.target.value })}
          />
          <input
            className="border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none transition-all placeholder-stone-300"
            style={{ borderRadius: '8px 20px 8px 20px' }}
            placeholder="Short description"
            value={newProject.description}
            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
          />
          <button
            onClick={addProject}
            className="flex items-center justify-center gap-2 bg-teal-800 text-teal-50 text-[10px] font-black uppercase tracking-widest border-2 border-teal-800 hover:bg-teal-700 transition-all shadow-[2px_3px_0px_#0f766e]"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            <Plus size={13} /> Add Project
          </button>
        </div>
      </Section>

      {/* ── Visibility ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
          className={`w-10 h-6 rounded-full border-2 relative transition-all flex-shrink-0
            ${form.isPublic ? 'bg-teal-700 border-teal-700' : 'bg-stone-200 border-stone-300'}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
              ${form.isPublic ? 'left-4' : 'left-0.5'}`}
          />
        </button>
        <span className="text-xs font-bold text-stone-600">
          {form.isPublic ? 'Profile is visible to other students' : 'Profile is hidden (private)'}
        </span>
      </div>

      {/* ── Submit ────────────────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-amber-900 text-amber-50 font-black py-4 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition-all shadow-[4px_6px_0px_#78350f] hover:shadow-[2px_3px_0px_#78350f] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
        style={{ borderRadius: '8px 32px 8px 32px' }}
      >
        {loading ? (
          <span className="animate-pulse">Saving…</span>
        ) : (
          <>
            <Rocket size={16} />
            {isEdit ? 'Update Profile' : 'Create Profile'}
          </>
        )}
      </button>
    </div>
  );
}
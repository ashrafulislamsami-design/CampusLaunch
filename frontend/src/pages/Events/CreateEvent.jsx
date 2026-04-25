import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Rocket, Calendar, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-800 focus:border-amber-400 focus:outline-none focus:bg-white transition placeholder-stone-300";
const inputStyle = { borderRadius: '8px 20px 8px 20px' };

export default function CreateEvent() {
  const { token } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', eventType: 'other',
    organizerName: '', hostingOrg: '', format: 'in-person',
    venue: '', meetLink: '', date: '', endDate: '',
    registrationDeadline: '', allowedParticipants: 'anyone',
    capacityLimit: '', tags: '', status: 'upcoming'
  });
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.description) {
      toast.error('Title, date, and description are required');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (banner) fd.append('banner', banner);

      const res  = await fetch(`${API}/api/hub`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) { toast.success('Event created!'); navigate(`/events/${data._id}`); }
      else toast.error(data.message || 'Failed to create event');
    } finally { setLoading(false); }
  };

  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="jewel-teal p-10 mb-8 relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.05] bg-black pointer-events-none" />
        <div className="relative z-10 flex justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-teal-50 font-serif-custom mb-2">Create an Event</h1>
            <p className="text-teal-200 text-sm">Publish a pitch competition, hackathon, workshop, or networking event.</p>
          </div>
          <Rocket size={64} className="text-teal-200 opacity-40 transform rotate-12 flex-shrink-0" />
        </div>
      </div>

      <div className="space-y-5">
        {/* Section: Basic */}
        <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-5 relative z-10">Basic Info</h3>
          <div className="space-y-4 relative z-10">
            <Field label="Event Title">
              <input className={inputCls} style={inputStyle} placeholder="e.g. National AI Hackathon 2026"
                value={form.title} onChange={e => set('title', e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className={`${inputCls} min-h-[100px] resize-none`} style={inputStyle}
                placeholder="Describe the event, agenda, prizes…"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Event Type">
                <select className={selectCls} style={inputStyle} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                  {['pitch-competition','hackathon','workshop','networking','webinar','other'].map(t => (
                    <option key={t} value={t}>{t.replace('-', ' ')}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select className={selectCls} style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                  {['upcoming','live','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Organizer Name">
                <input className={inputCls} style={inputStyle} placeholder="Your name or org"
                  value={form.organizerName} onChange={e => set('organizerName', e.target.value)} />
              </Field>
              <Field label="Hosting University/Company">
                <input className={inputCls} style={inputStyle} placeholder="e.g. BUET, Grameenphone"
                  value={form.hostingOrg} onChange={e => set('hostingOrg', e.target.value)} />
              </Field>
            </div>
            <Field label="Tags (comma separated)">
              <input className={inputCls} style={inputStyle} placeholder="ai, fintech, climate"
                value={form.tags} onChange={e => set('tags', e.target.value)} />
            </Field>
            <Field label="Banner Image">
              <input type="file" accept="image/*" onChange={e => setBanner(e.target.files[0])}
                className="text-sm text-stone-600" />
            </Field>
          </div>
        </div>

        {/* Section: Location */}
        <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-5 relative z-10 flex items-center gap-2">
            <MapPin size={12} className="text-teal-700" /> Location & Format
          </h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <Field label="Format">
              <select className={selectCls} style={inputStyle} value={form.format} onChange={e => set('format', e.target.value)}>
                {['in-person','online','hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Venue / Address">
              <input className={inputCls} style={inputStyle} placeholder="Hall 4, Main Campus"
                value={form.venue} onChange={e => set('venue', e.target.value)} />
            </Field>
            <Field label="Meeting Link (online)">
              <input className={inputCls} style={inputStyle} placeholder="https://meet.google.com/…"
                value={form.meetLink} onChange={e => set('meetLink', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Section: Timing */}
        <div className="placard bg-white border-2 border-stone-200 shadow-[3px_5px_0px_#d97706] p-6 relative overflow-hidden"
             style={{ borderRadius: '12px 32px 12px 32px' }}>
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] pointer-events-none" />
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-5 relative z-10 flex items-center gap-2">
            <Calendar size={12} className="text-teal-700" /> Timing & Capacity
          </h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <Field label="Event Date *">
              <input type="datetime-local" className={inputCls} style={inputStyle}
                value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="End Date">
              <input type="datetime-local" className={inputCls} style={inputStyle}
                value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </Field>
            <Field label="Registration Deadline">
              <input type="datetime-local" className={inputCls} style={inputStyle}
                value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} />
            </Field>
            <Field label="Capacity (0 = unlimited)">
              <input type="number" min={0} className={inputCls} style={inputStyle} placeholder="0"
                value={form.capacityLimit} onChange={e => set('capacityLimit', e.target.value)} />
            </Field>
            <Field label="Allowed Participants">
              <select className={selectCls} style={inputStyle} value={form.allowedParticipants} onChange={e => set('allowedParticipants', e.target.value)}>
                {['anyone','students','teams'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-amber-900 text-amber-50 font-black py-4 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition shadow-[4px_6px_0px_#78350f] hover:shadow-[2px_3px_0px_#78350f] disabled:opacity-50"
          style={{ borderRadius: '8px 32px 8px 32px' }}>
          <Rocket size={16} />
          {loading ? 'Publishing…' : 'Publish Event'}
        </button>
      </div>
    </div>
  );
}
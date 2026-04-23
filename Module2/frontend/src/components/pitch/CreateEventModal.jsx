import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEvent } from '../../services/pitchService';

const CreateEventModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '', description: '', eventDate: '', registrationDeadline: '',
    maxTeams: 10, presentationDuration: 5, eligibility: '',
    eventType: 'public', allowAudienceVoting: true, showLiveLeaderboard: false,
    status: 'registration_open',
    prizeMoney: { first: 0, second: 0, third: 0, currency: 'BDT' },
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('prize_')) {
      const key = name.replace('prize_', '');
      setForm(f => ({ ...f, prizeMoney: { ...f.prizeMoney, [key]: Number(value) } }));
    } else {
      setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.eventDate) {
      toast.error('Title and event date are required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      };
      const { data } = await createEvent(payload);
      toast.success('Event created!');
      onCreated?.(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper border-[3px] border-amber-200 shadow-[8px_10px_0px_#d97706] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600" aria-label="Close">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black font-serif-custom text-amber-900 mb-6">Create Pitch Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Event Date *</label>
              <input name="eventDate" type="datetime-local" value={form.eventDate} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" required />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Registration Deadline</label>
              <input name="registrationDeadline" type="datetime-local" value={form.registrationDeadline} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Max Teams</label>
              <input name="maxTeams" type="number" value={form.maxTeams} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Duration (min)</label>
              <input name="presentationDuration" type="number" value={form.presentationDuration} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">1st Prize</label>
              <input name="prize_first" type="number" value={form.prizeMoney.first} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">2nd Prize</label>
              <input name="prize_second" type="number" value={form.prizeMoney.second} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Event Type</label>
              <select name="eventType" value={form.eventType} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0">
                <option value="public">Public</option>
                <option value="university_only">University Only</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0" placeholder="e.g. FinTech, EdTech" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" name="allowAudienceVoting" checked={form.allowAudienceVoting} onChange={handleChange} className="rounded" />
              Audience Voting
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" name="showLiveLeaderboard" checked={form.showLiveLeaderboard} onChange={handleChange} className="rounded" />
              Live Leaderboard
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-900 text-amber-50 font-bold uppercase tracking-widest text-sm hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;

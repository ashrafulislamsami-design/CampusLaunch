import { useState, useEffect, useContext } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config';
import { registerTeam, uploadPitchDeck } from '../../services/pitchService';

const TeamRegistrationModal = ({ eventId, onClose, onRegistered }) => {
  const { token } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/teams/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setTeams(data);
      } catch (err) {
        console.error('Failed to fetch teams');
      }
    };
    fetchTeams();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam) { toast.error('Please select a team'); return; }

    try {
      setSubmitting(true);
      let deckUrl = '', deckName = '';

      if (file) {
        setUploading(true);
        const { data: uploadData } = await uploadPitchDeck(file);
        deckUrl = uploadData.url;
        deckName = uploadData.originalName;
        setUploading(false);
      }

      await registerTeam(eventId, {
        teamId: selectedTeam,
        pitchDeckUrl: deckUrl,
        pitchDeckOriginalName: deckName
      });

      toast.success('Team registered successfully!');
      onRegistered?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper border-[3px] border-amber-200 shadow-[8px_10px_0px_#d97706] w-full max-w-md p-6 sm:p-8" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600" aria-label="Close">
          <X size={24} />
        </button>

        <h2 className="text-xl font-black font-serif-custom text-amber-900 mb-6">Register Your Team</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1 block">Select Team *</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-amber-400 focus:ring-0"
              required
            >
              <option value="">Choose your team...</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            {teams.length === 0 && (
              <p className="text-xs text-stone-400 mt-1">No teams found. Create a team first.</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Pitch Deck (PDF)</label>
            <div
              className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-amber-400 transition cursor-pointer"
              onClick={() => document.getElementById('pitch-deck-input').click()}
            >
              <Upload size={24} className="mx-auto text-stone-400 mb-2" />
              <p className="text-sm text-stone-500">
                {file ? file.name : 'Click to upload or drag & drop PDF'}
              </p>
              <input
                id="pitch-deck-input"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-3 bg-amber-900 text-amber-50 font-bold uppercase tracking-widest text-sm hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            {uploading ? 'Uploading...' : submitting ? 'Registering...' : 'Register Team'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamRegistrationModal;

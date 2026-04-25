import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, User, Briefcase, Clock } from 'lucide-react';
import { getMentors, verifyMentor } from '../../services/adminService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:  'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-teal-100 text-teal-700 border-teal-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const MentorCard = ({ mentor, onAction }) => {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const user = mentor.userId || {};

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await onAction(mentor._id, action, note);
      toast.success(`Mentor ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setNoteOpen(false);
    }
  };

  return (
    <div className="placard p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-900 font-black text-xl border-2 border-amber-300"
            style={{ borderRadius: '8px 16px 8px 16px' }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div>
            <h3 className="font-black text-stone-900">{user.name || mentor.name}</h3>
            <p className="text-xs text-stone-500">{user.email || mentor.email}</p>
          </div>
        </div>
        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 border rounded-full ${STATUS_COLORS[mentor.verificationStatus]}`}>
          {mentor.verificationStatus}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {mentor.jobDetails && (
          <div className="flex items-start gap-2 text-stone-600">
            <Briefcase size={14} className="mt-0.5 flex-shrink-0 text-teal-600" />
            <span>{mentor.jobDetails}</span>
          </div>
        )}
        {mentor.linkedinUrl && (
          <a
            href={mentor.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium transition"
          >
            <ExternalLink size={14} />
            LinkedIn Profile
          </a>
        )}
        {mentor.expertise?.length > 0 && (
          <div className="col-span-2 flex flex-wrap gap-2">
            {mentor.expertise.map((e) => (
              <span key={e} className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded font-medium uppercase">
                {e}
              </span>
            ))}
          </div>
        )}
        {mentor.bio && (
          <p className="col-span-2 text-stone-500 text-sm italic border-l-2 border-amber-200 pl-3">
            {mentor.bio}
          </p>
        )}
        <div className="col-span-2 flex items-center gap-2 text-xs text-stone-400">
          <Clock size={12} />
          Applied {new Date(mentor.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Actions (only for pending) */}
      {mentor.verificationStatus === 'pending' && (
        <div className="border-t border-amber-100 pt-4">
          {!noteOpen ? (
            <div className="flex gap-3">
              <button
                onClick={() => { setNoteOpen(true); }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                <CheckCircle size={14} /> Approve
              </button>
              <button
                onClick={() => { setNoteOpen(true); }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-200 transition disabled:opacity-50 border border-red-200"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for your records..."
                rows={2}
                className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('approve')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  <CheckCircle size={14} /> Confirm Approve
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <XCircle size={14} /> Confirm Reject
                </button>
                <button
                  onClick={() => setNoteOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mentor.verificationNote && (
        <p className="text-xs text-stone-400 italic border-t border-amber-50 pt-2">
          Note: {mentor.verificationNote}
        </p>
      )}
    </div>
  );
};

const AdminMentors = () => {
  const { token } = useContext(AuthContext);
  const [mentors, setMentors] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMentors(token, { status, limit: 50 });
      setMentors(data.mentors);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const handleAction = async (mentorId, action, note) => {
    await verifyMentor(token, mentorId, action, note);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link to="/admin" className="flex items-center gap-2 text-stone-500 hover:text-teal-700 transition text-sm font-bold uppercase tracking-widest mb-8">
        <ArrowLeft size={16} /> Back to Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black font-serif-custom text-amber-900">Mentor Verification</h1>
          <p className="text-stone-500 text-sm mt-1">{total} mentor{total !== 1 ? 's' : ''} in this view</p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full transition ${
                status === s
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="placard p-6 h-40 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="placard p-12 text-center text-stone-400">
          <p className="text-lg font-bold">No {status} mentor applications</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {mentors.map((m) => (
            <MentorCard key={m._id} mentor={m} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMentors;

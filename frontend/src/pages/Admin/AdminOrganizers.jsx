import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, User, Clock, CalendarDays } from 'lucide-react';
import { getOrganizers, verifyOrganizer } from '../../services/adminService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:  'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-teal-100 text-teal-700 border-teal-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const OrganizerCard = ({ organizer, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handle = async (action) => {
    setLoading(true);
    try {
      await onAction(organizer._id, action);
      toast.success(`Organizer ${action === 'approve' ? 'approved' : 'rejected'}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="placard p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-violet-900 font-black text-xl border-2 border-violet-200"
            style={{ borderRadius: '8px 16px 8px 16px' }}
          >
            {organizer.name ? organizer.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div>
            <h3 className="font-black text-stone-900">{organizer.name}</h3>
            <p className="text-xs text-stone-500">{organizer.email}</p>
          </div>
        </div>
        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 border rounded-full ${STATUS_COLORS[organizer.organizerVerified || 'pending']}`}>
          {organizer.organizerVerified || 'pending'}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-stone-600">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} className="text-violet-500" />
          <span>Role: {organizer.role}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-stone-400" />
          <span>Registered {new Date(organizer.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {(organizer.organizerVerified === 'pending' || !organizer.organizerVerified) && (
        <div className="flex gap-3 border-t border-amber-100 pt-4">
          <button
            onClick={() => handle('approve')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            <CheckCircle size={14} /> Approve
          </button>
          <button
            onClick={() => handle('reject')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-200 transition disabled:opacity-50 border border-red-200"
          >
            <XCircle size={14} /> Reject
          </button>
        </div>
      )}
    </div>
  );
};

const AdminOrganizers = () => {
  const { token } = useContext(AuthContext);
  const [organizers, setOrganizers] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOrganizers(token, { status, limit: 50 });
      setOrganizers(data.organizers);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const handleAction = async (userId, action) => {
    await verifyOrganizer(token, userId, action);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link to="/admin" className="flex items-center gap-2 text-stone-500 hover:text-teal-700 transition text-sm font-bold uppercase tracking-widest mb-8">
        <ArrowLeft size={16} /> Back to Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black font-serif-custom text-amber-900">Organizer Verification</h1>
          <p className="text-stone-500 text-sm mt-1">{total} organizer{total !== 1 ? 's' : ''} in this view</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full transition ${
                status === s ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="placard p-6 h-32 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : organizers.length === 0 ? (
        <div className="placard p-12 text-center text-stone-400">
          <p className="text-lg font-bold">No {status} organizer accounts</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {organizers.map((o) => (
            <OrganizerCard key={o._id} organizer={o} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrganizers;

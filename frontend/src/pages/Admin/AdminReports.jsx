import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Flag, XCircle, ShieldOff, Search, Clock, User } from 'lucide-react';
import { getReports, actOnReport } from '../../services/adminService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:      'bg-amber-100 text-amber-700 border-amber-200',
  dismissed:    'bg-stone-100 text-stone-500 border-stone-200',
  suspended:    'bg-red-100 text-red-700 border-red-200',
  investigating:'bg-blue-100 text-blue-700 border-blue-200',
};

const REASON_LABELS = {
  spam:                 'Spam',
  harassment:           'Harassment',
  fake_profile:         'Fake Profile',
  inappropriate_content:'Inappropriate Content',
  scam:                 'Scam / Fraud',
  other:                'Other',
};

const ReportCard = ({ report, onAction }) => {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const reported = report.reportedUser || {};
  const by = report.reportedBy || {};

  const handle = async (action) => {
    setLoading(true);
    try {
      await onAction(report._id, action, note);
      toast.success(`Report marked as ${action === 'dismiss' ? 'dismissed' : action === 'suspend' ? 'suspended' : 'investigating'}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setNoteOpen(false);
    }
  };

  return (
    <div className="placard p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Flag size={18} className="text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-stone-900">{reported.name || 'Unknown User'}</span>
              <span className="text-xs text-stone-400">({reported.email})</span>
              {reported.isSuspended && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Suspended</span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Reported by <span className="font-semibold">{by.name}</span> ({by.email})
            </p>
          </div>
        </div>
        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 border rounded-full flex-shrink-0 ${STATUS_COLORS[report.status]}`}>
          {report.status}
        </span>
      </div>

      <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-stone-400">Reason</span>
          <p className="font-semibold text-stone-700">{REASON_LABELS[report.reason] || report.reason}</p>
        </div>
        {report.details && (
          <div className="col-span-2">
            <span className="text-xs font-black uppercase tracking-widest text-stone-400">Details</span>
            <p className="text-stone-600 italic border-l-2 border-amber-200 pl-3 mt-1">{report.details}</p>
          </div>
        )}
        <div className="col-span-2 flex items-center gap-1.5 text-xs text-stone-400">
          <Clock size={12} />
          Reported {new Date(report.createdAt).toLocaleString()}
        </div>
      </div>

      {report.status === 'pending' && (
        <div className="border-t border-amber-100 pt-4">
          {!noteOpen ? (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setNoteOpen(true)} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-700 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-stone-900 transition disabled:opacity-50">
                <ShieldOff size={13} /> Suspend User
              </button>
              <button onClick={() => handle('investigate')} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-blue-200 transition disabled:opacity-50 border border-blue-200">
                <Search size={13} /> Investigate
              </button>
              <button onClick={() => handle('dismiss')} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-500 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-stone-200 transition disabled:opacity-50">
                <XCircle size={13} /> Dismiss
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Suspension reason (will be shown to user)..."
                rows={2}
                className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => handle('suspend')} disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                  <ShieldOff size={13} /> Confirm Suspend
                </button>
                <button onClick={() => setNoteOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 transition uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {report.adminNote && (
        <p className="text-xs text-stone-400 italic border-t border-amber-50 pt-2">
          Admin note: {report.adminNote}
        </p>
      )}
    </div>
  );
};

const AdminReports = () => {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReports(token, { status, limit: 50 });
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const handleAction = async (reportId, action, note) => {
    await actOnReport(token, reportId, action, note);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link to="/admin" className="flex items-center gap-2 text-stone-500 hover:text-teal-700 transition text-sm font-bold uppercase tracking-widest mb-8">
        <ArrowLeft size={16} /> Back to Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black font-serif-custom text-amber-900">Reported Profiles</h1>
          <p className="text-stone-500 text-sm mt-1">{total} report{total !== 1 ? 's' : ''} in this view</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'investigating', 'suspended', 'dismissed', 'all'].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-full transition ${
                status === s ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="placard p-6 h-36 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="placard p-12 text-center text-stone-400">
          <Flag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold">No {status} reports</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <ReportCard key={r._id} report={r} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;

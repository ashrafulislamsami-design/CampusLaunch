import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Users, ShieldOff, ShieldCheck, Search, Clock, Filter } from 'lucide-react';
import { getUsers, toggleSuspension } from '../../services/adminService';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  Student:   'bg-teal-100 text-teal-700',
  Mentor:    'bg-amber-100 text-amber-700',
  Organizer: 'bg-violet-100 text-violet-700',
  Admin:     'bg-stone-800 text-white',
};

const UserRow = ({ user, onToggleSuspend }) => {
  const [loading, setLoading] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleSuspend = async () => {
    setLoading(true);
    try {
      await onToggleSuspend(user._id, true, reason);
      toast.success('User suspended');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setReasonOpen(false);
    }
  };

  const handleUnsuspend = async () => {
    setLoading(true);
    try {
      await onToggleSuspend(user._id, false, '');
      toast.success('User unsuspended');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`placard p-4 flex flex-col gap-3 ${user.isSuspended ? 'border-red-200 opacity-75' : ''}`}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Avatar */}
        <div
          className="w-10 h-10 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-700 font-black text-lg border-2 border-stone-200 flex-shrink-0"
          style={{ borderRadius: '8px 16px 8px 16px' }}
        >
          {user.name?.charAt(0).toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-stone-900">{user.name}</span>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] || 'bg-stone-100 text-stone-500'}`}>
              {user.role}
            </span>
            {user.isSuspended && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-200">
                Suspended
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400">{user.email}</p>
          {user.isSuspended && user.suspensionReason && (
            <p className="text-xs text-red-400 mt-0.5">Reason: {user.suspensionReason}</p>
          )}
        </div>

        {/* Joined */}
        <div className="flex items-center gap-1 text-xs text-stone-400 flex-shrink-0">
          <Clock size={11} />
          {new Date(user.createdAt).toLocaleDateString()}
        </div>

        {/* Actions */}
        {user.role !== 'Admin' && (
          <div className="flex-shrink-0">
            {user.isSuspended ? (
              <button
                onClick={handleUnsuspend}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-teal-200 transition disabled:opacity-50 border border-teal-200"
              >
                <ShieldCheck size={13} /> Unsuspend
              </button>
            ) : (
              <button
                onClick={() => setReasonOpen(!reasonOpen)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-100 transition disabled:opacity-50 border border-red-200"
              >
                <ShieldOff size={13} /> Suspend
              </button>
            )}
          </div>
        )}
      </div>

      {/* Suspend reason input */}
      {reasonOpen && !user.isSuspended && (
        <div className="flex gap-2 flex-wrap border-t border-amber-100 pt-3">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Suspension reason..."
            className="flex-1 min-w-0 px-3 py-1.5 border-2 border-amber-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
          />
          <button
            onClick={handleSuspend}
            disabled={loading}
            className="px-4 py-1.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={() => setReasonOpen(false)}
            className="px-3 py-1.5 text-xs font-bold text-stone-400 hover:text-stone-600 transition uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const AdminUsers = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const [suspendedFilter, setSuspendedFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 25;

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (suspendedFilter !== 'all') params.suspended = suspendedFilter === 'suspended';
      const data = await getUsers(token, params);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [roleFilter, suspendedFilter]);
  useEffect(() => { load(); }, [roleFilter, suspendedFilter, page]);

  const handleToggleSuspend = async (userId, suspend, reason) => {
    await toggleSuspension(token, userId, suspend, reason);
    load();
  };

  // Client-side name/email search filter
  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link
        to="/admin"
        className="flex items-center gap-2 text-stone-500 hover:text-teal-700 transition text-sm font-bold uppercase tracking-widest mb-8"
      >
        <ArrowLeft size={16} /> Back to Admin Panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black font-serif-custom text-amber-900">User Management</h1>
        <p className="text-stone-500 text-sm mt-1">
          {total} user{total !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border-2 border-amber-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-stone-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="text-sm focus:outline-none w-full"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'Student', 'Mentor', 'Organizer', 'Admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-full transition ${
                roleFilter === r ? 'bg-amber-500 text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Suspended filter */}
        <div className="flex gap-1.5">
          {['all', 'active', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setSuspendedFilter(s)}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-full transition ${
                suspendedFilter === s ? 'bg-red-500 text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="placard p-4 h-16 animate-pulse bg-stone-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="placard p-12 text-center text-stone-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold">No users match this filter</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((u) => (
            <UserRow key={u._id} user={u} onToggleSuspend={handleToggleSuspend} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm text-stone-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

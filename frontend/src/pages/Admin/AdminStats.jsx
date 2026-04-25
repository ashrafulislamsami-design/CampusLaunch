import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  ArrowLeft, Users, TrendingUp, BookOpen,
  Mic2, Coins, Clock, UserCheck, CalendarDays, Flag,
} from 'lucide-react';
import { getStats } from '../../services/adminService';

const MetricRow = ({ icon: Icon, label, value, color, description }) => (
  <div className="flex items-center gap-4 p-5 bg-white border-2 border-amber-100 rounded-xl hover:border-amber-200 transition">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-black uppercase tracking-widest text-stone-400">{label}</p>
      {description && <p className="text-xs text-stone-400 mt-0.5">{description}</p>}
    </div>
    <span className="text-2xl font-black text-stone-900 font-serif-custom flex-shrink-0">
      {value !== null && value !== undefined ? value.toLocaleString() : '—'}
    </span>
  </div>
);

const AdminStats = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStats(token);
      setStats(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link
        to="/admin"
        className="flex items-center gap-2 text-stone-500 hover:text-teal-700 transition text-sm font-bold uppercase tracking-widest mb-8"
      >
        <ArrowLeft size={16} /> Back to Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black font-serif-custom text-amber-900">Platform Analytics</h1>
          {lastRefresh && (
            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
              <Clock size={11} />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="gilded-btn text-sm"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 font-medium text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse bg-stone-100" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1 mt-4">
            Growth Metrics
          </h2>
          <MetricRow
            icon={Users}
            label="Total Student Signups"
            value={stats.totalStudents}
            color="bg-teal-600"
            description="Registered student accounts on the platform"
          />
          <MetricRow
            icon={TrendingUp}
            label="Active Startup Teams"
            value={stats.totalTeams}
            color="bg-amber-500"
            description="Startup teams created on CampusLaunch"
          />
          <MetricRow
            icon={BookOpen}
            label="Mentor Sessions Completed"
            value={stats.completedSessions}
            color="bg-indigo-500"
            description="Bookings with status 'completed'"
          />
          <MetricRow
            icon={Mic2}
            label="Total Pitch Events"
            value={stats.totalPitchEvents}
            color="bg-rose-500"
            description="All pitch arena events ever created"
          />
          <MetricRow
            icon={Coins}
            label="Total Funding Raised"
            value={stats.totalFundingRaised}
            color="bg-emerald-600"
            description="Sum of all student funding fields (BDT)"
          />

          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1 mt-6">
            Pending Actions
          </h2>
          <MetricRow
            icon={UserCheck}
            label="Mentor Applications Pending"
            value={stats.pendingMentors}
            color="bg-orange-500"
            description="Mentor profiles awaiting admin approval"
          />
          <MetricRow
            icon={CalendarDays}
            label="Organizer Accounts Pending"
            value={stats.pendingOrganizers}
            color="bg-violet-500"
            description="Organizer registrations awaiting verification"
          />
          <MetricRow
            icon={Flag}
            label="Open Profile Reports"
            value={stats.pendingReports}
            color="bg-red-500"
            description="User-submitted reports not yet resolved"
          />
        </div>
      ) : null}
    </div>
  );
};

export default AdminStats;

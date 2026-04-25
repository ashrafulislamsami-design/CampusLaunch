import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Users, UserCheck, UserX, BarChart3, Star,
  Flag, ShieldCheck, TrendingUp, Coins, Mic2,
  BookOpen, CalendarDays, Clock, CheckCircle,
} from 'lucide-react';
import { getStats } from '../../services/adminService';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="placard p-6 flex flex-col gap-2 hover:shadow-[8px_10px_0px_#d97706] transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mb-1`}>
      <Icon size={24} className="text-white" />
    </div>
    <span className="text-3xl font-black text-stone-900 font-serif-custom">
      {value !== null && value !== undefined ? value.toLocaleString() : '—'}
    </span>
    <span className="text-xs font-bold uppercase tracking-widest text-stone-500">{label}</span>
    {sub && <span className="text-xs text-stone-400">{sub}</span>}
  </div>
);

const NavTile = ({ to, icon: Icon, label, badge, color }) => (
  <Link
    to={to}
    className="placard-interactive p-6 flex items-center gap-4 group"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-stone-800 text-sm uppercase tracking-widest group-hover:text-teal-700 transition">
        {label}
      </div>
    </div>
    {badge > 0 && (
      <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0">
        {badge}
      </span>
    )}
  </Link>
);

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getStats(token);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={32} className="text-teal-700" />
          <h1 className="text-4xl font-black font-serif-custom text-amber-900">
            Admin Control Panel
          </h1>
        </div>
        <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">
          CampusLaunch · Platform Administration
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 font-medium">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <section className="mb-12">
        <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">
          Platform Statistics
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="placard p-6 h-36 animate-pulse bg-stone-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Student Signups"
              value={stats?.totalStudents}
              color="bg-teal-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Active Startup Teams"
              value={stats?.totalTeams}
              color="bg-amber-500"
            />
            <StatCard
              icon={BookOpen}
              label="Mentor Sessions Completed"
              value={stats?.completedSessions}
              color="bg-indigo-500"
            />
            <StatCard
              icon={Mic2}
              label="Pitch Events Held"
              value={stats?.totalPitchEvents}
              color="bg-rose-500"
            />
            <StatCard
              icon={Coins}
              label="Total Funding Raised"
              value={stats?.totalFundingRaised}
              color="bg-emerald-600"
              sub="Aggregated from student profiles"
            />
            <StatCard
              icon={Clock}
              label="Pending Mentor Reviews"
              value={stats?.pendingMentors}
              color="bg-orange-500"
            />
            <StatCard
              icon={UserCheck}
              label="Pending Organizers"
              value={stats?.pendingOrganizers}
              color="bg-violet-500"
            />
            <StatCard
              icon={Flag}
              label="Open Profile Reports"
              value={stats?.pendingReports}
              color="bg-red-500"
            />
          </div>
        )}
      </section>

      {/* Navigation Tiles */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">
          Administration Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NavTile
            to="/admin/mentors"
            icon={UserCheck}
            label="Mentor Verification"
            badge={stats?.pendingMentors || 0}
            color="bg-teal-600"
          />
          <NavTile
            to="/admin/organizers"
            icon={CalendarDays}
            label="Organizer Verification"
            badge={stats?.pendingOrganizers || 0}
            color="bg-violet-500"
          />
          <NavTile
            to="/admin/reports"
            icon={Flag}
            label="Reported Profiles"
            badge={stats?.pendingReports || 0}
            color="bg-red-500"
          />
          <NavTile
            to="/admin/featured"
            icon={Star}
            label="Featured Content"
            color="bg-amber-500"
          />
          <NavTile
            to="/admin/users"
            icon={Users}
            label="User Management"
            color="bg-stone-700"
          />
          <NavTile
            to="/admin/stats"
            icon={BarChart3}
            label="Platform Analytics"
            color="bg-indigo-500"
          />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

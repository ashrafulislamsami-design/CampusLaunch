import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Rocket, Target, CalendarDays, Coins, Users, Gem, BookOpen, Mic2, LayoutGrid } from 'lucide-react';
import FundingCard from '../Funding/FundingCard';

const StudentHome = () => {
  const { userTeamId, token, user, setUser } = useContext(AuthContext);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, [token]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/watchlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setWatchlist(data);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (fundingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/funding/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fundingId })
      });
      const data = await res.json();
      if (res.ok) {
        // Sync watchlist locally and in AuthContext
        setWatchlist(prev => prev.filter(item => item._id !== fundingId));
        if (setUser && user) {
          setUser({ ...user, watchlist: data });
        }
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Welcome & Banner Area */}
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center jewel-teal p-8 sm:p-12 shadow-xl relative overflow-hidden" style={{ borderRadius: '16px 48px 16px 48px' }}>
        <div className="absolute inset-0 opacity-[0.03] bg-black"></div>
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 font-serif-custom text-teal-50 drop-shadow-md">The CampusLaunch Hub</h1>
          <p className="text-teal-100 text-lg font-sans-custom font-medium max-w-2xl leading-relaxed">
            Choose a module below to begin crafting your startup architecture, map your event calendar, and navigate the seed matrix.
          </p>
        </div>

        {userTeamId && (
          <div className="relative z-10 mt-10 md:mt-0 flex justify-end">
            <Link
              to={`/teams/dashboard/${userTeamId}`}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border-[3px] border-amber-300 px-10 py-6 shadow-[6px_8px_0px_#042f2e] hover:shadow-[3px_4px_0px_#042f2e] hover:translate-y-[4px] hover:translate-x-[3px] transition-all cursor-pointer group"
              style={{ borderRadius: '12px 32px 12px 32px' }}
            >
              <Rocket size={40} className="mb-3 text-teal-700 icon-tactile group-hover:-translate-y-2 transition-transform duration-300" />
              <span className="font-black text-lg uppercase tracking-widest font-sans-custom">Go to Workspace</span>
            </Link>
          </div>
        )}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Teams Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 text-amber-700 rounded-xl flex items-center justify-center mb-6 shadow-sm transform -rotate-3 group-hover:rotate-0 transition">
              <Target size={32} className="icon-tactile text-amber-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Create a Team</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Form an idea, define your problem space, and invite classmates to your entrepreneurial journey.
            </p>
          </div>
          <Link
            to="/teams/create"
            className="w-full text-center bg-amber-900 text-amber-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Commence
          </Link>
        </div>

        {/* Funding Module (Placeholder) */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 border-2 border-teal-300 text-teal-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform translate-y-2 -rotate-2 group-hover:translate-y-0 group-hover:rotate-0 transition">
              <Coins size={32} className="icon-tactile text-teal-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Browse Funding</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Discover active university grants, alumni accelerators, and local VC pitch competitions.
            </p>
          </div>
          <Link
            to="/funding"
            className="w-full text-center bg-teal-800 text-teal-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-teal-100 hover:text-teal-900 hover:border-teal-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Connect
          </Link>
        </div>

        {/* Event Hub Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 text-orange-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform rotate-3 group-hover:rotate-0 transition">
              <CalendarDays size={32} className="icon-tactile text-orange-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Event Hub</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Check out upcoming networking events, workshops, and hackathons all around your campus.
            </p>
          </div>
          <Link
            to="/events"
            className="w-full text-center bg-orange-800 text-orange-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-orange-100 hover:text-orange-900 hover:border-orange-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Network
          </Link>
        </div>

        {/* Mentor Booking Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 border-2 border-sky-300 text-sky-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform -translate-y-1 rotate-1 group-hover:translate-y-0 group-hover:rotate-0 transition">
              <Users size={32} className="icon-tactile text-sky-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Mentorship</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Connect with industry experts, book 1-on-1 sessions, and get guidance for your startup journey.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/mentors"
              className="flex-1 text-center bg-sky-800 text-sky-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-sky-100 hover:text-sky-900 hover:border-sky-400 transition"
              style={{ borderRadius: '8px 24px 8px 24px' }}
            >
              Find Mentors
            </Link>
            <Link
              to="/bookings/my"
              className="flex-1 text-center bg-sky-100 text-sky-900 font-bold py-3 uppercase tracking-widest text-sm border-2 border-sky-300 hover:bg-sky-200 transition"
              style={{ borderRadius: '8px 24px 8px 24px' }}
            >
              My Bookings
            </Link>
          </div>
        </div>

        {/* Co-Founder Matching Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 border-2 border-indigo-300 text-indigo-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform translate-x-2 rotate-2 group-hover:rotate-0 transition">
              <Users size={32} className="icon-tactile text-indigo-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Founder Match</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Our engine identifies missing roles in your team and suggests ideal student co-founders.
            </p>
          </div>
          <Link
            to="/matching"
            className="w-full text-center bg-indigo-900 text-indigo-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-indigo-100 hover:text-indigo-900 hover:border-indigo-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Find Synergy
          </Link>
        </div>

        {/* Browse Profiles Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-violet-200 border-2 border-violet-300 text-violet-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform -rotate-2 group-hover:rotate-0 transition">
              <Users size={32} className="icon-tactile text-violet-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Browse Profiles</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Discover student entrepreneurs, explore their skills, ideas, and find your next co-founder.
            </p>
          </div>
          <Link
            to="/profiles"
            className="w-full text-center bg-violet-800 text-violet-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-violet-100 hover:text-violet-900 hover:border-violet-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Explore
          </Link>
        </div>


        {/* Curriculum Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-300 text-emerald-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform -rotate-2 group-hover:rotate-0 transition">
              <BookOpen size={32} className="icon-tactile text-emerald-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Curriculum</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Follow a structured startup curriculum with lessons, videos, quizzes, and assignments.
            </p>
          </div>
          <Link
            to="/curriculum"
            className="w-full text-center bg-emerald-800 text-emerald-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-emerald-100 hover:text-emerald-900 hover:border-emerald-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Start Learning
          </Link>
        </div>

        {/* Pitch Arena Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-200 border-2 border-rose-300 text-rose-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform rotate-2 group-hover:rotate-0 transition">
              <Mic2 size={32} className="icon-tactile text-rose-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Pitch Arena</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Compete in live pitch events, upload your deck, and present before judges.
            </p>
          </div>
          <Link
            to="/pitch-arena"
            className="w-full text-center bg-rose-800 text-rose-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-rose-100 hover:text-rose-900 hover:border-rose-400 transition"
            style={{ borderRadius: '8px 24px 8px 24px' }}
          >
            Enter Arena
          </Link>
        </div>

        {/* Canvas Builder Module (Business Model Canvas) */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 text-yellow-800 rounded-xl flex items-center justify-center mb-6 shadow-sm transform rotate-2 group-hover:rotate-0 transition">
              <LayoutGrid size={32} className="icon-tactile text-yellow-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">Canvas Builder</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Build your Business Model Canvas collaboratively with your team — sticky notes, real-time editing, and version history.
            </p>
          </div>
          {userTeamId ? (
            <Link
              to={`/canvas/${userTeamId}`}
              className="w-full text-center bg-yellow-700 text-yellow-50 font-bold py-3 uppercase tracking-widest text-sm border-2 border-transparent hover:bg-yellow-100 hover:text-yellow-900 hover:border-yellow-400 transition"
              style={{ borderRadius: '8px 24px 8px 24px' }}
            >
              Open Canvas
            </Link>
          ) : (
            <div
              className="w-full text-center bg-stone-200 text-stone-500 font-bold py-3 uppercase tracking-widest text-sm border-2 border-stone-300 cursor-not-allowed"
              style={{ borderRadius: '8px 24px 8px 24px' }}
              title="Join a team first"
            >
              Join a team first
            </div>
          )}
        </div>

        {/* My Connections Module */}
        <div className="placard p-8 group flex flex-col justify-between">
          <div>
            {/* Custom Messenger-style icon combining chat bubble + check badge */}
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-700 border-2 border-teal-300 rounded-xl flex items-center justify-center mb-6 shadow-md transform -rotate-2 group-hover:rotate-0 transition relative overflow-hidden">
              {/* WhatsApp/Messenger-style SVG icon */}
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                {/* Outer chat bubble */}
                <path d="M20 4C11.163 4 4 10.716 4 19c0 3.09.938 5.97 2.553 8.382L4 36l8.97-2.497A16.8 16.8 0 0020 34c8.837 0 16-6.716 16-15S28.837 4 20 4z" fill="white" fillOpacity="0.95" />
                {/* Inner dots like a message */}
                <circle cx="13" cy="19" r="2.2" fill="#0f766e" />
                <circle cx="20" cy="19" r="2.2" fill="#0f766e" />
                <circle cx="27" cy="19" r="2.2" fill="#0f766e" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-3 font-serif-custom">My Connections</h2>
            <p className="text-stone-700 mb-8 min-h-[4rem] font-sans-custom leading-relaxed">
              Connect, view request(s) & chat directly with your accepted co-founders for your startup team. Message, edit, and save conversations.
            </p>
          </div>
          <Link
            to="/connections"
            className="w-full text-center text-white font-bold py-3 uppercase tracking-widest text-sm border-2 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
            style={{ borderRadius: '8px 24px 8px 24px', backgroundColor: '#5865f2', borderColor: '#5865f2' }}
          >
            My Partners
          </Link>
        </div>

      </div>

      {/* My Saved Opportunities Section */}
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-900 border-2 border-amber-300 shadow-sm">
            <Gem size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-amber-900 font-serif-custom">My Saved Opportunities</h2>
            <p className="text-stone-500 font-sans-custom font-medium">Your curated watchlist from the Funding Matrix.</p>
          </div>
        </div>

        {!loading && watchlist.length === 0 ? (
          <div className="placard p-12 text-center border-dashed border-2 border-stone-200" style={{ borderRadius: '16px 48px 16px 48px' }}>
            <p className="text-stone-400 font-black uppercase tracking-widest text-sm">No opportunities saved yet. Explore the Matrix to pin your future.</p>
            <Link to="/funding" className="inline-block mt-6 text-amber-900 font-bold underline decoration-amber-400 decoration-2 underline-offset-4">Browse Funding Matrix</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {watchlist.map((item) => (
              <FundingCard
                key={item._id}
                item={item}
                isSaved={true}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;

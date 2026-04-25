// frontend/src/components/Navbar.jsx
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Rocket, CircleUser, ChevronDown, Bell, LayoutGrid, Mail, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, userTeamId, user, logout, unreadCount, refreshUnreadCount } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Poll for unread notification count every 30 seconds while logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-paper border-b-[3px] border-amber-200/60 shadow-sm relative z-50">
      <div className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link
              to={isAuthenticated ? '/home' : '/'}
              className="flex items-center text-amber-900 font-black text-2xl gap-2 hover:text-amber-700 transition font-serif-custom"
            >
              <Rocket size={28} className="text-teal-700 icon-tactile transform -rotate-12" />
              <span className="drop-shadow-sm">CampusLaunch</span>
            </Link>
          </div>

          {/* Navigation & User Actions Container */}
          <div className="flex items-center justify-between flex-1 ml-12">
            {isAuthenticated ? (
              <>
                {/* Centered Navigation Links */}
                <div className="flex-1 flex justify-start items-center space-x-4 lg:space-x-12 ml-8">
                  <Link
                    to="/home"
                    className="text-stone-700 hover:text-teal-700 transition font-bold uppercase tracking-widest text-[10px] lg:text-xs whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={userTeamId ? `/teams/dashboard/${userTeamId}` : '/teams/create'}
                    className="text-stone-700 hover:text-teal-700 transition font-bold uppercase tracking-widest text-[10px] lg:text-xs whitespace-nowrap"
                  >
                    My Team
                  </Link>
                  {/* ✅ ADDED: Browse Profiles link */}
                  <Link
                    to="/profiles"
                    className="text-stone-700 hover:text-teal-700 transition font-bold uppercase tracking-widest text-xs"
                  >
                    Browse Profiles
                  </Link>
                  {/* ✅ ADDED: My Profile link */}
                  <Link
                    to="/profile/me"
                    className="text-stone-700 hover:text-teal-700 transition font-bold uppercase tracking-widest text-xs"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="text-stone-700 hover:text-teal-700 transition font-bold uppercase tracking-widest text-[10px] lg:text-xs whitespace-nowrap"
                  >
                    Leaderboard
                  </Link>
                  <Link
                    to="/ai-validator"
                    className="text-stone-700 hover:text-teal-700 transition font-bold uppercase tracking-widest text-[10px] lg:text-xs whitespace-nowrap"
                  >
                    AI Validator
                  </Link>
                  <Link
                    to={userTeamId ? `/canvas/${userTeamId}` : '/teams/create'}
                    className="text-stone-700 hover:text-teal-700 transition font-bold uppercase tracking-widest text-[10px] lg:text-xs whitespace-nowrap flex items-center gap-1"
                    title={userTeamId ? 'Open your Business Model Canvas' : 'Join a team to open the canvas'}
                  >
                    <LayoutGrid size={13} className="text-teal-700" />
                    Canvas
                  </Link>

                  {/* Admin link — only visible to Admin role */}
                  {user?.role === 'Admin' && (
                    <Link
                      to="/admin"
                      className="text-amber-700 hover:text-amber-900 transition font-black uppercase tracking-widest text-[10px] lg:text-xs whitespace-nowrap flex items-center gap-1 border border-amber-300 bg-amber-50 px-2 py-1 rounded"
                    >
                      <ShieldCheck size={12} />
                      Admin
                    </Link>
                  )}

                  {/* Notification Bell */}
                  <Link
                    to="/notifications"
                    className="relative text-stone-600 hover:text-amber-700 transition ml-2"
                    title="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* User Identity Block - Dropdown */}
                <div className="relative border-l-2 border-amber-200/50 pl-6">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 text-left focus:outline-none hover:opacity-90 transition group"
                  >
                    <div
                      className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-900 font-black text-lg shadow-[2px_3px_0px_#b45309] border-[2px] border-amber-300 group-hover:-translate-y-0.5 group-hover:shadow-[2px_4px_0px_#b45309] transition-all"
                      style={{ borderRadius: '8px 16px 8px 16px' }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : <CircleUser size={24} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-stone-900 leading-tight tracking-wide whitespace-nowrap">
                        {user?.name || 'Student'}
                      </span>
                      <span className="text-xs text-teal-900 font-black bg-teal-100/80 px-2 py-0.5 mt-1 uppercase tracking-widest inline-block w-max border border-teal-200" style={{borderRadius: '4px 8px 4px 8px'}}>
                        {user?.teamRole || user?.role || 'Member'}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-amber-700 ml-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-5 w-56 bg-paper border-[3px] border-amber-200 shadow-[6px_8px_0px_#d97706] z-50 overflow-hidden"
                      style={{ borderRadius: '12px 24px 12px 24px' }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-6 py-4 text-sm text-amber-900 hover:bg-amber-100 font-bold transition border-b border-amber-100 uppercase tracking-widest"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between px-6 py-4 text-sm text-stone-700 hover:bg-amber-50 font-bold transition border-b border-amber-100 uppercase tracking-widest"
                      >
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/settings/email-preferences"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-6 py-4 text-sm text-stone-700 hover:bg-amber-50 font-bold transition border-b border-amber-100 uppercase tracking-widest"
                      >
                        <Mail size={14} className="text-teal-700" />
                        <span>Email Preferences</span>
                      </Link>
                      {user?.role === 'Admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-6 py-4 text-sm text-amber-900 hover:bg-amber-100 font-bold transition border-b border-amber-100 uppercase tracking-widest bg-amber-50"
                        >
                          <ShieldCheck size={14} className="text-amber-700" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-6 py-4 text-sm text-red-700 bg-red-50 hover:bg-red-100 font-bold transition uppercase tracking-widest"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-6 ml-auto">
                <Link
                  to="/login"
                  className="text-stone-700 hover:text-amber-800 transition font-bold uppercase tracking-widest text-xs"
                >
                  Login
                </Link>
                <Link to="/register" className="gilded-btn">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

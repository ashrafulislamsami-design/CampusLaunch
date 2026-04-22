import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import NotificationHandler from './components/NotificationHandler';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentHome from './pages/Home/StudentHome';
import EventHub from './pages/Home/EventHub';
import CreateTeam from './pages/StartupTeam/CreateTeam';
import TeamDashboard from './pages/StartupTeam/TeamDashboard';
import PublicProfile from './pages/StartupTeam/PublicProfile';
import BrowseTeams from './pages/StartupTeam/BrowseTeams';
import PortfolioEditor from './pages/StartupTeam/PortfolioEditor';
import ProfileSettings from './pages/Profile/ProfileSettings';
import FundingDirectory from './pages/Funding/FundingDirectory';
import CoFounderMatching from './pages/Matching/CoFounderMatching';
import StudentProfile from './pages/Profile/StudentProfile';
import BrowseProfiles from './pages/Profile/BrowseProfiles';
import MentorList from './pages/Mentors/MentorList';
import BookSession from './pages/Mentors/BookSession';
import MyBookings from './pages/Mentors/MyBookings';
import Leaderboard from './pages/Leaderboard/Leaderboard';


const CurriculumPage = lazy(() => import('./pages/Curriculum/CurriculumPage'));
const CurriculumWeekPage = lazy(() => import('./pages/Curriculum/CurriculumWeekPage'));
const CurriculumCertificate = lazy(() => import('./pages/Curriculum/CurriculumCertificate'));
const PitchArenaPage = lazy(() => import('./pages/PitchArena/PitchArenaPage'));
const PitchEventDetailPage = lazy(() => import('./pages/PitchArena/PitchEventDetailPage'));
const PitchLiveRoomPage = lazy(() => import('./pages/PitchArena/PitchLiveRoomPage'));
const PitchAudiencePage = lazy(() => import('./pages/PitchArena/PitchAudiencePage'));
const PitchResultsPage = lazy(() => import('./pages/PitchArena/PitchResultsPage'));

const LazyFallback = () => (
  <div className="flex items-center justify-center py-24">
    <div className="animate-pulse text-stone-400 font-bold text-sm uppercase tracking-widest">Loading...</div>
  </div>
);
import ConnectionRequests from './pages/Matching/ConnectionRequests';
import ConnectionsDashboard from './pages/Matching/ConnectionsDashboard';
import PrivateChat from './pages/Matching/PrivateChat';
import NotificationInbox from './pages/Notifications/NotificationInbox';

// AI Validator
import AIValidator from './pages/AI/AIValidator';
import AIReportPage from './pages/AI/AIReportPage';

// Resources
import Resources from './pages/Resources/Resources';
import AddResource from './pages/Resources/AddResource';
import ResourceDetail from './pages/Resources/ResourceDetail';
import EditResource from './pages/Resources/EditResource';

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Beautiful Landing Page for Guests
const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-4xl w-full text-center space-y-10 mt-8 z-10">
        <h1 className="text-6xl md:text-8xl font-black text-amber-900 tracking-tight drop-shadow-sm font-serif-custom relative inline-block">
          LAUNCH YOUR<br />STARTUP <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-500">PRO</span>
          <div className="absolute -bottom-4 left-1/4 right-1/4 h-2 bg-amber-400 rounded-full opacity-60"></div>
        </h1>
        <p className="text-2xl text-stone-700 font-sans-custom max-w-2xl mx-auto leading-relaxed border-l-4 border-amber-400 pl-6 text-left italic">
          CampusLaunch is the ultimate platform for student entrepreneurs. Build your dream team, sketch out your business model canvas, manage Kanban tasks, and connect with seed funding—all in one place.
        </p>
        <div className="pt-12 flex justify-center gap-8">
          {isAuthenticated ? (
            <Link to="/home" className="gilded-btn text-xl px-12 py-5 uppercase">
              Back to Home Hub
            </Link>
          ) : (
            <>
              <Link to="/register" className="gilded-btn text-lg px-10">
                Get Started
              </Link>
              <Link to="/login" className="placard-interactive bg-white text-stone-800 font-bold px-10 py-3 tracking-widest text-sm flex items-center justify-center uppercase">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};



function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationHandler />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/startup/:id" element={<PublicProfile />} />
              
              <Route path="/profile/me" element={
                <PrivateRoute><StudentProfile /></PrivateRoute>
              } />
              <Route path="/profiles" element={<BrowseProfiles />} />
              <Route path="/profiles/:id" element={<StudentProfile />} />

              <Route path="/mentors" element={<MentorList />} />
              <Route path="/mentors/:mentorId/book" element={
                  <PrivateRoute><BookSession /></PrivateRoute>
              } />
              <Route path="/bookings/my" element={
                  <PrivateRoute><MyBookings /></PrivateRoute>
              } />
              

              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfileSettings />
                </PrivateRoute>
              } />
              
              <Route path="/home" element={
                <PrivateRoute>
                  <StudentHome />
                </PrivateRoute>
              } />
              <Route path="/events" element={
                <PrivateRoute>
                  <EventHub />
                </PrivateRoute>
              } />
              <Route path="/funding" element={
                <PrivateRoute>
                  <FundingDirectory />
                </PrivateRoute>
              } />

              <Route path="/matching" element={
                <PrivateRoute>
                  <CoFounderMatching />
                </PrivateRoute>
              } />

              <Route path="/curriculum" element={
                <PrivateRoute>
                  <CurriculumPage />
                </PrivateRoute>
              } />
              <Route path="/curriculum/week/:weekNumber" element={
                <PrivateRoute>
                  <CurriculumWeekPage />
                </PrivateRoute>
              } />
              <Route path="/curriculum/certificate" element={
                <PrivateRoute>
                  <CurriculumCertificate />
                </PrivateRoute>
              } />

              <Route path="/pitch-arena" element={
                <PrivateRoute>
                  <PitchArenaPage />
                </PrivateRoute>
              } />
              <Route path="/pitch-arena/event/:eventId" element={
                <PrivateRoute>
                  <PitchEventDetailPage />
                </PrivateRoute>
              } />
              <Route path="/pitch-arena/event/:eventId/room" element={
                <PrivateRoute>
                  <PitchLiveRoomPage />
                </PrivateRoute>
              } />
              <Route path="/pitch-arena/event/:eventId/audience" element={
                <PrivateRoute>
                  <PitchAudiencePage />
                </PrivateRoute>
              } />
              <Route path="/pitch-arena/event/:eventId/results" element={
                <PrivateRoute>
                  <PitchResultsPage />
                </PrivateRoute>
              } />

              <Route path="/connections" element={
                <PrivateRoute>
                  <ConnectionsDashboard />
                </PrivateRoute>
              } />

              <Route path="/requests" element={
                <PrivateRoute>
                  <ConnectionRequests />
                </PrivateRoute>
              } />

              <Route path="/chat/:connectionId" element={
                <PrivateRoute>
                  <PrivateChat />
                </PrivateRoute>
              } />

              <Route path="/teams/create" element={
                <PrivateRoute>
                  <CreateTeam />
                </PrivateRoute>
              } />
              <Route path="/teams/dashboard/:teamId" element={
                <PrivateRoute>
                  <TeamDashboard />
                </PrivateRoute>
              } />
              <Route path="/teams/browse" element={<BrowseTeams />} />
              <Route path="/teams/:teamId/portfolio/edit" element={
                <PrivateRoute>
                  <PortfolioEditor />
                </PrivateRoute>
              } />
              <Route path="/notifications" element={
                <PrivateRoute>
                  <NotificationInbox />
                </PrivateRoute>
              } />

              <Route path="/ai-validator" element={
                <PrivateRoute>
                  <AIValidator />
                </PrivateRoute>
              } />
              <Route path="/ai/report/:id" element={
                <PrivateRoute>
                  <AIReportPage />
                </PrivateRoute>
              } />
              <Route path="/leaderboard" element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              } />

              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/add" element={
                <PrivateRoute>
                  <AddResource />
                </PrivateRoute>
              } />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/resources/:id/edit" element={
                <PrivateRoute>
                  <EditResource />
                </PrivateRoute>
              } />
            </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

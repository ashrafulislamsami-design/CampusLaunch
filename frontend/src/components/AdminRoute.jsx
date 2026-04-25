import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldOff } from 'lucide-react';

/**
 * AdminRoute
 * Wraps admin-only pages. Redirects unauthenticated users to /login,
 * shows a "forbidden" screen for authenticated non-admin users,
 * and renders children only when role === 'Admin'.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  // Still loading auth context — render nothing to prevent flash
  if (loading) return null;

  // Not logged in → redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Logged in but not admin → 403 screen
  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="placard p-12 max-w-md w-full flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
            <ShieldOff size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black font-serif-custom text-amber-900">Access Denied</h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            This section is restricted to platform administrators only.
            If you believe this is an error, please contact support.
          </p>
          <a
            href="/home"
            className="gilded-btn mt-2"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

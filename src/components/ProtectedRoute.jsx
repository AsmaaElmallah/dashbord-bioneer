import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, isSupabaseEnabled } from '../context/AuthContext';

/**
 * When Supabase is enabled, admin pages require an authenticated session.
 * Local mode (VITE_USE_SUPABASE=false) stays open for UI development.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { loading, isLoggedIn } = useAuth();

  if (!isSupabaseEnabled) {
    return children;
  }

  if (loading) {
    return (
      <div className="protected-route-loading">
        <p className="text-caption">جاري التحقق من الجلسة…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

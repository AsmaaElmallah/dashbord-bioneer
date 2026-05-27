import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth, isSupabaseEnabled } from '../context/AuthContext';

export function TopbarAuth() {
  const navigate = useNavigate();
  const { user, loading, isLoggedIn, signOut } = useAuth();

  if (!isSupabaseEnabled) {
    return (
      <div className="admin-topbar__user">
        <span className="admin-topbar__user-name">وضع محلي</span>
        <div className="admin-avatar" title="بدون سحابة">
          ب
        </div>
      </div>
    );
  }

  if (loading) {
    return <span className="text-caption admin-topbar__auth-loading">جاري التحقق…</span>;
  }

  if (!isLoggedIn) {
    return (
      <Link to="/login" className="mock-btn mock-btn--primary admin-topbar__login-btn">
        <LogIn size={16} aria-hidden />
        تسجيل الدخول
      </Link>
    );
  }

  const displayName = user?.email?.split('@')[0] ?? 'أدمن';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-topbar__user">
      <button
        type="button"
        className="mock-btn mock-btn--outline admin-topbar__logout-btn"
        onClick={handleSignOut}
        title="تسجيل الخروج"
      >
        <LogOut size={16} aria-hidden />
        خروج
      </button>
      <span className="admin-topbar__user-name" title={user?.email}>
        {displayName}
      </span>
      <div className="admin-avatar" title={user?.email}>
        {displayName.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogIn, Menu } from 'lucide-react';
import { GlobalSearch } from '../components/GlobalSearch';
import { TopbarAuth } from '../components/TopbarAuth';
import { useAuth, isSupabaseEnabled } from '../context/AuthContext';
import { mobileNavSections, navSections } from '../config/navigation';
import './AdminShell.css';

function AuthBanner() {
  const { isLoggedIn, loading } = useAuth();

  if (!isSupabaseEnabled || loading || isLoggedIn) return null;

  return (
    <div className="admin-auth-banner" role="status">
      <span>لم تسجّلي الدخول — الحفظ على السحابة قد لا يعمل (RLS).</span>
      <Link to="/login" className="admin-auth-banner__link">
        <LogIn size={14} aria-hidden />
        تسجيل الدخول
      </Link>
    </div>
  );
}

export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
      <div className="admin-shell">
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__brand-full">بيانور — لوحة التحكم</span>
            <span className="admin-sidebar__brand-short admin-avatar" title="بيانور">
              ب
            </span>
          </div>
          <nav className="admin-sidebar__nav">
            {navSections.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                title={label}
              >
                <Icon size={18} />
                <span className="admin-nav-link__label">{label}</span>
              </NavLink>
            ))}
            {isSupabaseEnabled && (
              <NavLink
                to="/login"
                className={({ isActive }) => `admin-nav-link admin-nav-link--login ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                title="تسجيل الدخول"
              >
                <LogIn size={18} />
                <span className="admin-nav-link__label">تسجيل الدخول</span>
              </NavLink>
            )}
          </nav>
        </aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="القائمة"
            >
              <Menu size={24} />
            </button>
            <strong className="admin-topbar__title">لوحة تحكم بيانور</strong>
            <GlobalSearch />
            <div className="admin-topbar__right">
              <TopbarAuth />
            </div>
          </header>
          <AuthBanner />
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
        <nav className="mobile-bottom-nav" aria-label="تنقل سريع">
          {mobileNavSections.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `mobile-bottom-nav__link${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
  );
}

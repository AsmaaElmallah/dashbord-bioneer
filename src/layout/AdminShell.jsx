import { useState } from 'react';

import { NavLink, Outlet } from 'react-router-dom';

import { Menu } from 'lucide-react';

import { GlobalSearch } from '../components/GlobalSearch';

import { mobileNavSections, navSections } from '../config/navigation';

import './AdminShell.css';



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

        </nav>

      </aside>

      <div className="admin-main">

        <header className="admin-topbar">

          <button type="button" className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="القائمة">

            <Menu size={24} />

          </button>

          <strong className="admin-topbar__title">لوحة تحكم بيانور</strong>

          <GlobalSearch />

          <div className="admin-topbar__right">

            <div className="admin-topbar__user">

              <span className="admin-topbar__user-name">مدير النظام</span>

              <div className="admin-avatar">ب</div>

            </div>

          </div>

        </header>

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



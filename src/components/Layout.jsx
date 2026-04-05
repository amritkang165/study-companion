import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  HiSquares2X2,
  HiBookOpen,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiSparkles,
} from 'react-icons/hi2';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: HiSquares2X2 },
  { to: '/subjects', label: 'Subjects', icon: HiBookOpen },
  { to: '/tasks', label: 'Tasks', icon: HiClipboardDocumentList },
  { to: '/revision', label: 'Revision', icon: HiCalendarDays },
  { to: '/ai-tools', label: 'AI Tools', icon: HiSparkles },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden>
            ◆
          </span>
          <div>
            <h1 className="app-header__title">Study Companion</h1>
            <p className="app-header__tagline">Plan, revise, learn smarter</p>
          </div>
        </div>
        <nav className="app-nav" aria-label="Main">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `app-nav__link ${isActive ? 'app-nav__link--active' : ''}`
              }
            >
              <Icon className="app-nav__icon" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

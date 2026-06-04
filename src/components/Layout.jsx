import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import {
  HiSquares2X2,
  HiBookOpen,
  HiSparkles,
  HiClock,
  HiUser,
  HiSun,
  HiMoon,
} from 'react-icons/hi2';
const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: HiSquares2X2 },
  { to: '/subjects-tasks', label: 'Subjects & Tasks', icon: HiBookOpen },
  { to: '/pomodoro', label: 'Pomodoro', icon: HiClock },
  { to: '/study-buddy', label: 'Study Buddy', icon: HiSparkles },
  { to: '/profile', label: 'Profile', icon: HiUser },
];

export function Layout() {
  const { dark, toggle } = useDarkMode();
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
            <React.Fragment key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `app-nav__link ${isActive ? 'app-nav__link--active' : ''}`
                }
              >
                <Icon className="app-nav__icon" aria-hidden />
                <span>{label}</span>
              </NavLink>

            </React.Fragment>
          ))}
          <button
            type="button"
            className="app-nav__link"
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ cursor: 'pointer', background: 'none', border: 'none' }}
          >
            {dark ? <HiSun className="app-nav__icon" /> : <HiMoon className="app-nav__icon" />}
          </button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

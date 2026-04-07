import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/calendar', icon: '📅', label: 'Calendar' },
  { to: '/goals', icon: '🎯', label: 'Goals' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/weekly-review', icon: '📋', label: 'Weekly Review' },
  { to: '/focus', icon: '⚡', label: 'Focus Mode' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>⏱ Timeblazer</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

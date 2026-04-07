import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Home' },
  { to: '/calendar', icon: '📅', label: 'Calendar' },
  { to: '/goals', icon: '🎯', label: 'Goals' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

function Navbar() {
  return (
    <nav className={styles.navbar}>
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
  );
}

export default Navbar;

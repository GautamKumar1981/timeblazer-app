import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/calendar', icon: '📅', label: 'Calendar' },
  { to: '/goals', icon: '🎯', label: 'Goals' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/weekly-review', icon: '📝', label: 'Weekly Review' },
  { to: '/focus', icon: '⏱', label: 'Focus Mode' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

const Sidebar: React.FC = () => {
  return (
    <aside style={{
      width: '220px', minWidth: '220px', backgroundColor: '#1e1b4b',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
    }}>
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#a5b4fc' }}>⏱ Timeblazer</span>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              color: isActive ? '#fff' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(99,102,241,0.3)' : 'transparent',
              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

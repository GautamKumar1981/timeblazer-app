import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem { to: string; icon: string; label: string }

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',        icon: '🏠',  label: 'Dashboard'         },
  { to: '/morning-ritual',   icon: '☀️',  label: 'Morning Ritual'    },
  { to: '/shutdown-ritual',  icon: '🌙',  label: 'End of Day'        },
  { to: '/nepali-panchang',  icon: '🙏',  label: 'Nepali Panchang'   },
  { to: '/calendar',         icon: '📅',  label: 'Bazi Calendar'     },
  { to: '/chart',            icon: '🀄',  label: 'Four Pillars'      },
  { to: '/analytics',        icon: '💎',  label: 'Remedies'          },
  { to: '/weekly-review',    icon: '📝',  label: 'Weekly Review'     },
  { to: '/focus',            icon: '🧘',  label: 'Meditation'        },
  { to: '/settings',         icon: '⚙️',  label: 'Settings'          },
];

const Sidebar: React.FC = () => {
  return (
    <aside style={{
      width: 230, minWidth: 230, backgroundColor: '#f0eeff',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
      borderRight: '1px solid #e2daff',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #e2daff', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 3px 10px rgba(124,58,237,0.35)',
            flexShrink: 0,
          }}>🐉</div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{
              fontSize: 15, fontWeight: 900,
              background: 'linear-gradient(90deg, #7c3aed, #db2777)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>DragonHour</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#a78bfa', letterSpacing: 2 }}>BAZI · JYOTISH · TIME</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', textDecoration: 'none',
              fontSize: 14, fontWeight: isActive ? 700 : 500,
              color: isActive ? '#3b0764' : '#6d28d9',
              backgroundColor: isActive ? '#ddd6fe' : 'transparent',
              borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
              transition: 'background 0.12s, color 0.12s',
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useIsMobile } from '../../hooks/useIsMobile';

interface NavItem { to: string; icon: string; label: string }

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',        icon: '🏠',  label: 'Dashboard'        },
  { to: '/morning-ritual',   icon: '☀️',  label: 'Morning Ritual'   },
  { to: '/shutdown-ritual',  icon: '🌙',  label: 'End of Day'       },
  { to: '/vedic-panchang',   icon: '🙏',  label: 'Vedic Panchang'  },
  { to: '/calendar',         icon: '📅',  label: 'Bazi Calendar'    },
  { to: '/chart',            icon: '🀄',  label: 'Four Pillars'     },
  { to: '/analytics',        icon: '💎',  label: 'Remedies'         },
  { to: '/weekly-review',    icon: '📝',  label: 'Weekly Review'    },
  { to: '/focus',            icon: '🧘',  label: 'Meditation'       },
  { to: '/settings',         icon: '⚙️',  label: 'Settings'         },
];

const Sidebar: React.FC = () => {
  const isMobile = useIsMobile();
  const { isOpen, close } = useSidebar();

  const sidebarContent = (
    <aside style={{
      width: 230, minWidth: 230, backgroundColor: '#f0eeff',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
      borderRight: '1px solid #e2daff', height: '100%',
    }}>
      {/* Logo + close button on mobile */}
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #e2daff', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 3px 10px rgba(124,58,237,0.35)', flexShrink: 0,
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
        {isMobile && (
          <button onClick={close} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#7c3aed', padding: '0 4px', lineHeight: 1 }}>✕</button>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && close()}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 16px', textDecoration: 'none',
              fontSize: 14, fontWeight: isActive ? 700 : 500,
              color: isActive ? '#3b0764' : '#6d28d9',
              backgroundColor: isActive ? '#ddd6fe' : 'transparent',
              borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div onClick={close} style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 199, backdropFilter: 'blur(2px)',
          }} />
        )}
        {/* Slide-out drawer */}
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
        }}>
          {sidebarContent}
        </div>
      </>
    );
  }

  return sidebarContent;
};

export default Sidebar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const DragonLogo: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 42, height: 42, borderRadius: 11,
      background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, boxShadow: '0 3px 12px rgba(124,58,237,0.38)',
      flexShrink: 0,
    }}>🐉</div>
    <div style={{ lineHeight: 1 }}>
      <div style={{
        fontSize: 17, fontWeight: 900, letterSpacing: 0.3,
        background: 'linear-gradient(90deg, #7c3aed, #db2777)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>DragonHour</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#a78bfa', letterSpacing: 2.5, marginTop: 1 }}>BAZI ASTROLOGY</div>
    </div>
  </div>
);

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const sub      = useAppSelector((s) => s.subscription.data);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  const trialBadge = sub?.is_trial_active
    ? `Trial: ${sub.trial_days_remaining}d left`
    : sub && !sub.has_premium_access
    ? 'Trial Expired'
    : null;

  return (
    <header style={{
      backgroundColor: '#fff', borderBottom: '1px solid #ede9fe',
      padding: '0 24px', height: 60, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', boxShadow: '0 1px 6px rgba(124,58,237,0.07)',
      flexShrink: 0,
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <DragonLogo />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {trialBadge && (
          <button
            onClick={() => navigate('/upgrade')}
            style={{
              padding: '6px 12px',
              backgroundColor: sub?.has_premium_access ? '#ede9fe' : '#fce7f3',
              color: sub?.has_premium_access ? '#6d28d9' : '#be185d',
              border: `1px solid ${sub?.has_premium_access ? '#c4b5fd' : '#fbcfe8'}`,
              borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 700,
            }}
          >
            {trialBadge}
          </button>
        )}

        <Link to="/focus" style={{
          padding: '7px 14px', backgroundColor: '#ede9fe', color: '#6d28d9',
          textDecoration: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: '1px solid #c4b5fd',
        }}>
          🧘 Meditate
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14,
          }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{user?.name || 'User'}</span>
        </div>

        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid #e8e3f8', color: '#6b7280', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

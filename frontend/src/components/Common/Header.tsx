import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb',
      padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexShrink: 0,
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5' }}>⏱ Timeblazer</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/focus" style={{ padding: '7px 14px', backgroundColor: '#4f46e5', color: '#fff', textDecoration: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600 }}>
          🎯 Focus Mode
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>{user?.name || 'User'}</span>
        </div>

        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

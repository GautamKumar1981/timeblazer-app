import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import styles from './Header.module.css';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date: Date) =>
    date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className={styles.header}>
      <div className={styles.logo}>⏱ Timeblazer</div>
      <div className={styles.clock}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <span className={styles.date}>{formatDate(currentTime)}</span>
      </div>
      <div className={styles.userMenu}>
        <button
          className={styles.avatarButton}
          onClick={() => setShowMenu((prev) => !prev)}
          aria-label="User menu"
        >
          <span className={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </span>
          <span className={styles.userName}>{user?.name ?? 'User'}</span>
        </button>
        {showMenu && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownEmail}>{user?.email}</div>
            <button className={styles.dropdownItem} onClick={() => { navigate('/settings'); setShowMenu(false); }}>
              ⚙️ Settings
            </button>
            <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

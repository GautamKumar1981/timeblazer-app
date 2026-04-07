import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { api } from '../services/api';
import styles from './Settings.module.css';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
  'Asia/Shanghai', 'Australia/Sydney',
];

function Settings() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState({ name: user?.name ?? '', timezone: user?.timezone ?? 'UTC' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [theme, setTheme] = useState<'light' | 'dark'>(user?.theme ?? 'light');
  const [notifications, setNotifications] = useState(true);

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.users.getProfile();
        const u = res.data.user || res.data;
        setProfile({ name: u.name, timezone: u.timezone });
      } catch {}
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.users.updateProfile({ name: profile.name, timezone: profile.timezone, theme });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.users.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ current_password: '', new_password: '', confirm: '' });
    } catch {
      setPasswordMsg({ type: 'error', text: 'Failed to change password. Check your current password.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>⚙️ Settings</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        {profileMsg && (
          <div className={profileMsg.type === 'success' ? 'success-message' : 'error-message'}>
            {profileMsg.text}
          </div>
        )}
        <form onSubmit={handleSaveProfile} className={styles.form}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email ?? ''} disabled className={styles.disabledInput} />
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
            >
              {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSavingProfile}>
            {isSavingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Preferences</h2>
        <div className={styles.preferenceRow}>
          <div>
            <div className={styles.prefLabel}>Theme</div>
            <div className={styles.prefDesc}>Choose your display theme</div>
          </div>
          <div className={styles.themeToggle}>
            <button
              className={`${styles.themeBtn} ${theme === 'light' ? styles.themeActive : ''}`}
              onClick={() => setTheme('light')}
            >
              ☀️ Light
            </button>
            <button
              className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeActive : ''}`}
              onClick={() => setTheme('dark')}
            >
              🌙 Dark
            </button>
          </div>
        </div>
        <div className={styles.preferenceRow}>
          <div>
            <div className={styles.prefLabel}>Notifications</div>
            <div className={styles.prefDesc}>Get timebox reminders</div>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Change Password</h2>
        {passwordMsg && (
          <div className={passwordMsg.type === 'success' ? 'success-message' : 'error-message'}>
            {passwordMsg.text}
          </div>
        )}
        <form onSubmit={handleChangePassword} className={styles.form}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSavingPassword}>
            {isSavingPassword ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Settings;

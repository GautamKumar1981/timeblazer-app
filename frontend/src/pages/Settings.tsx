import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { updateProfile } from '../store/slices/authSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [notifications, setNotifications] = useState({ email: true, browser: true, reminderMinutes: 5 });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saved, setSaved] = useState(false);

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateProfile(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 18px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', maxWidth: '700px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>⚙️ Settings</h2>

          {saved && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              ✓ Settings saved successfully.
            </div>
          )}

          <SectionCard title="👤 Profile">
            <form onSubmit={handleSaveProfile}>
              <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input style={inputStyle} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
              <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Email</label>
              <input style={inputStyle} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
              <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                Save Profile
              </button>
            </form>
          </SectionCard>

          <SectionCard title="🔔 Notifications">
            {[
              { key: 'email', label: 'Email notifications' },
              { key: 'browser', label: 'Browser notifications' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>
                <div
                  onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    backgroundColor: notifications[key as keyof typeof notifications] ? '#4f46e5' : '#d1d5db',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s',
                    left: notifications[key as keyof typeof notifications] ? '23px' : '3px',
                  }} />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', color: '#374151' }}>Reminder before timebox (minutes)</label>
              <input
                style={{ width: '70px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                type="number" min={1} max={60}
                value={notifications.reminderMinutes}
                onChange={(e) => setNotifications({ ...notifications, reminderMinutes: Number(e.target.value) })}
              />
            </div>
          </SectionCard>

          <SectionCard title="🎨 Appearance">
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '10px 22px', border: '2px solid', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                    borderColor: theme === t ? '#4f46e5' : '#d1d5db',
                    backgroundColor: theme === t ? '#ede9fe' : '#fff',
                    color: theme === t ? '#4f46e5' : '#374151',
                  }}
                >
                  {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px' }}>Theme preference is saved locally.</p>
          </SectionCard>
        </main>
      </div>
    </div>
  );
};

export default Settings;

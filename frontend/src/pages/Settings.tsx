import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { updateProfile } from '../store/slices/authSlice';
import { fetchSubscriptionStatus } from '../store/slices/subscriptionSlice';
import { subscriptionAPI } from '../services/api';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3',
  borderRadius: 8, fontSize: 14, color: '#1f2937', backgroundColor: '#fff',
  boxSizing: 'border-box', marginBottom: 12, outline: 'none',
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(124,58,237,0.07)', marginBottom: 20, border: '1px solid #e8e3f8' }}>
    <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#2e1065' }}>{title}</h3>
    {children}
  </div>
);

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [notifications, setNotifications] = useState({ email: true, browser: true, reminderMinutes: 5 });
  const [saved, setSaved] = useState(false);

  // Sync form when Redux user loads (e.g. after page refresh)
  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '' });
  }, [user]);

  // Verify payment and activate subscription when returning from Stripe checkout
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      window.history.replaceState({}, '', '/settings');
      subscriptionAPI.verifySession(sessionId)
        .then(() => dispatch(fetchSubscriptionStatus()))
        .catch(() => dispatch(fetchSubscriptionStatus()));
    }
  }, [dispatch]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateProfile(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 28, overflowY: 'auto', maxWidth: 720 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: '#2e1065' }}>⚙️ Settings</h2>

          {saved && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '11px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, border: '1px solid #6ee7b7' }}>
              ✓ Settings saved successfully.
            </div>
          )}

          <SectionCard title="👤 Profile">
            <form onSubmit={handleSaveProfile}>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4, fontWeight: 600 }}>Full Name</label>
              <input
                style={inp}
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
              />
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4, fontWeight: 600 }}>Email</label>
              <input
                style={inp}
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Email address"
              />
              <button
                type="submit"
                style={{ padding: '10px 22px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
              >
                Save Profile
              </button>
            </form>
          </SectionCard>

          <SectionCard title="🔔 Notifications">
            {[
              { key: 'email',   label: 'Email notifications'   },
              { key: 'browser', label: 'Browser notifications' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
                <div
                  onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                  style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', backgroundColor: notifications[key as keyof typeof notifications] ? '#7c3aed' : '#d1d5db' }}
                >
                  <div style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', left: notifications[key as keyof typeof notifications] ? 23 : 3 }} />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 14, color: '#374151' }}>Reminder before timebox (minutes)</label>
              <input
                style={{ width: 70, padding: '6px 10px', border: '1px solid #e2d9f3', borderRadius: 7, fontSize: 14, color: '#1f2937', backgroundColor: '#fff' }}
                type="number" min={1} max={60}
                value={notifications.reminderMinutes}
                onChange={(e) => setNotifications({ ...notifications, reminderMinutes: Number(e.target.value) })}
              />
            </div>
          </SectionCard>

          <SectionCard title="💎 Subscription">
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 14px' }}>
              Manage your DragonHour subscription — 7-day free trial, then £0.99/month or £9.99/year.
            </p>
            <a href="/upgrade" style={{ display: 'inline-block', padding: '10px 22px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              View Pricing Plans →
            </a>
          </SectionCard>
        </main>
      </div>
    </div>
  );
};

export default Settings;

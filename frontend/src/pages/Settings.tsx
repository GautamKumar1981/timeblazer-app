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
  const sub = useAppSelector((s) => s.subscription.data);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [notifications, setNotifications] = useState({ email: true, browser: true, reminderMinutes: 5 });
  const [saved, setSaved] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

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

  const handleCancelSubscription = async () => {
    if (!window.confirm('Cancel your subscription? You will lose access immediately.')) return;
    setCancelling(true);
    setCancelError('');
    try {
      await subscriptionAPI.cancelSubscription();
      dispatch(fetchSubscriptionStatus());
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setCancelError(err.response?.data?.error || 'Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

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
            {sub?.is_subscribed ? (
              <div>
                {sub.is_cancelled ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#fffbeb', borderRadius: 10, padding: '12px 16px', marginBottom: 12, border: '1px solid #fcd34d' }}>
                      <span style={{ fontSize: 20 }}>⚠️</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Subscription Cancelled</div>
                        <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                          You still have full access until {new Date(sub.subscribed_until!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <a href="/upgrade" style={{ display: 'inline-block', padding: '8px 18px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                      Resubscribe →
                    </a>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#d1fae5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, border: '1px solid #6ee7b7' }}>
                      <span style={{ fontSize: 20 }}>✅</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Active Subscription</div>
                        <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
                          Renews {new Date(sub.subscribed_until!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    {cancelError && (
                      <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, border: '1px solid #fecaca' }}>
                        {cancelError}
                      </div>
                    )}
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      style={{ padding: '8px 18px', backgroundColor: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, cursor: cancelling ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: cancelling ? 0.7 : 1 }}
                    >
                      {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
                    </button>
                  </>
                )}
              </div>
            ) : sub?.is_trial_active ? (
              <div>
                <div style={{ backgroundColor: '#ede9fe', borderRadius: 10, padding: '12px 16px', marginBottom: 14, border: '1px solid #c4b5fd' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95' }}>⏳ Free Trial — {sub.trial_days_remaining} day{sub.trial_days_remaining !== 1 ? 's' : ''} remaining</div>
                  <div style={{ fontSize: 13, color: '#6d28d9', marginTop: 4 }}>Subscribe before your trial ends to keep full access.</div>
                </div>
                <a href="/upgrade" style={{ display: 'inline-block', padding: '10px 22px', backgroundColor: '#7c3aed', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                  Subscribe Now →
                </a>
              </div>
            ) : (
              <div>
                <div style={{ backgroundColor: '#fce7f3', borderRadius: 10, padding: '12px 16px', marginBottom: 14, border: '1px solid #fbcfe8' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#9d174d' }}>🔒 Trial Expired</div>
                  <div style={{ fontSize: 13, color: '#be185d', marginTop: 4 }}>Subscribe to continue your Bazi journey.</div>
                </div>
                <a href="/upgrade" style={{ display: 'inline-block', padding: '10px 22px', backgroundColor: '#7c3aed', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                  View Plans →
                </a>
              </div>
            )}
          </SectionCard>
        </main>
      </div>
    </div>
  );
};

export default Settings;

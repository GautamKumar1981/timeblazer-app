import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { updateProfile } from '../store/slices/authSlice';
import { fetchSubscriptionStatus } from '../store/slices/subscriptionSlice';
import { subscriptionAPI, authAPI } from '../services/api';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import { useIsMobile } from '../hooks/useIsMobile';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3',
  borderRadius: 8, fontSize: 14, color: '#1f2937', backgroundColor: '#fff',
  boxSizing: 'border-box', marginBottom: 12, outline: 'none',
};
const labelStyle: React.CSSProperties = {
  fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4, fontWeight: 600,
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 2px 8px rgba(124,58,237,0.07)', marginBottom: 18, border: '1px solid #e8e3f8' }}>
    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#2e1065' }}>{title}</h3>
    {children}
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', backgroundColor: checked ? '#7c3aed' : '#d1d5db', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', left: checked ? 23 : 3 }} />
  </div>
);

const NOTIF_KEY = 'dragonhour_notifications';
const loadNotifPrefs = () => {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}'); } catch { return {}; }
};

const Settings: React.FC = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();
  const { user }  = useAppSelector((s) => s.auth);
  const sub       = useAppSelector((s) => s.subscription.data);

  const [profile,       setProfile]       = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState<{ ok: boolean; text: string } | null>(null);

  const [pwForm,    setPwForm]    = useState({ current: '', next: '', confirm: '' });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwMsg,     setPwMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [showPw,    setShowPw]    = useState(false);

  const savedNotifs = loadNotifPrefs();
  const [notifs, setNotifs] = useState({
    browser: savedNotifs.browser ?? true,
    reminderMinutes: savedNotifs.reminderMinutes ?? 5,
  });

  const [cancelling,    setCancelling]    = useState(false);
  const [cancelError,   setCancelError]   = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '' });
  }, [user]);

  useEffect(() => { dispatch(fetchSubscriptionStatus()); }, [dispatch]);

  // Verify Stripe session on return from checkout
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

  const saveNotifs = (next: typeof notifs) => {
    setNotifs(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  const requestBrowserPermission = async (enabled: boolean) => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    saveNotifs({ ...notifs, browser: enabled });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await dispatch(updateProfile(profile)).unwrap();
      setProfileMsg({ ok: true, text: 'Profile saved.' });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.message || 'Save failed. Please try again.' });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' }); return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ ok: false, text: 'New password must be at least 8 characters.' }); return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await authAPI.changePassword(pwForm.current, pwForm.next);
      setPwMsg({ ok: true, text: 'Password updated successfully.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setPwMsg({ ok: false, text: err?.response?.data?.error || 'Password change failed.' });
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwMsg(null), 3500);
    }
  };

  const handleBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await subscriptionAPI.billingPortal();
      window.location.href = res.data.url;
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Could not open billing portal.');
    } finally { setPortalLoading(false); }
  };

  const handleCancel = async () => {
    const until = sub?.subscribed_until
      ? new Date(sub.subscribed_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'the end of your billing period';
    if (!window.confirm(`Cancel subscription? You keep full access until ${until}.`)) return;
    setCancelling(true); setCancelError('');
    try {
      await subscriptionAPI.cancelSubscription();
      dispatch(fetchSubscriptionStatus());
    } catch (e: any) {
      setCancelError(e?.response?.data?.error || 'Failed to cancel. Please try again.');
    } finally { setCancelling(false); }
  };

  const msgBanner = (msg: { ok: boolean; text: string } | null) => msg && (
    <div style={{ backgroundColor: msg.ok ? '#d1fae5' : '#fef2f2', color: msg.ok ? '#065f46' : '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, border: `1px solid ${msg.ok ? '#6ee7b7' : '#fecaca'}`, fontWeight: 600 }}>
      {msg.ok ? '✓ ' : '⚠ '}{msg.text}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: isMobile ? 16 : '28px 32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 680, width: '100%' }}>

            <h2 style={{ margin: '0 0 4px', fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2e1065' }}>⚙️ Settings</h2>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 20px' }}>Manage your profile, security, and subscription.</p>

            {/* ── Profile ───────────────────────────────────────────── */}
            <SectionCard title="👤 Profile">
              {msgBanner(profileMsg)}
              <form onSubmit={handleSaveProfile}>
                <label style={labelStyle}>Full Name</label>
                <input style={inp} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your full name" />
                <label style={labelStyle}>Email</label>
                <input style={inp} type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="Email address" />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="submit" disabled={profileSaving} style={{ padding: '9px 22px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: profileSaving ? 0.7 : 1 }}>
                    {profileSaving ? 'Saving…' : 'Save Profile'}
                  </button>
                  <button type="button" onClick={() => navigate('/profile')} style={{ padding: '9px 18px', backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #e2d9f3', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    Update Bazi Profile →
                  </button>
                </div>
              </form>
            </SectionCard>

            {/* ── Change Password ───────────────────────────────────── */}
            <SectionCard title="🔒 Change Password">
              {msgBanner(pwMsg)}
              <form onSubmit={handleChangePassword}>
                <label style={labelStyle}>Current Password</label>
                <input style={inp} type={showPw ? 'text' : 'password'} value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} placeholder="Enter current password" autoComplete="current-password" />
                <label style={labelStyle}>New Password</label>
                <input style={inp} type={showPw ? 'text' : 'password'} value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} placeholder="At least 8 characters" autoComplete="new-password" />
                <label style={labelStyle}>Confirm New Password</label>
                <input style={inp} type={showPw ? 'text' : 'password'} value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Repeat new password" autoComplete="new-password" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <input type="checkbox" id="show_pw" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor: '#7c3aed' }} />
                  <label htmlFor="show_pw" style={{ fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>Show passwords</label>
                </div>
                <button type="submit" disabled={pwSaving || !pwForm.current || !pwForm.next} style={{ padding: '9px 22px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: (pwSaving || !pwForm.current || !pwForm.next) ? 0.6 : 1 }}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </SectionCard>

            {/* ── Notifications ─────────────────────────────────────── */}
            <SectionCard title="🔔 Notifications">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Browser notifications</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Timebox reminders and daily energy alerts</div>
                </div>
                <Toggle checked={notifs.browser} onChange={() => requestBrowserPermission(!notifs.browser)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontSize: 14, color: '#374151', flex: 1 }}>Reminder before timebox</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number" min={1} max={60}
                    value={notifs.reminderMinutes}
                    onChange={e => saveNotifs({ ...notifs, reminderMinutes: Number(e.target.value) })}
                    style={{ width: 60, padding: '6px 10px', border: '1px solid #e2d9f3', borderRadius: 7, fontSize: 14, color: '#1f2937', backgroundColor: '#fff', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>min</span>
                </div>
              </div>
            </SectionCard>

            {/* ── Subscription ──────────────────────────────────────── */}
            <SectionCard title="💎 Subscription">
              {sub?.is_subscribed ? (
                <>
                  {sub.is_cancelled ? (
                    <div style={{ backgroundColor: '#fffbeb', borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: '1px solid #fcd34d', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Cancellation scheduled</div>
                        <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                          You keep full access until {new Date(sub.subscribed_until!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. No further charges.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#d1fae5', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid #6ee7b7', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Active Subscription</div>
                        <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
                          Renews {new Date(sub.subscribed_until!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )}
                  {cancelError && (
                    <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, border: '1px solid #fecaca' }}>{cancelError}</div>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={handleBillingPortal} disabled={portalLoading} style={{ padding: '8px 18px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: portalLoading ? 0.7 : 1 }}>
                      {portalLoading ? 'Opening…' : '💳 Manage Billing'}
                    </button>
                    {!sub.is_cancelled && (
                      <button onClick={handleCancel} disabled={cancelling} style={{ padding: '8px 18px', backgroundColor: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: cancelling ? 0.7 : 1 }}>
                        {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
                      </button>
                    )}
                    {sub.is_cancelled && (
                      <button onClick={() => navigate('/upgrade')} style={{ padding: '8px 18px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                        Resubscribe →
                      </button>
                    )}
                  </div>
                </>
              ) : sub?.is_trial_active ? (
                <>
                  <div style={{ backgroundColor: '#ede9fe', borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: '1px solid #c4b5fd' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95' }}>⏳ Free Trial — {sub.trial_days_remaining} day{sub.trial_days_remaining !== 1 ? 's' : ''} remaining</div>
                    <div style={{ fontSize: 13, color: '#6d28d9', marginTop: 4 }}>Subscribe before your trial ends to keep full access.</div>
                  </div>
                  <button onClick={() => navigate('/upgrade')} style={{ padding: '10px 22px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    Subscribe Now →
                  </button>
                </>
              ) : (
                <>
                  <div style={{ backgroundColor: '#fce7f3', borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: '1px solid #fbcfe8' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#9d174d' }}>🔒 Trial Expired</div>
                    <div style={{ fontSize: 13, color: '#be185d', marginTop: 4 }}>Subscribe to continue your Bazi journey.</div>
                  </div>
                  <button onClick={() => navigate('/upgrade')} style={{ padding: '10px 22px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    View Plans →
                  </button>
                </>
              )}
            </SectionCard>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';
import { adminAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';
import { useIsMobile } from '../hooks/useIsMobile';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminSub {
  id: number;
  trial_start: string | null;
  trial_end: string | null;
  trial_days_remaining: number;
  is_trial_active: boolean;
  subscribed_until: string | null;
  is_subscribed: boolean;
  has_premium_access: boolean;
  is_cancelled: boolean;
  plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}
interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string | null;
  subscription: AdminSub | null;
}
interface Stats {
  total_users: number;
  total_admins: number;
  active_subs: number;
  active_trials: number;
  expired: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusBadge = (sub: AdminSub | null): { label: string; color: string } => {
  if (!sub) return { label: 'No record', color: '#9ca3af' };
  if (sub.is_subscribed && !sub.is_cancelled) return { label: `Subscribed · ${sub.plan ?? ''}`, color: '#16a34a' };
  if (sub.is_subscribed && sub.is_cancelled)  return { label: 'Cancelling', color: '#d97706' };
  if (sub.is_trial_active)                    return { label: `Trial · ${sub.trial_days_remaining}d left`, color: '#2563eb' };
  return { label: 'Expired', color: '#dc2626' };
};

const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ flex: 1, minWidth: 100, backgroundColor: '#fff', borderRadius: 10, padding: '14px 16px', border: `1px solid ${color}22` }}>
    <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const AdminPanel: React.FC = () => {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();
  const { user }  = useAppSelector((s) => s.auth);

  const [stats,     setStats]     = useState<Stats | null>(null);
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<AdminUser | null>(null);
  const [editForm,  setEditForm]  = useState({ username: '', email: '', is_admin: false });
  const [subForm,   setSubForm]   = useState({ action: 'grant', days: 31, plan: 'monthly', subscribed_until: '', trial_end: '' });
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');
  const LIMIT = 20;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadStats = useCallback(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const loadUsers = useCallback((q: string, pg: number) => {
    setLoading(true);
    adminAPI.listUsers({ search: q || undefined, page: pg, limit: LIMIT })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .catch((e: any) => setToast(e?.response?.data?.error ?? 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.is_admin) { navigate('/dashboard'); return; }
    loadStats();
    loadUsers('', 1);
  }, [user, navigate, loadStats, loadUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    loadUsers(e.target.value, 1);
  };

  const selectUser = (u: AdminUser) => {
    setSelected(u);
    setEditForm({ username: u.username, email: u.email, is_admin: u.is_admin });
    const sub = u.subscription;
    setSubForm({
      action: 'grant', days: 31, plan: sub?.plan ?? 'monthly',
      subscribed_until: sub?.subscribed_until ? sub.subscribed_until.split('T')[0] : '',
      trial_end: sub?.trial_end ? sub.trial_end.split('T')[0] : '',
    });
  };

  const saveUserEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const r = await adminAPI.updateUser(selected.id, editForm);
      const updated = r.data.user as AdminUser;
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setSelected(updated);
      loadStats();
      showToast('User updated');
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? 'Update failed');
    } finally { setSaving(false); }
  };

  const saveSubOverride = async () => {
    if (!selected) return;
    setSaving(true);
    const payload: Record<string, unknown> = { action: subForm.action };
    if (subForm.action === 'grant')        { payload.days = subForm.days; payload.plan = subForm.plan; }
    if (subForm.action === 'extend_trial') { payload.days = subForm.days; }
    if (subForm.action === 'direct') {
      payload.subscribed_until = subForm.subscribed_until || null;
      payload.trial_end        = subForm.trial_end        || null;
      payload.plan             = subForm.plan;
    }
    try {
      const r = await adminAPI.overrideSub(selected.id, payload);
      const updatedSub = r.data.subscription as AdminSub;
      const updatedUser = { ...selected, subscription: updatedSub };
      setUsers(prev => prev.map(u => u.id === selected.id ? updatedUser : u));
      setSelected(updatedUser);
      loadStats();
      showToast('Subscription updated');
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? 'Failed');
    } finally { setSaving(false); }
  };

  const deleteUser = async (u: AdminUser) => {
    if (!window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      if (selected?.id === u.id) setSelected(null);
      setTotal(t => t - 1);
      loadStats();
      showToast(`${u.email} deleted`);
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? 'Delete failed');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', border: '1px solid #e2d9f3', borderRadius: 6,
    fontSize: 13, color: '#1f2937', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: '#6b7280', fontWeight: 700, display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 };
  const card: React.CSSProperties = { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' };

  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: isMobile ? 16 : '24px 32px', overflowY: 'auto' }}>

          {/* Toast */}
          {toast && (
            <div style={{ position: 'fixed', top: 70, right: 20, zIndex: 1000, backgroundColor: '#2e1065', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              {toast}
            </div>
          )}

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2e1065' }}>🔐 Admin Panel</h2>
            <button
              onClick={async () => {
                try {
                  const r = await adminAPI.testEmail();
                  showToast((r.data as any).message ?? 'Sent');
                } catch (e: any) {
                  const d = e?.response?.data;
                  showToast(d?.error
                    ? `Email error: ${d.error}${d.SMTP_HOST ? ` (host=${d.SMTP_HOST}, user=${d.SMTP_USER})` : ''}`
                    : 'Test failed');
                }
              }}
              style={{ padding: '7px 14px', backgroundColor: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#7c3aed' }}
            >
              📧 Test Email
            </button>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 20px' }}>Manage users, subscriptions, and access rights.</p>

          {/* Stats row */}
          {stats && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <StatCard label="Total Users"   value={stats.total_users}   color="#7c3aed" />
              <StatCard label="Active Subs"   value={stats.active_subs}   color="#16a34a" />
              <StatCard label="Active Trials" value={stats.active_trials} color="#2563eb" />
              <StatCard label="Expired"       value={stats.expired}       color="#dc2626" />
              <StatCard label="Admins"        value={stats.total_admins}  color="#d97706" />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (selected ? '1fr 380px' : '1fr'), gap: 20, alignItems: 'start' }}>

            {/* ── User list ──────────────────────────────────────────────── */}
            <div style={{ ...card, overflow: 'hidden' }}>
              {/* Search bar */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e3f8', display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Search by email or name…"
                  value={search}
                  onChange={handleSearch}
                />
                <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{total} users</span>
              </div>

              {/* Table */}
              {loading ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
              ) : (
                <>
                  {/* Header row */}
                  {!isMobile && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 130px 80px', gap: 8, padding: '8px 20px', backgroundColor: '#f5f3ff', borderBottom: '1px solid #e8e3f8' }}>
                      {['User', 'Status', 'Joined', ''].map(h => (
                        <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</div>
                      ))}
                    </div>
                  )}

                  {users.map(u => {
                    const badge = statusBadge(u.subscription);
                    const isActive = selected?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => selectUser(u)}
                        style={{
                          display: isMobile ? 'flex' : 'grid',
                          gridTemplateColumns: '1fr 180px 130px 80px',
                          flexDirection: isMobile ? 'column' : undefined,
                          gap: 8, padding: '12px 20px', cursor: 'pointer',
                          backgroundColor: isActive ? '#f5f3ff' : 'transparent',
                          borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                          borderBottom: '1px solid #f5f3ff',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                              {(u.username || u.email)[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</div>
                              <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                            </div>
                            {u.is_admin && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', flexShrink: 0 }}>ADMIN</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, backgroundColor: badge.color + '18', color: badge.color, border: `1px solid ${badge.color}33`, fontWeight: 600 }}>{badge.label}</span>
                        </div>
                        {!isMobile && <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>{fmt(u.created_at)}</div>}
                        <div style={{ display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => deleteUser(u)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 14, padding: '4px', borderRadius: 4, opacity: 0.5 }}
                            title="Delete user"
                          >🗑️</button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {pages > 1 && (
                    <div style={{ padding: '12px 20px', display: 'flex', gap: 8, justifyContent: 'center', borderTop: '1px solid #f5f3ff' }}>
                      <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); loadUsers(search, page - 1); }} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e8e3f8', cursor: page > 1 ? 'pointer' : 'default', backgroundColor: '#fff', color: page > 1 ? '#7c3aed' : '#d1d5db', fontWeight: 600, fontSize: 13 }}>‹ Prev</button>
                      <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center' }}>Page {page} of {pages}</span>
                      <button disabled={page >= pages} onClick={() => { setPage(p => p + 1); loadUsers(search, page + 1); }} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e8e3f8', cursor: page < pages ? 'pointer' : 'default', backgroundColor: '#fff', color: page < pages ? '#7c3aed' : '#d1d5db', fontWeight: 600, fontSize: 13 }}>Next ›</button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── User detail / edit pane ────────────────────────────── */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Edit user info */}
                <div style={{ ...card, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065' }}>✏️ Edit User</div>
                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af', padding: '2px 6px' }}>✕</button>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Username</label>
                    <input style={inputStyle} value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="is_admin" checked={editForm.is_admin} onChange={e => setEditForm({ ...editForm, is_admin: e.target.checked })} style={{ accentColor: '#7c3aed' }} />
                    <label htmlFor="is_admin" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>Admin rights</label>
                  </div>
                  <button onClick={saveUserEdit} disabled={saving} style={{ width: '100%', padding: '9px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>

                {/* Subscription override */}
                <div style={{ ...card, padding: '18px 20px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 4 }}>💳 Subscription Override</div>

                  {/* Current status */}
                  {selected.subscription && (
                    <div style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#4c1d95' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {[
                          ['Subscribed until', fmt(selected.subscription.subscribed_until)],
                          ['Trial ends',       fmt(selected.subscription.trial_end)],
                          ['Plan',             selected.subscription.plan ?? '—'],
                          ['Is subscribed',    selected.subscription.is_subscribed ? 'Yes' : 'No'],
                          ['Trial active',     selected.subscription.is_trial_active ? `Yes (${selected.subscription.trial_days_remaining}d)` : 'No'],
                          ['Cancelled',        selected.subscription.is_cancelled ? 'Yes' : 'No'],
                        ].map(([k, v]) => (
                          <React.Fragment key={k}>
                            <span style={{ color: '#6b7280', fontWeight: 600 }}>{k}:</span>
                            <span style={{ color: '#1f2937' }}>{v}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action selector */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Action</label>
                    <select style={inputStyle} value={subForm.action} onChange={e => setSubForm({ ...subForm, action: e.target.value })}>
                      <option value="grant">Grant subscription</option>
                      <option value="revoke">Revoke subscription</option>
                      <option value="extend_trial">Extend trial</option>
                      <option value="reset_trial">Reset trial (fresh 7 days)</option>
                      <option value="set_plan">Change plan only</option>
                      <option value="direct">Set raw dates</option>
                    </select>
                  </div>

                  {/* Conditional fields */}
                  {(subForm.action === 'grant' || subForm.action === 'extend_trial') && (
                    <div style={{ marginBottom: 10 }}>
                      <label style={labelStyle}>Days</label>
                      <input style={inputStyle} type="number" min={1} value={subForm.days} onChange={e => setSubForm({ ...subForm, days: Number(e.target.value) })} />
                    </div>
                  )}
                  {(subForm.action === 'grant' || subForm.action === 'set_plan' || subForm.action === 'direct') && (
                    <div style={{ marginBottom: 10 }}>
                      <label style={labelStyle}>Plan</label>
                      <select style={inputStyle} value={subForm.plan} onChange={e => setSubForm({ ...subForm, plan: e.target.value })}>
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                  )}
                  {subForm.action === 'direct' && (
                    <>
                      <div style={{ marginBottom: 10 }}>
                        <label style={labelStyle}>Subscribed Until (date)</label>
                        <input style={inputStyle} type="date" value={subForm.subscribed_until} onChange={e => setSubForm({ ...subForm, subscribed_until: e.target.value })} />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <label style={labelStyle}>Trial End (date)</label>
                        <input style={inputStyle} type="date" value={subForm.trial_end} onChange={e => setSubForm({ ...subForm, trial_end: e.target.value })} />
                      </div>
                    </>
                  )}

                  {subForm.action === 'revoke' && (
                    <div style={{ backgroundColor: '#fef2f2', borderRadius: 8, padding: '10px 12px', marginBottom: 10, fontSize: 12, color: '#dc2626', border: '1px solid #fecaca' }}>
                      This will clear the subscription end date and mark the account as cancelled.
                    </div>
                  )}

                  <button onClick={saveSubOverride} disabled={saving} style={{ width: '100%', padding: '9px', backgroundColor: subForm.action === 'revoke' ? '#dc2626' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : 'Apply'}
                  </button>
                </div>

                {/* Stripe info (read-only) */}
                {selected.subscription?.stripe_customer_id && (
                  <div style={{ ...card, padding: '14px 18px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>STRIPE IDs</div>
                    {[
                      ['Customer', selected.subscription.stripe_customer_id],
                      ['Subscription', selected.subscription.stripe_subscription_id],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{k}</div>
                        <div style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { login, register, getMe, getTimeboxes, getGoals, createTimebox, createGoal } from './services/api';

const styles = {
  container: { maxWidth: 480, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#444' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 16, outline: 'none' },
  btn: { width: '100%', padding: '12px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  btnSecondary: { background: 'transparent', color: '#6c63ff', border: '1px solid #6c63ff', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginRight: 8 },
  error: { background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  success: { background: '#f0fff4', border: '1px solid #b2f2bb', color: '#276749', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 600 },
  card: { background: '#f8f9ff', border: '1px solid #e0e0f0', borderRadius: 10, padding: '14px 18px', marginBottom: 12 },
  cardTitle: { fontWeight: 600, fontSize: 15, color: '#1a1a2e' },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 4 },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#e8e4ff', color: '#6c63ff', marginLeft: 8 },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a2e', color: '#fff', padding: '14px 24px', marginBottom: 0 },
  navTitle: { fontSize: 20, fontWeight: 700, color: '#fff', textDecoration: 'none' },
  dashContainer: { maxWidth: 900, margin: '0 auto', padding: 24 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1a1a2e' },
  formRow: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  smallInput: { flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, minWidth: 120 },
  smallBtn: { padding: '8px 16px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
};

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>⏱ Timeblazer</div>
      <div style={styles.subtitle}>Sign in to your account</div>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <button style={styles.btn} type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center', color: '#666' }}>
        Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
      </p>
    </div>
  );
}

function RegisterPage({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(email, password, name);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>⏱ Timeblazer</div>
      <div style={styles.subtitle}>Create your account</div>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Name</label>
        <input style={styles.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required />
        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
        <button style={styles.btn} type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center', color: '#666' }}>
        Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
      </p>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [timeboxes, setTimeboxes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tbTitle, setTbTitle] = useState('');
  const [tbStart, setTbStart] = useState('');
  const [tbEnd, setTbEnd] = useState('');
  const [tbError, setTbError] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalError, setGoalError] = useState('');

  useEffect(() => {
    getTimeboxes().then(r => setTimeboxes(r.data.timeboxes)).catch(() => {});
    getGoals().then(r => setGoals(r.data.goals)).catch(() => {});
  }, []);

  const handleCreateTimebox = async (e) => {
    e.preventDefault();
    setTbError('');
    try {
      const res = await createTimebox(tbTitle, new Date(tbStart).toISOString(), new Date(tbEnd).toISOString());
      setTimeboxes([res.data.timebox, ...timeboxes]);
      setTbTitle(''); setTbStart(''); setTbEnd('');
    } catch (err) {
      setTbError(err.response?.data?.error || 'Failed to create timebox');
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setGoalError('');
    try {
      const res = await createGoal(goalTitle, goalDate ? new Date(goalDate).toISOString() : null);
      setGoals([res.data.goal, ...goals]);
      setGoalTitle(''); setGoalDate('');
    } catch (err) {
      setGoalError(err.response?.data?.error || 'Failed to create goal');
    }
  };

  const formatDt = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (
    <>
      <nav style={styles.nav}>
        <span style={styles.navTitle}>⏱ Timeblazer</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#ccc', fontSize: 14 }}>👤 {user.name}</span>
          <button onClick={onLogout} style={{ ...styles.btnSecondary, color: '#fff', borderColor: '#fff', padding: '6px 14px' }}>Logout</button>
        </div>
      </nav>
      <div style={styles.dashContainer}>
        <h2 style={{ marginTop: 24, fontSize: 22, color: '#1a1a2e' }}>Welcome back, {user.name}! 👋</h2>
        <div style={styles.grid}>
          {/* Timeboxes */}
          <div>
            <div style={styles.sectionTitle}>⏰ Timeboxes</div>
            <form onSubmit={handleCreateTimebox}>
              {tbError && <div style={styles.error}>{tbError}</div>}
              <input style={styles.input} type="text" value={tbTitle} onChange={e => setTbTitle(e.target.value)} placeholder="Timebox title" required />
              <div style={styles.formRow}>
                <input style={styles.smallInput} type="datetime-local" value={tbStart} onChange={e => setTbStart(e.target.value)} required title="Start time" />
                <input style={styles.smallInput} type="datetime-local" value={tbEnd} onChange={e => setTbEnd(e.target.value)} required title="End time" />
                <button style={styles.smallBtn} type="submit">Add</button>
              </div>
            </form>
            {timeboxes.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>No timeboxes yet. Create one above!</p>}
            {timeboxes.map(tb => (
              <div key={tb.id} style={styles.card}>
                <div style={styles.cardTitle}>{tb.title} <span style={styles.badge}>{tb.status}</span></div>
                <div style={styles.cardMeta}>{formatDt(tb.start_time)} → {formatDt(tb.end_time)}</div>
              </div>
            ))}
          </div>
          {/* Goals */}
          <div>
            <div style={styles.sectionTitle}>🎯 Goals</div>
            <form onSubmit={handleCreateGoal}>
              {goalError && <div style={styles.error}>{goalError}</div>}
              <input style={styles.input} type="text" value={goalTitle} onChange={e => setGoalTitle(e.target.value)} placeholder="Goal title" required />
              <div style={styles.formRow}>
                <input style={styles.smallInput} type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} title="Target date (optional)" />
                <button style={styles.smallBtn} type="submit">Add</button>
              </div>
            </form>
            {goals.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>No goals yet. Create one above!</p>}
            {goals.map(goal => (
              <div key={goal.id} style={styles.card}>
                <div style={styles.cardTitle}>{goal.title} <span style={styles.badge}>{goal.priority}</span></div>
                <div style={styles.cardMeta}>
                  Status: {goal.status}
                  {goal.target_date && ` · Due: ${formatDt(goal.target_date)}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: 18, color: '#666' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage onLogin={handleLogin} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

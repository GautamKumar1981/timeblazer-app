import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, registerUser } from '../store/slices/authSlice';
import { authAPI } from '../services/api';

type Mode = 'login' | 'register' | 'forgot';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [mode, setMode]   = useState<Mode>('login');
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg,   setForgotMsg]   = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
      if (registerUser.fulfilled.match(result)) navigate('/profile');
    } else {
      const result = await dispatch(loginUser({ email: form.email, password: form.password }));
      if (loginUser.fulfilled.match(result)) navigate('/dashboard');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotMsg('If that email is registered, a reset link has been sent. Check your inbox.');
    } catch {
      setForgotMsg('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', marginBottom: 14,
    backgroundColor: '#ffffff', border: '1px solid #e8e3f8',
    borderRadius: 8, fontSize: 14, color: '#1f2937', outline: 'none',
    boxSizing: 'border-box',
  };

  const switchBtn: React.CSSProperties = {
    background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 13,
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, #f8f6ff 60%)',
      backgroundColor: '#f8f6ff',
    }}>
      <div style={{
        backgroundColor: '#ffffff', padding: '44px 40px', borderRadius: 18,
        boxShadow: '0 8px 40px rgba(0,0,0,0.1)', width: 400, maxWidth: '95vw',
        border: '1px solid #e2d9f3',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg, #7c3aed, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>🐉</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DragonHour</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#6d28d9', letterSpacing: 2.5 }}>BAZI ASTROLOGY</div>
            </div>
          </div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 13 }}>
            {mode === 'register' ? 'Begin your Bazi journey — 7 days free' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}
          </p>
        </div>

        {/* ── Forgot password mode ── */}
        {mode === 'forgot' && (
          <>
            {forgotMsg ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#166534', lineHeight: 1.6, marginBottom: 20 }}>
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <input
                  style={inp}
                  type="email"
                  placeholder="Your email address"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(90deg, #7c3aed, #db2777)', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 15, fontWeight: 700, opacity: forgotLoading ? 0.7 : 1 }}
                >
                  {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => { setMode('login'); setForgotMsg(''); }} style={switchBtn}>
                ← Back to sign in
              </button>
            </div>
          </>
        )}

        {/* ── Login / Register mode ── */}
        {mode !== 'forgot' && (
          <>
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <input style={inp} type="text" name="name" placeholder="Your full name"
                  value={form.name} onChange={handleChange} required autoComplete="name" />
              )}
              <input style={inp} type="email" name="email" placeholder="Email address"
                value={form.email} onChange={handleChange} required autoComplete="email" />
              <input
                style={{ ...inp, marginBottom: 6 }}
                type="password" name="password" placeholder="Password"
                value={form.password} onChange={handleChange} required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: 10 }}>
                  <button type="button" onClick={() => setMode('forgot')} style={{ ...switchBtn, fontSize: 12 }}>
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 10, backgroundColor: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', marginTop: 6, padding: '13px 0', background: 'linear-gradient(90deg, #7c3aed, #db2777)', color: '#fff', border: 'none', borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, letterSpacing: 0.3, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Please wait…' : mode === 'register' ? '🐉 Create Account — Free Trial' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setForm({ name: '', email: '', password: '' }); }} style={switchBtn}>
                {mode === 'login' ? 'New here? Start your free 7-day trial' : 'Already have an account? Sign in'}
              </button>
            </div>

            {mode === 'register' && (
              <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 14, lineHeight: 1.5 }}>
                7 days free · then £0.99/month or £9.99/year<br />No card required to start.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

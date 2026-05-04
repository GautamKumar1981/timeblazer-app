import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, registerUser } from '../store/slices/authSlice';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
      if (registerUser.fulfilled.match(result)) navigate('/dashboard');
    } else {
      const result = await dispatch(loginUser({ email: form.email, password: form.password }));
      if (loginUser.fulfilled.match(result)) navigate('/dashboard');
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', marginBottom: 14,
    backgroundColor: '#1a1830', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, fontSize: 14, color: '#e5e7eb', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, #0f0e1a 60%)',
      backgroundColor: '#0f0e1a',
    }}>
      <div style={{
        backgroundColor: '#16152e', padding: '44px 40px', borderRadius: 18,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)', width: 400, maxWidth: '95vw',
        border: '1px solid rgba(139,92,246,0.25)',
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
            {isRegister ? 'Begin your Bazi journey — 7 days free' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              style={inp}
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          )}
          <input
            style={inp}
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <input
            style={{ ...inp, marginBottom: 6 }}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />

          {error && (
            <div style={{ color: '#fca5a5', fontSize: 12, marginBottom: 10, marginTop: 4, backgroundColor: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: 14, padding: '13px 0', background: 'linear-gradient(90deg, #7c3aed, #db2777)', color: '#fff', border: 'none', borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, letterSpacing: 0.3, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Please wait…' : isRegister ? '🐉 Create Account — Free Trial' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => { setIsRegister(!isRegister); setForm({ name: '', email: '', password: '' }); }}
            style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 13 }}
          >
            {isRegister ? 'Already have an account? Sign in' : 'New here? Start your free 7-day trial'}
          </button>
        </div>

        {isRegister && (
          <p style={{ textAlign: 'center', fontSize: 11, color: '#4b5563', marginTop: 14, lineHeight: 1.5 }}>
            7 days free · then £0.99/month or £9.99/year<br />
            No card required to start.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;

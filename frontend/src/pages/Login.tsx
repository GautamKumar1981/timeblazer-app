import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, registerUser } from '../store/slices/authSlice';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const result = await dispatch(registerUser({ email: form.email, password: form.password }));
      if (registerUser.fulfilled.match(result)) navigate('/dashboard');
    } else {
      const result = await dispatch(loginUser({ email: form.email, password: form.password }));
      if (loginUser.fulfilled.match(result)) navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0f0e1a',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, #0f0e1a 60%)',
    }}>
      <div style={{
        backgroundColor: '#16152e', padding: '44px 40px', borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)', width: 380, maxWidth: '95vw',
        border: '1px solid rgba(139,92,246,0.25)',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🐉</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#c4b5fd', margin: '0 0 4px', letterSpacing: 0.5 }}>
            DragonHour
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 13 }}>Bazi Timing System</p>
        </div>

        {/* Mode label */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', marginBottom: 20, textAlign: 'center' }}>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            style={{
              width: '100%', padding: '11px 14px', marginBottom: 14,
              backgroundColor: '#1a1830', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, fontSize: 14, color: '#e5e7eb', outline: 'none',
              boxSizing: 'border-box',
            }}
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <input
            style={{
              width: '100%', padding: '11px 14px', marginBottom: 6,
              backgroundColor: '#1a1830', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, fontSize: 14, color: '#e5e7eb', outline: 'none',
              boxSizing: 'border-box',
            }}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />

          {error && (
            <div style={{
              color: '#fca5a5', fontSize: 12, marginBottom: 10, marginTop: 4,
              backgroundColor: 'rgba(239,68,68,0.1)', padding: '8px 12px',
              borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: 14, padding: '12px 0',
              backgroundColor: '#7c3aed', color: '#fff',
              border: 'none', borderRadius: 9, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, letterSpacing: 0.3,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait…' : isRegister ? '🐉 Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: 'none', border: 'none', color: '#8b5cf6',
              cursor: 'pointer', fontSize: 13,
            }}
          >
            {isRegister ? 'Already have an account? Sign in' : "New here? Create an account"}
          </button>
        </div>

        {isRegister && (
          <p style={{ textAlign: 'center', fontSize: 11, color: '#4b5563', marginTop: 14, lineHeight: 1.5 }}>
            Your Bazi profile is set up from the Dashboard after sign-in.<br />
            No name required — just your email and password.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;

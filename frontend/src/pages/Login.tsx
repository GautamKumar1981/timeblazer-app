import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, registerUser } from '../store/slices/authSlice';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  marginBottom: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '11px',
  backgroundColor: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: '10px',
};

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const result = await dispatch(registerUser({ email: form.email, password: form.password, name: form.name }));
      if (registerUser.fulfilled.match(result)) navigate('/dashboard');
    } else {
      const result = await dispatch(loginUser({ email: form.email, password: form.password }));
      if (loginUser.fulfilled.match(result)) navigate('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '380px', maxWidth: '95vw' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#4f46e5', margin: 0 }}>⏱ Timeblazer</h1>
          <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '14px' }}>
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              style={inputStyle}
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            style={inputStyle}
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={inputStyle}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && (
            <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button style={btnPrimary} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

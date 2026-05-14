import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState(false);

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', marginBottom: 14,
    backgroundColor: '#fff', border: '1px solid #e8e3f8',
    borderRadius: 8, fontSize: 14, color: '#1f2937', outline: 'none',
    boxSizing: 'border-box',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, #f8f6ff 60%)',
      backgroundColor: '#f8f6ff',
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '44px 40px', borderRadius: 18,
        boxShadow: '0 8px 40px rgba(0,0,0,0.1)', width: 400, maxWidth: '95vw',
        border: '1px solid #e2d9f3',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔑</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2e1065' }}>Set New Password</div>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '8px 0 0' }}>Choose a strong password for your account.</p>
        </div>

        {!token ? (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#dc2626', textAlign: 'center' }}>
            Invalid or missing reset link. Please request a new one.
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '16px', fontSize: 14, color: '#166534', marginBottom: 20 }}>
              ✓ Password updated successfully!
            </div>
            <button
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(90deg, #7c3aed, #db2777)', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}
            >
              Sign In →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input style={inp} type="password" placeholder="New password (min 8 characters)"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            <input style={inp} type="password" placeholder="Confirm new password"
              value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />

            {error && (
              <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, backgroundColor: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(90deg, #7c3aed, #db2777)', color: '#fff', border: 'none', borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 13 }}>
                ← Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

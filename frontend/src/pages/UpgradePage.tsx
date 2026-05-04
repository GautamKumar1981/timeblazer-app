import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';
import { subscriptionAPI } from '../services/api';

const FEATURES = [
  '🀄  Full Four Pillars Bazi Chart with animal profiles',
  '📅  Tong Shu Auspicious Calendar (daily officer readings)',
  '🌀  Luck Pillars decade predictions & element remedies',
  '💎  Daily / Monthly / Yearly Remedies & Lucky Charms',
  '🧘  Meditation with personalised deity & mantra chanting',
  '💼  Business Timing for meetings, launches & contracts',
  '📊  Weekly Review & goal tracking',
  '⭐  2026 Fire Horse personalised forecast',
];

const UpgradePage: React.FC = () => {
  const navigate    = useNavigate();
  const { data }    = useAppSelector((s) => s.subscription);
  const { user }    = useAppSelector((s) => s.auth);
  const daysLeft    = data?.trial_days_remaining ?? 0;
  const trialActive = data?.is_trial_active ?? false;
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setLoading(plan);
    setCheckoutError('');
    try {
      const res = await subscriptionAPI.createCheckout(plan);
      window.location.href = res.data.url;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const detail = err.response?.data?.error || err.message || 'Unknown error';
      const status = err.response?.status ?? 0;
      setCheckoutError(`Error ${status}: ${detail}`);
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f6ff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px 60px' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>🐉</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, background: 'linear-gradient(90deg, #7c3aed, #db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DragonHour</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 2 }}>BAZI ASTROLOGY</div>
        </div>
      </div>

      {/* Trial banner */}
      <div style={{ width: '100%', maxWidth: 560, backgroundColor: trialActive ? '#ede9fe' : '#fce7f3', borderRadius: 14, padding: '18px 24px', marginBottom: 32, border: `1px solid ${trialActive ? '#c4b5fd' : '#fbcfe8'}`, textAlign: 'center' }}>
        {trialActive ? (
          <>
            <div style={{ fontSize: 22, marginBottom: 6 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#4c1d95' }}>
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your free trial, {user?.name}
            </div>
            <div style={{ fontSize: 13, color: '#6d28d9', marginTop: 4 }}>
              Unlock unlimited access before your trial ends
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🔒</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#9d174d' }}>
              Your 7-day free trial has ended, {user?.name}
            </div>
            <div style={{ fontSize: 13, color: '#be185d', marginTop: 4 }}>
              Subscribe to continue your Bazi journey
            </div>
          </>
        )}
      </div>

      {/* Pricing cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 560 }}>

        {/* Monthly */}
        <div style={{ flex: 1, minWidth: 230, backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '2px solid #e8e3f8', boxShadow: '0 2px 12px rgba(124,58,237,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Monthly</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#4c1d95' }}>£</span>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#2e1065' }}>0.99</span>
            <span style={{ fontSize: 14, color: '#6b7280' }}>/month</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 24 }}>Billed monthly · Cancel anytime</div>
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={loading !== null}
            style={{ width: '100%', padding: '12px 0', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading === 'monthly' ? 'Redirecting…' : 'Subscribe Monthly →'}
          </button>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Secure payment via Stripe</div>
        </div>

        {/* Annual — highlighted */}
        <div style={{ flex: 1, minWidth: 230, backgroundColor: '#ede9fe', borderRadius: 16, padding: '28px 24px', border: '2px solid #7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.2)', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
            BEST VALUE — SAVE 16%
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Annual</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#4c1d95' }}>£</span>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#2e1065' }}>9.99</span>
            <span style={{ fontSize: 14, color: '#6b7280' }}>/year</span>
          </div>
          <div style={{ fontSize: 12, color: '#6d28d9', marginBottom: 24 }}>= £0.83/month · Best value</div>
          <button
            onClick={() => handleSubscribe('annual')}
            disabled={loading !== null}
            style={{ width: '100%', padding: '12px 0', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading === 'annual' ? 'Redirecting…' : 'Subscribe Annually →'}
          </button>
          <div style={{ fontSize: 11, color: '#6d28d9', marginTop: 8 }}>Secure payment via Stripe</div>
        </div>
      </div>

      {checkoutError && (
        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 20px', marginBottom: 16, fontSize: 13, maxWidth: 560, width: '100%', textAlign: 'center' }}>
          {checkoutError}
        </div>
      )}

      {/* Feature list */}
      <div style={{ width: '100%', maxWidth: 560, backgroundColor: '#ffffff', borderRadius: 16, padding: '24px 28px', border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)', marginBottom: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 16 }}>Everything included:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#374151' }}>
              <span style={{ color: '#7c3aed', fontWeight: 700, marginTop: 1 }}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Back to dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{ background: 'none', border: 'none', color: '#6d28d9', cursor: 'pointer', fontSize: 14, fontWeight: 600, textDecoration: 'underline' }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default UpgradePage;

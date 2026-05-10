import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchSubscriptionStatus } from '../store/slices/subscriptionSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const FEATURES_FREE = [
  'Your personal Bazi chart',
  'Today\'s daily summary',
  'Basic hourly breakdown',
  'Bazi profile setup',
];

const FEATURES_PREMIUM = [
  'Full monthly auspicious calendar',
  'Strategic wisdom (Art of War + Five Rings)',
  'Personalised elemental remedies',
  'Crystal, colour & feng shui prescriptions',
  'Business timing finder (15–90 days)',
  'Luck pillars — your 10-year cycles',
  'Celestial folk stories for every pillar',
  'Daily affirmations & feng shui tips',
  'Sacred artifacts shop',
];

const Check: React.FC<{ text: string; ok?: boolean }> = ({ text, ok = true }) => (
  <div style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 13, color: ok ? '#374151' : '#6b7280' }}>
    <span style={{ color: ok ? '#16a34a' : '#9ca3af', fontWeight: 700 }}>{ok ? '✓' : '·'}</span>
    {text}
  </div>
);

const SubscriptionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const sub = useAppSelector((s) => s.subscription.data);

  useEffect(() => { dispatch(fetchSubscriptionStatus()); }, [dispatch]);

  const pageLayout = (content: React.ReactNode) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{content}</main>
      </div>
    </div>
  );

  return pageLayout(
    <>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#2e1065' }}>
        🐉 DragonHour Premium
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 28px' }}>
        Unlock your full Bazi timing system — personalised remedies, strategic wisdom, and monthly calendars.
      </p>

      {/* Status Banner */}
      {sub && (
        <div style={{
          borderRadius: 12, padding: '18px 22px', marginBottom: 28,
          backgroundColor: sub.has_premium_access ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${sub.has_premium_access ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 36 }}>{sub.has_premium_access ? '🌟' : '⏳'}</div>
          <div style={{ flex: 1 }}>
            {sub.is_trial_active && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>
                  7-Day Free Trial Active
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  You have <strong style={{ color: '#1f2937' }}>{sub.trial_days_remaining} day{sub.trial_days_remaining !== 1 ? 's' : ''}</strong> remaining
                  in your free trial. Enjoy full access to all premium features.
                </div>
              </>
            )}
            {sub.is_subscribed && !sub.is_trial_active && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>
                  Premium Subscription Active
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  Your subscription is active. Renews on{' '}
                  {sub.subscribed_until ? new Date(sub.subscribed_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}.
                </div>
              </>
            )}
            {!sub.has_premium_access && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
                  Trial Expired
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  Your 7-day trial has ended. Subscribe below to continue accessing premium features.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        {/* Free plan */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 14, padding: '26px 24px',
          border: '1px solid #e8e3f8',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Free</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#1f2937', marginBottom: 4 }}>£0</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Always free, no card needed</div>
          {FEATURES_FREE.map((f) => <Check key={f} text={f} ok />)}
          {FEATURES_PREMIUM.slice(0, 3).map((f) => <Check key={f} text={f} ok={false} />)}
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>+ more premium features…</div>
        </div>

        {/* Premium plan */}
        <div style={{
          backgroundColor: 'rgba(124,58,237,0.12)', borderRadius: 14, padding: '26px 24px',
          border: '2px solid #7c3aed', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            backgroundColor: '#7c3aed', color: '#fff',
            fontSize: 10, fontWeight: 700, padding: '4px 14px',
            borderBottomLeftRadius: 10, letterSpacing: 0.5,
          }}>MOST POPULAR</div>

          <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            ✨ Premium
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#2e1065', marginBottom: 4 }}>
            £2.99<span style={{ fontSize: 14, fontWeight: 400, color: '#9ca3af' }}>/month</span>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
            Billed monthly · Cancel anytime
          </div>
          <div style={{ fontSize: 11, color: '#16a34a', marginBottom: 20, fontWeight: 600 }}>
            ✓ Includes 7-day free trial
          </div>
          {FEATURES_PREMIUM.map((f) => <Check key={f} text={f} ok />)}

          <button
            onClick={() => alert('Payment integration coming soon. You will receive an email when payments go live.')}
            style={{
              width: '100%', marginTop: 22, padding: '13px 0',
              backgroundColor: '#7c3aed', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: 14, fontWeight: 700,
            }}
          >
            {sub?.has_premium_access ? '✓ Currently Active' : '🚀 Subscribe — £2.99/month'}
          </button>

          <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 10 }}>
            Secure payment · Cancel anytime · No hidden fees
          </div>
        </div>
      </div>

      {/* What Premium delivers this month */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: 12, padding: '22px 24px',
        border: '1px solid #ede9fe', marginBottom: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', marginBottom: 16 }}>
          📅 What Premium Delivers Each Month
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { icon: '📅', title: 'Full Monthly Calendar', desc: 'Every day colour-coded: Auspicious (green), Neutral (amber), Challenging (red) — personalised to your Bazi chart' },
            { icon: '🌿', title: 'Daily Remedies', desc: 'Crystal, colour, food, direction and feng shui prescriptions for each day of the month' },
            { icon: '⚔️', title: 'Strategic Wisdom', desc: 'Art of War and Book of Five Rings quotes mapped to each day\'s elemental energy' },
            { icon: '💼', title: 'Business Timing', desc: 'Best dates for meetings, contracts, launches, investments and travel in the coming month' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ backgroundColor: '#f5f3ff', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: 12, padding: '22px 24px',
        border: '1px solid #f3f4f6',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', marginBottom: 16 }}>
          Frequently Asked Questions
        </div>
        {[
          {
            q: 'How does the 7-day free trial work?',
            a: 'Your trial begins automatically when you create your account and set up your Bazi profile. No credit card is required. You have full access to all premium features for 7 days.',
          },
          {
            q: 'What does £2.99/month give me access to?',
            a: 'One month\'s full personalised Bazi calendar, including all daily and hourly forecasts, remedies, strategic wisdom, business timing, and the folk stories library for that month.',
          },
          {
            q: 'Can I cancel anytime?',
            a: 'Yes. Cancel before your renewal date and you will not be charged for the following month. You keep access until the end of the period you have paid for.',
          },
          {
            q: 'Is this based on authentic Bazi principles?',
            a: 'Yes. The calculations follow classical 四柱八字 (Four Pillars) methodology: the 5-Tiger rule for month stems, the 5-Rat rule for hour stems, and traditional solar term boundaries (Li Chun for year boundaries).',
          },
        ].map(({ q, a }, i) => (
          <div key={i} style={{ borderBottom: '1px solid #f3f4f6', padding: '14px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>{q}</div>
            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{a}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SubscriptionPage;

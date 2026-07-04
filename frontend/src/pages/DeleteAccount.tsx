import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa', margin: '0 0 10px' }}>{title}</h2>
    <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.8 }}>{children}</div>
  </div>
);

const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0e1a', padding: '40px 20px', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0 }}>
            ← Back to DragonHour
          </button>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐉</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 6px' }}>Delete Your DragonHour Account</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>DragonHour · Last updated: July 2026</p>
        </div>

        <Section title="How to Request Deletion">
          To delete your DragonHour account and all associated data, email us at{' '}
          <a href="mailto:support@dragonhour.com?subject=Account%20Deletion%20Request" style={{ color: '#7c3aed' }}>support@dragonhour.com</a>{' '}
          from the email address registered on your account, with the subject line "Account Deletion Request".
          <br /><br />
          We will confirm your identity and process the deletion within 7 business days. You will receive an
          email confirmation once your account and data have been removed.
        </Section>

        <Section title="What Gets Deleted">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Your account credentials (email, password hash)</li>
            <li>Your Bazi and Vedic birth profiles (date, time, location of birth)</li>
            <li>Your daily priorities, timeboxes, goals, and reviews</li>
            <li>Your subscription and payment history record</li>
            <li>Your push notification subscription</li>
          </ul>
        </Section>

        <Section title="What May Be Retained">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Anonymised, aggregated usage analytics that no longer identify you</li>
            <li>Transaction records Stripe is legally required to retain for tax and fraud-prevention purposes, held by Stripe under their own retention policy</li>
          </ul>
          <br />
          All identifiable personal data is permanently removed from DragonHour's systems within 30 days of a confirmed deletion request.
        </Section>

        <Section title="Contact">
          <strong style={{ color: '#e5e7eb' }}>DragonHour</strong><br />
          Email: <a href="mailto:support@dragonhour.com" style={{ color: '#7c3aed' }}>support@dragonhour.com</a><br />
          Website: <a href="https://dragonhour.com" style={{ color: '#7c3aed' }}>dragonhour.com</a>
        </Section>

        <div style={{ borderTop: '1px solid #2d2b4e', paddingTop: 24, fontSize: 12, color: '#4b5563', textAlign: 'center' }}>
          © 2026 DragonHour · <a href="https://dragonhour.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>dragonhour.com</a>
        </div>

      </div>
    </div>
  );
};

export default DeleteAccount;

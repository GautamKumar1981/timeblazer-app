import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa', margin: '0 0 10px' }}>{title}</h2>
    <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.8 }}>{children}</div>
  </div>
);

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0e1a', padding: '40px 20px', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0 }}>
            ← Back to DragonHour
          </button>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐉</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 6px' }}>Privacy Policy</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>DragonHour · Last updated: May 2026</p>
        </div>

        <Section title="1. Who We Are">
          DragonHour is a Bazi timing and Vedic astrology application operated at{' '}
          <a href="https://dragonhour.com" style={{ color: '#7c3aed' }}>dragonhour.com</a>.
          We provide personalised Chinese metaphysics forecasts, Vedic Panchang, auspicious hour calculations,
          and wellness tools based on your birth data.
        </Section>

        <Section title="2. Data We Collect">
          <strong style={{ color: '#e5e7eb' }}>Account data:</strong> Your email address and password (stored as a secure hash) when you register.
          <br /><br />
          <strong style={{ color: '#e5e7eb' }}>Birth profile:</strong> Date of birth, time of birth, and birth location (city, country, latitude/longitude).
          This is used solely to calculate your Bazi chart, Four Pillars, Vedic Moon sign, and Dasha periods.
          <br /><br />
          <strong style={{ color: '#e5e7eb' }}>Usage data:</strong> Pages visited and features used, collected anonymously to improve the app.
          <br /><br />
          <strong style={{ color: '#e5e7eb' }}>Push notification tokens:</strong> If you opt in to push notifications, we store your browser push subscription
          endpoint to send you hourly auspicious timing alerts. You can revoke this at any time in Settings.
        </Section>

        <Section title="3. How We Use Your Data">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>To generate your personalised Bazi chart, luck pillars, daily forecasts, and Vedic readings</li>
            <li>To send push notifications about hourly Hora and Choghadiya changes (if you opted in)</li>
            <li>To manage your account and subscription</li>
            <li>To improve app features and fix issues</li>
          </ul>
          <br />
          We do <strong style={{ color: '#e5e7eb' }}>not</strong> sell your data to third parties. We do not use your birth data for advertising.
        </Section>

        <Section title="4. Data Storage & Security">
          Your data is stored on secure servers hosted by Railway (railway.app) in the United States.
          Passwords are hashed using bcrypt and never stored in plain text.
          All data is transmitted over HTTPS (TLS 1.2+).
          Birth data is encrypted at rest.
        </Section>

        <Section title="5. Third-Party Services">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong style={{ color: '#e5e7eb' }}>Vercel</strong> — hosts the frontend at dragonhour.com</li>
            <li><strong style={{ color: '#e5e7eb' }}>Railway</strong> — hosts the backend API and database</li>
            <li><strong style={{ color: '#e5e7eb' }}>Google Play / Apple App Store</strong> — app distribution (no additional data shared)</li>
            <li><strong style={{ color: '#e5e7eb' }}>Web Push (VAPID)</strong> — browser push notification delivery</li>
          </ul>
        </Section>

        <Section title="6. Push Notifications">
          DragonHour sends optional push notifications to alert you when the planetary Hora or Choghadiya period
          changes each hour. These notifications contain no personal data — only the current auspicious timing
          information. You can disable notifications at any time via your browser or device settings, or from
          the Settings page in the app.
        </Section>

        <Section title="7. Your Rights">
          You may request to:
          <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            <li>Access the personal data we hold about you</li>
            <li>Delete your account and all associated data</li>
            <li>Export your birth profile data</li>
            <li>Withdraw consent for push notifications</li>
          </ul>
          <br />
          To exercise any of these rights, email us at{' '}
          <a href="mailto:support@dragonhour.com" style={{ color: '#7c3aed' }}>support@dragonhour.com</a>.
        </Section>

        <Section title="8. Data Retention">
          We retain your account and birth profile data for as long as your account is active.
          If you delete your account, all personal data is permanently removed within 30 days.
          Anonymised usage analytics may be retained indefinitely.
        </Section>

        <Section title="9. Children">
          DragonHour is not directed at children under 13. We do not knowingly collect data from children.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this policy periodically. We will notify registered users by email if changes are material.
          Continued use of the app after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="11. Contact">
          For privacy-related questions or requests:
          <br /><br />
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

export default Privacy;

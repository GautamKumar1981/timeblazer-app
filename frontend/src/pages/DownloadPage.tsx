import React, { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

const Step: React.FC<{ n: number; icon: string; text: React.ReactNode }> = ({ n, icon, text }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ paddingTop: 4 }}>
      <span style={{ fontSize: 22, marginRight: 8 }}>{icon}</span>
      <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{text}</span>
    </div>
  </div>
);

const DownloadPage: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('other');
  const [tab, setTab] = useState<Platform>('ios');

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    if (p === 'android') setTab('android');
    else setTab('ios');
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0e1a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>

      {/* Logo */}
      <div style={{ fontSize: 64, marginBottom: 12 }}>🐉</div>
      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 6px', textAlign: 'center' }}>DragonHour</h1>
      <p style={{ color: '#a78bfa', fontSize: 14, margin: '0 0 32px', textAlign: 'center' }}>Bazi timing system for auspicious hours</p>

      {/* Platform tabs */}
      <div style={{ display: 'flex', gap: 4, backgroundColor: '#1a1830', borderRadius: 12, padding: 4, marginBottom: 32, width: '100%', maxWidth: 400 }}>
        {(['ios', 'android'] as Platform[]).map(p => (
          <button key={p} onClick={() => setTab(p)} style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 14,
            backgroundColor: tab === p ? '#7c3aed' : 'transparent',
            color: tab === p ? '#fff' : '#6b7280',
          }}>
            {p === 'ios' ? '🍎 iPhone / iPad' : '🤖 Android'}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#1a1830', borderRadius: 16, padding: '28px 24px', width: '100%', maxWidth: 400, border: '1px solid #2d2b4e' }}>

        {tab === 'ios' && (
          <>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Install on iPhone / iPad</h2>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 24px', lineHeight: 1.6 }}>
              DragonHour installs directly from Safari — no App Store needed. Follow these steps:
            </p>

            {platform !== 'ios' && (
              <div style={{ backgroundColor: '#2d2b4e', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#a78bfa', border: '1px solid #7c3aed44' }}>
                📱 Open this page on your iPhone or iPad in Safari, then follow the steps below.
                <br /><strong style={{ color: '#fff' }}>URL: dragonhour.com/download</strong>
              </div>
            )}

            <Step n={1} icon="🌐" text={<>Open <strong style={{ color: '#fff' }}>dragonhour.com</strong> in <strong style={{ color: '#fff' }}>Safari</strong> (not Chrome — must be Safari)</>} />
            <Step n={2} icon="⬆️" text={<>Tap the <strong style={{ color: '#fff' }}>Share button</strong> at the bottom of the screen (the box with an arrow pointing up)</>} />
            <Step n={3} icon="➕" text={<>Scroll down and tap <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong></>} />
            <Step n={4} icon="✏️" text={<>Name it <strong style={{ color: '#fff' }}>DragonHour</strong> and tap <strong style={{ color: '#fff' }}>Add</strong></>} />
            <Step n={5} icon="🐉" text={<>DragonHour appears on your home screen — tap it to open like a native app!</>} />

            <div style={{ backgroundColor: '#0f0e1a', borderRadius: 10, padding: '12px 14px', marginTop: 8, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
              ✓ Works offline · ✓ Push notifications · ✓ Full screen · ✓ Free
            </div>

            {platform === 'ios' && (
              <a href="https://dragonhour.com" style={{
                display: 'block', marginTop: 20, padding: '14px 0', backgroundColor: '#7c3aed',
                color: '#fff', borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: 16,
                textDecoration: 'none',
              }}>
                Open DragonHour in Safari →
              </a>
            )}
          </>
        )}

        {tab === 'android' && (
          <>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Install on Android</h2>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 24px', lineHeight: 1.6 }}>
              Available on Google Play (internal testing) or install directly from Chrome:
            </p>

            <div style={{ backgroundColor: '#0d2d1a', borderRadius: 12, padding: '16px 18px', marginBottom: 20, border: '1px solid #16a34a44' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>Option A — Google Play (Recommended)</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Search for <strong style={{ color: '#fff' }}>DragonHour</strong> on the Play Store.</div>
              <a href="https://play.google.com/store/apps/details?id=com.dragonhour.app" style={{
                display: 'block', padding: '12px 0', backgroundColor: '#16a34a',
                color: '#fff', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14,
                textDecoration: 'none',
              }}>
                🛒 Open Google Play
              </a>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 14, textAlign: 'center' }}>— OR install from Chrome —</div>

            <Step n={1} icon="🌐" text={<>Open <strong style={{ color: '#fff' }}>dragonhour.com</strong> in <strong style={{ color: '#fff' }}>Chrome</strong></>} />
            <Step n={2} icon="⋮" text={<>Tap the <strong style={{ color: '#fff' }}>three-dot menu</strong> (top right)</>} />
            <Step n={3} icon="➕" text={<>Tap <strong style={{ color: '#fff' }}>"Add to Home screen"</strong></>} />
            <Step n={4} icon="🐉" text={<>Tap <strong style={{ color: '#fff' }}>Add</strong> — DragonHour appears on your home screen!</>} />
          </>
        )}

      </div>

      <p style={{ color: '#4b5563', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
        © 2025 DragonHour · <a href="https://dragonhour.com" style={{ color: '#7c3aed', textDecoration: 'none' }}>dragonhour.com</a>
      </p>
    </div>
  );
};

export default DownloadPage;

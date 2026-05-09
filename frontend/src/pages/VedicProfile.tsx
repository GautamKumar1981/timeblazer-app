import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vedicAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header from '../components/Common/Header';

const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: 'Kathmandu',  lat: 27.7172, lon: 85.3240 },
  { name: 'Pokhara',   lat: 28.2096, lon: 83.9856 },
  { name: 'Lalitpur',  lat: 27.6588, lon: 85.3247 },
  { name: 'Bhaktapur', lat: 27.6710, lon: 85.4298 },
  { name: 'Biratnagar',lat: 26.4525, lon: 87.2718 },
  { name: 'Birgunj',   lat: 27.0104, lon: 84.8771 },
  { name: 'Dharan',    lat: 26.8065, lon: 87.2845 },
  { name: 'Butwal',    lat: 27.7006, lon: 83.4532 },
  { name: 'Other',     lat: 27.7172, lon: 85.3240 },
];


const VedicProfile: React.FC = () => {
  const navigate = useNavigate();
  const [existing, setExisting] = useState<any>(null);
  const [form, setForm] = useState({
    birth_date: '', birth_hour: '6', birth_minute: '0',
    birth_city: 'Kathmandu', gender: 'M',
    birth_lat: '27.7172', birth_lon: '85.3240',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    vedicAPI.getProfile().then((res: any) => {
      const p = res.data?.profile;
      if (p) {
        setExisting(p);
        setForm({
          birth_date: p.birth_date ?? '',
          birth_hour: String(p.birth_hour ?? 6),
          birth_minute: String(p.birth_minute ?? 0),
          birth_city: p.birth_city ?? 'Kathmandu',
          gender: p.gender ?? 'M',
          birth_lat: String(p.birth_lat ?? 27.7172),
          birth_lon: String(p.birth_lon ?? 85.3240),
        });
      }
    }).catch(() => {});
  }, []);

  const handleCityChange = (city: string) => {
    const c = CITIES.find(x => x.name === city);
    if (c) {
      setForm(f => ({ ...f, birth_city: city, birth_lat: String(c.lat), birth_lon: String(c.lon) }));
    } else {
      setForm(f => ({ ...f, birth_city: city }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await vedicAPI.saveProfile({
        birth_date: form.birth_date,
        birth_hour: parseInt(form.birth_hour),
        birth_minute: parseInt(form.birth_minute),
        birth_city: form.birth_city,
        birth_lat: parseFloat(form.birth_lat),
        birth_lon: parseFloat(form.birth_lon),
        gender: form.gender,
      });
      setSaved(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🙏</div>
            <h2 style={{ color: '#2e1065', fontSize: 24, fontWeight: 800, margin: '0 0 10px', textAlign: 'center' }}>
              Your Vedic Profile is Set!
            </h2>
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 24, maxWidth: 380, width: '100%', border: '1px solid #e8e3f8', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, textAlign: 'center', backgroundColor: '#ede9fe', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Moon Rashi</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2e1065', marginTop: 4 }}>{saved.moon_rashi}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Chandra Rashi</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', backgroundColor: '#f5f3ff', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Janma Nakshatra</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#2e1065', marginTop: 4 }}>{saved.moon_nakshatra}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Birth Star</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', margin: 0 }}>
                Your daily Rashifal, Panchang, and Vimshottari Dasha are now personalised to your birth chart.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <button onClick={() => navigate('/vedic-panchang')} style={{ padding: '12px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                View Today's Panchang →
              </button>
              <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', maxWidth: 640, margin: '0 auto', width: '100%' }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#2e1065' }}>🙏 Vedic Vedic Profile</h2>
            <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: 14 }}>
              Enter your birth details to calculate your Kundali, Moon Rashi, Nakshatra, and personalised Rashifal.
            </p>
          </div>

          {existing && (
            <div style={{ backgroundColor: '#ede9fe', borderRadius: 10, padding: '10px 16px', marginBottom: 20, border: '1px solid #c4b5fd', fontSize: 13, color: '#4c1d95' }}>
              ✓ Profile exists — updating will recalculate your chart.
              Moon Rashi: <strong>{existing.moon_rashi}</strong> · Nakshatra: <strong>{existing.moon_nakshatra}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 16 }}>Birth Date & Time</div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Date of Birth</label>
                <input type="date" required value={form.birth_date}
                  onChange={(e) => setForm(f => ({ ...f, birth_date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Hour of Birth (0–23)</label>
                  <input type="number" min={0} max={23} value={form.birth_hour}
                    onChange={(e) => setForm(f => ({ ...f, birth_hour: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Minute</label>
                  <input type="number" min={0} max={59} value={form.birth_minute}
                    onChange={(e) => setForm(f => ({ ...f, birth_minute: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Gender</label>
                  <select value={form.gender} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 16 }}>Birth Location</div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>City</label>
                <select value={form.birth_city} onChange={(e) => handleCityChange(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}>
                  {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Latitude</label>
                  <input type="number" step="0.0001" value={form.birth_lat}
                    onChange={(e) => setForm(f => ({ ...f, birth_lat: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Longitude</label>
                  <input type="number" step="0.0001" value={form.birth_lon}
                    onChange={(e) => setForm(f => ({ ...f, birth_lon: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f5f3ff', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: '1px solid #e8e3f8', fontSize: 13, color: '#6b7280' }}>
              💡 <strong>Tip:</strong> Exact birth time gives accurate Lagna (rising sign) and Nakshatra. If unknown, enter 6:00 AM as an approximation — Moon Rashi will still be calculated.
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, border: '1px solid #fecaca' }}>{error}</div>
            )}

            <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px 0', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Calculating chart…' : '🙏 Calculate My Kundali →'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default VedicProfile;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchBaziProfile, saveBaziProfile } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const TZ_OPTIONS = [
  { label: 'UTC-12', value: -12 }, { label: 'UTC-11', value: -11 },
  { label: 'UTC-10 (Hawaii)', value: -10 }, { label: 'UTC-8 (PST)', value: -8 },
  { label: 'UTC-7 (MST)', value: -7 },  { label: 'UTC-6 (CST)', value: -6 },
  { label: 'UTC-5 (EST)', value: -5 },  { label: 'UTC-4 (AST)', value: -4 },
  { label: 'UTC+0 (GMT/UTC)', value: 0 },  { label: 'UTC+1 (CET)', value: 1 },
  { label: 'UTC+2 (EET)', value: 2 },  { label: 'UTC+3 (Moscow)', value: 3 },
  { label: 'UTC+5:30 (IST)', value: 5.5 },{ label: 'UTC+8 (CST/SGT)', value: 8 },
  { label: 'UTC+9 (JST/KST)', value: 9 }, { label: 'UTC+10 (AEST)', value: 10 },
  { label: 'UTC+12', value: 12 },
];

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', backgroundColor: '#1e1c3a',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  color: '#e5e7eb', fontSize: 14, boxSizing: 'border-box',
};

const BaziProfile: React.FC = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { profile, loading, error } = useAppSelector((s) => s.bazi);

  const [form, setForm] = useState({
    birth_date: '', birth_hour: '8', birth_minute: '0',
    gender: 'M', timezone_offset: '8',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { dispatch(fetchBaziProfile()); }, [dispatch]);

  useEffect(() => {
    if (profile) setForm({
      birth_date:       profile.birth_date,
      birth_hour:       String(profile.birth_hour),
      birth_minute:     String(profile.birth_minute),
      gender:           profile.gender,
      timezone_offset:  String(profile.timezone_offset),
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(saveBaziProfile({
      birth_date:      form.birth_date,
      birth_hour:      parseInt(form.birth_hour),
      birth_minute:    parseInt(form.birth_minute),
      gender:          form.gender,
      timezone_offset: parseFloat(form.timezone_offset),
    }));
    if (saveBaziProfile.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('/chart'); }, 1500);
    }
  };

  const label = (text: string) => (
    <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 500 }}>
      {text}
    </label>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>
            👤 Birth Profile Setup
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 28px' }}>
            Your birth date, time, and gender are used to calculate your Four Pillars (四柱八字).
          </p>

          <div style={{ maxWidth: 520 }}>
            <form onSubmit={handleSubmit}>
              <div style={{
                backgroundColor: '#16152e', borderRadius: 12, padding: 28,
                border: '1px solid rgba(139,92,246,0.2)', marginBottom: 20,
              }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 15, color: '#c4b5fd', fontWeight: 600 }}>
                  Birth Information
                </h3>

                <div style={{ marginBottom: 18 }}>
                  {label('Date of Birth')}
                  <input type="date" style={inp} value={form.birth_date} required
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                  <div>
                    {label('Birth Hour (0–23)')}
                    <input type="number" style={inp} min={0} max={23} value={form.birth_hour} required
                      onChange={(e) => setForm({ ...form, birth_hour: e.target.value })} />
                  </div>
                  <div>
                    {label('Birth Minute')}
                    <input type="number" style={inp} min={0} max={59} value={form.birth_minute}
                      onChange={(e) => setForm({ ...form, birth_minute: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  {label('Gender')}
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[{ v: 'M', l: '♂ Male' }, { v: 'F', l: '♀ Female' }].map(({ v, l }) => (
                      <button key={v} type="button"
                        onClick={() => setForm({ ...form, gender: v })}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 8, fontWeight: 600, fontSize: 14,
                          border: `2px solid ${form.gender === v ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                          backgroundColor: form.gender === v ? 'rgba(139,92,246,0.2)' : 'transparent',
                          color: form.gender === v ? '#c4b5fd' : '#9ca3af', cursor: 'pointer',
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {label('Timezone')}
                  <select style={{ ...inp, appearance: 'none' }} value={form.timezone_offset}
                    onChange={(e) => setForm({ ...form, timezone_offset: e.target.value })}>
                    {TZ_OPTIONS.map(({ label: l, value: v }) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div style={{ backgroundColor: '#3f0a0a', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              {saved && (
                <div style={{ backgroundColor: '#052e16', color: '#86efac', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  ✓ Profile saved — redirecting to your Bazi Chart…
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px 0', backgroundColor: '#7c3aed',
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Saving…' : 'Save & Calculate My Chart →'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BaziProfile;

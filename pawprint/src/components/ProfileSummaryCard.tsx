'use client';

import { useRef, useState } from 'react';
import type { PetProfile, ScanAPIResponse, BreedScanResult } from '@/types';

interface Props {
  profile: PetProfile;
  onResult: (result: BreedScanResult, preview: string) => void;
  onReset: () => void;
}

function calcAge(birthday: string): string {
  if (!birthday) return '';
  const birth = new Date(birthday);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}yr`;
  return `${years}yr ${months}mo`;
}

const LABELS: Record<string, Record<string, string>> = {
  gender: { boy: 'Good Boy 🐶', girl: 'Good Girl 🐱', other: 'Other 🐾' },
  size: { tiny: 'Tiny 🐾', medium: 'Medium 🐕', large: 'Large 🦮', giant: 'Giant 🐻' },
  coat: { fluffy: 'Fluffy ☁️', smooth: 'Smooth ✨', curly: 'Curly 🌀', wiry: 'Wiry 🌿' },
  ears: { floppy: 'Floppy 🐰', perky: 'Perky 👂', mixed: 'One of each 😂' },
  energy: { couch: 'Couch Potato 🛋️', balanced: 'Balanced ⚖️', zoomies: 'Zoomies 24/7 ⚡' },
};

export default function ProfileSummaryCard({ profile, onResult, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chips = [
    LABELS.gender[profile.gender],
    calcAge(profile.birthday),
    LABELS.size[profile.size],
    `${profile.weight}${profile.weightUnit}`,
    LABELS.coat[profile.coat],
    LABELS.ears[profile.ears],
    LABELS.energy[profile.energy],
  ];

  const handleFile = (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleFile(f);
  };

  const handleAnalyse = async () => {
    if (!imageFile) return;
    setLoading(true); setError(null);

    // Track in localStorage
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = JSON.parse(localStorage.getItem('pawprint-scans') || '{}');
      if (stored.date !== today) { stored.date = today; stored.count = 0; }
      stored.count++;
      localStorage.setItem('pawprint-scans', JSON.stringify(stored));
    } catch { /* ignore */ }

    const fd = new FormData();
    fd.append('image', imageFile);
    fd.append('name', profile.name);
    fd.append('birthday', profile.birthday);
    fd.append('size', profile.size);
    fd.append('weight', `${profile.weight}${profile.weightUnit}`);
    fd.append('coat', profile.coat);
    fd.append('ears', profile.ears);
    fd.append('energy', profile.energy);

    try {
      const res = await fetch('/api/scan', { method: 'POST', body: fd });
      const data: ScanAPIResponse = await res.json();
      if (!data.success || !data.result) throw new Error(data.error || 'Analysis failed');
      onResult(data.result, preview!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px 80px' }} className="fade-in">
      {/* Profile summary */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '28px', color: 'var(--foreground)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Meet {profile.name}! ✨
          </h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--muted)' }}>Here's the profile you built</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {chips.map((chip, i) => (
            <span key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground-secondary)', padding: '6px 14px', borderRadius: '20px', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Photo upload */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '20px', color: 'var(--foreground)', textAlign: 'center', marginBottom: '8px' }}>
          Now let&apos;s meet them properly 📸
        </p>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--muted)', textAlign: 'center', marginBottom: '20px' }}>
          Drop a photo and our AI will do the rest
        </p>

        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{ border: `1.5px dashed ${dragging ? 'var(--gold)' : 'var(--border)'}`, borderRadius: '12px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--gold-glow)' : 'var(--surface)', transition: 'all 0.2s' }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--muted)' }}>
              Drop photo here or <span style={{ color: 'var(--gold)' }}>click to browse</span>
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            <img src={preview} alt="Pet preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
            <button
              type="button"
              onClick={() => { setImageFile(null); setPreview(null); }}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
              Change
            </button>
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {error && (
          <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '8px', padding: '12px 16px', margin: '16px 0', fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--error-text)' }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleAnalyse}
          disabled={!imageFile || loading}
          style={{ width: '100%', marginTop: '16px', padding: '15px', borderRadius: '10px', border: 'none', background: (!imageFile || loading) ? 'var(--surface)' : 'var(--gold)', color: (!imageFile || loading) ? 'var(--muted)' : 'var(--text-on-gold)', cursor: (!imageFile || loading) ? 'not-allowed' : 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', borderColor: 'transparent' }}>
          {loading ? (
            <>
              <span style={{ width: '15px', height: '15px', border: '2px solid var(--muted)', borderTopColor: 'var(--gold)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Analysing with AI…
            </>
          ) : 'Identify My Pet ✦'}
        </button>

        <button type="button" onClick={onReset}
          style={{ width: '100%', marginTop: '10px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
          ← Start over
        </button>
      </div>
    </div>
  );
}

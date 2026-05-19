'use client';

import { useState } from 'react';
import type { BreedScanResult, PetProfile } from '@/types';

interface Props {
  result: BreedScanResult;
  imagePreview: string;
  profile: PetProfile;
  onReset: () => void;
  testMode?: boolean;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'var(--subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.7 }}>{value}</p>
    </div>
  );
}

export default function BreedResultCard({ result, imagePreview, profile, onReset, testMode }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `Just used PawPrint AI to identify ${profile.name}! 🐾\n\nBreed: ${result.primary_breed}${result.secondary_breed ? ` × ${result.secondary_breed}` : ''}\n${result.fun_fact}\n\nTry it free → https://pawprint.app\n\n#PawPrint #PetAI`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    });
  };

  return (
    <div className="slide-in" style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px 80px' }}>
      {testMode && (
        <div style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-border)', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px' }}>⚡</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.5px' }}>
            Test Mode — Add your <code style={{ background: 'rgba(0,0,0,0.15)', padding: '1px 5px', borderRadius: '4px' }}>ANTHROPIC_API_KEY</code> to <code style={{ background: 'rgba(0,0,0,0.15)', padding: '1px 5px', borderRadius: '4px' }}>.env.local</code> for live AI analysis
          </span>
        </div>
      )}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Hero photo + breed */}
        <div style={{ position: 'relative' }}>
          <img src={imagePreview} alt={profile.name} style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 'clamp(22px, 4vw, 30px)', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '4px' }}>
              {result.primary_breed}
              {result.secondary_breed && <span style={{ fontStyle: 'italic', opacity: 0.8 }}> × {result.secondary_breed}</span>}
            </h2>
            {result.breed_percentage && (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{result.breed_percentage}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Name chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--gold)' }}>🐾 {profile.name}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--muted)' }}>{result.size_category}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--muted)' }}>{result.estimated_age_range}</span>
          </div>

          <Field label="Temperament" value={result.typical_temperament} />
          <Field label="Coat" value={result.coat_description} />
          <Field label="Health Considerations" value={result.common_health_considerations} />

          {/* Fun fact */}
          <div style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-border)', borderRadius: '10px', padding: '16px 18px', marginBottom: '24px' }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '6px' }}>✦ Fun Fact</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: 1.7 }}>{result.fun_fact}</p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button type="button" onClick={handleShare}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'var(--gold)', color: 'var(--text-on-gold)', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }}>
              {copied ? '✓ Copied to clipboard!' : '🐾 Share My Pet'}
            </button>
            <button type="button" onClick={onReset}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>
              ← Analyse another pet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

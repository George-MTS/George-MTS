'use client';

import { useState } from 'react';
import type { PetProfile } from '@/types';

interface Props {
  onComplete: (profile: PetProfile) => void;
}

const TOTAL_STEPS = 8;

function calcAge(birthday: string): string {
  if (!birthday) return '';
  const birth = new Date(birthday);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''} old`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''} old`;
  return `${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''} old`;
}

const btnBase: React.CSSProperties = {
  border: '1.5px solid var(--border)', borderRadius: '12px', cursor: 'pointer',
  fontFamily: "'DM Mono', monospace", fontSize: '14px', transition: 'all 0.18s',
  background: 'var(--surface)', color: 'var(--foreground)',
};

function OptionBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{
      ...btnBase,
      padding: '14px 20px',
      background: active ? 'var(--gold-glow)' : 'var(--surface)',
      borderColor: active ? 'var(--gold)' : 'var(--border)',
      color: active ? 'var(--gold)' : 'var(--foreground)',
      fontWeight: active ? 500 : 400,
    }}>
      {children}
    </button>
  );
}

export default function PetProfileForm({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<PetProfile['gender'] | ''>('');
  const [birthday, setBirthday] = useState('');
  const [size, setSize] = useState<PetProfile['size'] | ''>('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [coat, setCoat] = useState<PetProfile['coat'] | ''>('');
  const [ears, setEars] = useState<PetProfile['ears'] | ''>('');
  const [energy, setEnergy] = useState<PetProfile['energy'] | ''>('');

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  const advance = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const finish = () => {
    onComplete({
      name, gender: gender as PetProfile['gender'], birthday,
      size: size as PetProfile['size'], weight: parseFloat(weight) || 0, weightUnit,
      coat: coat as PetProfile['coat'], ears: ears as PetProfile['ears'],
      energy: energy as PetProfile['energy'],
    });
  };

  const heading: React.CSSProperties = {
    fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 'clamp(26px, 4vw, 36px)',
    color: 'var(--foreground)', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '32px', textAlign: 'center',
  };

  const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };

  const canContinue = [
    name.trim().length > 0,
    gender !== '',
    birthday !== '',
    size !== '',
    weight !== '' && parseFloat(weight) > 0,
    coat !== '',
    ears !== '',
    energy !== '',
  ][step - 1];

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px' }}>
            STEP {step} OF {TOTAL_STEPS}
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--gold)' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--copper), var(--gold))', borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Step 1 — Name */}
      {step === 1 && (
        <div className="fade-in">
          <h2 style={heading}>What's your pet's name? 🐾</h2>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Buddy, Luna, Max…"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && name.trim() && advance()}
            style={{ width: '100%', padding: '16px 18px', borderRadius: '12px', fontSize: '20px', textAlign: 'center', border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--foreground)', fontFamily: "'Fraunces', serif" }}
          />
        </div>
      )}

      {/* Step 2 — Gender */}
      {step === 2 && (
        <div className="fade-in">
          <h2 style={heading}>Are they a good boy or good girl?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {([['boy', 'Good Boy 🐶'], ['girl', 'Good Girl 🐱'], ['other', 'Other 🐾']] as const).map(([val, label]) => (
              <OptionBtn key={val} active={gender === val} onClick={() => { setGender(val); setTimeout(advance, 200); }}>
                {label}
              </OptionBtn>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Birthday */}
      {step === 3 && (
        <div className="fade-in">
          <h2 style={heading}>When's their birthday? 🎂</h2>
          <input
            type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '16px 18px', borderRadius: '12px', fontSize: '16px', textAlign: 'center', border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--foreground)', fontFamily: "'DM Mono', monospace" }}
          />
          {birthday && (
            <p style={{ textAlign: 'center', marginTop: '16px', fontFamily: "'DM Mono', monospace", fontSize: '14px', color: 'var(--gold)' }}>
              🎉 That makes them {calcAge(birthday)}!
            </p>
          )}
        </div>
      )}

      {/* Step 4 — Size */}
      {step === 4 && (
        <div className="fade-in">
          <h2 style={heading}>How big is your baby?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {([['tiny', 'Tiny 🐾'], ['medium', 'Medium 🐕'], ['large', 'Large 🦮'], ['giant', 'Giant 🐻']] as const).map(([val, label]) => (
              <OptionBtn key={val} active={size === val} onClick={() => { setSize(val); setTimeout(advance, 200); }}>
                <span style={{ display: 'block', fontSize: '24px', marginBottom: '4px' }}>{label.split(' ')[1]}</span>
                <span style={{ textTransform: 'capitalize' }}>{val.charAt(0).toUpperCase() + val.slice(1)}</span>
              </OptionBtn>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 — Weight */}
      {step === 5 && (
        <div className="fade-in">
          <h2 style={heading}>How heavy is your furball? ⚖️</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="0" min="0" step="0.1"
              style={{ flex: 1, padding: '16px 18px', borderRadius: '12px', fontSize: '24px', textAlign: 'center', border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--foreground)', fontFamily: "'Fraunces', serif" }}
            />
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
              {(['kg', 'lbs'] as const).map(unit => (
                <button key={unit} type="button" onClick={() => setWeightUnit(unit)}
                  style={{ padding: '14px 18px', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '14px', transition: 'all 0.2s', background: weightUnit === unit ? 'var(--gold)' : 'transparent', color: weightUnit === unit ? 'var(--text-on-gold)' : 'var(--muted)', fontWeight: weightUnit === unit ? 500 : 400 }}>
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 6 — Coat */}
      {step === 6 && (
        <div className="fade-in">
          <h2 style={heading}>What's their fur situation? 🪮</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {([['fluffy', 'Fluffy ☁️'], ['smooth', 'Smooth ✨'], ['curly', 'Curly 🌀'], ['wiry', 'Wiry 🌿']] as const).map(([val, label]) => (
              <OptionBtn key={val} active={coat === val} onClick={() => { setCoat(val); setTimeout(advance, 200); }}>
                {label}
              </OptionBtn>
            ))}
          </div>
        </div>
      )}

      {/* Step 7 — Ears */}
      {step === 7 && (
        <div className="fade-in">
          <h2 style={heading}>How do their ears roll? 👂</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {([['floppy', 'Floppy 🐰'], ['perky', 'Perky 👂'], ['mixed', 'One of each 😂']] as const).map(([val, label]) => (
              <OptionBtn key={val} active={ears === val} onClick={() => { setEars(val); setTimeout(advance, 200); }}>
                {label}
              </OptionBtn>
            ))}
          </div>
        </div>
      )}

      {/* Step 8 — Energy */}
      {step === 8 && (
        <div className="fade-in">
          <h2 style={heading}>Vibe check — how wild are they? 🔥</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {([['couch', 'Couch Potato 🛋️'], ['balanced', 'Balanced ⚖️'], ['zoomies', 'Zoomies 24/7 ⚡']] as const).map(([val, label]) => (
              <OptionBtn key={val} active={energy === val} onClick={() => { setEnergy(val); setTimeout(finish, 250); }}>
                {label}
              </OptionBtn>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '32px', ...wrap }}>
        {step > 1 && (
          <button type="button" onClick={back}
            style={{ ...btnBase, padding: '12px 24px', flex: 1 }}>
            ← Back
          </button>
        )}
        {step < TOTAL_STEPS && step !== 2 && step !== 4 && step !== 6 && step !== 7 && (
          <button type="button" onClick={advance} disabled={!canContinue}
            style={{ ...btnBase, padding: '12px 24px', flex: 2, background: canContinue ? 'var(--gold)' : 'var(--surface)', color: canContinue ? 'var(--text-on-gold)' : 'var(--subtle)', borderColor: canContinue ? 'var(--gold)' : 'var(--border)', cursor: canContinue ? 'pointer' : 'not-allowed' }}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

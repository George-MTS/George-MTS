'use client';

export default function HeroSection() {
  return (
    <section style={{ padding: '72px 24px 40px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '20px' }}>
        AI Pet Intelligence
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 'clamp(42px, 7vw, 72px)', lineHeight: 1.05, letterSpacing: '-2px', color: 'var(--foreground)', marginBottom: '20px' }}>
        Know Your Pet
        <br />
        <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Better.</span>
      </h1>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto' }}>
        Answer 8 quick questions, snap a photo, and our AI delivers a full breed profile in seconds.
      </p>
    </section>
  );
}

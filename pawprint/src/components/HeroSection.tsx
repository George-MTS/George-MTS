'use client';

export default function HeroSection() {
  return (
    <section
      style={{
        padding: '80px 24px 48px',
        textAlign: 'center',
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#e8c97e',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}
      >
        AI Pet Intelligence
      </p>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: 'clamp(42px, 7vw, 72px)',
          lineHeight: 1.05,
          letterSpacing: '-2px',
          color: '#f0ede8',
          marginBottom: '24px',
        }}
      >
        Know Your Pet
        <br />
        <span style={{ fontStyle: 'italic', color: '#e8c97e' }}>Better.</span>
      </h1>
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '15px',
          color: '#888',
          lineHeight: 1.7,
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        Upload a photo of your dog or cat. Our AI analyses breed characteristics,
        temperament, care needs, and more — in seconds.
      </p>
    </section>
  );
}

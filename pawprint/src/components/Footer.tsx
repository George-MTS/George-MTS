'use client';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--subtle)', letterSpacing: '0.5px' }}>
        PawPrint · Free forever · Powered by{' '}
        <span style={{ color: 'var(--muted)' }}>Claude AI</span>
        {' · '}
        <span>Every submission helps build the future of pet intelligence</span>
      </p>
    </footer>
  );
}

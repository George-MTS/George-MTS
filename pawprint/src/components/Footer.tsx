'use client';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #2a2a2a',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
          color: '#444',
          letterSpacing: '0.5px',
        }}
      >
        PawPrint · Free forever · Powered by{' '}
        <span style={{ color: '#666' }}>Claude AI</span>
        {' '}·{' '}
        <span style={{ color: '#555' }}>
          Every submission helps build the future of pet intelligence
        </span>
      </p>
    </footer>
  );
}

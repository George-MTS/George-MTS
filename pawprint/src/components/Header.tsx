'use client';

export default function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid #2a2a2a',
        background: '#0d0d0d',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>🐾</span>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '22px',
              color: '#e8c97e',
              letterSpacing: '-0.5px',
            }}
          >
            PawPrint
          </span>
          <span
            style={{
              background: 'rgba(232, 201, 126, 0.12)',
              border: '1px solid rgba(232, 201, 126, 0.3)',
              color: '#e8c97e',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.5px',
            }}
          >
            Beta · Free Forever
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#888',
              fontSize: '13px',
              textDecoration: 'none',
              fontFamily: "'DM Mono', monospace",
              transition: 'color 0.2s',
            }}
          >
            Share on X
          </a>
        </nav>
      </div>
    </header>
  );
}

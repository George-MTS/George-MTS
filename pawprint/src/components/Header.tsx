'use client';

import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)', position: 'sticky', top: 0, zIndex: 50, transition: 'background 0.25s' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>🐾</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 600, fontSize: '22px', color: 'var(--gold)', letterSpacing: '-0.5px' }}>
            PawPrint
          </span>
          <span style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-border)', color: 'var(--gold)', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.5px' }}>
            Beta · Free Forever
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none', fontFamily: "'DM Mono', monospace", transition: 'color 0.2s' }}>
            Share on X
          </a>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s',
              color: 'var(--foreground)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}

'use client';

interface TabSwitcherProps {
  activeTab: 'submit' | 'identify';
  onTabChange: (tab: 'submit' | 'identify') => void;
}

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', padding: '0 24px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '2px' }}>
        {([
          { key: 'submit' as const, label: '✦ Submit My Pet' },
          { key: 'identify' as const, label: '🔍 Identify A Pet' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: '10px 24px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Mono', monospace", fontSize: '13px', letterSpacing: '0.3px', transition: 'all 0.2s',
              background: activeTab === tab.key ? 'var(--gold)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-on-gold)' : 'var(--muted)',
              fontWeight: activeTab === tab.key ? 500 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

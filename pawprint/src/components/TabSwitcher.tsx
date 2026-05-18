'use client';

interface TabSwitcherProps {
  activeTab: 'submit' | 'identify';
  onTabChange: (tab: 'submit' | 'identify') => void;
}

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '48px',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '4px',
          display: 'inline-flex',
          gap: '2px',
        }}
      >
        {[
          { key: 'submit' as const, label: '✦ Submit My Pet' },
          { key: 'identify' as const, label: '🔍 Identify A Pet' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: '10px 24px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Mono', monospace",
              fontSize: '13px',
              letterSpacing: '0.3px',
              transition: 'all 0.2s',
              background: activeTab === tab.key ? '#e8c97e' : 'transparent',
              color: activeTab === tab.key ? '#0d0d0d' : '#888',
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

'use client';

interface PetTypeSelectorProps {
  value: 'dog' | 'cat';
  onChange: (value: 'dog' | 'cat') => void;
}

export default function PetTypeSelector({ value, onChange }: PetTypeSelectorProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <label
        style={{
          display: 'block',
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          letterSpacing: '2px',
          color: '#666',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}
      >
        Pet Type
      </label>
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { key: 'dog' as const, emoji: '🐕', label: 'Dog' },
          { key: 'cat' as const, emoji: '🐈', label: 'Cat' },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '10px',
              border: `1px solid ${value === option.key ? '#e8c97e' : '#2a2a2a'}`,
              background: value === option.key ? 'rgba(232, 201, 126, 0.08)' : '#161616',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '28px' }}>{option.emoji}</span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '13px',
                color: value === option.key ? '#e8c97e' : '#888',
                letterSpacing: '0.5px',
              }}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

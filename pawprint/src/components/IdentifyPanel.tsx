'use client';

import StatsStrip from './StatsStrip';

interface IdentifyPanelProps {
  onSwitchTab: () => void;
}

export default function IdentifyPanel({ onSwitchTab }: IdentifyPanelProps) {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
      <StatsStrip />

      {/* Coming Soon Card */}
      <div
        style={{
          background: '#1e1e1e',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '48px 40px',
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(232, 201, 126, 0.1)',
            border: '1px solid rgba(232, 201, 126, 0.2)',
            borderRadius: '20px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '12px' }}>⏳</span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              color: '#e8c97e',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Coming Soon
          </span>
        </div>

        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '32px',
            color: '#f0ede8',
            letterSpacing: '-1px',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          Instant Breed Identification
        </h2>

        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '14px',
            color: '#666',
            lineHeight: 1.75,
            maxWidth: '440px',
            margin: '0 auto 32px',
          }}
        >
          Drop a photo — no forms, no details needed. Our AI identifies the breed,
          traits, and care notes instantly, powered by the dataset we're building together.
        </p>

        {/* Flywheel visual */}
        <div
          style={{
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '2px',
              color: '#555',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            The Data Flywheel
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { step: '01', text: 'Owners submit photos with breed labels (Phase 1)' },
              { step: '02', text: 'We build a labeled visual training dataset' },
              { step: '03', text: 'AI learns to identify breeds from images alone' },
              { step: '04', text: 'Instant ID with no manual input needed (Phase 2)' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    color: '#e8c97e',
                    minWidth: '24px',
                    opacity: 0.7,
                  }}
                >
                  {item.step}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '13px',
                    color: '#777',
                    lineHeight: 1.5,
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchTab}
          style={{
            padding: '14px 32px',
            borderRadius: '10px',
            border: 'none',
            background: '#e8c97e',
            color: '#0d0d0d',
            cursor: 'pointer',
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
          }}
        >
          Help build the dataset — Submit My Pet ✦
        </button>
      </div>
    </div>
  );
}

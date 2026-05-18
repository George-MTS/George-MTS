'use client';

import { useEffect, useState } from 'react';
import type { StatsResponse } from '@/types';

export default function StatsStrip() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data: StatsResponse) => setStats(data))
      .catch(() => {});
  }, []);

  const items = [
    { label: 'Pets Analysed', value: stats?.totalSubmissions ?? '—' },
    { label: 'Unique Breeds', value: stats?.uniqueBreeds ?? '—' },
    { label: 'Dogs', value: stats?.dogCount ?? '—' },
    { label: 'Cats', value: stats?.catCount ?? '—' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        maxWidth: '680px',
        margin: '0 auto 32px',
        padding: '0 24px',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '28px',
              fontWeight: 600,
              color: '#e8c97e',
              lineHeight: 1,
              marginBottom: '6px',
            }}
          >
            {item.value.toLocaleString()}
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              color: '#555',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

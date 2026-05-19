'use client';

import { useEffect, useState } from 'react';
import type { StatsResponse } from '@/types';

export default function StatsStrip() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then((d: StatsResponse) => setStats(d)).catch(() => {});
  }, []);

  const items = [
    { label: 'Pets Analysed', value: stats?.totalSubmissions ?? '—' },
    { label: 'Unique Breeds', value: stats?.uniqueBreeds ?? '—' },
    { label: 'Dogs', value: stats?.dogCount ?? '—' },
    { label: 'Cats', value: stats?.catCount ?? '—' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
      {items.map((item) => (
        <div key={item.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 600, color: 'var(--gold)', lineHeight: 1, marginBottom: '6px' }}>
            {item.value.toLocaleString()}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--subtle)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

interface Submission {
  id: string;
  timestamp: string;
  pet_name: string | null;
  pet_type: string;
  breed_identified: string;
  confidence: number | null;
  temperament: string;
  care_notes: string;
  fun_fact: string;
}

export async function GET(): Promise<Response> {
  try {
    const [totalRaw, submissionsRaw] = await Promise.all([
      kv.get<number>('total_count'),
      kv.lrange<string>('submissions', 0, 9),
    ]);

    const total = totalRaw ?? 0;
    const submissions: Submission[] = (submissionsRaw ?? [])
      .map((item) => {
        try {
          return (typeof item === 'string' ? JSON.parse(item) : item) as Submission;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Submission[];

    return Response.json({ total_count: total, recent_submissions: submissions });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[STATS] KV error:', msg);
    return Response.json({ total_count: 0, recent_submissions: [] });
  }
}

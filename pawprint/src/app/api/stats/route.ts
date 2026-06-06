import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

interface Submission {
  petName: string | null;
  petType: string;
  breedIdentified: string;
  confidence: number | null;
  timestamp: string;
  ip: string;
}

interface TopBreed {
  breed: string;
  count: number;
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET(): Promise<Response> {
  const redis = getRedis();

  if (!redis) {
    return Response.json(
      { error: 'Redis not configured', totalScans: 0, recentScans: [], topBreeds: [] },
      { status: 503 }
    );
  }

  try {
    // Fetch total count, last 10 scan keys, and top 5 breeds in parallel
    const [totalRaw, scanKeys, breedMembers] = await Promise.all([
      redis.get<number>('stats:total_scans'),
      redis.lrange<string>('scans:recent', 0, 9),
      redis.zrange<string[]>('breeds:counts', 0, 4, { rev: true }),
    ]);

    const totalScans = totalRaw ?? 0;

    // Fetch each individual scan record
    let recentScans: Submission[] = [];
    if (scanKeys && scanKeys.length > 0) {
      const records = await Promise.all(
        scanKeys.map((key) => redis.get<string>(key))
      );
      recentScans = records
        .map((raw) => {
          if (!raw) return null;
          try {
            return (typeof raw === 'string' ? JSON.parse(raw) : raw) as Submission;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as Submission[];
    }

    // Fetch scores for top breed names
    let topBreeds: TopBreed[] = [];
    if (breedMembers && breedMembers.length > 0) {
      const scores = await Promise.all(
        breedMembers.map((breed) => redis.zscore('breeds:counts', breed))
      );
      topBreeds = breedMembers.map((breed, i) => ({
        breed,
        count: Number(scores[i] ?? 0),
      }));
    }

    return Response.json({ totalScans, recentScans, topBreeds });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[STATS] Redis error:', msg);
    return Response.json(
      { error: msg, totalScans: 0, recentScans: [], topBreeds: [] },
      { status: 500 }
    );
  }
}

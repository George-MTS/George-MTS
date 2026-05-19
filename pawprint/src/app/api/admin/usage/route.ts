import { getUsage } from '@/lib/usageCounter';

export async function GET(): Promise<Response> {
  const usage = getUsage();
  return Response.json({
    date: usage.date,
    count: usage.count,
    limit: usage.limit,
    remaining: Math.max(0, usage.limit - usage.count),
    percentage: Math.round((usage.count / usage.limit) * 100),
  });
}

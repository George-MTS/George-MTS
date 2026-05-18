import { createServiceClient } from '@/lib/supabase';
import type { StatsResponse } from '@/types';

export async function GET(): Promise<Response> {
  try {
    const supabaseAdmin = createServiceClient();

    const { data, error } = await supabaseAdmin
      .from('submission_stats')
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const stats: StatsResponse = {
      totalSubmissions: Number(data?.total_submissions ?? 0),
      uniqueBreeds: Number(data?.unique_breeds ?? 0),
      dogCount: Number(data?.dog_count ?? 0),
      catCount: Number(data?.cat_count ?? 0),
    };

    return Response.json(stats);
  } catch (error) {
    console.error('Stats route error:', error);
    const fallback: StatsResponse = {
      totalSubmissions: 0,
      uniqueBreeds: 0,
      dogCount: 0,
      catCount: 0,
    };
    return Response.json(fallback);
  }
}

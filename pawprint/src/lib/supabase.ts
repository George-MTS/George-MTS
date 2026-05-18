import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _publicClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_publicClient) {
    _publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _publicClient;
}

export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

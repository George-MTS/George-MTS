import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      supabase:
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url',
      anthropic:
        !!process.env.ANTHROPIC_API_KEY &&
        process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key',
    },
  });
}

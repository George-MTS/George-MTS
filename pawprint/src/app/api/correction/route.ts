import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { submissionId, identifiedBreed, correctedBreed, petName } = await request.json() as {
      submissionId?: string;
      identifiedBreed: string;
      correctedBreed: string;
      petName: string;
    };

    if (!correctedBreed?.trim()) {
      return Response.json({ success: false, error: 'Corrected breed is required' }, { status: 400 });
    }

    // Try to save to Supabase — gracefully skip if not configured
    try {
      const supabase = createServiceClient();
      await supabase.from('breed_corrections').insert({
        submission_id: submissionId || null,
        pet_name: petName || null,
        identified_breed: identifiedBreed,
        corrected_breed: correctedBreed.trim(),
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      // Log but don't fail — DB may not be configured yet
      console.warn('[CORRECTION] Could not save to DB:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    console.log(`[CORRECTION] ${identifiedBreed} → ${correctedBreed} (pet: ${petName})`);
    return Response.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}

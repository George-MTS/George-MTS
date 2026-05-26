import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { anthropic } from '@/lib/anthropic';
import { createServiceClient } from '@/lib/supabase';
import { bufferToBase64 } from '@/lib/utils';
import { checkAndIncrement } from '@/lib/usageCounter';
import { IS_TEST_MODE, MOCK_SCAN_RESULT } from '@/lib/mockData';
import type { BreedScanResult, ScanAPIResponse } from '@/types';

export const maxDuration = 60;

// Pages-Router style hint — kept for compatibility; App Router uses maxDuration above
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

const SYSTEM_PROMPT = `You are the world's most accurate dog and cat breed identification expert.
You have encyclopedic knowledge of every AKC, KC, and FCI registered breed,
plus mixed breeds, and regional/African breeds.

IDENTIFICATION METHODOLOGY:
1. First examine the HEAD shape — ear set, ear length, muzzle length, skull shape, eye colour and set
2. Then examine COAT — texture, length, feathering, colour pattern, markings
3. Then examine BODY — size, bone structure, chest depth, tail set
4. Cross-reference ALL three before deciding
5. Factor in any owner-provided details as supporting evidence

KEY SPANIEL IDENTIFICATION MARKERS (example of the detail level required):
- English Springer Spaniel: liver/white or black/white, long feathered ears set at eye level,
  medium size (18-25kg), domed skull, deep chest, feathered legs and chest
- Cocker Spaniel: smaller, more domed head, longer ears set BELOW eye level, silkier coat
- Field Spaniel: darker, more solid colour, lower set ears, longer body
- Welsh Springer Spaniel: always red/white only, never liver/white

CONFIDENCE SCORING:
- 90-100%: Purebred with multiple clear identifying features visible
- 70-89%: Strong likelihood, one or two features ambiguous
- 50-69%: Best guess, mixed breed likely or photo quality limits assessment
- Below 50%: Cannot determine — say so honestly

CRITICAL RULES:
- NEVER default to Golden Retriever or Labrador unless you are certain
- If you see a Spaniel, identify WHICH type specifically
- If the dog is a mix, say "X mix" or "X/Y cross" — do not pretend it is purebred
- A wrong confident answer is worse than an honest uncertain one

RESPONSE FORMAT:
Respond ONLY with a valid JSON object. No preamble. No markdown. No backticks. Raw JSON only.

The JSON must have these exact fields:
primary_breed, secondary_breed (string or null), breed_percentage (string or null),
coat_description, estimated_age_range, size_category, typical_temperament,
common_health_considerations, fun_fact`;

const LOW_CONFIDENCE_RETRY = `Your confidence was below 60%. Please look more carefully at:
1. The ear set and length relative to the skull
2. The exact coat colour pattern and any ticking or roan
3. The body proportions and bone density
4. Any feathering on legs, chest, and ears

Reconsider your identification and provide an updated JSON response.`;

const SUPPORTED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

async function convertToJpeg(buffer: ArrayBuffer, mimeType: string): Promise<Buffer> {
  const lower = mimeType.toLowerCase();
  if (lower && !SUPPORTED_TYPES.has(lower) && !lower.startsWith('application/octet-stream')) {
    throw new Error('Please upload a JPG or PNG photo');
  }
  const bytes = Buffer.from(buffer);
  return sharp(bytes, { failOn: 'none' })
    .rotate()
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
}

interface RawResult extends BreedScanResult {
  confidence?: number;
}

async function callClaude(base64: string, context: string, retryPrompt?: string): Promise<RawResult> {
  const userText = retryPrompt
    ? retryPrompt
    : `Look carefully at this pet photo. Take your time to examine all visible features before responding.\n\nOwner-provided context:\n${context || 'None provided'}\n\nReturn ONLY raw JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
          },
          { type: 'text', text: userText },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected Claude response type');

  let text = content.text.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();

  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) text = objMatch[0];

  try {
    return JSON.parse(text) as RawResult;
  } catch {
    console.error('[SCAN] Claude returned non-JSON response:', content.text);
    throw new Error('AI returned an unexpected response — please try again');
  }
}

async function saveToSupabase(
  imageBuffer: Buffer,
  result: RawResult,
  fields: {
    name: string; size: string; weight: string; coat: string;
    ears: string; energy: string; birthday: string;
  }
): Promise<void> {
  const supabase = createServiceClient();

  console.log('[SCAN] Saving submission to Supabase...');
  console.log('[SCAN] Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('[SCAN] Service role key configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Step 1: try to upload image — non-fatal if it fails
  let imageUrl: string | null = null;
  try {
    const filename = `${Date.now()}_${uuidv4()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) {
      console.warn('[SCAN] Image upload failed (non-fatal):', uploadError.message);
    } else {
      const { data: urlData } = supabase.storage.from('pet-photos').getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
      console.log('[SCAN] Image uploaded:', imageUrl);
    }
  } catch (uploadErr) {
    console.warn('[SCAN] Image upload threw (non-fatal):', uploadErr instanceof Error ? uploadErr.message : uploadErr);
  }

  // Step 2: insert submission — always attempt regardless of image upload outcome
  const traitsNotes = [
    fields.size && `Size: ${fields.size}`,
    fields.weight && `Weight: ${fields.weight}`,
    fields.coat && `Coat: ${fields.coat}`,
    fields.ears && `Ears: ${fields.ears}`,
    fields.energy && `Energy: ${fields.energy}`,
    fields.birthday && `Birthday: ${fields.birthday}`,
  ].filter(Boolean).join(' | ') || null;

  const row = {
    pet_type: 'dog' as const,       // scan flow doesn't ask — default to dog
    pet_name: fields.name || null,
    breed_provided: null,
    age: result.estimated_age_range || null,
    origin: null,
    owner_name: null,
    twitter_handle: null,
    traits_notes: traitsNotes,
    image_url: imageUrl,
    ai_breed_identified: result.primary_breed,
    ai_confidence: typeof result.confidence === 'number' ? result.confidence : null,
    ai_temperament: result.typical_temperament || null,
    ai_care_notes: result.common_health_considerations || null,
    ai_traits: null,
    ai_fun_fact: result.fun_fact || null,
    ai_origin: null,
    raw_ai_response: result as unknown as Record<string, unknown>,
  };

  console.log('SAVING TO SUPABASE', JSON.stringify({ ...row, raw_ai_response: '(omitted)' }, null, 2));

  const { data: insertData, error: insertError } = await supabase
    .from('submissions')
    .insert(row)
    .select('id')
    .single();

  console.log('SUPABASE RESULT:', JSON.stringify({ data: insertData, error: insertError }, null, 2));
}

export async function POST(request: NextRequest): Promise<Response> {
  const usage = checkAndIncrement();
  if (!usage.allowed) {
    return Response.json(
      {
        success: false,
        limitReached: true,
        error: "We've hit our daily limit of pet discoveries! 🐾 Come back tomorrow for more.",
      } satisfies ScanAPIResponse,
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    if (!imageFile) {
      return Response.json({ success: false, error: 'No image provided' } satisfies ScanAPIResponse, { status: 400 });
    }

    if (IS_TEST_MODE) {
      console.log('[TEST MODE] Using mock AI result — add a real ANTHROPIC_API_KEY to .env.local for live AI');
      return Response.json({ success: true, result: MOCK_SCAN_RESULT, testMode: true } satisfies ScanAPIResponse);
    }

    const rawBuffer = await imageFile.arrayBuffer();
    let imageBuffer: Buffer;
    try {
      imageBuffer = await convertToJpeg(rawBuffer, imageFile.type);
    } catch (convErr) {
      const msg = convErr instanceof Error ? convErr.message : 'Unsupported image format';
      return Response.json({ success: false, error: msg } satisfies ScanAPIResponse, { status: 415 });
    }
    const base64 = imageBuffer.toString('base64');

    const fields = {
      name: (formData.get('name') as string) || '',
      size: (formData.get('size') as string) || '',
      weight: (formData.get('weight') as string) || '',
      coat: (formData.get('coat') as string) || '',
      ears: (formData.get('ears') as string) || '',
      energy: (formData.get('energy') as string) || '',
      birthday: (formData.get('birthday') as string) || '',
    };

    const context = [
      fields.name && `Name: ${fields.name}`,
      fields.birthday && `Birthday: ${fields.birthday}`,
      fields.size && `Size: ${fields.size}`,
      fields.weight && `Weight: ${fields.weight}`,
      fields.coat && `Coat type: ${fields.coat}`,
      fields.ears && `Ear type: ${fields.ears}`,
      fields.energy && `Energy level: ${fields.energy}`,
    ].filter(Boolean).join('\n');

    let result = await callClaude(base64, context);

    // Retry if confidence is low
    if (typeof result.confidence === 'number' && result.confidence < 60) {
      console.log(`[SCAN] Low confidence (${result.confidence}%), retrying with focused prompt`);
      const retry = await callClaude(base64, context, LOW_CONFIDENCE_RETRY);
      if (typeof retry.confidence === 'number' && retry.confidence > result.confidence) {
        result = retry;
      }
    }

    // Save to Supabase — must be awaited before response; Vercel terminates on response exit
    await saveToSupabase(imageBuffer, result, fields).catch((err) => {
      console.error('[SCAN] saveToSupabase threw unexpectedly:', err instanceof Error ? err.message : err);
    });

    // Strip internal confidence field before returning
    const { confidence: _conf, ...scanResult } = result;
    void _conf;

    return Response.json({ success: true, result: scanResult as BreedScanResult } satisfies ScanAPIResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SCAN] Route error:', msg);
    return Response.json({ success: false, error: msg } satisfies ScanAPIResponse, { status: 500 });
  }
}

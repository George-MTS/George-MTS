import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { anthropic } from '@/lib/anthropic';
import { bufferToBase64 } from '@/lib/utils';
import { checkAndIncrement } from '@/lib/usageCounter';
import { IS_TEST_MODE, MOCK_SCAN_RESULT } from '@/lib/mockData';
import type { BreedScanResult, ScanAPIResponse } from '@/types';

export const maxDuration = 60;

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
  const sizeMB = bytes.byteLength / (1024 * 1024);

  const pipeline = sharp(bytes, { failOn: 'none' });
  if (sizeMB > 5) {
    pipeline.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true });
  }
  return pipeline.rotate().jpeg({ quality: 85 }).toBuffer();
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

    const name = (formData.get('name') as string) || '';
    const size = (formData.get('size') as string) || '';
    const weight = (formData.get('weight') as string) || '';
    const coat = (formData.get('coat') as string) || '';
    const ears = (formData.get('ears') as string) || '';
    const energy = (formData.get('energy') as string) || '';
    const birthday = (formData.get('birthday') as string) || '';

    const context = [
      name && `Name: ${name}`,
      birthday && `Birthday: ${birthday}`,
      size && `Size: ${size}`,
      weight && `Weight: ${weight}`,
      coat && `Coat type: ${coat}`,
      ears && `Ear type: ${ears}`,
      energy && `Energy level: ${energy}`,
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

    // Strip internal confidence field before returning (not part of BreedScanResult schema)
    const { confidence: _conf, ...scanResult } = result;
    void _conf;

    return Response.json({ success: true, result: scanResult as BreedScanResult } satisfies ScanAPIResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: msg } satisfies ScanAPIResponse, { status: 500 });
  }
}

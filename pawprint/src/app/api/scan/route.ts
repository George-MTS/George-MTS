import { NextRequest } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { bufferToBase64 } from '@/lib/utils';
import { checkAndIncrement } from '@/lib/usageCounter';
import type { BreedScanResult, ScanAPIResponse } from '@/types';

const SYSTEM_PROMPT = `You are an expert veterinarian and animal breed specialist. Analyse this pet photo and return a JSON object with these fields: primary_breed, secondary_breed (if mixed), breed_percentage (e.g. "65% Labrador, 35% Husky"), coat_description, estimated_age_range, size_category, typical_temperament, common_health_considerations, fun_fact. Keep all descriptions friendly, warm and engaging — not clinical.

CRITICAL: Respond ONLY with a valid JSON object. No preamble. No markdown. No backticks. Just raw JSON starting with { and ending with }.`;

async function callClaude(base64: string, mime: string, context: string): Promise<BreedScanResult> {
  const safeMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mime) ? mime : 'image/jpeg';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: safeMime as 'image/jpeg', data: base64 },
          },
          {
            type: 'text',
            text: `Analyse this pet photo and return the breed profile JSON.\n\nOwner-provided context:\n${context}\n\nReturn ONLY raw JSON.`,
          },
        ],
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected Claude response type');

  let text = content.text.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();

  return JSON.parse(text) as BreedScanResult;
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

    const buffer = await imageFile.arrayBuffer();
    const base64 = bufferToBase64(buffer);

    const name = formData.get('name') as string || '';
    const size = formData.get('size') as string || '';
    const weight = formData.get('weight') as string || '';
    const coat = formData.get('coat') as string || '';
    const ears = formData.get('ears') as string || '';
    const energy = formData.get('energy') as string || '';
    const birthday = formData.get('birthday') as string || '';

    const context = [
      name && `Name: ${name}`,
      birthday && `Birthday: ${birthday}`,
      size && `Size: ${size}`,
      weight && `Weight: ${weight}`,
      coat && `Coat type: ${coat}`,
      ears && `Ear type: ${ears}`,
      energy && `Energy level: ${energy}`,
    ].filter(Boolean).join('\n');

    let result: BreedScanResult;
    try {
      result = await callClaude(base64, imageFile.type, context);
    } catch {
      result = await callClaude(base64, imageFile.type, context);
    }

    return Response.json({ success: true, result } satisfies ScanAPIResponse);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: msg } satisfies ScanAPIResponse, { status: 500 });
  }
}

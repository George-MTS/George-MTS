import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { createServiceClient } from '@/lib/supabase';
import { anthropic } from '@/lib/anthropic';
import { bufferToBase64 } from '@/lib/utils';
import type { AIAnalysisResult, AnalyseAPIResponse } from '@/types';

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

{
  "breedIdentified": "English Springer Spaniel",
  "confidence": 94,
  "origin": "England, United Kingdom",
  "temperament": "3-4 sentence description of personality, energy, loyalty, and family behaviour",
  "careNotes": "3-4 sentences on exercise, grooming, diet, and health issues to watch for",
  "traits": [
    {"label": "Energy Level", "value": "Very High"},
    {"label": "Good with Kids", "value": "Excellent"},
    {"label": "Coat Type", "value": "Medium, wavy, feathered"},
    {"label": "Size Category", "value": "Medium (18–25 kg)"},
    {"label": "Trainability", "value": "Excellent — highly intelligent"},
    {"label": "Average Lifespan", "value": "12–14 years"},
    {"label": "Shedding", "value": "Moderate — year round"},
    {"label": "Hypoallergenic", "value": "No"}
  ],
  "funFact": "One surprising or little-known fact about this specific breed",
  "similarBreeds": ["Welsh Springer Spaniel", "Cocker Spaniel", "Field Spaniel"]
}`;

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

function validateMimeType(mime: string): void {
  // Browsers sometimes report HEIC as 'application/octet-stream' — we let sharp handle that.
  // Only hard-reject types we know are unprocessable.
  const lower = mime.toLowerCase();
  if (lower && !SUPPORTED_TYPES.has(lower) && !lower.startsWith('application/octet-stream')) {
    throw new Error('Please upload a JPG or PNG photo');
  }
}

async function convertToJpeg(buffer: ArrayBuffer, mimeType: string): Promise<Buffer> {
  validateMimeType(mimeType);

  const bytes = Buffer.from(buffer);
  const sizeMB = bytes.byteLength / (1024 * 1024);

  const pipeline = sharp(bytes, {
    // Needed for HEIC/HEIF decoding on some platforms
    failOn: 'none',
  });

  if (sizeMB > 5) {
    pipeline.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true });
  }

  return pipeline.rotate().jpeg({ quality: 85 }).toBuffer();
}

async function callClaude(base64: string, userMessage: string): Promise<AIAnalysisResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
          },
          { type: 'text', text: userMessage },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  let jsonText = content.text.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonText = fenceMatch[1].trim();

  // Isolate the first JSON object in case Claude added any preamble
  const objMatch = jsonText.match(/\{[\s\S]*\}/);
  if (objMatch) jsonText = objMatch[0];

  try {
    return JSON.parse(jsonText) as AIAnalysisResult;
  } catch (parseErr) {
    console.error('[ANALYSE] Claude returned non-JSON response:', content.text);
    throw new Error('AI returned an unexpected response — please try again');
  }
}

export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();

    const imageFile = formData.get('image') as File | null;
    if (!imageFile) {
      return Response.json({ success: false, error: 'No image provided' } satisfies AnalyseAPIResponse, { status: 400 });
    }

    const petType = (formData.get('petType') as string) || 'dog';
    const breed = (formData.get('breed') as string) || '';
    const age = (formData.get('age') as string) || '';
    const petName = (formData.get('petName') as string) || '';
    const origin = (formData.get('origin') as string) || '';
    const ownerName = (formData.get('ownerName') as string) || '';
    const twitter = (formData.get('twitter') as string) || '';
    const traits = (formData.get('traits') as string) || '';

    const rawBuffer = await imageFile.arrayBuffer();
    let imageBuffer: Buffer;
    try {
      imageBuffer = await convertToJpeg(rawBuffer, imageFile.type);
    } catch (convErr) {
      const msg = convErr instanceof Error ? convErr.message : 'Unsupported image format';
      return Response.json({ success: false, error: msg } satisfies AnalyseAPIResponse, { status: 415 });
    }
    const base64Image = bufferToBase64(imageBuffer.buffer as ArrayBuffer);

    const userMessage = `Look carefully at this pet photo. Take your time to examine all visible features before responding.

Owner provided details:
- Pet type: ${petType}
- Pet name: ${petName || 'Not provided'}
- Breed (owner's guess): ${breed || 'Not provided'}
- Age: ${age || 'Not provided'}
- Origin/Country: ${origin || 'Not provided'}
- Traits/Notes: ${traits || 'Not provided'}

Provide a full breed analysis as JSON.`;

    let aiResult = await callClaude(base64Image, userMessage);

    // Retry if low confidence
    if (aiResult.confidence < 60) {
      console.log(`[ANALYSE] Low confidence (${aiResult.confidence}%), retrying`);
      try {
        const retry = await callClaude(base64Image, LOW_CONFIDENCE_RETRY);
        if (retry.confidence > aiResult.confidence) aiResult = retry;
      } catch { /* keep original result */ }
    }

    const supabaseAdmin = createServiceClient();
    const filename = `${Date.now()}_${uuidv4()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('pet-photos')
      .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabaseAdmin.storage.from('pet-photos').getPublicUrl(uploadData.path);
    const imageUrl = publicUrlData.publicUrl;

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('submissions')
      .insert({
        pet_type: petType,
        pet_name: petName || null,
        breed_provided: breed || null,
        age: age || null,
        origin: origin || null,
        owner_name: ownerName || null,
        twitter_handle: twitter || null,
        traits_notes: traits || null,
        image_url: imageUrl,
        ai_breed_identified: aiResult.breedIdentified,
        ai_confidence: aiResult.confidence,
        ai_temperament: aiResult.temperament,
        ai_care_notes: aiResult.careNotes,
        ai_traits: aiResult.traits,
        ai_fun_fact: aiResult.funFact,
        ai_origin: aiResult.origin,
        raw_ai_response: aiResult,
      })
      .select('id')
      .single();

    if (insertError) console.error('DB insert error:', insertError);

    return Response.json({
      success: true,
      submissionId: insertData?.id,
      imageUrl,
      result: aiResult,
    } satisfies AnalyseAPIResponse);
  } catch (error) {
    console.error('Analyse route error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ success: false, error: message } satisfies AnalyseAPIResponse, { status: 500 });
  }
}

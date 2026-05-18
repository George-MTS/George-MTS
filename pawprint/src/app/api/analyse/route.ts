import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createServiceClient } from '@/lib/supabase';
import { anthropic } from '@/lib/anthropic';
import { bufferToBase64 } from '@/lib/utils';
import type { AIAnalysisResult, AnalyseAPIResponse } from '@/types';

const SYSTEM_PROMPT = `You are PawPrint AI, the world's most knowledgeable expert in dog and cat breeds, animal behaviour, veterinary care, and pet origins.

The user has submitted a photo of their pet along with optional details. Your job is to:
1. Analyse the photo carefully for visual breed characteristics (coat, body shape, ears, tail, size, markings)
2. Cross-reference with any details provided by the owner
3. Return a comprehensive breed profile

CRITICAL: Respond ONLY with a valid JSON object. No preamble. No markdown. No backticks. No explanation. Just raw JSON.

JSON format:
{
  "breedIdentified": "Full official breed name or most likely mix",
  "confidence": 82,
  "origin": "Country or region this breed originates from",
  "temperament": "3-4 sentence description of this breed's typical personality, energy level, loyalty, and behaviour with families",
  "careNotes": "3-4 sentences covering exercise needs, grooming requirements, diet considerations, and common health issues to watch for",
  "traits": [
    {"label": "Energy Level", "value": "High"},
    {"label": "Good with Kids", "value": "Yes"},
    {"label": "Coat Type", "value": "Double coat, medium length"},
    {"label": "Size Category", "value": "Large (25-35kg)"},
    {"label": "Trainability", "value": "Excellent — eager to please"},
    {"label": "Average Lifespan", "value": "10–12 years"},
    {"label": "Shedding", "value": "Heavy — seasonal"},
    {"label": "Hypoallergenic", "value": "No"}
  ],
  "funFact": "One surprising or little-known fact about this breed",
  "similarBreeds": ["Breed 1", "Breed 2"]
}`;

async function callClaude(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
  userMessage: string,
  strict = false
): Promise<AIAnalysisResult> {
  const prompt = strict
    ? `${userMessage}\n\nCRITICAL REMINDER: You MUST return ONLY raw JSON. No text before or after. No markdown code fences. Start your response with { and end with }.`
    : userMessage;

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
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let jsonText = content.text.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonText) as AIAnalysisResult;
  return parsed;
}

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

    const supabaseAdmin = createServiceClient();

    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = bufferToBase64(imageBuffer);
    const mimeType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const safeMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)
      ? mimeType
      : 'image/jpeg';

    const filename = `${Date.now()}_${uuidv4()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('pet-photos')
      .upload(filename, imageBuffer, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('pet-photos')
      .getPublicUrl(uploadData.path);

    const imageUrl = publicUrlData.publicUrl;

    const userMessage = `Please analyse this ${petType} photo.
Owner provided details:
- Pet name: ${petName || 'Not provided'}
- Breed (owner's guess): ${breed || 'Not provided'}
- Age: ${age || 'Not provided'}
- Origin/Country: ${origin || 'Not provided'}
- Traits/Notes: ${traits || 'Not provided'}

Provide a full breed analysis as JSON.`;

    let aiResult: AIAnalysisResult;
    try {
      aiResult = await callClaude(base64Image, safeMime, userMessage, false);
    } catch {
      aiResult = await callClaude(base64Image, safeMime, userMessage, true);
    }

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

    if (insertError) {
      console.error('DB insert error:', insertError);
    }

    const response: AnalyseAPIResponse = {
      success: true,
      submissionId: insertData?.id,
      imageUrl,
      result: aiResult,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Analyse route error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { success: false, error: message } satisfies AnalyseAPIResponse,
      { status: 500 }
    );
  }
}

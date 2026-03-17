import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropic = new Anthropic()

const FEATURES = [
  'Burj View', 'Sea View', 'City View', 'Golf View', 'Pool View', 'Marina View',
  'Private Pool', 'Shared Pool', 'Private Garden', 'Balcony', 'Terrace',
  'Gym', 'Spa', 'Concierge', 'Security', 'Smart Home',
  'Fully Furnished', 'Semi-Furnished', 'Unfurnished',
  "Maid's Room", 'Study Room', 'Storage',
  'Near Metro', 'Near Mall', 'Near Beach', 'Near School',
  'Freehold', 'PHPP Available', 'Post-Handover Payment',
]

const COMMUNITIES = [
  'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'JVC', 'JBR', 'DIFC',
  'Business Bay', 'Arabian Ranches', 'Meydan', 'Jumeirah', 'Al Barsha',
  'Dubai Hills', 'Creek Harbour', 'Emaar Beachfront', 'MBR City', 'Dubai South',
  'Damac Hills', 'Town Square', 'Sobha Hartland', 'Al Furjan', 'Silicon Oasis',
  'International City', 'Sports City', 'Motor City', 'Jumeirah Lake Towers',
]

export async function POST(request: Request) {
  const formData = await request.formData()
  const audioFile = formData.get('audio') as File | null

  if (!audioFile) {
    return Response.json({ error: 'No audio provided' }, { status: 400 })
  }

  // Step 1 — Transcribe with OpenAI Whisper
  let rawTranscript: string
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      prompt: 'UAE real estate: Dubai Marina, Downtown, Palm Jumeirah, JVC, Emaar, DAMAC, Nakheel, villa, apartment, AED, sqft, bedrooms, bathrooms',
    })
    rawTranscript = transcription.text.trim()
  } catch {
    return Response.json({ error: 'Transcription failed. Please try again.' }, { status: 500 })
  }

  if (!rawTranscript) {
    return Response.json({ error: 'No speech detected. Please try again.' }, { status: 400 })
  }

  // Step 2 — Parse with Claude
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a UAE real estate data parser.

Extract listing details from this transcript into structured JSON. The transcript was already captured via Whisper — correct any remaining UAE-specific mishearings (place names, developer names, number formats).

Transcript: "${rawTranscript}"

Return ONLY valid JSON with this exact structure (use null for anything not mentioned):
{
  "transcript": "the corrected, readable version of what was said",
  "property_type": one of [villa, apartment, townhouse, penthouse, office, retail, warehouse] or null,
  "listing_type": "sale" or "rent" (default "sale" if unclear),
  "bedrooms": integer or null,
  "bathrooms": integer or null,
  "parking": integer or null,
  "floor_number": string or null,
  "size_sqft": number or null,
  "price_aed": number or null,
  "community": best match from [${COMMUNITIES.join(', ')}] or null,
  "building_name": string or null,
  "developer": string or null,
  "handover_date": string or null,
  "features": array of matching items from [${FEATURES.join(', ')}] or [],
  "tone": "professional" or "luxury" or "investment",
  "additional_notes": string or null
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return Response.json({ error: 'Unexpected response from AI' }, { status: 500 })
  }

  try {
    // Strip markdown code fences Claude sometimes wraps around JSON
    const raw = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const result = JSON.parse(raw)
    const { transcript: corrected, ...parsed } = result
    return Response.json({ parsed, transcript: corrected ?? rawTranscript })
  } catch {
    return Response.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}

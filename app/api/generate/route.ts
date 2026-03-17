import Anthropic from '@anthropic-ai/sdk'

interface PropertyData {
  property_type: string
  listing_type?: string
  bedrooms?: number
  bathrooms?: number
  parking?: number
  floor_number?: number
  size_sqft?: number
  price_aed: number
  community?: string
  building_name?: string
  developer?: string
  handover_date?: string
  features?: string[]
  tone?: string
  additional_notes?: string
}

function buildPropertyDescription(data: PropertyData): string {
  const lines = [
    `Property Type: ${data.property_type}`,
    `Listing Type: ${data.listing_type === 'rent' ? 'For Rent' : 'For Sale'}`,
    data.bedrooms ? `Bedrooms: ${data.bedrooms}` : null,
    data.bathrooms ? `Bathrooms: ${data.bathrooms}` : null,
    data.parking ? `Parking: ${data.parking} space(s)` : null,
    data.size_sqft
      ? `Size: ${data.size_sqft.toLocaleString()} sqft (${Math.round(data.size_sqft * 0.0929).toLocaleString()} sqm)`
      : null,
    `Price: AED ${Number(data.price_aed).toLocaleString()}${data.listing_type === 'rent' ? '/year' : ''}`,
    data.community ? `Community: ${data.community}` : null,
    data.building_name ? `Building/Tower: ${data.building_name}` : null,
    data.developer ? `Developer: ${data.developer}` : null,
    data.handover_date ? `Handover: ${data.handover_date}` : null,
    data.features?.length ? `Key Features: ${data.features.join(', ')}` : null,
    data.additional_notes ? `Additional Notes: ${data.additional_notes}` : null,
  ].filter(Boolean)
  return lines.join('\n')
}

function getStyleContext(tone: string): string {
  switch (tone) {
    case 'luxury':
      return `You write in the style of Engel & Völkers and Hamptons International Dubai — luxury editorial, aspirational, lifestyle-forward. Think high-end magazine feature. The reader should feel the property before they see the specs.

Style rules:
- Open with a vision statement — NOT a generic "proud to present" opener
- Embed specs within narrative prose (never as a raw standalone list in the full listing)
- Room-by-room atmospheric walkthrough: each key space gets a mood descriptor
- The property's views are the primary emotional anchor — describe them cinematically
- Elevated vocabulary: meticulously redesigned, resort-style, impeccable, bespoke, haven, refined, curated, spa-like, nestled, panoramic, architectural marvel, unparalleled, seamlessly
- Avoid overused words: "stunning" (use sparingly), "spacious" (replace with "expansive" or "generous"), "luxury" as a generic adjective
- Experiential verbs: indulge, experience, entertain, discover, unwind
- CTA tone: invitation to experience, not urgency — "arrange a private viewing"
- Full listing target: 300–400 words`

    case 'investment':
      return `You write in the style of Provident Estate and fäm Properties investment listings — ROI-first, metrics-heavy, conviction-driven. Written for buyers who open a spreadsheet before a floor plan.

Style rules:
- Lead with the investment thesis: yield potential, rental demand context, capital appreciation trajectory
- If tenanted (from additional notes), state: "Currently tenanted at AED X/year — generating X% gross yield"
- If vacant, state: "Vacant — ready to generate income from day one"
- Specs are brief and precise — investors know what they're buying
- Include market context: area rental demand, developer reputation, community growth
- Handover/off-plan angle if relevant: "Pre-handover entry point — ideal for capital appreciation play"
- Exit strategy sentence: capital growth projection OR payment plan flexibility
- Minimal lifestyle language — replace with performance language
- Urgency is explicit: "call now to secure", "limited availability", "motivated seller"
- Short, declarative sentences. Numbers are the hero: percentages, AED figures, sq ft, service charges
- Full listing target: 150–200 words`

    default: // professional — Agency Pro style (Betterhomes / Allsopp & Allsopp / Espace)
      return `You write in the dominant Dubai agency voice modelled on Betterhomes, Allsopp & Allsopp, and Espace Real Estate — data-forward, structured, professional trust-building. Written like a well-organized briefing note.

Style rules:
- Open with: "We are proud to present this [X]-bedroom [property type] in [Building/Community]." (or "delighted to present" — alternate)
- Second sentence: lead specification — BUA in sq ft, bedrooms, bathrooms, parking, floor (if relevant)
- Feature inventory paragraph: comma or dash-separated feature list in prose form
- Amenity paragraph: building-level and community-level facilities
- Location context: proximity to key roads, metro, malls, schools (X minutes away)
- Close with dual-appeal line: "An ideal choice for both end-users and investors alike."
- CTA: "Contact us now to arrange a viewing or make an offer."
- Vocabulary: Vacant, Exclusive, Upgraded, Prime, Modern, Fully Fitted, Rare Find, Brand New, Corner Unit, High Floor, Motivated Seller, Vacant on Transfer
- Avoid flowery language — be factual and precise
- Full listing target: 180–240 words`
  }
}

function buildPrompt(data: PropertyData): string {
  const propertyDescription = buildPropertyDescription(data)
  const tone = data.tone || 'professional'
  const styleContext = getStyleContext(tone)
  const communityTag = data.community?.replace(/\s+/g, '') ?? 'Dubai'

  // Compute estimated yield for investment tone if enough data
  let yieldNote = ''
  if (tone === 'investment' && data.price_aed && data.size_sqft) {
    const estAnnualRent = Math.round(data.price_aed * 0.065) // ~6.5% Dubai avg
    yieldNote = `\nEstimated gross yield reference (if not specified in additional notes): ~${((estAnnualRent / data.price_aed) * 100).toFixed(1)}% based on Dubai market averages.`
  }

  return `You are an elite UAE real estate copywriter. You have studied how the top agencies in Dubai write listings — Betterhomes, Allsopp & Allsopp, Engel & Völkers, Espace, Hamptons International, and Provident Estate. You know what works on Bayut and Property Finder.

${styleContext}${yieldNote}

Property details:
${propertyDescription}

Generate exactly the following outputs in JSON format. Each output must reflect the style rules above consistently.

{
  "en_listing": "Full English property listing. Apply the style rules above precisely. Do NOT use generic filler. Every sentence must earn its place. No 'stunning' overuse. The title card (pipe-separated) goes on its own first line, then the listing body starts on the next line.",

  "ar_listing": "نص إعلان عقاري كامل باللغة العربية الفصحى (3-4 فقرات). يجب أن يكون النص طبيعياً وجذاباً، موجهاً للمشتري أو المستأجر العربي مع مراعاة الثقافة المحلية. ليس مجرد ترجمة حرفية — اكتب من جديد بأسلوب عربي أصيل.",

  "compact_listing": "A tight 80-110 word portal-ready version of the listing. Preserve the 3 strongest selling points. One short paragraph. No wasted words. Ends with a clear call to action. Same tone/style as the full listing but compressed.",

  "highlight_bullets": "Key property highlights as a clean bullet list. Format: exactly 6-8 bullet points starting with '•'. Each bullet is a complete fact or USP (e.g. '• Full Marina view from living room and master bedroom', '• 1,247 sq ft BUA across an open-plan layout'). No fluff, no repetition. Suitable for the 'Key Features' section on Bayut/Property Finder.",

  "headline_title": "A pipe-separated listing title card following the Dubai agency convention. Format: [Beds/Type] | [Condition/Status] | [View or Key Feature] | [Location Hook] | [Investment or Lifestyle Angle]. Example: '2BR | Full Marina View | Fully Furnished | Vacant Now | High ROI'. Maximum 5 pipe-separated segments. All caps for each segment. Make it scannable and click-worthy.",

  "whatsapp_text": "WhatsApp-ready broker message (max 150 words). Start with a property emoji, then key specs as emoji-bulleted lines (🛏 🚿 📐 💰), price prominently, then 2-sentence lifestyle or investment pitch, then CTA. Professional broker tone — not salesy.",

  "instagram_caption": "Instagram caption (max 120 words of body text, then hashtags on new lines). Aspirational tone matching the listing style. End body with a CTA. Then add 18-22 relevant hashtags on the next line including #DubaiRealEstate #UAE #${communityTag} #PropertyFinder #Bayut and property-specific tags."
}

Return only valid JSON, no markdown code blocks, no extra text.`
}

export async function POST(request: Request) {
  let body: PropertyData
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.property_type || !body.price_aed) {
    return Response.json({ error: 'property_type and price_aed are required' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'placeholder') {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Please add your API key to .env.local' },
      { status: 503 }
    )
  }

  const client = new Anthropic({ apiKey })
  const prompt = buildPrompt(body)

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return Response.json({ error: 'Unexpected response type from AI' }, { status: 500 })
    }

    let generated: Record<string, string>
    try {
      const raw = content.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      generated = JSON.parse(raw)
    } catch {
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const listing = {
      id: 'preview',
      ...body,
      listing_type: body.listing_type ?? 'sale',
      tone: body.tone ?? 'professional',
      status: 'draft',
      portals_published: [] as string[],
      ...generated,
    }

    return Response.json({ listing })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI generation failed'
    return Response.json({ error: message }, { status: 500 })
  }
}

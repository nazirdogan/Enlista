import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

function buildPrompt(data: PropertyData, includeAllPlatforms: boolean): string {
  const propertyDescription = buildPropertyDescription(data)
  const tone = data.tone || 'professional'
  const styleContext = getStyleContext(tone)
  const communityTag = data.community?.replace(/\s+/g, '') ?? 'Dubai'

  const socialCopySpec = includeAllPlatforms
    ? `
  "whatsapp_text": "WhatsApp-ready broker message (max 150 words). Start with a property emoji, then key specs as emoji-bulleted lines (🛏 🚿 📐 💰), price prominently, then 2-sentence lifestyle or investment pitch, then CTA. Professional broker tone — not salesy.",

  "instagram_caption": "Instagram caption (max 120 words of body text, then hashtags on new lines). Aspirational tone matching the listing style. End body with a CTA. Then add 18-22 relevant hashtags on the next line including #DubaiRealEstate #UAE #${communityTag} #PropertyFinder #Bayut and property-specific tags.",`
    : ''

  return `You are an elite UAE real estate copywriter. You have studied how the top agencies in Dubai write listings — Betterhomes, Allsopp & Allsopp, Engel & Völkers, Espace, Hamptons International, and Provident Estate. You know what works on Bayut and Property Finder.

${styleContext}

Property details:
${propertyDescription}

Generate exactly the following outputs in JSON format. Each output must reflect the style rules above consistently.

{
  "en_listing": "Full English property listing. Apply the style rules above precisely. Do NOT use generic filler. Every sentence must earn its place. No 'stunning' overuse. The title card (pipe-separated) goes on its own first line, then the listing body starts on the next line.",

  "ar_listing": "نص إعلان عقاري كامل باللغة العربية الفصحى (3-4 فقرات). يجب أن يكون النص طبيعياً وجذاباً، موجهاً للمشتري أو المستأجر العربي مع مراعاة الثقافة المحلية. ليس مجرد ترجمة حرفية — اكتب من جديد بأسلوب عربي أصيل.",

  "compact_listing": "A tight 80-110 word portal-ready version of the listing. Preserve the 3 strongest selling points. One short paragraph. No wasted words. Ends with a clear call to action. Same tone/style as the full listing but compressed.",

  "highlight_bullets": "Key property highlights as a clean bullet list. Format: exactly 6-8 bullet points starting with '•'. Each bullet is a complete fact or USP (e.g. '• Full Marina view from living room and master bedroom', '• 1,247 sq ft BUA across an open-plan layout'). No fluff, no repetition. Suitable for the 'Key Features' section on Bayut/Property Finder.",

  "headline_title": "A pipe-separated listing title card following the Dubai agency convention. Format: [Beds/Type] | [Condition/Status] | [View or Key Feature] | [Location Hook] | [Investment or Lifestyle Angle]. Example: '2BR | Full Marina View | Fully Furnished | Vacant Now | High ROI'. Maximum 5 pipe-separated segments. All caps for each segment. Make it scannable and click-worthy.",${socialCopySpec}
}

Return only valid JSON, no markdown code blocks, no extra text.`
}

// ─── Credit helpers ───────────────────────────────────────────────────────────

interface AgencyCredits {
  id: string
  plan: string
  account_status: string
  trial_ends_at: string | null
  listing_credits: number
  credits_remaining: number
  extra_credits: number
  credits_reset_at: string | null
}

function getPlanLimit(plan: string): number {
  switch (plan) {
    case 'free':       return 1
    case 'plus':       return 5
    case 'pro':        return 15
    case 'enterprise': return 9999
    default:           return 1
  }
}

async function checkAndDecrementCredits(userId: string): Promise<
  | { ok: true; plan: string; creditsRemaining: number; extraCredits: number }
  | { ok: false; error: string; creditsRemaining: number; extraCredits: number; trialExpired?: boolean; upgradeRequired?: boolean }
> {
  const db = createAdminClient()

  const { data: agency, error: fetchErr } = await db
    .from('agencies')
    .select('id, plan, account_status, trial_ends_at, credits_remaining, extra_credits, listing_credits, credits_reset_at')
    .eq('user_id', userId)
    .single<AgencyCredits>()

  if (fetchErr || !agency) {
    return { ok: false, error: 'Agency not found', creditsRemaining: 0, extraCredits: 0 }
  }

  // ── Trial status check ────────────────────────────────────────────────────
  if (agency.account_status === 'trial') {
    const now = new Date()
    const trialEnds = agency.trial_ends_at ? new Date(agency.trial_ends_at) : null
    if (trialEnds && now > trialEnds) {
      await db.from('agencies').update({ account_status: 'trial_expired' }).eq('id', agency.id)
      return {
        ok: false,
        error: 'Your 30-day free trial has expired. Upgrade to keep generating listings.',
        creditsRemaining: 0,
        extraCredits: 0,
        trialExpired: true,
      }
    }
  } else if (agency.account_status === 'trial_expired' || agency.account_status === 'cancelled') {
    return {
      ok: false,
      error: 'Your account does not have an active subscription. Please upgrade to continue.',
      creditsRemaining: 0,
      extraCredits: 0,
      upgradeRequired: true,
    }
  }

  // Auto-reset if we've rolled into a new calendar month
  let creditsRemaining = agency.credits_remaining
  const resetAt = agency.credits_reset_at ? new Date(agency.credits_reset_at) : null
  const now = new Date()
  if (!resetAt || (resetAt.getFullYear() < now.getFullYear()) ||
      (resetAt.getFullYear() === now.getFullYear() && resetAt.getMonth() < now.getMonth())) {
    creditsRemaining = getPlanLimit(agency.plan)
    await db
      .from('agencies')
      .update({ credits_remaining: creditsRemaining, credits_reset_at: now.toISOString() })
      .eq('id', agency.id)
  }

  // Deduct listing_credits (referral credits) first before monthly quota
  if (agency.listing_credits > 0) {
    const { error: updateErr } = await db
      .from('agencies')
      .update({ listing_credits: agency.listing_credits - 1 })
      .eq('id', agency.id)
    if (updateErr) {
      console.error('Failed to decrement listing_credits:', updateErr)
      return { ok: false, error: 'Failed to update credits', creditsRemaining, extraCredits: agency.extra_credits }
    }
    return { ok: true, plan: agency.plan, creditsRemaining, extraCredits: agency.extra_credits }
  }

  const totalCredits = creditsRemaining + agency.extra_credits

  if (totalCredits <= 0) {
    return {
      ok: false,
      error: 'No listing credits remaining. Purchase more credits or upgrade your plan.',
      creditsRemaining,
      extraCredits: agency.extra_credits,
    }
  }

  // Deduct: use monthly credits first, then extra credits
  let newMonthly = creditsRemaining
  let newExtra = agency.extra_credits
  if (newMonthly > 0) {
    newMonthly -= 1
  } else {
    newExtra -= 1
  }

  const { error: updateErr } = await db
    .from('agencies')
    .update({ credits_remaining: newMonthly, extra_credits: newExtra })
    .eq('id', agency.id)

  if (updateErr) {
    console.error('Failed to decrement credits:', updateErr)
    return { ok: false, error: 'Failed to update credits', creditsRemaining, extraCredits: agency.extra_credits }
  }

  return { ok: true, plan: agency.plan, creditsRemaining: newMonthly, extraCredits: newExtra }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const isDev = process.env.NODE_ENV === 'development'
  let userId: string | null = null

  if (isDev && process.env.DEV_USER_ID) {
    userId = process.env.DEV_USER_ID
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    userId = user.id
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: PropertyData
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.property_type || !body.price_aed) {
    return Response.json({ error: 'property_type and price_aed are required' }, { status: 400 })
  }

  // ── Credit check & decrement ──────────────────────────────────────────────
  const creditResult = await checkAndDecrementCredits(userId)
  if (!creditResult.ok) {
    // Use 403 for trial/auth blocks, 402 for out-of-credits
    const status = (creditResult.trialExpired || creditResult.upgradeRequired) ? 403 : 402
    return Response.json(
      {
        error: creditResult.error,
        creditsRemaining: creditResult.creditsRemaining,
        extraCredits: creditResult.extraCredits,
        outOfCredits: !creditResult.trialExpired && !creditResult.upgradeRequired,
        ...(creditResult.trialExpired && { trialExpired: true }),
        ...(creditResult.upgradeRequired && { upgradeRequired: true }),
      },
      { status }
    )
  }

  // ── AI generation ─────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'placeholder') {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Please add your API key to .env.local' },
      { status: 503 }
    )
  }

  const userPlan = creditResult.plan
  const includeAllPlatforms = userPlan === 'pro' || userPlan === 'enterprise'

  const client = new Anthropic({ apiKey })
  const prompt = buildPrompt(body, includeAllPlatforms)

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

    // Enforce platform gating — strip social copy for free/plus regardless of what AI returned
    if (!includeAllPlatforms) {
      delete generated.whatsapp_text
      delete generated.instagram_caption
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

    return Response.json({
      listing,
      // Return updated credit counts so the UI can refresh without a separate fetch
      creditsRemaining: creditResult.creditsRemaining,
      extraCredits: creditResult.extraCredits,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI generation failed'
    return Response.json({ error: message }, { status: 500 })
  }
}

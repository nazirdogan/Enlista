import { NextRequest, NextResponse } from "next/server"
import { stripe, CREDIT_PACKS, CreditPackKey } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { pack } = await req.json()

    if (!pack || !(pack in CREDIT_PACKS)) {
      return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 })
    }

    // Get authenticated user's agency
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 400 })
    }

    const selectedPack = CREDIT_PACKS[pack as CreditPackKey]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    // One-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: selectedPack.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?credits=purchased`,
      cancel_url: `${appUrl}/dashboard`,
      payment_intent_data: {
        metadata: {
          type: "credit_pack",
          pack,
          agency_id: agency.id,
          credits: String(selectedPack.credits),
        },
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Buy credits checkout error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

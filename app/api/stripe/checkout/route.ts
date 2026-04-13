import { NextRequest, NextResponse } from "next/server"
import { stripe, PLANS, PlanKey } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { plan, billing = "monthly" } = await req.json()

    // Resolve to annual variant key when billing=annual
    const planKey: PlanKey = billing === "annual" && (plan === "plus" || plan === "pro")
      ? (`${plan}_annual` as PlanKey)
      : (plan as PlanKey)

    if (!planKey || !(planKey in PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Get authenticated user's agency_id
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

    const selectedPlan = PLANS[planKey]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    // Check if this agency already has an active or trialing subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('agency_id', agency.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle()

    const isNewSubscriber = !existingSub

    // ── Calculated Trial: Use remaining days from user's original 30-day trial ────
    // Instead of giving a fixed 14-day trial in Stripe, calculate how many days
    // are left from the user's original signup trial. This ensures they're charged
    // on the same date regardless of when they upgrade.
    //
    // Example:
    //   User signs up: trial_ends_at = May 13
    //   User upgrades on day 5 (April 18): days_remaining = 25
    //   Charged: May 13 (same date as if no upgrade)
    //
    // Example (expired):
    //   User signs up: trial_ends_at = May 13
    //   User upgrades on day 40 (May 23): days_remaining = negative
    //   Charged: immediately (0 days trial)
    let trialDays: number | undefined
    if (isNewSubscriber) {
      const { data: agencyTrial } = await supabase
        .from('agencies')
        .select('trial_started_at, trial_ends_at')
        .eq('id', agency.id)
        .single()

      if (agencyTrial?.trial_ends_at) {
        const now = new Date()
        const trialEnd = new Date(agencyTrial.trial_ends_at)
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Only apply trial if days remaining > 0; otherwise charge immediately
        // Using Math.max(0, ...) || undefined ensures:
        // - Positive days: passed to Stripe
        // - Zero or negative: omitted (Stripe charges immediately)
        trialDays = Math.max(0, daysRemaining) || undefined
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=${isNewSubscriber ? 'trial' : 'success'}`,
      cancel_url: `${appUrl}/pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        ...(trialDays ? { trial_period_days: trialDays } : {}),
        metadata: {
          plan,
          billing,
          agency_id: agency.id,
          plan_amount: String(selectedPlan.price),
          plan_credits: String(selectedPlan.credits),
          ...(isNewSubscriber && trialDays !== undefined ? { trial_days_calculated: String(trialDays) } : {}),
        },
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

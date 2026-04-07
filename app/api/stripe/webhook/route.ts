import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import Stripe from "stripe"

function getPlanCreditLimit(plan: string): number {
  switch (plan) {
    case 'free':       return 1
    case 'plus':       return 5
    case 'pro':        return 15
    case 'enterprise': return 9999
    default:           return 1
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const db = createAdminClient()

  switch (event.type) {

    // ── New subscription started ────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      // ── Credit pack (one-time payment) ──────────────────────────────────
      if (session.mode === "payment") {
        // Retrieve the payment intent to get our metadata
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent as { id?: string } | null)?.id ?? null

        if (paymentIntentId) {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
          const meta = pi.metadata ?? {}

          if (meta.type === "credit_pack" && meta.agency_id && meta.credits) {
            const creditsToAdd = parseInt(meta.credits, 10)
            const { error: creditErr } = await db.rpc('add_extra_credits', {
              p_agency_id: meta.agency_id,
              p_credits: creditsToAdd,
            })
            if (creditErr) {
              // Fallback: direct update if RPC doesn't exist yet
              console.warn("RPC add_extra_credits failed, using direct update:", creditErr)
              const { data: ag } = await db
                .from('agencies')
                .select('extra_credits')
                .eq('id', meta.agency_id)
                .single()
              if (ag) {
                await db
                  .from('agencies')
                  .update({ extra_credits: (ag.extra_credits ?? 0) + creditsToAdd })
                  .eq('id', meta.agency_id)
              }
            }
          }
        }
        break
      }

      // ── Subscription checkout ────────────────────────────────────────────
      if (!session.subscription) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      const meta = sub.metadata ?? {}
      const agencyId = meta.agency_id
      const plan = meta.plan
      const planAmount = parseInt(meta.plan_amount ?? '0', 10)
      if (!agencyId || !plan) break

      const periodEnd = sub.items.data[0]?.current_period_end

      const customerId = typeof session.customer === 'string'
        ? session.customer
        : (session.customer as { id?: string } | null)?.id ?? null

      if (!customerId) console.warn("checkout.session.completed: no customer ID on session", session.id)

      // Upsert subscription record
      const { error: upsertError } = await db.from('subscriptions').upsert({
        agency_id: agencyId,
        plan,
        plan_amount: planAmount,
        status: sub.status,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        started_at: new Date(sub.start_date * 1000).toISOString(),
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' })

      if (upsertError) {
        console.error("DB upsert failed:", upsertError)
        return NextResponse.json({ error: "DB write failed" }, { status: 500 })
      }

      // Update agency plan + reset credits to the new plan's monthly allowance
      // is_trial stays true while the subscription is trialing; cleared on invoice.paid
      const creditLimit = getPlanCreditLimit(plan)
      const isTrialing = sub.status === 'trialing'
      await db.from('agencies').update({
        plan,
        is_trial: isTrialing,
        account_status: isTrialing ? 'trial' : 'active',
        subscribed_at: isTrialing ? null : new Date().toISOString(),
        credits_remaining: creditLimit,
        credits_reset_at: new Date().toISOString(),
      }).eq('id', agencyId)

      break
    }

    // ── Subscription renewed (invoice paid) — reset monthly credits ────────
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.parent?.subscription_details?.subscription
      if (!subscriptionId) break

      const sub = await stripe.subscriptions.retrieve(String(subscriptionId))
      const agencyId = sub.metadata?.agency_id
      const plan = sub.metadata?.plan
      if (!agencyId || !plan) break

      // Skip free/trial invoices — referral credits should only be awarded on actual payment
      if ((invoice.amount_paid ?? 0) === 0) break

      const creditLimit = getPlanCreditLimit(plan)
      await db.from('agencies').update({
        plan,
        is_trial: false,
        account_status: 'active',
        subscribed_at: new Date().toISOString(),
        credits_remaining: creditLimit,
        credits_reset_at: new Date().toISOString(),
      }).eq('id', agencyId)

      const periodEnd = sub.items.data[0]?.current_period_end
      await db.from('subscriptions').update({
        status: sub.status,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', sub.id)

      // ── Referral credit award ──────────────────────────────────────────────
      const { data: convertedAgency } = await db
        .from('agencies')
        .select('id, name, referred_by_agency_id')
        .eq('id', agencyId)
        .single()

      if (convertedAgency?.referred_by_agency_id) {
        const { data: referral } = await db
          .from('referrals')
          .select('id, credits_awarded')
          .eq('referred_agency_id', agencyId)
          .eq('referrer_agency_id', convertedAgency.referred_by_agency_id)
          .single()

        if (referral && !referral.credits_awarded) {
          const { data: referrer } = await db
            .from('agencies')
            .select('id, email, name, listing_credits')
            .eq('id', convertedAgency.referred_by_agency_id)
            .single()

          if (referrer) {
            const newBalance = (referrer.listing_credits ?? 0) + 10
            await db
              .from('agencies')
              .update({ listing_credits: newBalance })
              .eq('id', referrer.id)

            await db
              .from('referrals')
              .update({
                credits_awarded: true,
                converted_at: new Date().toISOString(),
                credits_awarded_at: new Date().toISOString(),
              })
              .eq('id', referral.id)

            if (referrer.email) {
              const { sendTransactionalEmail } = await import('@/lib/email/resend')
              await sendTransactionalEmail({
                type: 'credits_awarded',
                to: referrer.email,
                agencyName: referrer.name ?? 'your agency',
                credits: 10,
                newBalance,
                referredName: convertedAgency.name ?? 'A new user',
              }).catch(console.error)
            }
          }
        }
      }

      break
    }

    // ── Plan changed (upgrade / downgrade) ─────────────────────────────────
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const periodEnd = sub.items.data[0]?.current_period_end
      const agencyId = sub.metadata?.agency_id
      const plan = sub.metadata?.plan

      await db.from('subscriptions')
        .update({
          status: sub.status,
          plan: plan ?? undefined,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)

      // If plan metadata is present, sync to agency
      if (agencyId && plan) {
        await db.from('agencies').update({ plan }).eq('id', agencyId)
      }

      break
    }

    // ── Subscription cancelled — revert to free ────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const agencyId = sub.metadata?.agency_id

      await db.from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id)

      if (agencyId) {
        await db.from('agencies').update({
          plan: 'free',
          account_status: 'cancelled',
          credits_remaining: 1,
          credits_reset_at: new Date().toISOString(),
        }).eq('id', agencyId)
      }

      break
    }

    // ── Trial ending in 3 days — send reminder email ───────────────────────
    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription
      const agencyId = sub.metadata?.agency_id
      if (!agencyId) break

      const { data: agency } = await db
        .from('agencies')
        .select('email, name')
        .eq('id', agencyId)
        .single()

      if (agency?.email && sub.trial_end) {
        const trialEndDate = new Date(sub.trial_end * 1000)
        const expiresAt = trialEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        const { sendTransactionalEmail } = await import('@/lib/email/resend')
        await sendTransactionalEmail({
          type: 'trial_expiry',
          to: agency.email,
          agencyName: agency.name ?? 'your agency',
          expiresAt,
        })
      }
      break
    }

    // ── Payment failed ─────────────────────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.parent?.subscription_details?.subscription
      if (subscriptionId) {
        await db.from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', String(subscriptionId))
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}

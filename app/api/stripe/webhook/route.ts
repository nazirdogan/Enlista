import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const db = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (!session.subscription) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      const meta = sub.metadata ?? {}
      const agencyId = meta.agency_id
      const plan = meta.plan
      const planAmount = parseInt(meta.plan_amount ?? '0', 10)
      if (!agencyId || !plan) break

      const periodEnd = sub.items.data[0]?.current_period_end
      await db.from('subscriptions').upsert({
        agency_id: agencyId,
        plan,
        plan_amount: planAmount,
        status: sub.status,
        stripe_customer_id: String(session.customer),
        stripe_subscription_id: sub.id,
        started_at: new Date(sub.start_date * 1000).toISOString(),
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const periodEnd = sub.items.data[0]?.current_period_end
      await db.from('subscriptions')
        .update({
          status: sub.status,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await db.from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id)
      break
    }

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
  }

  return NextResponse.json({ received: true })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

function getPlanCreditLimit(plan: string): number {
  switch (plan) {
    case 'free':       return 1
    case 'plus':       return 5
    case 'pro':        return 15
    case 'enterprise': return 9999
    default:           return 1
  }
}

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  let userId: string | null = null

  if (isDev && process.env.DEV_USER_ID) {
    userId = process.env.DEV_USER_ID
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }
    userId = user.id
  }

  const db = createAdminClient()
  const { data: agency, error } = await db
    .from('agencies')
    .select('id, plan, credits_remaining, extra_credits, credits_reset_at')
    .eq('user_id', userId)
    .single()

  if (error || !agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 })
  }

  // Auto-reset if into a new calendar month
  const now = new Date()
  const resetAt = agency.credits_reset_at ? new Date(agency.credits_reset_at) : null
  let creditsRemaining = agency.credits_remaining

  if (!resetAt || (resetAt.getFullYear() < now.getFullYear()) ||
      (resetAt.getFullYear() === now.getFullYear() && resetAt.getMonth() < now.getMonth())) {
    creditsRemaining = getPlanCreditLimit(agency.plan)
    await db.from('agencies').update({
      credits_remaining: creditsRemaining,
      credits_reset_at: now.toISOString(),
    }).eq('id', agency.id)
  }

  // Next reset date = 1st of next month
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return NextResponse.json({
    plan: agency.plan,
    creditsRemaining,
    extraCredits: agency.extra_credits,
    totalCredits: creditsRemaining + agency.extra_credits,
    creditLimit: getPlanCreditLimit(agency.plan),
    nextReset: nextReset.toISOString(),
  })
}

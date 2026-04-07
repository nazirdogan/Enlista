// app/api/auth/post-signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionalEmail } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  // Must be authenticated — user just signed up
  const isDev = process.env.NODE_ENV === 'development'
  let userId: string | null = null

  // DEV ONLY: skips auth. Ensure NODE_ENV is never 'development' in staging/production.
  if (isDev && process.env.DEV_USER_ID) {
    userId = process.env.DEV_USER_ID
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    userId = user.id
  }

  const body = await req.json().catch(() => ({}))
  const refCode: string | null = typeof body.refCode === 'string' ? body.refCode : null

  const db = createAdminClient()

  // Look up the new user's agency
  const { data: newAgency } = await db
    .from('agencies')
    .select('id, email, name, trial_ends_at')
    .eq('user_id', userId)
    .single()

  if (!newAgency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
  }

  // ── Send trial started email ──────────────────────────────────────────────
  if (newAgency.email && newAgency.trial_ends_at) {
    const trialEndsAt = new Date(newAgency.trial_ends_at).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    await sendTransactionalEmail({
      type: 'trial_started',
      to: newAgency.email,
      agencyName: newAgency.name ?? 'your agency',
      trialEndsAt,
    }).catch(console.error)
  }

  // ── Referral attribution ──────────────────────────────────────────────────
  if (!refCode) {
    return NextResponse.json({ ok: true })
  }

  // Look up the referrer by referral code
  const { data: referrerAgency } = await db
    .from('agencies')
    .select('id')
    // stored codes are always uppercase (DB trigger); toUpperCase() covers case-insensitive match
    .eq('referral_code', refCode.toUpperCase())
    .single()

  if (!referrerAgency) {
    // Invalid code — not an error, just skip attribution
    return NextResponse.json({ ok: true })
  }

  // Prevent self-referral
  if (referrerAgency.id === newAgency.id) {
    return NextResponse.json({ ok: true })
  }

  // Set referred_by on the new agency
  const { error: updateErr } = await db
    .from('agencies')
    .update({ referred_by_agency_id: referrerAgency.id })
    .eq('id', newAgency.id)

  if (updateErr) {
    console.error('[post-signup] referral agency update failed', updateErr)
    return NextResponse.json({ ok: true })
  }

  const { error: insertErr } = await db.from('referrals').insert({
    referrer_agency_id: referrerAgency.id,
    referred_agency_id: newAgency.id,
  })

  if (insertErr) {
    console.error('[post-signup] referral record insert failed', insertErr)
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionalEmail } from '@/lib/email/resend'

export async function GET(req: NextRequest) {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  // Allow manual trigger via ?secret=<CRON_SECRET> for testing
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (
    authHeader !== `Bearer ${cronSecret}` &&
    req.nextUrl.searchParams.get('secret') !== cronSecret
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()
  const now = new Date()

  const results = {
    expired: 0,
    reminder10: 0,
    reminder3: 0,
    errors: [] as string[],
  }

  // ── 1. Expire overdue trials ──────────────────────────────────────────────
  const { data: expiredAgencies } = await db
    .from('agencies')
    .select('id, email, name')
    .eq('account_status', 'trial')
    .lt('trial_ends_at', now.toISOString())

  for (const agency of expiredAgencies ?? []) {
    await db.from('agencies').update({ account_status: 'trial_expired' }).eq('id', agency.id)

    if (agency.email) {
      try {
        // Check if expiry email already sent
        const { data: sent } = await db
          .from('email_events')
          .select('id')
          .eq('agency_id', agency.id)
          .eq('email_type', 'trial_expired_user')
          .maybeSingle()

        if (!sent) {
          await sendTransactionalEmail({
            type: 'trial_expired_user',
            to: agency.email,
            agencyName: agency.name ?? 'your agency',
          })
          await db.from('email_events').insert({
            agency_id: agency.id,
            email_type: 'trial_expired_user',
            recipient: agency.email,
            status: 'sent',
            sent_at: now.toISOString(),
          })
        }
      } catch (e) {
        results.errors.push(`expiry email for ${agency.id}: ${String(e)}`)
      }
    }
    results.expired++
  }

  // ── 2. 10-day reminder (trial ends between 9.5 and 10.5 days from now) ────
  const in10DaysMin = new Date(now.getTime() + 9.5 * 24 * 60 * 60 * 1000).toISOString()
  const in10DaysMax = new Date(now.getTime() + 10.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: remind10Agencies } = await db
    .from('agencies')
    .select('id, email, name, trial_ends_at')
    .eq('account_status', 'trial')
    .gte('trial_ends_at', in10DaysMin)
    .lte('trial_ends_at', in10DaysMax)

  for (const agency of remind10Agencies ?? []) {
    if (!agency.email) continue
    try {
      const { data: sent } = await db
        .from('email_events')
        .select('id')
        .eq('agency_id', agency.id)
        .eq('email_type', 'trial_reminder_10')
        .maybeSingle()

      if (!sent) {
        const endsAt = new Date(agency.trial_ends_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
        await sendTransactionalEmail({
          type: 'trial_reminder_10',
          to: agency.email,
          agencyName: agency.name ?? 'your agency',
          trialEndsAt: endsAt,
        })
        await db.from('email_events').insert({
          agency_id: agency.id,
          email_type: 'trial_reminder_10',
          recipient: agency.email,
          status: 'sent',
          sent_at: now.toISOString(),
        })
        results.reminder10++
      }
    } catch (e) {
      results.errors.push(`reminder10 for ${agency.id}: ${String(e)}`)
    }
  }

  // ── 3. 3-day reminder (trial ends between 2.5 and 3.5 days from now) ──────
  const in3DaysMin = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000).toISOString()
  const in3DaysMax = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: remind3Agencies } = await db
    .from('agencies')
    .select('id, email, name, trial_ends_at')
    .eq('account_status', 'trial')
    .gte('trial_ends_at', in3DaysMin)
    .lte('trial_ends_at', in3DaysMax)

  for (const agency of remind3Agencies ?? []) {
    if (!agency.email) continue
    try {
      const { data: sent } = await db
        .from('email_events')
        .select('id')
        .eq('agency_id', agency.id)
        .eq('email_type', 'trial_reminder_3')
        .maybeSingle()

      if (!sent) {
        const endsAt = new Date(agency.trial_ends_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
        await sendTransactionalEmail({
          type: 'trial_reminder_3',
          to: agency.email,
          agencyName: agency.name ?? 'your agency',
          trialEndsAt: endsAt,
        })
        await db.from('email_events').insert({
          agency_id: agency.id,
          email_type: 'trial_reminder_3',
          recipient: agency.email,
          status: 'sent',
          sent_at: now.toISOString(),
        })
        results.reminder3++
      }
    } catch (e) {
      results.errors.push(`reminder3 for ${agency.id}: ${String(e)}`)
    }
  }

  return NextResponse.json({ ok: true, ...results })
}

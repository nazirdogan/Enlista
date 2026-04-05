// lib/admin/queries.ts
import { createAdminClient } from '@/lib/supabase/admin'

const db = () => createAdminClient()

export async function getOverviewKpis() {
  const supabase = db()
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()

  const [agencies, activeSubs, listings, trialExpiring] = await Promise.all([
    supabase.from('agencies').select('id, created_at, city, country'),
    supabase.from('subscriptions').select('plan_amount, status, trial_end').eq('status', 'active'),
    supabase.from('listings').select('id, created_at'),
    supabase.from('subscriptions').select('id').eq('status', 'trialing').lt('trial_end', threeDaysFromNow).gt('trial_end', now.toISOString()),
  ])

  const totalSignups = agencies.data?.length ?? 0
  const mrr = activeSubs.data?.reduce((sum, s) => sum + (s.plan_amount ?? 0), 0) ?? 0
  const totalListings = listings.data?.length ?? 0
  const paidSubs = activeSubs.data?.length ?? 0
  const conversionRate = totalSignups > 0 ? Math.round((paidSubs / totalSignups) * 100) : 0
  const avgLtv = paidSubs > 0 ? Math.round(mrr * 6 / paidSubs) : 0

  return {
    totalSignups,
    mrr,
    activeTrials: 0, // placeholder — agencies.is_trial not yet implemented
    totalListings,
    conversionRate,
    avgLtv,
    trialsExpiringIn3Days: trialExpiring.data?.length ?? 0,
  }
}

export async function getSignupTrend(months = 6) {
  const supabase = db()
  const result = []
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()
    const { count } = await supabase
      .from('agencies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end)
    result.push({
      month: date.toLocaleString('default', { month: 'short' }),
      signups: count ?? 0,
    })
  }
  return result
}

export async function getAllUsers(filters?: { plan?: string; search?: string; country?: string }) {
  const supabase = db()
  let query = supabase
    .from('agencies')
    .select('id, user_id, name, email, phone, city, country, created_at, listings(id, created_at)')
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
  }
  if (filters?.country) {
    query = query.eq('country', filters.country)
  }

  const { data } = await query
  return data ?? []
}

export async function getSubscriptions(status?: string) {
  const supabase = db()
  let query = supabase
    .from('subscriptions')
    .select('*, agencies(name, email)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data } = await query
  return data ?? []
}

export async function getListingsStats() {
  const supabase = db()
  const [all, byType, byTone] = await Promise.all([
    supabase.from('listings').select('id, created_at, status, community, tone, property_type'),
    supabase.from('listings').select('property_type'),
    supabase.from('listings').select('tone'),
  ])

  return {
    total: all.data?.length ?? 0,
    published: all.data?.filter(l => l.status === 'published').length ?? 0,
    listings: all.data ?? [],
    byType: groupCount(byType.data ?? [], 'property_type'),
    byTone: groupCount(byTone.data ?? [], 'tone'),
  }
}

export async function getOutreachStats() {
  const supabase = db()
  const [sends, clicks, replies, signups, optouts] = await Promise.all([
    supabase.from('outreach_sends').select('id, variant, sent_at, agent_name, agency, phone, tracking_token'),
    supabase.from('outreach_clicks').select('id, tracking_token, clicked_at'),
    supabase.from('outreach_replies').select('id, send_id, replied_at'),
    supabase.from('outreach_signups').select('id, tracking_token, signed_up_at'),
    supabase.from('outreach_optouts').select('id'),
  ])

  return {
    sends: sends.data ?? [],
    clicks: clicks.data ?? [],
    replies: replies.data ?? [],
    signups: signups.data ?? [],
    optoutsCount: optouts.data?.length ?? 0,
  }
}

export async function getEmailStats() {
  const supabase = db()
  const { data } = await supabase
    .from('email_events')
    .select('*, agencies(name, email)')
    .order('sent_at', { ascending: false })
  return data ?? []
}

function groupCount(rows: Record<string, unknown>[], field: string): Record<string, number> {
  return rows.reduce((acc: Record<string, number>, row) => {
    const key = String(row[field] ?? 'unknown')
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

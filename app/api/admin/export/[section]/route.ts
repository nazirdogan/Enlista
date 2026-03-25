import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getAllUsers, getSubscriptions, getOutreachStats, getEmailStats } from '@/lib/admin/queries'
import { createAdminClient } from '@/lib/supabase/admin'

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n')
}

export async function GET(req: NextRequest, { params }: { params: { section: string } }) {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }

  const { section } = params
  let rows: Record<string, unknown>[] = []

  switch (section) {
    case 'users': {
      const users = await getAllUsers()
      rows = users.map(u => ({
        name: u.name,
        email: u.email,
        city: u.city ?? '',
        country: u.country ?? '',
        listings_count: (u.listings as unknown[] | null)?.length ?? 0,
        created_at: u.created_at,
      }))
      break
    }
    case 'subscriptions': {
      const subs = await getSubscriptions('all')
      rows = (subs as Array<typeof subs[0] & { agencies?: { name?: string } | null }>).map(s => ({
        agency: s.agencies?.name ?? '',
        plan: s.plan,
        plan_amount: s.plan_amount,
        status: s.status,
        started_at: s.started_at ?? '',
        current_period_end: s.current_period_end ?? '',
        cancelled_at: s.cancelled_at ?? '',
      }))
      break
    }
    case 'listings': {
      const db = createAdminClient()
      const { data } = await db
        .from('listings')
        .select('id, property_type, listing_type, tone, status, community, price_aed, created_at, agencies(name)')
      rows = (data ?? []).map(l => ({
        agency: (l.agencies as { name?: string } | null)?.name ?? '',
        property_type: l.property_type,
        listing_type: l.listing_type,
        tone: l.tone ?? '',
        status: l.status ?? '',
        community: l.community ?? '',
        price_aed: l.price_aed,
        created_at: l.created_at,
      }))
      break
    }
    case 'outreach': {
      const stats = await getOutreachStats()
      const sends = stats.sends as Array<{ id: string; agent_name: string; agency: string; variant: string; sent_at: string; tracking_token: string }>
      const clicks = stats.clicks as Array<{ tracking_token: string }>
      const signups = stats.signups as Array<{ tracking_token: string }>
      rows = sends.map(s => ({
        agent_name: s.agent_name,
        agency: s.agency,
        variant: s.variant,
        sent_at: s.sent_at,
        clicked: clicks.some(c => c.tracking_token === s.tracking_token),
        signed_up: signups.some(sg => sg.tracking_token === s.tracking_token),
      }))
      break
    }
    case 'emails': {
      const events = await getEmailStats() as Array<{ agencies?: { name?: string } | null; recipient: string; email_type: string; status: string; sent_at: string }>
      rows = events.map(e => ({
        agency: e.agencies?.name ?? '',
        recipient: e.recipient,
        email_type: e.email_type,
        status: e.status,
        sent_at: e.sent_at,
      }))
      break
    }
    default:
      return NextResponse.json({ error: 'Unknown section' }, { status: 400 })
  }

  const csv = toCsv(rows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="enlista-${section}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

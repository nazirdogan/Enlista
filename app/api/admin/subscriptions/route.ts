import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getSubscriptions } from '@/lib/admin/queries'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }
  const status = new URL(req.url).searchParams.get('status') ?? 'all'
  const subs = await getSubscriptions(status)
  return NextResponse.json({ subscriptions: subs })
}

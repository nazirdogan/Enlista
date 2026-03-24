import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getOverviewKpis, getSignupTrend } from '@/lib/admin/queries'

export async function GET() {
  try {
    await requireAdmin()
  } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }
  const [kpis, trend] = await Promise.all([getOverviewKpis(), getSignupTrend(6)])
  return NextResponse.json({ kpis, trend })
}

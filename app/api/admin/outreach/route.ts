import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getOutreachStats } from '@/lib/admin/queries'
import { getMetaAdsSpend } from '@/lib/admin/meta-ads'

export async function GET() {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }
  const month = new Date().toISOString().slice(0, 7)
  const [stats, spend] = await Promise.all([getOutreachStats(), getMetaAdsSpend(month)])
  return NextResponse.json({ stats, spend })
}

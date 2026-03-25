import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getListingsStats } from '@/lib/admin/queries'

export async function GET() {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }
  const stats = await getListingsStats()
  return NextResponse.json(stats)
}

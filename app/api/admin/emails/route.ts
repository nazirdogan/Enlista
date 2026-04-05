import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getEmailStats } from '@/lib/admin/queries'

export async function GET() {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }
  const events = await getEmailStats()
  return NextResponse.json({ events })
}

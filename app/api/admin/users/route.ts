import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getAllUsers } from '@/lib/admin/queries'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch (e) {
    if (e instanceof AdminAuthError) return NextResponse.json({ error: e.message }, { status: e.status })
    throw e
  }
  const { searchParams } = new URL(req.url)
  const users = await getAllUsers({
    search: searchParams.get('search') ?? undefined,
    plan: searchParams.get('plan') ?? undefined,
    country: searchParams.get('country') ?? undefined,
  })
  return NextResponse.json({ users })
}

// app/api/trial-status/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  let userId: string | null = null

  if (isDev && process.env.DEV_USER_ID) {
    userId = process.env.DEV_USER_ID
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    userId = user.id
  }

  const db = createAdminClient()
  const { data: agency } = await db
    .from('agencies')
    .select('account_status, trial_ends_at')
    .eq('user_id', userId)
    .single()

  if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const accountStatus: string = agency.account_status ?? 'active'
  const trialEndsAt: string | null = agency.trial_ends_at ?? null
  let daysRemaining: number | null = null

  if (accountStatus === 'trial' && trialEndsAt) {
    const msLeft = new Date(trialEndsAt).getTime() - Date.now()
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
  }

  return NextResponse.json({ accountStatus, trialEndsAt, daysRemaining })
}

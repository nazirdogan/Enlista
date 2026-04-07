// app/api/referrals/stats/route.ts
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
    .select('id, referral_code, listing_credits')
    .eq('user_id', userId)
    .single()

  if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: referrals } = await db
    .from('referrals')
    .select('id, credits_awarded')
    .eq('referrer_agency_id', agency.id)

  const sent = referrals?.length ?? 0
  const converted = referrals?.filter(r => r.credits_awarded).length ?? 0
  const totalCreditsEarned = converted * 10

  return NextResponse.json({
    referralCode: agency.referral_code,
    currentBalance: agency.listing_credits ?? 0,
    sent,
    converted,
    totalCreditsEarned,
  })
}

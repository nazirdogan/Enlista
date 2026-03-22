import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { token, userId } = await req.json()

  if (!token || !userId) {
    return NextResponse.json({ error: 'Missing token or userId' }, { status: 400 })
  }

  // Verify the request comes from an authenticated session
  // and that the userId matches the session user
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Non-fatal — token may not exist in outreach_sends (organic signup)
  await supabase
    .from('outreach_signups')
    .insert({ tracking_token: token, user_id: userId })

  return NextResponse.json({ ok: true })
}

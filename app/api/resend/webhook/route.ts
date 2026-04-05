import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('RESEND_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const webhook = new Webhook(webhookSecret)
  let event: { type: string; data: { email_id?: string } }
  try {
    event = webhook.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature }) as typeof event
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createAdminClient()
  const { type, data } = event

  const statusMap: Record<string, string> = {
    'email.delivered': 'delivered',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
  }

  if (statusMap[type] && data?.email_id) {
    const { error: updateError } = await db.from('email_events')
      .update({ status: statusMap[type] })
      .eq('resend_id', data.email_id)
    if (updateError) console.error('DB update failed:', updateError)
  }

  return NextResponse.json({ received: true })
}

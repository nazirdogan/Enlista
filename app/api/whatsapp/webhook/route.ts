import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

const APP_SECRET = process.env.META_WA_APP_SECRET!
const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN!

function verifySignature(body: string, signature: string): boolean {
  const expected = 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex')
  return expected === signature
}

// GET — Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const searchParams = (req.nextUrl ?? new URL(req.url)).searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// POST — inbound messages
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const payload = JSON.parse(rawBody)
  const supabase = createClient()

  const messages =
    payload?.entry?.[0]?.changes?.[0]?.value?.messages ?? []

  for (const msg of messages) {
    if (msg.type !== 'text') continue

    const phone = `+${msg.from}`
    const text: string = msg.text?.body ?? ''

    // Opt-out handling
    if (text.trim().toUpperCase() === 'STOP') {
      await supabase.from('outreach_optouts').upsert({ phone }, { onConflict: 'phone' })
      continue
    }

    // Resolve send_id from phone
    const { data: send } = await supabase
      .from('outreach_sends')
      .select('id')
      .eq('phone', phone)
      .single()

    await supabase.from('outreach_replies').insert({
      send_id: send?.id ?? null,
      phone,
      reply_text: text,
    })
  }

  return new NextResponse('OK', { status: 200 })
}

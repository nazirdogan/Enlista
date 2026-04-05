import { describe, it, expect, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { createHmac } from 'crypto'

const APP_SECRET = 'test_secret'
process.env.META_WA_APP_SECRET = APP_SECRET
process.env.META_WA_VERIFY_TOKEN = 'test_verify_token'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'send-uuid' }, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}))

function makeSignature(body: string): string {
  return 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex')
}

describe('POST /api/whatsapp/webhook', () => {
  it('rejects requests with invalid signature', async () => {
    const { POST } = await import('../webhook/route')
    const body = JSON.stringify({ object: 'whatsapp_business_account' })
    const req = new Request('https://enlista.io/api/whatsapp/webhook', {
      method: 'POST',
      body,
      headers: { 'x-hub-signature-256': 'sha256=badsignature' },
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  it('accepts requests with valid signature', async () => {
    const { POST } = await import('../webhook/route')
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] })
    const req = new Request('https://enlista.io/api/whatsapp/webhook', {
      method: 'POST',
      body,
      headers: { 'x-hub-signature-256': makeSignature(body) },
    })
    const res = await POST(req as unknown as NextRequest)
    expect(res.status).toBe(200)
  })
})

describe('GET /api/whatsapp/webhook (verification)', () => {
  it('responds to Meta verification challenge', async () => {
    const { GET } = await import('../webhook/route')
    const url = 'https://enlista.io/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token&hub.challenge=challenge123'
    const req = new Request(url)
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toBe('challenge123')
  })
})

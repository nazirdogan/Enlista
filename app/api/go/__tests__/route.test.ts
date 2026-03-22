import { describe, it, expect, vi } from 'vitest'
import type { NextRequest } from 'next/server'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}))

describe('GET /api/go', () => {
  it('redirects to /auth with token when token is present', async () => {
    const { GET } = await import('../route')
    const req = new Request('https://enlista.ai/api/go?t=abc123', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    })
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth?t=abc123')
  })

  it('redirects to /auth without token when token is missing', async () => {
    const { GET } = await import('../route')
    const req = new Request('https://enlista.ai/api/go')
    const res = await GET(req as unknown as NextRequest)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth')
  })
})

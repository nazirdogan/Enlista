import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers before importing the module under test
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn() })),
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { AdminAuthError, requireAdmin } from '../auth'
import { createServerClient } from '@supabase/ssr'

const mockCreateServerClient = vi.mocked(createServerClient)

function makeSupabaseMock(user: { email: string } | null, error?: Error) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: error ?? null,
      }),
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.ADMIN_EMAILS = 'admin@example.com,super@example.com'
})

describe('requireAdmin', () => {
  it('returns user when email is in ADMIN_EMAILS', async () => {
    const user = { email: 'admin@example.com', id: 'user-123' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateServerClient.mockReturnValue(makeSupabaseMock(user) as any)

    const result = await requireAdmin()

    expect(result).toEqual(user)
  })

  it('throws AdminAuthError(403) when email is NOT in ADMIN_EMAILS', async () => {
    const user = { email: 'notadmin@example.com', id: 'user-456' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateServerClient.mockReturnValue(makeSupabaseMock(user) as any)

    await expect(requireAdmin()).rejects.toThrow(AdminAuthError)

    try {
      await requireAdmin()
    } catch (err) {
      expect(err).toBeInstanceOf(AdminAuthError)
      expect((err as AdminAuthError).status).toBe(403)
      expect((err as AdminAuthError).message).toBe('Forbidden')
    }
  })

  it('throws AdminAuthError(401) when auth returns an error', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateServerClient.mockReturnValue(makeSupabaseMock(null, new Error('JWT expired')) as any)

    await expect(requireAdmin()).rejects.toThrow(AdminAuthError)

    try {
      await requireAdmin()
    } catch (err) {
      expect(err).toBeInstanceOf(AdminAuthError)
      expect((err as AdminAuthError).status).toBe(401)
      expect((err as AdminAuthError).message).toBe('Unauthenticated')
    }
  })

  it('throws AdminAuthError(401) when user is null with no error', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateServerClient.mockReturnValue(makeSupabaseMock(null) as any)

    try {
      await requireAdmin()
    } catch (err) {
      expect(err).toBeInstanceOf(AdminAuthError)
      expect((err as AdminAuthError).status).toBe(401)
    }
  })

  it('AdminAuthError has correct status property', () => {
    const err = new AdminAuthError(403, 'Forbidden')
    expect(err.status).toBe(403)
    expect(err.message).toBe('Forbidden')
    expect(err).toBeInstanceOf(Error)
  })
})

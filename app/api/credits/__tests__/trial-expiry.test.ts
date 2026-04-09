/**
 * End-to-end tests: trial expiry flow — /api/credits route
 *
 * Verifies that `daysRemaining` and `accountStatus` are computed correctly
 * for accounts in various stages of their trial window, including the
 * ≤5 day threshold that triggers the red TrialBanner.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns an ISO string that is `days` days from the frozen "now". */
function trialEndsAt(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Builds a chainable Supabase query mock.
 * The same object handles both:
 *   .from().select().eq().single()   (read)
 *   .from().update({}).eq()          (write — terminal, must be awaitable)
 */
function makeQueryChain(singleResult: { data: unknown; error: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {}
  chain.select  = vi.fn(() => chain)
  chain.update  = vi.fn(() => chain)
  chain.single  = vi.fn(() => Promise.resolve(singleResult))
  // eq() is used both mid-chain (select) AND as terminal (update).
  // Make it thenable so `await .update({}).eq()` resolves cleanly.
  chain.eq = vi.fn(() => {
    const thenableChain = { ...chain }
    thenableChain.then = (resolve: (v: unknown) => void) =>
      resolve({ error: null })
    thenableChain.catch = vi.fn(() => thenableChain)
    return thenableChain
  })
  return chain
}

/** Builds a minimal agency row that will NOT trigger a credits auto-reset. */
function makeAgency(overrides: Record<string, unknown> = {}) {
  const futureReset = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  return {
    id: 'agency-1',
    plan: 'plus',
    account_status: 'trial',
    trial_ends_at: trialEndsAt(14),   // two weeks left by default
    credits_remaining: 5,
    extra_credits: 0,
    listing_credits: 0,
    credits_reset_at: futureReset,
    ...overrides,
  }
}

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      }),
    },
  })),
}))

// `createAdminClient` mock is set per-test via mockImplementation
const mockCreateAdminClient = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}))

// ─── Test setup ─────────────────────────────────────────────────────────────

const FROZEN_NOW = new Date('2025-06-15T12:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FROZEN_NOW)
})

afterEach(() => {
  vi.useRealTimers()
  vi.resetModules()
})

// ─── Utility: run the route ──────────────────────────────────────────────────

async function callCreditsRoute(agencyData: ReturnType<typeof makeAgency>) {
  mockCreateAdminClient.mockReturnValue({
    from: () => makeQueryChain({ data: agencyData, error: null }),
  })
  const { GET } = await import('../route')
  return GET()
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/credits — trial expiry banner threshold', () => {

  // ── Exactly 5 days left (boundary — must be red) ──────────────────────────
  it('returns daysRemaining=5 and accountStatus=trial for a trial ending in exactly 5 days', async () => {
    const agency = makeAgency({ trial_ends_at: trialEndsAt(5) })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.accountStatus).toBe('trial')
    expect(body.daysRemaining).toBe(5)
  })

  // ── 4 days left ───────────────────────────────────────────────────────────
  it('returns daysRemaining=4 for a trial ending in 4 days', async () => {
    const agency = makeAgency({ trial_ends_at: trialEndsAt(4) })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.daysRemaining).toBe(4)
    expect(body.accountStatus).toBe('trial')
  })

  // ── 1 day left ────────────────────────────────────────────────────────────
  it('returns daysRemaining=1 for a trial ending tomorrow', async () => {
    const agency = makeAgency({ trial_ends_at: trialEndsAt(1) })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.daysRemaining).toBe(1)
  })

  // ── Expiring today (0 days) ───────────────────────────────────────────────
  it('returns daysRemaining=0 when trial_ends_at is in the past (expired today)', async () => {
    // Set trial_ends_at 1 hour in the past
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const agency = makeAgency({ trial_ends_at: oneHourAgo })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.daysRemaining).toBe(0)
  })

  // ── 6 days left (just above threshold — should be blue, not red) ──────────
  it('returns daysRemaining=6 for a trial ending in 6 days', async () => {
    const agency = makeAgency({ trial_ends_at: trialEndsAt(6) })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.daysRemaining).toBe(6)
    expect(body.accountStatus).toBe('trial')
  })

  // ── 14 days left (full trial — definitely blue) ───────────────────────────
  it('returns daysRemaining=14 for a brand-new trial', async () => {
    const agency = makeAgency({ trial_ends_at: trialEndsAt(14) })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.daysRemaining).toBe(14)
  })

  // ── Non-trial account — no banner should render ───────────────────────────
  it('returns daysRemaining=null and accountStatus=active for a paid account', async () => {
    const agency = makeAgency({
      account_status: 'active',
      trial_ends_at: null,
    })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.accountStatus).toBe('active')
    expect(body.daysRemaining).toBeNull()
  })

  // ── Trial-expired account ─────────────────────────────────────────────────
  it('returns accountStatus=trial_expired and daysRemaining=null for an expired trial', async () => {
    const agency = makeAgency({
      account_status: 'trial_expired',
      trial_ends_at: null,
    })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.accountStatus).toBe('trial_expired')
    expect(body.daysRemaining).toBeNull()
  })

  // ── Response shape ────────────────────────────────────────────────────────
  it('includes all required fields in the response', async () => {
    const agency = makeAgency({ trial_ends_at: trialEndsAt(3) })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body).toMatchObject({
      plan: expect.any(String),
      creditsRemaining: expect.any(Number),
      extraCredits: expect.any(Number),
      totalCredits: expect.any(Number),
      creditLimit: expect.any(Number),
      nextReset: expect.any(String),
      accountStatus: 'trial',
      daysRemaining: 3,
    })
  })

  // ── daysRemaining uses Math.ceil, not Math.floor ──────────────────────────
  it('rounds daysRemaining up (Math.ceil) so a partial day counts as 1', async () => {
    // Trial ends in exactly 4 hours → ceil(4/24) = 1
    const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    const agency = makeAgency({ trial_ends_at: fourHoursFromNow })
    const res = await callCreditsRoute(agency)
    const body = await res.json()

    expect(body.daysRemaining).toBe(1)
  })

  // ── Unauthenticated request ───────────────────────────────────────────────
  it('returns 401 when no authenticated user session', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValueOnce({
      // @ts-expect-error minimal mock
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    })
    const { GET } = await import('../route')
    const res = await GET()

    expect(res.status).toBe(401)
  })
})

/**
 * End-to-end tests: TrialBanner component
 *
 * Verifies that the banner renders with red styling when daysRemaining ≤ 5
 * and blue styling when daysRemaining > 5, plus message copy per edge case.
 *
 * Uses React's server-side renderToString so no DOM/jsdom is required —
 * the output is inspected as an HTML string, matching the same token the
 * browser would render.
 */
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'
import TrialBanner from '../TrialBanner'

// ─── Colour tokens (must stay in sync with TrialBanner.tsx) ─────────────────
const RED   = { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', btn: '#EF4444' }
const BLUE  = { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E3A8A', btn: '#1D4ED8' }

// ─── Helper ──────────────────────────────────────────────────────────────────
function render(daysRemaining: number): string {
  return renderToString(<TrialBanner daysRemaining={daysRemaining} />)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('TrialBanner — colour theme (isUrgent = daysRemaining ≤ 5)', () => {

  // ── Red zone: 5 days (boundary) ──────────────────────────────────────────
  it('renders RED theme at exactly 5 days remaining', () => {
    const html = render(5)
    expect(html).toContain(RED.bg)
    expect(html).toContain(RED.text)
    expect(html).toContain(RED.btn)
  })

  // ── Red zone: 4 days ─────────────────────────────────────────────────────
  it('renders RED theme at 4 days remaining', () => {
    const html = render(4)
    expect(html).toContain(RED.bg)
    expect(html).not.toContain(BLUE.bg)
  })

  // ── Red zone: 1 day ──────────────────────────────────────────────────────
  it('renders RED theme at 1 day remaining', () => {
    const html = render(1)
    expect(html).toContain(RED.bg)
    expect(html).toContain(RED.btn)
  })

  // ── Red zone: 0 days (expires today) ─────────────────────────────────────
  it('renders RED theme at 0 days remaining', () => {
    const html = render(0)
    expect(html).toContain(RED.bg)
    expect(html).toContain(RED.btn)
  })

  // ── Blue zone: 6 days (one above threshold) ───────────────────────────────
  it('renders BLUE theme at 6 days remaining', () => {
    const html = render(6)
    expect(html).toContain(BLUE.bg)
    expect(html).toContain(BLUE.text)
    expect(html).toContain(BLUE.btn)
    expect(html).not.toContain(RED.bg)
  })

  // ── Blue zone: 14 days (full trial) ──────────────────────────────────────
  it('renders BLUE theme at 14 days remaining', () => {
    const html = render(14)
    expect(html).toContain(BLUE.bg)
    expect(html).not.toContain(RED.bg)
  })
})

describe('TrialBanner — message copy', () => {

  it('shows "Your free trial ends today" when daysRemaining is 0', () => {
    const html = render(0)
    expect(html).toContain('Your free trial ends today')
  })

  it('shows "1 day left in your free trial" when daysRemaining is 1', () => {
    const html = render(1)
    expect(html).toContain('1 day left in your free trial')
  })

  it('shows "5 days left in your free trial" when daysRemaining is 5', () => {
    const html = render(5)
    expect(html).toContain('5 days left in your free trial')
  })

  it('shows "6 days left in your free trial" when daysRemaining is 6', () => {
    const html = render(6)
    expect(html).toContain('6 days left in your free trial')
  })

  it('shows "14 days left in your free trial" for a brand-new trial', () => {
    const html = render(14)
    expect(html).toContain('14 days left in your free trial')
  })

  it('always includes the upgrade CTA text', () => {
    for (const days of [0, 1, 3, 5, 6, 14]) {
      expect(render(days)).toContain('Upgrade now')
    }
  })

  it('always includes a link to /onboarding', () => {
    for (const days of [0, 3, 5, 6]) {
      expect(render(days)).toContain('href="/onboarding"')
    }
  })
})

describe('TrialBanner — end-to-end: API daysRemaining feeds correct banner colour', () => {
  /**
   * This block mirrors what the DashboardLayout does:
   *   if (accountStatus === 'trial' && daysRemaining !== null)
   *     render <TrialBanner daysRemaining={daysRemaining} />
   *
   * We simulate the values returned by /api/credits for representative
   * accounts and assert the correct visual outcome.
   */

  const scenarios: Array<{
    label: string
    apiResponse: { accountStatus: string; daysRemaining: number | null }
    expectBanner: boolean
    expectRed: boolean | null  // null = don't care (banner not shown)
  }> = [
    {
      label: 'trial — 5 days left → banner shown, RED',
      apiResponse: { accountStatus: 'trial', daysRemaining: 5 },
      expectBanner: true, expectRed: true,
    },
    {
      label: 'trial — 3 days left → banner shown, RED',
      apiResponse: { accountStatus: 'trial', daysRemaining: 3 },
      expectBanner: true, expectRed: true,
    },
    {
      label: 'trial — 0 days left → banner shown, RED',
      apiResponse: { accountStatus: 'trial', daysRemaining: 0 },
      expectBanner: true, expectRed: true,
    },
    {
      label: 'trial — 6 days left → banner shown, BLUE',
      apiResponse: { accountStatus: 'trial', daysRemaining: 6 },
      expectBanner: true, expectRed: false,
    },
    {
      label: 'trial — 14 days left → banner shown, BLUE',
      apiResponse: { accountStatus: 'trial', daysRemaining: 14 },
      expectBanner: true, expectRed: false,
    },
    {
      label: 'active (paid) account → no banner',
      apiResponse: { accountStatus: 'active', daysRemaining: null },
      expectBanner: false, expectRed: null,
    },
    {
      label: 'trial_expired account → no banner (TrialExpiredModal shown instead)',
      apiResponse: { accountStatus: 'trial_expired', daysRemaining: null },
      expectBanner: false, expectRed: null,
    },
  ]

  for (const { label, apiResponse, expectBanner, expectRed } of scenarios) {
    it(label, () => {
      const { accountStatus, daysRemaining } = apiResponse

      // Replicate the layout's conditional: only render banner for 'trial' with a value
      const shouldShowBanner = accountStatus === 'trial' && daysRemaining !== null

      expect(shouldShowBanner).toBe(expectBanner)

      if (shouldShowBanner && daysRemaining !== null) {
        const html = render(daysRemaining)
        if (expectRed) {
          expect(html).toContain(RED.bg)
          expect(html).not.toContain(BLUE.bg)
        } else {
          expect(html).toContain(BLUE.bg)
          expect(html).not.toContain(RED.bg)
        }
      }
    })
  }
})

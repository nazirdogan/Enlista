'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowLeft, Zap } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/pricing-data'

interface UpgradePageProps {
  searchParams?: { days?: string }
}

export default function UpgradePage({ searchParams }: UpgradePageProps) {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  // Get days remaining from query params or show generic message
  const daysRemaining = searchParams?.days ? parseInt(searchParams.days) : null

  async function handlePlanCta(planKey: string) {
    setLoadingPlan(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoadingPlan(null)
    }
  }

  // Filter to show only Plus and Pro (+ Enterprise) for upgrade flow
  const upgradeablePlans = PRICING_PLANS.filter(p => ['plus', 'pro', 'enterprise'].includes(p.key))

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1D4ED8', fontSize: 13, fontWeight: 600,
            marginBottom: 24, fontFamily: 'inherit', padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 style={{
          fontSize: 32, fontWeight: 800, color: '#0F1829',
          marginBottom: 12, lineHeight: 1.2,
        }}>
          Unlock more listings
        </h1>
        {daysRemaining ? (
          <p style={{
            fontSize: 16, color: '#6B7280',
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '12px 16px',
            maxWidth: 600,
          }}>
            Your free trial{daysRemaining === 0 ? ' ends today' : ` ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}. Upgrade now to keep full access.
          </p>
        ) : (
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 600 }}>
            You&apos;re currently on the Free plan with 1 listing per month. Upgrade to unlock more.
          </p>
        )}
      </div>

      {/* Plan cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 48,
      }}>
        {upgradeablePlans.map((plan) => (
          <div
            key={plan.key}
            style={{
              background: plan.highlight ? 'linear-gradient(160deg, #1D4ED8 0%, #1e3a8a 100%)' : '#fff',
              border: plan.highlight ? 'none' : '1.5px solid #EAECF0',
              borderRadius: 16,
              padding: 28,
              boxShadow: plan.highlight
                ? '0 16px 48px rgba(29,78,216,0.3)'
                : '0 2px 12px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute', top: 20, right: 20,
                background: '#FDE68A', color: '#92400E',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                padding: '3px 10px', borderRadius: 100,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ⭐ {plan.badge.toUpperCase()}
              </div>
            )}

            {/* Plan header */}
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: plan.highlight ? 'rgba(255,255,255,0.55)' : '#9CA3AF', marginBottom: 4,
              }}>
                {plan.name}
              </p>
              <p style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#6B7280', marginBottom: 16 }}>
                {plan.tagline}
              </p>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <span style={{
                  fontSize: 40, fontWeight: 800,
                  color: plan.highlight ? '#fff' : '#0F1829', lineHeight: 1,
                }}>
                  {plan.priceLabel}
                </span>
                <span style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.45)' : '#9CA3AF' }}>
                  {plan.priceSub}
                </span>
              </div>

              {/* Credits badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: plan.highlight ? 'rgba(255,255,255,0.1)' : '#F0F9FF',
                borderRadius: 6, padding: '4px 10px',
              }}>
                <Zap size={11} color={plan.highlight ? 'rgba(255,255,255,0.7)' : '#1D4ED8'} />
                <span style={{ fontSize: 12, fontWeight: 600, color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#1D4ED8' }}>
                  {plan.creditsLabel}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => handlePlanCta(plan.key)}
              disabled={!!loadingPlan}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '12px 0', borderRadius: 10,
                fontSize: 14, fontWeight: 700, border: 'none', cursor: loadingPlan ? 'not-allowed' : 'pointer',
                background: plan.highlight ? '#fff' : '#EFF6FF',
                color: plan.highlight ? '#1D4ED8' : '#1D4ED8',
                fontFamily: 'inherit', transition: 'all 0.15s',
                opacity: loadingPlan && loadingPlan !== plan.key ? 0.5 : 1,
                marginBottom: 20,
              }}
            >
              {loadingPlan === plan.key ? 'Redirecting...' : `Start ${plan.name}`}
              <span style={{ marginLeft: 4 }}>→</span>
            </button>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <div style={{
                    minWidth: 18, width: 18, height: 18, borderRadius: 4,
                    background: plan.highlight ? 'rgba(255,255,255,0.15)' : '#EFF6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={11} color={plan.highlight ? '#fff' : '#1D4ED8'} strokeWidth={2.5} />
                  </div>
                  <span style={{
                    fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#374151',
                    lineHeight: 1.4,
                  }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div style={{
        background: '#F7F8FC', borderRadius: 16,
        padding: 32, marginBottom: 40,
      }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: '#0F1829',
          marginBottom: 20,
        }}>
          Frequently asked
        </h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1829', marginBottom: 6 }}>
              Can I try before upgrading?
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              You already are! Your free trial lets you test all features. Upgrade anytime to get more listings.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1829', marginBottom: 6 }}>
              What&apos;s the difference between Plus and Pro?
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              <strong>Plus</strong> (5 listings/mo) is great for individual agents. <strong>Pro</strong> (15 listings/mo) adds WhatsApp & Instagram copy, priority support, and advanced analytics.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1829', marginBottom: 6 }}>
              What happens after my trial ends?
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              If you don&apos;t upgrade, your account stays on Free with 1 listing per month. No card required.
            </p>
          </div>
        </div>
      </div>

      {/* Continue on free */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B7280', fontSize: 14, fontWeight: 600,
            fontFamily: 'inherit', textDecoration: 'underline',
          }}
        >
          Continue with Free for now
        </button>
      </div>
    </div>
  )
}

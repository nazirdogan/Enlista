'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PublicNav } from '@/components/PublicNav'
import { Check, Zap, ArrowRight, Star, Building2, MessageSquare } from 'lucide-react'

// ─── Plan data ────────────────────────────────────────────────────────────────

const plans = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Try before you commit',
    price: 0,
    priceLabel: 'Free',
    priceSub: 'forever',
    credits: 1,
    creditsLabel: '1 listing/month',
    cta: 'Get started free',
    ctaHref: '/auth?tab=signup',
    highlight: false,
    features: [
      'Full AI listing generation',
      'English + Arabic output',
      'Compact portal version',
      'Highlight bullets',
      'WhatsApp & Instagram copy',
      '1 listing credit per month',
    ],
    missing: [
      'Additional listings',
      'Priority support',
    ],
  },
  {
    key: 'plus',
    name: 'Plus',
    tagline: 'For active individual agents',
    price: 95,
    priceLabel: 'AED 95',
    priceSub: 'per month',
    credits: 5,
    creditsLabel: '5 listings/month',
    cta: 'Start with Plus',
    ctaHref: null, // triggers checkout
    highlight: false,
    features: [
      'Everything in Free',
      '5 listing credits per month',
      'Credits reset on the 1st',
      'Buy extra credits anytime',
      'Email support',
    ],
    missing: [],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For high-volume agents',
    price: 145,
    priceLabel: 'AED 145',
    priceSub: 'per month',
    credits: 15,
    creditsLabel: '15 listings/month',
    cta: 'Start with Pro',
    ctaHref: null,
    highlight: true,
    badge: 'Most popular',
    features: [
      'Everything in Plus',
      '15 listing credits per month',
      'Priority support',
      'Advanced analytics',
      'Early access to new features',
    ],
    missing: [],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'For brokerages & teams',
    price: null,
    priceLabel: 'Custom',
    priceSub: 'per agent / per month',
    credits: null,
    creditsLabel: 'Unlimited listings',
    cta: 'Contact sales',
    ctaHref: '/contact-sales',
    highlight: false,
    minAgents: 10,
    features: [
      'Minimum 10 agents',
      'Dedicated account manager',
      'White-label platform option',
      'Priority AI processing',
      'Custom onboarding & training',
      'SLA guarantee',
      'Admin dashboard & analytics',
      'Bulk listing management',
      'Portal integrations (Bayut, PF)',
    ],
    missing: [],
  },
]

const creditPacks = [
  { key: 'credits_5',  label: '5 Credits',  price: 'AED 50', perCredit: 'AED 10.00' },
  { key: 'credits_10', label: '10 Credits', price: 'AED 90', perCredit: 'AED 9.00', popular: true },
  { key: 'credits_20', label: '20 Credits', price: 'AED 140', perCredit: 'AED 7.00' },
]

const faqs = [
  {
    q: 'What counts as one credit?',
    a: 'Each time you click "Generate" to produce a listing, one credit is used. Saving or editing an existing listing does not use credits.',
  },
  {
    q: 'Do unused monthly credits roll over?',
    a: 'Monthly credits reset on the 1st of each month and do not roll over. Extra credits you purchase are permanent — they never expire.',
  },
  {
    q: 'Can I buy extra credits on any plan?',
    a: 'Yes. Extra credit packs are available on all plans including Free. They stack on top of your monthly allowance.',
  },
  {
    q: 'What happens when I run out of credits?',
    a: 'You\'ll see a prompt in the sidebar and when you try to generate. You can immediately purchase a credit pack or upgrade your plan without losing any work.',
  },
  {
    q: 'What qualifies as Enterprise?',
    a: 'Enterprise is designed for brokerages with 10 or more agents. It includes a custom per-agent rate, a brokerage admin dashboard, and optional white-labelling of the platform.',
  },
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPack, setLoadingPack] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handlePlanCta(planKey: string) {
    setLoadingPlan(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (res.status === 401) {
        // Not logged in — redirect to signup with plan param
        router.push(`/auth?tab=signup&plan=${planKey}`)
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // ignore
    } finally {
      setLoadingPlan(null)
    }
  }

  async function handleBuyPack(packKey: string) {
    setLoadingPack(packKey)
    try {
      const res = await fetch('/api/stripe/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: packKey }),
      })
      const data = await res.json()
      if (res.status === 401) {
        router.push('/auth?tab=signin')
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // ignore
    } finally {
      setLoadingPack(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FC', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <PublicNav />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 96px' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', padding: '72px 0 56px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            borderRadius: 100, padding: '5px 14px', marginBottom: 20,
          }}>
            <Zap size={13} color="#1D4ED8" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8', letterSpacing: '0.04em' }}>
              CREDIT-BASED · CANCEL ANYTIME
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800,
            color: '#0F172A', lineHeight: 1.15, marginBottom: 16,
          }}>
            Pay for what you generate.
            <br />
            <span style={{ color: '#1D4ED8' }}>Nothing more.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
            Each listing generation uses one credit. Start free, upgrade when you need more volume.
          </p>
        </div>

        {/* ── Pricing cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>
          {plans.map((plan) => (
            <div
              key={plan.key}
              style={{
                background: plan.highlight ? 'linear-gradient(160deg, #1D4ED8 0%, #1e3a8a 100%)' : '#fff',
                border: plan.highlight ? 'none' : '1.5px solid #EAECF0',
                borderRadius: 20,
                padding: 28,
                boxShadow: plan.highlight
                  ? '0 16px 48px rgba(29,78,216,0.3)'
                  : '0 2px 12px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
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
                  <Star size={9} style={{ fill: '#92400E' }} />
                  {plan.badge.toUpperCase()}
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: plan.highlight ? 'rgba(255,255,255,0.55)' : '#9CA3AF', marginBottom: 4,
                }}>
                  {plan.name}
                </p>
                <p style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#6B7280', marginBottom: 16 }}>
                  {plan.tagline}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontSize: plan.price === null ? 26 : 36, fontWeight: 800,
                    color: plan.highlight ? '#fff' : '#0F172A', lineHeight: 1,
                  }}>
                    {plan.priceLabel}
                  </span>
                  <span style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.45)' : '#9CA3AF' }}>
                    {plan.priceSub}
                  </span>
                </div>
                <div style={{
                  marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
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
              {plan.ctaHref ? (
                <Link
                  href={plan.ctaHref}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '12px 0', borderRadius: 10, textDecoration: 'none',
                    fontSize: 14, fontWeight: 700,
                    background: plan.highlight ? '#fff' : plan.key === 'free' ? '#0F172A' : '#EFF6FF',
                    color: plan.highlight ? '#1D4ED8' : plan.key === 'free' ? '#fff' : '#1D4ED8',
                    transition: 'all 0.15s',
                    marginBottom: 24,
                  }}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              ) : (
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
                    marginBottom: 24,
                  }}
                >
                  {loadingPlan === plan.key ? 'Redirecting...' : plan.cta}
                  <ArrowRight size={14} />
                </button>
              )}

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5,
                      background: plan.highlight ? 'rgba(255,255,255,0.15)' : '#EFF6FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Check size={11} color={plan.highlight ? '#fff' : '#1D4ED8'} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#374151', lineHeight: 1.4 }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {plan.key === 'enterprise' && (
                <div style={{
                  marginTop: 20, padding: '12px 14px',
                  background: '#F0F9FF', borderRadius: 10, border: '1px solid #BFDBFE',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Building2 size={13} color="#1D4ED8" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8' }}>Minimum 10 agents</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
                    Custom pricing scales automatically as your team grows.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Credit packs ── */}
        <div style={{ marginTop: 72 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              Need a few more listings?
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280' }}>
              Buy extra credits on any plan — they never expire and stack on top of your monthly allowance.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, maxWidth: 700, margin: '0 auto',
          }}>
            {creditPacks.map((pack) => (
              <button
                key={pack.key}
                onClick={() => handleBuyPack(pack.key)}
                disabled={!!loadingPack}
                style={{
                  padding: '20px 20px 18px', borderRadius: 16, cursor: loadingPack ? 'not-allowed' : 'pointer',
                  border: pack.popular ? '2px solid #1D4ED8' : '1.5px solid #EAECF0',
                  background: pack.popular ? '#EFF6FF' : '#fff',
                  fontFamily: 'inherit', textAlign: 'left',
                  opacity: loadingPack && loadingPack !== pack.key ? 0.5 : 1,
                  transition: 'all 0.15s',
                  boxShadow: pack.popular ? '0 4px 20px rgba(29,78,216,0.12)' : 'none',
                }}
              >
                {pack.popular && (
                  <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: '#1D4ED8',
                    background: '#DBEAFE', display: 'inline-block',
                    padding: '2px 8px', borderRadius: 100, marginBottom: 10,
                  }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                  {pack.label}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
                  {pack.perCredit} per credit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#1D4ED8' }}>{pack.price}</span>
                  <ArrowRight size={16} color={pack.popular ? '#1D4ED8' : '#9CA3AF'} />
                </div>
                {loadingPack === pack.key && (
                  <p style={{ fontSize: 11, color: '#6B7280', marginTop: 6, textAlign: 'center' }}>Redirecting...</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Comparison table (simple) ── */}
        <div style={{ marginTop: 80 }}>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 32 }}>
            Compare plans
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Feature', 'Free', 'Plus', 'Pro', 'Enterprise'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: i === 0 ? 'left' : 'center',
                      fontSize: 12, fontWeight: 700, color: '#6B7280',
                      borderBottom: '2px solid #EAECF0', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Monthly credits',         '1',       '5',        '15',       'Unlimited'],
                  ['Extra credit packs',       '✓',       '✓',        '✓',        '✓'],
                  ['English + Arabic output',  '✓',       '✓',        '✓',        '✓'],
                  ['All content formats',      '✓',       '✓',        '✓',        '✓'],
                  ['Email support',            '—',       '✓',        '✓',        '✓'],
                  ['Priority support',         '—',       '—',        '✓',        '✓'],
                  ['Advanced analytics',       '—',       '—',        '✓',        '✓'],
                  ['Admin dashboard',          '—',       '—',        '—',        '✓'],
                  ['White-label platform',     '—',       '—',        '—',        '✓'],
                  ['Dedicated account mgr',    '—',       '—',        '—',        '✓'],
                  ['SLA guarantee',            '—',       '—',        '—',        '✓'],
                  ['Portal integrations',      '—',       '—',        '—',        '✓'],
                ].map(([label, free, plus, pro, ent], i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                    <td style={{ padding: '11px 16px', color: '#374151', fontWeight: 500 }}>{label}</td>
                    {[free, plus, pro, ent].map((val, j) => (
                      <td key={j} style={{ padding: '11px 16px', textAlign: 'center', color: val === '—' ? '#D1D5DB' : val === '✓' ? '#1D4ED8' : '#0F172A', fontWeight: val === '✓' ? 700 : 600 }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: '#F7F8FC' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>Price</td>
                  {['Free', 'AED 95/mo', 'AED 145/mo', 'Custom'].map((p, i) => (
                    <td key={i} style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: i === 2 ? '#1D4ED8' : '#0F172A' }}>
                      {p}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ marginTop: 80, maxWidth: 680, margin: '80px auto 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 32 }}>
            Common questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: '#fff', border: '1.5px solid #EAECF0',
                  borderRadius: 12, overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{faq.q}</span>
                  <span style={{
                    fontSize: 18, color: '#9CA3AF', lineHeight: 1,
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s', flexShrink: 0, marginLeft: 12,
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px' }}>
                    <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Enterprise CTA ── */}
        <div style={{
          marginTop: 72, background: 'linear-gradient(135deg, #0F1829 0%, #1D3461 100%)',
          borderRadius: 24, padding: '48px 40px', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <MessageSquare size={22} color="#5DA3FF" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            Running a brokerage?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 420, margin: '0 auto 28px' }}>
            Enterprise plans start at 10 agents with a dedicated account manager, white-label options, and custom per-agent pricing.
          </p>
          <Link
            href="/contact-sales"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', color: '#0F1829',
              fontSize: 14, fontWeight: 700, padding: '13px 28px', borderRadius: 10,
              textDecoration: 'none', transition: 'all 0.15s',
            }}
          >
            Talk to our team
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  )
}

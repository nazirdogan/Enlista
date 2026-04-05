'use client'

import { useState } from 'react'
import { X, Zap, TrendingUp, ArrowRight, Check } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
  creditsRemaining: number
  extraCredits: number
}

const CREDIT_PACKS = [
  { key: 'credits_5',  label: '5 Credits',  price: '$15', pricePerCredit: '$3.00', popular: false },
  { key: 'credits_10', label: '10 Credits', price: '$25', pricePerCredit: '$2.50', popular: true  },
  { key: 'credits_20', label: '20 Credits', price: '$40', pricePerCredit: '$2.00', popular: false },
]

const UPGRADE_PLANS = [
  {
    key: 'plus',
    name: 'Plus',
    price: '$25/mo',
    credits: 5,
    features: ['5 listings/month', 'All content formats', 'English + Arabic', 'Voice input'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$40/mo',
    credits: 15,
    features: ['15 listings/month', 'All content formats', 'English + Arabic', 'Priority support', 'Advanced analytics'],
    highlight: true,
  },
]

export default function OutOfCreditsModal({ isOpen, onClose, currentPlan, creditsRemaining, extraCredits }: Props) {
  const [tab, setTab] = useState<'credits' | 'upgrade'>('credits')
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const totalCredits = creditsRemaining + extraCredits

  async function handleBuyCredits(packKey: string) {
    setLoading(packKey)
    try {
      const res = await fetch('/api/stripe/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: packKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleUpgrade(planKey: string) {
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F1829 0%, #1D3461 100%)',
          padding: '28px 28px 24px',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>

          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'rgba(255,165,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Zap size={22} color="#FFA500" />
          </div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 6 }}>
            {totalCredits === 0 ? 'You\'re out of credits' : 'Running low on credits'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0 }}>
            {totalCredits === 0
              ? 'Top up to keep generating listing content.'
              : `${totalCredits} credit${totalCredits !== 1 ? 's' : ''} left. Top up or upgrade to continue.`}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #F0F0F0', background: '#FAFAFA',
        }}>
          {[
            { key: 'credits', label: 'Buy Credits', icon: Zap },
            { key: 'upgrade', label: 'Upgrade Plan', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'credits' | 'upgrade')}
              style={{
                flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer',
                background: 'transparent', fontFamily: 'inherit',
                fontSize: 13, fontWeight: tab === key ? 700 : 500,
                color: tab === key ? '#1D4ED8' : '#6B7280',
                borderBottom: tab === key ? '2px solid #1D4ED8' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '24px 28px 28px' }}>

          {/* ── Buy Credits tab ── */}
          {tab === 'credits' && (
            <div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 18 }}>
                Extra credits never expire and stack on top of your monthly allowance.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CREDIT_PACKS.map((pack) => (
                  <button
                    key={pack.key}
                    onClick={() => handleBuyCredits(pack.key)}
                    disabled={!!loading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px',
                      border: pack.popular ? '2px solid #1D4ED8' : '1.5px solid #E5E7EB',
                      borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                      background: pack.popular ? '#EFF6FF' : '#fff',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                      opacity: loading && loading !== pack.key ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: pack.popular ? '#1D4ED8' : '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Zap size={16} color={pack.popular ? '#fff' : '#6B7280'} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                          {pack.label}
                          {pack.popular && (
                            <span style={{
                              marginLeft: 8, fontSize: 10, fontWeight: 700,
                              background: '#1D4ED8', color: '#fff',
                              padding: '2px 7px', borderRadius: 100, verticalAlign: 'middle',
                            }}>BEST VALUE</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{pack.pricePerCredit} per credit</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{pack.price}</span>
                      <ArrowRight size={16} color={pack.popular ? '#1D4ED8' : '#9CA3AF'} />
                    </div>
                  </button>
                ))}
              </div>

              {currentPlan === 'free' && (
                <p style={{
                  marginTop: 16, fontSize: 12, color: '#9CA3AF', textAlign: 'center',
                }}>
                  Already on the Free plan?{' '}
                  <button
                    onClick={() => setTab('upgrade')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D4ED8', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, padding: 0 }}
                  >
                    Upgrade for a better monthly rate →
                  </button>
                </p>
              )}
            </div>
          )}

          {/* ── Upgrade Plan tab ── */}
          {tab === 'upgrade' && (
            <div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 18 }}>
                Switch to a monthly plan for a better per-listing rate.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {UPGRADE_PLANS.filter(p => p.key !== currentPlan).map((plan) => (
                  <button
                    key={plan.key}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={!!loading}
                    style={{
                      padding: '18px 16px', border: plan.highlight ? '2px solid #1D4ED8' : '1.5px solid #E5E7EB',
                      borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer',
                      background: plan.highlight ? 'linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%)' : '#fff',
                      fontFamily: 'inherit', textAlign: 'left',
                      opacity: loading && loading !== plan.key ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#9CA3AF', marginBottom: 4,
                    }}>
                      {plan.name}
                    </div>
                    <div style={{
                      fontSize: 22, fontWeight: 800,
                      color: plan.highlight ? '#fff' : '#111827', marginBottom: 12,
                    }}>
                      {plan.price}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {plan.features.map((f) => (
                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <Check size={13} color={plan.highlight ? 'rgba(255,255,255,0.7)' : '#1D4ED8'} style={{ marginTop: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#374151' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 6, fontSize: 13, fontWeight: 600,
                      color: plan.highlight ? '#fff' : '#1D4ED8',
                    }}>
                      {loading === plan.key ? 'Redirecting...' : 'Get started'}
                      <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>

              <p style={{ marginTop: 16, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                For teams of 10+ agents,{' '}
                <a href="/contact-sales" style={{ color: '#1D4ED8', fontWeight: 600 }}>
                  contact us for Enterprise pricing
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

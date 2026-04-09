'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const PLANS = [
  {
    key: 'plus',
    name: 'Plus',
    price: 'AED 95',
    priceSub: 'per month after trial',
    credits: 5,
    features: [
      '5 listing credits per month',
      'Full AI listing generation',
      'English + Arabic output',
      'WhatsApp & Instagram copy',
      'Credits reset on the 1st',
      'Buy extra credits anytime',
      'Email support',
    ],
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 'AED 145',
    priceSub: 'per month after trial',
    credits: 15,
    features: [
      '15 listing credits per month',
      'Everything in Plus',
      'Priority support',
      'Advanced analytics',
      'Early access to new features',
    ],
    highlight: true,
    badge: 'Most popular',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // If user already has an active subscription, send them straight to the dashboard
  useEffect(() => {
    fetch('/api/credits')
      .then((r) => r.json())
      .then((data) => {
        if (data.plan && data.plan !== 'free') {
          router.replace('/dashboard')
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [router])

  if (checking) return null

  const handleStartTrial = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing: 'monthly' }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Could not start checkout. Please try again.')
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F2F4F7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      {/* Wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontWeight: 800, fontSize: 26, color: '#0F1829', margin: 0 }}>
            Enlist<span style={{ color: '#1D4ED8' }}>a</span>
          </h1>
        </Link>
        <p style={{ color: '#64748B', fontSize: 15, marginTop: 8, marginBottom: 0 }}>
          Account created. Now choose your plan to start your free trial.
        </p>
      </div>

      {/* Trial banner */}
      <div style={{
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 10,
        padding: '14px 24px',
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 520,
        width: '100%',
      }}>
        <p style={{ margin: 0, fontSize: 14, color: '#1D4ED8', fontWeight: 600 }}>
          14 days free — no charge until your trial ends
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#3B82F6' }}>
          You can cancel anytime before the trial ends and you won&apos;t be billed.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 640,
      }}>
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            style={{
              flex: '1 1 260px',
              maxWidth: 300,
              background: '#FFFFFF',
              border: plan.highlight ? '2px solid #1D4ED8' : '1px solid #DDE3EC',
              borderRadius: 14,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1D4ED8',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {plan.badge}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F1829', margin: '0 0 6px' }}>
                {plan.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#0F1829' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>{plan.priceSub}</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                {plan.credits} listings/month
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <Check size={14} style={{ color: '#1D4ED8', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: '#334155' }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleStartTrial(plan.key)}
              disabled={loading !== null}
              style={{
                width: '100%',
                background: plan.highlight ? '#1D4ED8' : '#0F1829',
                color: 'white',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                opacity: loading !== null ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
                transition: 'opacity 0.15s',
              }}
            >
              {loading === plan.key
                ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Redirecting...</>
                : `Start free trial →`}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 28, fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
        Already subscribed?{' '}
        <Link href="/dashboard" style={{ color: '#1D4ED8', textDecoration: 'none', fontWeight: 600 }}>
          Go to dashboard
        </Link>
      </p>
    </div>
  )
}

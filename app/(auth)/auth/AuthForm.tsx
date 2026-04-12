'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

type Tab = 'signin' | 'signup'

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#64748B',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: 6,
  border: '1.5px solid #DDE3EC',
  outline: 'none',
  fontSize: 14,
  color: '#1E293B',
  background: '#FFFFFF',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const INPUT_ERROR: React.CSSProperties = {
  ...INPUT,
  border: '1.5px solid #EF4444',
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters'
  return null
}

export default function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Default to signup unless ?tab=signin is explicitly set
  const tabParam = searchParams.get('tab')
  const [tab, setTab] = useState<Tab>(tabParam === 'signin' ? 'signin' : 'signup')
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  // Sign-in state
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siShowPw, setSiShowPw] = useState(false)

  // Sign-up state — 3 fields only
  const [agencyName, setAgencyName] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  // Redirect already-authenticated users
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard')
      } else {
        setSessionChecked(true)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync tab with URL param
  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'signin' || t === 'signup') setTab(t)
  }, [searchParams])

  // Persist outreach tracking token from URL to localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('t')
    if (t) localStorage.setItem('enlista_outreach_token', t)
    const ref = params.get('ref')
    if (ref) localStorage.setItem('enlista_ref_code', ref)
  }, [])

  const switchTab = (t: Tab) => {
    setTab(t)
    router.replace(`/auth?tab=${t}`)
  }

  const allSignUpFilled = Boolean(agencyName && workEmail && password && !pwError)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: siEmail,
        password: siPassword,
      })
      if (error) {
        toast.error(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const pwErr = validatePassword(password)
    if (pwErr) { setPwError(pwErr); return }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: workEmail,
        password,
        options: {
          data: {
            agency_name: agencyName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (!data.user) {
        toast.error('Signup could not be completed. Please try again.')
        return
      }

      const trialStartedAt = new Date().toISOString()
      const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const { error: agencyError } = await supabase.from('agencies').insert({
        user_id: data.user.id,
        name: agencyName,
        email: workEmail,
        account_status: 'trial',
        trial_started_at: trialStartedAt,
        trial_ends_at: trialEndsAt,
      })
      if (agencyError && agencyError.code !== '23505') {
        console.error('Agency creation error:', agencyError)
      }

      toast.success('Welcome to Enlista.io')

      // Fire Meta pixel StartTrial conversion event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).fbq('track', 'StartTrial', {
          currency: 'AED',
          predicted_ltv: 95,
        })
      }

      // Attribute signup to outreach campaign if token present
      const outreachToken = typeof window !== 'undefined'
        ? localStorage.getItem('enlista_outreach_token')
        : null
      if (outreachToken && data.user?.id) {
        fetch('/api/outreach/signup-hook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: outreachToken, userId: data.user.id }),
        }).then(() => localStorage.removeItem('enlista_outreach_token'))
      }

      // Call post-signup to send trial email and handle referral attribution
      const refCode = typeof window !== 'undefined'
        ? localStorage.getItem('enlista_ref_code')
        : null
      if (data.user?.id) {
        fetch('/api/auth/post-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refCode }),
        }).then(() => {
          if (refCode) localStorage.removeItem('enlista_ref_code')
        })
      }

      router.push('/dashboard')
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) return null

  const inputStyle = (hasError: boolean) => hasError ? INPUT_ERROR : INPUT

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F2F4F7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#FFFFFF',
        border: '1px solid #DDE3EC',
        borderRadius: 16,
        padding: 'clamp(32px, 5vw, 48px)',
      }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontWeight: 800, fontSize: 24, color: '#0F1829', margin: 0 }}>
              Enlist<span style={{ color: '#1D4ED8' }}>a</span>
            </h1>
          </Link>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 6, marginBottom: 0 }}>
            {tab === 'signup' ? '30-day free trial · No credit card required' : 'Sign in to your account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: '#F2F4F7',
          borderRadius: 8,
          padding: 4,
          marginBottom: 28,
          gap: 4,
        }}>
          {(['signup', 'signin'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? '#0F1829' : '#64748B',
                background: tab === t ? '#FFFFFF' : 'transparent',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {t === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Sign In form */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={LABEL}>Email</label>
              <input
                type="email"
                value={siEmail}
                onChange={(e) => setSiEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="agent@agency.ae"
                style={INPUT}
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>
            <div>
              <label style={LABEL}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={siShowPw ? 'text' : 'password'}
                  value={siPassword}
                  onChange={(e) => setSiPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{ ...INPUT, paddingRight: 44 }}
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
                <button
                  type="button"
                  onClick={() => setSiShowPw(!siShowPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0,
                  }}
                  aria-label={siShowPw ? 'Hide password' : 'Show password'}
                >
                  {siShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !siEmail || !siPassword}
              style={{
                width: '100%', background: '#1D4ED8', color: 'white',
                padding: '13px', borderRadius: 6, border: 'none',
                fontSize: 14, fontWeight: 600,
                cursor: loading || !siEmail || !siPassword ? 'not-allowed' : 'pointer',
                opacity: loading || !siEmail || !siPassword ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'opacity 0.15s',
              }}
            >
              {loading
                ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />Signing In...</>
                : 'Sign In →'}
            </button>
          </form>
        )}

        {/* Sign Up form — 3 fields only */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Agency name */}
            <div>
              <label style={LABEL}>Agency Name</label>
              <input
                type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)}
                required autoComplete="organization" placeholder="Prestige Properties Dubai"
                style={INPUT}
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={LABEL}>Email</label>
              <input
                type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)}
                required autoComplete="email" placeholder="you@agency.ae"
                style={INPUT}
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={LABEL}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPwError(null) }}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  style={{ ...inputStyle(!!pwError), paddingRight: 44 }}
                  onFocus={(e) => { e.target.style.borderColor = pwError ? '#EF4444' : '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = pwError ? '#EF4444' : '#DDE3EC' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0,
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwError && (
                <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4, marginBottom: 0 }}>{pwError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !allSignUpFilled}
              style={{
                width: '100%', background: '#1D4ED8', color: 'white',
                padding: '13px', borderRadius: 6, border: 'none',
                fontSize: 14, fontWeight: 600,
                cursor: loading || !allSignUpFilled ? 'not-allowed' : 'pointer',
                opacity: loading || !allSignUpFilled ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'opacity 0.15s',
                marginTop: 4,
              }}
            >
              {loading
                ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />Creating Account...</>
                : 'Start free trial →'}
            </button>
          </form>
        )}

        {/* Footer toggle */}
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748B', marginBottom: 0 }}>
          {tab === 'signin' ? (
            <>Don&apos;t have an account?{' '}<button onClick={() => switchTab('signup')} style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Sign Up</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => switchTab('signin')} style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}

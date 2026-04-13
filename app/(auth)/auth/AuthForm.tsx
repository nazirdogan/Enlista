'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Zap, Globe, MessageCircle, CheckCircle2 } from 'lucide-react'

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

// ─── Left panel feature rows ──────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Zap,
    title: '30-second listings',
    desc: 'Paste property details and get a polished listing in seconds.',
  },
  {
    Icon: Globe,
    title: 'English + Arabic output',
    desc: 'Every listing generated in both languages — ready to post anywhere.',
  },
  {
    Icon: MessageCircle,
    title: 'WhatsApp-ready copy',
    desc: 'Condensed, attention-grabbing captions built for mobile sharing.',
  },
]

const TRUST = ['RERA compliant', 'No credit card required', 'Setup in 5 minutes']

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

  // Sign-up state — 4 fields
  const [fullName, setFullName] = useState('')
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

  // Fire Meta pixel Lead event when signup tab is viewed — mid-funnel signal
  // for Meta to optimise toward users likely to convert, without waiting for StartTrial
  useEffect(() => {
    if (tab === 'signup') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).fbq('track', 'Lead')
      }
    }
  }, [tab])

  const switchTab = (t: Tab) => {
    setTab(t)
    router.replace(`/auth?tab=${t}`)
  }

  const allSignUpFilled = Boolean(fullName && agencyName && workEmail && password && !pwError)

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
            full_name: fullName,
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

  // ─── Sign In — split layout (matching signup) ───────────────────────────────
  if (tab === 'signin') {
    return (
      <>
        <style>{`
          @keyframes enlista-spin { to { transform: rotate(360deg); } }
        `}</style>

        <div className="flex flex-col md:flex-row" style={{ minHeight: '100vh' }}>

          {/* ── Dark panel ───────────────────────────────────────────────── */}
          <div className="w-full md:w-[55%]" style={{ background: '#0F1829' }}>

            {/* MOBILE ONLY: compact header — wordmark + tagline + trust */}
            <div
              className="flex flex-col md:hidden"
              style={{ padding: '28px 24px 22px', position: 'relative', overflow: 'hidden' }}
            >
              {/* Subtle glow */}
              <div style={{
                position: 'absolute', top: -60, right: -60,
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              {/* Top row: wordmark + sign up link */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <span style={{ fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.3px' }}>
                    Enlist<span style={{ color: '#3B82F6' }}>a</span>
                  </span>
                </Link>
                <button
                  onClick={() => switchTab('signup')}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6, color: '#93C5FD', cursor: 'pointer',
                    fontWeight: 600, fontSize: 12, padding: '5px 12px', fontFamily: 'inherit',
                  }}
                >
                  Sign up
                </button>
              </div>
              {/* Tagline */}
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                Less typing. More viewings.
              </h2>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 14px', lineHeight: 1.5 }}>
                AI listing descriptions for UAE real estate — bilingual, in seconds.
              </p>
              {/* Trust badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                {TRUST.map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle2 size={11} color="#22C55E" />
                    <span style={{ fontSize: 11, color: '#64748B' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DESKTOP ONLY: full info panel */}
            <div
              className="hidden md:flex flex-col justify-between"
              style={{
                height: '100%',
                minHeight: '100vh',
                padding: 'clamp(40px, 6vw, 64px)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle background glow */}
              <div style={{
                position: 'absolute', top: -120, right: -120,
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div>
                {/* Wordmark */}
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 48 }}>
                  <span style={{ fontWeight: 800, fontSize: 22, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                    Enlist<span style={{ color: '#3B82F6' }}>a</span>
                  </span>
                </Link>

                {/* Hero copy */}
                <h2 style={{
                  fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800,
                  color: '#FFFFFF', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.5px',
                }}>
                  Less typing.<br />More viewings.
                </h2>
                <p style={{ fontSize: 16, color: '#94A3B8', margin: '0 0 44px', lineHeight: 1.6 }}>
                  AI listing descriptions built specifically for UAE real estate. Bilingual, branded, and done in seconds.
                </p>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 44 }}>
                  {FEATURES.map(({ Icon, title, desc }) => (
                    <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{
                        flexShrink: 0, width: 36, height: 36, borderRadius: 8,
                        background: 'rgba(59,130,246,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                      }}>
                        <Icon size={17} color="#3B82F6" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>{title}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sample output card */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '18px 20px', marginBottom: 36,
                }}>
                  <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Sample output
                  </p>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748B' }}>You type</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                        2BR, JVC, 1.1M AED, pool view, modern kitchen
                      </p>
                    </div>
                    <div style={{ color: '#3B82F6', fontSize: 16, marginTop: 16, flexShrink: 0 }}>→</div>
                    <div style={{ flex: 1.2 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748B' }}>Enlista outputs</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#E2E8F0', lineHeight: 1.5 }}>
                        &ldquo;Stunning 2BR in JVC with pool views &amp; a sleek open kitchen — priced at AED 1.1M.&rdquo;
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: 11, color: '#3B82F6' }}>+ Arabic version included</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                <div style={{ borderLeft: '3px solid #3B82F6', paddingLeft: 16 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 14, color: '#E2E8F0', lineHeight: 1.6, fontStyle: 'italic' }}>
                    &ldquo;Two days to four minutes. That&apos;s a 720× improvement in our listing workflow.&rdquo;
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    Head of Operations, Dubai brokerage
                  </p>
                </div>
              </div>

              {/* Trust strip */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 40,
                paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)',
              }}>
                {TRUST.map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} color="#22C55E" />
                    <span style={{ fontSize: 12, color: '#64748B' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Form panel ───────────────────────────────────────────────── */}
          <div
            className="w-full md:w-[45%] flex items-center justify-center"
            style={{
              background: '#F8FAFC',
              padding: 'clamp(24px, 4vw, 56px) clamp(20px, 4vw, 48px)',
            }}
          >
            <div style={{ width: '100%', maxWidth: 400 }}>

              {/* Heading — desktop only (mobile gets wordmark+tagline from dark panel above) */}
              <div className="hidden md:block" style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F1829', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
                  Sign in
                </h2>
                <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                  Welcome back
                </p>
              </div>

              {/* Mobile heading — shorter, no redundant subtext */}
              <div className="block md:hidden" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1829', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                  Sign in
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                  To your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Email */}
                <div>
                  <label style={LABEL}>Email</label>
                  <input
                    type="email"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@agency.ae"
                    style={{ ...INPUT, fontSize: 16 }}
                    onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                    onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                  />
                </div>

                {/* Password */}
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
                      style={{ ...INPUT, paddingRight: 44, fontSize: 16 }}
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
                    padding: '13px', borderRadius: 8, border: 'none',
                    fontSize: 15, fontWeight: 700,
                    cursor: loading || !siEmail || !siPassword ? 'not-allowed' : 'pointer',
                    opacity: loading || !siEmail || !siPassword ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'inherit', transition: 'opacity 0.15s', marginTop: 4,
                  }}
                >
                  {loading
                    ? <><Loader2 style={{ width: 16, height: 16, animation: 'enlista-spin 1s linear infinite' }} />Signing In...</>
                    : 'Sign in →'}
                </button>
              </form>

              {/* Footer */}
              <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#64748B', marginBottom: 0 }}>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchTab('signup')}
                  style={{
                    background: 'none', border: 'none', color: '#1D4ED8',
                    cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    padding: 0, fontFamily: 'inherit',
                  }}
                >
                  Start free trial
                </button>
              </p>

            </div>
          </div>

        </div>
      </>
    )
  }

  // ─── Sign Up — split layout ───────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes enlista-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/*
        Tailwind handles ALL responsive layout here — no custom CSS media queries.
        flex-col on mobile → md:flex-row on desktop (md = 768px in Tailwind).
      */}
      <div className="flex flex-col md:flex-row" style={{ minHeight: '100vh' }}>

        {/* ── Dark panel ───────────────────────────────────────────────── */}
        <div className="w-full md:w-[55%]" style={{ background: '#0F1829' }}>

          {/* MOBILE ONLY: compact header — wordmark + tagline + trust */}
          {/* hidden md:hidden → flex on mobile, hidden on ≥768px         */}
          <div
            className="flex flex-col md:hidden"
            style={{ padding: '28px 24px 22px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Subtle glow */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            {/* Top row: wordmark + sign in link */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.3px' }}>
                  Enlist<span style={{ color: '#3B82F6' }}>a</span>
                </span>
              </Link>
              <button
                onClick={() => switchTab('signin')}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6, color: '#93C5FD', cursor: 'pointer',
                  fontWeight: 600, fontSize: 12, padding: '5px 12px', fontFamily: 'inherit',
                }}
              >
                Sign in
              </button>
            </div>
            {/* Tagline */}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
              Less typing. More viewings.
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 14px', lineHeight: 1.5 }}>
              AI listing descriptions for UAE real estate — bilingual, in seconds.
            </p>
            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
              {TRUST.map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={11} color="#22C55E" />
                  <span style={{ fontSize: 11, color: '#64748B' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP ONLY: full info panel */}
          <div
            className="hidden md:flex flex-col justify-between"
            style={{
              height: '100%',
              minHeight: '100vh',
              padding: 'clamp(40px, 6vw, 64px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle background glow */}
            <div style={{
              position: 'absolute', top: -120, right: -120,
              width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div>
              {/* Wordmark */}
              <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 48 }}>
                <span style={{ fontWeight: 800, fontSize: 22, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                  Enlist<span style={{ color: '#3B82F6' }}>a</span>
                </span>
              </Link>

              {/* Hero copy */}
              <h2 style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800,
                color: '#FFFFFF', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.5px',
              }}>
                Less typing.<br />More viewings.
              </h2>
              <p style={{ fontSize: 16, color: '#94A3B8', margin: '0 0 44px', lineHeight: 1.6 }}>
                AI listing descriptions built specifically for UAE real estate. Bilingual, branded, and done in seconds.
              </p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 44 }}>
                {FEATURES.map(({ Icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: 8,
                      background: 'rgba(59,130,246,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                    }}>
                      <Icon size={17} color="#3B82F6" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>{title}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample output card */}
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '18px 20px', marginBottom: 36,
              }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Sample output
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748B' }}>You type</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                      2BR, JVC, 1.1M AED, pool view, modern kitchen
                    </p>
                  </div>
                  <div style={{ color: '#3B82F6', fontSize: 16, marginTop: 16, flexShrink: 0 }}>→</div>
                  <div style={{ flex: 1.2 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748B' }}>Enlista outputs</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#E2E8F0', lineHeight: 1.5 }}>
                      &ldquo;Stunning 2BR in JVC with pool views &amp; a sleek open kitchen — priced at AED 1.1M.&rdquo;
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: 11, color: '#3B82F6' }}>+ Arabic version included</p>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <div style={{ borderLeft: '3px solid #3B82F6', paddingLeft: 16 }}>
                <p style={{ margin: '0 0 6px', fontSize: 14, color: '#E2E8F0', lineHeight: 1.6, fontStyle: 'italic' }}>
                  &ldquo;Two days to four minutes. That&apos;s a 720× improvement in our listing workflow.&rdquo;
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  Head of Operations, Dubai brokerage
                </p>
              </div>
            </div>

            {/* Trust strip */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 40,
              paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)',
            }}>
              {TRUST.map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color="#22C55E" />
                  <span style={{ fontSize: 12, color: '#64748B' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form panel ───────────────────────────────────────────────── */}
        <div
          className="w-full md:w-[45%] flex items-center justify-center"
          style={{
            background: '#F8FAFC',
            padding: 'clamp(24px, 4vw, 56px) clamp(20px, 4vw, 48px)',
          }}
        >
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Heading — desktop only (mobile gets wordmark+tagline from dark panel above) */}
            <div className="hidden md:block" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F1829', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
                Start your free trial
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                30 days free &middot; No credit card required
              </p>
            </div>

            {/* Mobile heading — shorter, no redundant subtext */}
            <div className="block md:hidden" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1829', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                Create your account
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                30 days free &middot; No credit card required
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Full name */}
              <div>
                <label style={LABEL}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Sarah Al Mansoori"
                  style={{ ...INPUT, fontSize: 16 }}
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>

              {/* Agency name */}
              <div>
                <label style={LABEL}>Agency Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                  autoComplete="organization"
                  placeholder="Prestige Properties Dubai"
                  style={{ ...INPUT, fontSize: 16 }}
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={LABEL}>Email</label>
                <input
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@agency.ae"
                  style={{ ...INPUT, fontSize: 16 }}
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
                    style={{ ...inputStyle(!!pwError), paddingRight: 44, fontSize: 16 }}
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
                  padding: '13px', borderRadius: 8, border: 'none',
                  fontSize: 15, fontWeight: 700,
                  cursor: loading || !allSignUpFilled ? 'not-allowed' : 'pointer',
                  opacity: loading || !allSignUpFilled ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit', transition: 'opacity 0.15s', marginTop: 4,
                }}
              >
                {loading
                  ? <><Loader2 style={{ width: 16, height: 16, animation: 'enlista-spin 1s linear infinite' }} />Creating Account...</>
                  : 'Start free trial →'}
              </button>
            </form>

            {/* Footer */}
            <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#64748B', marginBottom: 0 }}>
              Already have an account?{' '}
              <button
                onClick={() => switchTab('signin')}
                style={{
                  background: 'none', border: 'none', color: '#1D4ED8',
                  cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  padding: 0, fontFamily: 'inherit',
                }}
              >
                Sign in
              </button>
            </p>

          </div>
        </div>

      </div>
    </>
  )
}

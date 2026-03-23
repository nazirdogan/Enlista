# Combined Auth Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate `/login` and `/signup` pages with a single `/auth` page that uses `?tab=signin` or `?tab=signup` to control the active tab, connected to Supabase Auth, with no email verification required.

**Architecture:** A thin server component at `app/(auth)/auth/page.tsx` wraps the client component in `<Suspense>` (required for `useSearchParams()` in Next.js 14). The client component `AuthForm.tsx` handles all tab state, form logic, validation, and Supabase calls. Old `/login` and `/signup` routes become permanent redirects. Five `href="#cta"` links on the landing page become typed auth URLs.

**Tech Stack:** Next.js 14 App Router, Supabase SSR client (`@supabase/ssr`), Lucide React icons, Sonner toasts, inline styles matching existing design system.

**Spec:** `docs/superpowers/specs/2026-03-17-combined-auth-page-design.md`

---

## Chunk 1: Create the combined auth page

### Task 1: Create the AuthForm client component

**Files:**
- Create: `app/(auth)/auth/AuthForm.tsx`

- [ ] **Step 1: Create `app/(auth)/auth/AuthForm.tsx`** with the full implementation below.

```tsx
'use client'

import { useState, useEffect } from 'react'
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
  if (pw.length !== 12) return 'Password must be exactly 12 characters'
  if (!/[A-Z]/.test(pw)) return 'Must include an uppercase letter'
  if (!/[a-z]/.test(pw)) return 'Must include a lowercase letter'
  if (!/[0-9]/.test(pw)) return 'Must include a number'
  if (!/[!@#$%^&*()\-_=+[\]{}|;':",.<>?/\\]/.test(pw))
    return 'Must include a special character'
  return null
}

export default function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const tabParam = searchParams.get('tab')
  const [tab, setTab] = useState<Tab>(tabParam === 'signin' ? 'signin' : 'signup')
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Sign-in state
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siShowPw, setSiShowPw] = useState(false)

  // Sign-up state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [agencyEmail, setAgencyEmail] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [confirmPwError, setConfirmPwError] = useState<string | null>(null)

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

  const switchTab = (t: Tab) => {
    setTab(t)
    router.replace(`/auth?tab=${t}`)
  }

  const allSignUpFilled = Boolean(
    firstName && lastName && agencyName && city && country &&
    agencyEmail && workEmail && phoneNumber && password && confirmPassword &&
    !pwError && !confirmPwError
  )

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
    if (password !== confirmPassword) {
      setConfirmPwError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: workEmail,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            agency_name: agencyName,
            city,
            country,
            agency_email: agencyEmail,
            phone: phoneNumber,
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

      const { error: agencyError } = await supabase.from('agencies').insert({
        user_id: data.user.id,
        name: agencyName,
        email: agencyEmail,
        phone: phoneNumber,
      })
      if (agencyError && agencyError.code !== '23505') {
        console.error('Agency creation error:', agencyError)
      }

      toast.success('Account created! Welcome to ListingsLaunch.')
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
          <h1 style={{ fontWeight: 800, fontSize: 24, color: '#0F1829', margin: 0 }}>
            Listings<span style={{ color: '#1D4ED8' }}>Launch</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 6, marginBottom: 0 }}>
            List it. In Arabic. In 30 seconds.
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
              <label style={LABEL}>Work Email</label>
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
                  placeholder="••••••••••••"
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

        {/* Sign Up form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* First + Last name row */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LABEL}>First Name</label>
                <input
                  type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  required autoComplete="given-name" placeholder="Sarah"
                  style={INPUT}
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>
              <div>
                <label style={LABEL}>Last Name</label>
                <input
                  type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  required autoComplete="family-name" placeholder="Al Mansoori"
                  style={INPUT}
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>
            </div>

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

            {/* City + Country row */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LABEL}>City</label>
                <input
                  type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  required autoComplete="address-level2" placeholder="Dubai"
                  style={INPUT}
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>
              <div>
                <label style={LABEL}>Country</label>
                <input
                  type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                  required autoComplete="country-name" placeholder="UAE"
                  style={INPUT}
                  onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
                />
              </div>
            </div>

            {/* Agency email */}
            <div>
              <label style={LABEL}>Agency Email</label>
              <input
                type="email" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)}
                required autoComplete="email" placeholder="info@prestige.ae"
                style={INPUT}
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>

            {/* Work email */}
            <div>
              <label style={LABEL}>Work Email</label>
              <input
                type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)}
                required autoComplete="email" placeholder="sarah@prestige.ae"
                style={INPUT}
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={LABEL}>Phone Number</label>
              <input
                type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                required autoComplete="tel" placeholder="+971 50 123 4567"
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
                  placeholder="Exactly 12 characters"
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
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, marginBottom: 0 }}>
                Exactly 12 characters · uppercase · lowercase · number · special character
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label style={LABEL}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPwError(null) }}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  style={{ ...inputStyle(!!confirmPwError), paddingRight: 44 }}
                  onFocus={(e) => { e.target.style.borderColor = confirmPwError ? '#EF4444' : '#1D4ED8' }}
                  onBlur={(e) => { e.target.style.borderColor = confirmPwError ? '#EF4444' : '#DDE3EC' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0,
                  }}
                  aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPwError && (
                <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4, marginBottom: 0 }}>{confirmPwError}</p>
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
                : 'Create Account →'}
            </button>
          </form>
        )}

        {/* Footer toggle */}
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748B', marginBottom: 0 }}>
          {tab === 'signin' ? (
            <>New here?{' '}<button onClick={() => switchTab('signup')} style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Create an account</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => switchTab('signin')} style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/(auth)/auth/page.tsx`** as the Suspense wrapper.

```tsx
import { Suspense } from 'react'
import AuthForm from './AuthForm'

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  )
}
```

- [ ] **Step 3: Run typecheck to verify no errors**

```bash
cd /Users/nazir/ListingAI && npm run typecheck 2>&1 | head -40
```

Expected: zero errors in the new files.

- [ ] **Step 4: Commit**

```bash
git add "app/(auth)/auth/page.tsx" "app/(auth)/auth/AuthForm.tsx"
git commit -m "feat: add combined /auth page with sign-in and sign-up tabs"
```

---

### Task 2: Redirect old /login and /signup routes

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/signup/page.tsx`

- [ ] **Step 1: Replace `app/(auth)/login/page.tsx`** with a permanent redirect.

```tsx
import { permanentRedirect } from 'next/navigation'

export default function LoginPage() {
  permanentRedirect('/auth?tab=signin')
}
```

- [ ] **Step 2: Replace `app/(auth)/signup/page.tsx`** with a permanent redirect.

```tsx
import { permanentRedirect } from 'next/navigation'

export default function SignupPage() {
  permanentRedirect('/auth?tab=signup')
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/nazir/ListingAI && npm run typecheck 2>&1 | head -20
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(auth)/login/page.tsx" "app/(auth)/signup/page.tsx"
git commit -m "feat: redirect /login and /signup to /auth with correct tab param"
```

---

## Chunk 2: Update landing page navigation

### Task 3: Update all auth links on the landing page

**Files:**
- Modify: `app/page.tsx`

There are 5 links to update and the bottom CTA form to convert.

- [ ] **Step 1: Update desktop nav "Sign in" link** (line ~187, `href="#cta"` with text "Sign in")

Change: `href="#cta"` → `href="/auth?tab=signin"`

- [ ] **Step 2: Update desktop nav "Get Started Free" link** (line ~202, `href="#cta"`)

Change: `href="#cta"` → `href="/auth?tab=signup"`

- [ ] **Step 3: Update mobile nav "Sign in" link** (line ~267, `href="#cta"` with text "Sign in", inside mobile dropdown)

Change: `href="#cta"` → `href="/auth?tab=signin"`
Also remove the `onClick={() => setMobileMenuOpen(false)}` handler or keep it — either is fine.

- [ ] **Step 4: Update mobile nav "Get Started Free" link** (line ~284, `href="#cta"` with text "Get Started Free", inside mobile dropdown)

Change: `href="#cta"` → `href="/auth?tab=signup"`

- [ ] **Step 5: Update hero "Start Free — 14 days" link** (line ~367, `href="#cta"` with text "Start Free — 14 days")

Change: `href="#cta"` → `href="/auth?tab=signup"`

- [ ] **Step 6: Convert the bottom CTA form to a redirect link**

The `<form>` at roughly line 1477–1517 has two fake inputs and a "Start Free Trial →" submit button that currently does nothing. Replace it with a single "Start Free Trial →" link styled to match:

Find this block:
```tsx
<form
  style={{ display: "flex", flexDirection: "column", gap: 10 }}
>
  {["Agency email", "Agency name"].map((placeholder) => (
    <input
      key={placeholder}
      type={placeholder.includes("email") ? "email" : "text"}
      placeholder={placeholder}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        color: "white",
        padding: "11px 16px",
        fontFamily: "var(--font-jakarta), sans-serif",
        fontSize: 13,
        borderRadius: 6,
        outline: "none",
        width: "100%",
      }}
    />
  ))}
  <button
    type="submit"
    style={{
      padding: 13,
      cursor: "pointer",
      background: c.blue,
      color: "white",
      border: "none",
      fontSize: 13,
      borderRadius: 6,
      display: "block",
      width: "100%",
      fontWeight: 600,
      letterSpacing: "0.02em",
      fontFamily: "var(--font-jakarta), sans-serif",
    }}
  >
    Start Free Trial →
  </button>
</form>
```

Replace with:
```tsx
<a
  href="/auth?tab=signup"
  style={{
    display: "block",
    textAlign: "center",
    padding: 13,
    background: c.blue,
    color: "white",
    border: "none",
    fontSize: 13,
    borderRadius: 6,
    fontWeight: 600,
    letterSpacing: "0.02em",
    fontFamily: "var(--font-jakarta), sans-serif",
    textDecoration: "none",
  }}
>
  Start Free Trial →
</a>
```

- [ ] **Step 7: Run typecheck and lint**

```bash
cd /Users/nazir/ListingAI && npm run typecheck && npm run lint 2>&1 | tail -20
```

Expected: zero errors and zero warnings on the modified files.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire landing page auth buttons to /auth with correct tab params"
```

---

## Final verification

- [ ] **Step 1: Run full typecheck + lint**

```bash
cd /Users/nazir/ListingAI && npm run typecheck && npm run lint
```

Expected: clean.

- [ ] **Step 2: Manual smoke test checklist**
  - Visit `/auth?tab=signup` — Sign Up tab is active
  - Visit `/auth?tab=signin` — Sign In tab is active
  - Visit `/login` — redirects to `/auth?tab=signin`
  - Visit `/signup` — redirects to `/auth?tab=signup`
  - Click "Sign in" in desktop nav → lands on Sign In tab
  - Click "Get Started Free" in desktop nav → lands on Sign Up tab
  - Click "Start Free — 14 days" hero button → lands on Sign Up tab
  - Sign Up: submit with any empty field → button stays disabled (cannot submit)
  - Sign Up: password not 12 chars → shows inline error
  - Sign Up: passwords don't match → shows inline error
  - Sign Up: valid data → redirects to `/dashboard`
  - Sign In: wrong credentials → toast error
  - Sign In: correct credentials → redirects to `/dashboard`
  - Visit `/auth` while already logged in → redirects to `/dashboard`

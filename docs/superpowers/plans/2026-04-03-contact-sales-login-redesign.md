# Contact Sales & Login Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace public self-serve signup with a Contact Sales lead capture form, simplify login to email+password only, and update all homepage CTAs.

**Architecture:** New `/contact-sales` public page with form → `POST /api/contact-sales` API route that validates, inserts into `contact_leads` table via Supabase admin client, and sends branded HTML email via Resend. Auth page modified to hide signup tab by default (still accessible via `?tab=signup` URL). Homepage CTAs all point to `/contact-sales`.

**Tech Stack:** Next.js 14 App Router, Supabase (Postgres + Auth), Resend (email), TypeScript, inline styles (matching existing patterns)

---

### Task 1: Database Migration — `contact_leads` table

**Files:**
- Create: `supabase/migrations/005_contact_leads.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- 005_contact_leads.sql
CREATE TABLE contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  location TEXT NOT NULL,
  focus_area TEXT[] NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for rate-limiting check (recent submissions by email)
CREATE INDEX idx_contact_leads_email_created ON contact_leads (email, created_at DESC);
```

- [ ] **Step 2: Apply the migration to Supabase**

Run: `npx supabase db push` (or apply manually via Supabase dashboard SQL editor if not using local Supabase CLI)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/005_contact_leads.sql
git commit -m "feat: add contact_leads table for agency sales inquiries"
```

---

### Task 2: Resend Email Template — Lead Notification

**Files:**
- Modify: `lib/email/resend.ts`

- [ ] **Step 1: Add the `contact_lead` type to `EmailPayload`**

In `lib/email/resend.ts`, add a new union member to the `EmailPayload` type (after line 10):

```typescript
| {
    type: 'contact_lead'
    to: string
    firstName: string
    lastName: string
    email: string
    phone: string
    agencyName: string
    employeeCount: string
    location: string
    focusArea: string[]
    message?: string
  }
```

- [ ] **Step 2: Add the subject line**

In the `subjects` object inside `sendTransactionalEmail` (around line 16), add:

```typescript
contact_lead: `New Agency Lead: ${'agencyName' in payload ? payload.agencyName : ''}`,
```

- [ ] **Step 3: Add the HTML builder case**

In the `buildEmailHtml` function's switch statement, add before the `default` case:

```typescript
case 'contact_lead':
  return `${base}
    <div style="text-align:center;margin-bottom:24px;">
      <h2 style="color:#1E293B;margin:0;">New Agency Lead</h2>
      <p style="color:#64748B;font-size:14px;margin-top:4px;">${payload.agencyName}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;width:140px;">Name</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.firstName} ${payload.lastName}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Email</td>
        <td style="padding:12px 8px;color:#1E293B;"><a href="mailto:${payload.email}" style="color:#1D4ED8;">${payload.email}</a></td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Phone</td>
        <td style="padding:12px 8px;color:#1E293B;"><a href="tel:${payload.phone}" style="color:#1D4ED8;">${payload.phone}</a></td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Agency</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.agencyName}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Employees</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.employeeCount}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Location</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.location}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Focus Area</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.focusArea.join(', ')}</td>
      </tr>
      ${payload.message ? `<tr><td style="padding:12px 8px;color:#64748B;font-weight:600;">Message</td><td style="padding:12px 8px;color:#1E293B;">${payload.message}</td></tr>` : ''}
    </table>
    <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Submitted at ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}</p>
  ${footer}`
```

- [ ] **Step 4: Commit**

```bash
git add lib/email/resend.ts
git commit -m "feat: add contact_lead email template for sales inquiries"
```

---

### Task 3: Contact Sales API Route

**Files:**
- Create: `app/api/contact-sales/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionalEmail } from '@/lib/email/resend'

const VALID_EMPLOYEE_COUNTS = ['1-5', '6-15', '16-50', '51-100', '100+']
const VALID_FOCUS_AREAS = ['leasing', 'sales', 'off-plan', 'all']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { firstName, lastName, email, phone, agencyName, employeeCount, location, focusArea, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !agencyName || !employeeCount || !location) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Validate employee count
    if (!VALID_EMPLOYEE_COUNTS.includes(employeeCount)) {
      return NextResponse.json({ error: 'Invalid employee count range.' }, { status: 400 })
    }

    // Validate focus area
    if (!Array.isArray(focusArea) || focusArea.length === 0 || !focusArea.every((f: string) => VALID_FOCUS_AREAS.includes(f))) {
      return NextResponse.json({ error: 'Invalid focus area selection.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Rate limit: reject if same email submitted in last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('contact_leads')
      .select('id')
      .eq('email', email)
      .gte('created_at', fiveMinAgo)
      .limit(1)

    if (recent && recent.length > 0) {
      return NextResponse.json({ error: 'You have already submitted a request. Please wait a few minutes.' }, { status: 429 })
    }

    // Insert lead
    const { error: insertError } = await supabase.from('contact_leads').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      agency_name: agencyName,
      employee_count: employeeCount,
      location,
      focus_area: focusArea,
      message: message || null,
    })

    if (insertError) {
      console.error('Failed to insert contact lead:', insertError)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Send notification email
    try {
      await sendTransactionalEmail({
        type: 'contact_lead',
        to: 'nazir@enlista.io',
        firstName,
        lastName,
        email,
        phone,
        agencyName,
        employeeCount,
        location,
        focusArea,
        message,
      })
    } catch (emailErr) {
      // Log but don't fail the request — lead is already saved
      console.error('Failed to send lead notification email:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/contact-sales/route.ts
git commit -m "feat: add POST /api/contact-sales API route with validation and email"
```

---

### Task 4: Contact Sales Page

**Files:**
- Create: `app/(public)/contact-sales/page.tsx`

- [ ] **Step 1: Create the route group directory and page**

The `(public)` route group doesn't exist yet. Create it along with the page. This is a client component with form state management.

```typescript
'use client'

import { useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Link from 'next/link'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const c = {
  bg: '#F2F4F7',
  white: '#FFFFFF',
  dark: '#0F1829',
  blue: '#1D4ED8',
  text: '#1E293B',
  muted: '#64748B',
  border: '#DDE3EC',
  placeholder: '#94A3B8',
  bluePale: '#EFF6FF',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: c.text,
  marginBottom: 6,
}

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: `1px solid ${c.border}`,
  fontSize: 14,
  color: c.text,
  background: c.white,
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  outline: 'none',
}

const FOCUS_HANDLERS = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = c.blue
    e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = c.border
    e.target.style.boxShadow = 'none'
  },
}

const EMPLOYEE_RANGES = ['1-5', '6-15', '16-50', '51-100', '100+'] as const
const FOCUS_OPTIONS = ['Leasing', 'Sales', 'Off-Plan', 'All of the Above'] as const

export default function ContactSalesPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [location, setLocation] = useState('')
  const [focusArea, setFocusArea] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const toggleFocus = (option: string) => {
    const value = option.toLowerCase()
    if (value === 'all of the above') {
      setFocusArea((prev) => prev.includes('all') ? [] : ['all'])
    } else {
      setFocusArea((prev) => {
        const without = prev.filter((f) => f !== 'all')
        return without.includes(value)
          ? without.filter((f) => f !== value)
          : [...without, value]
      })
    }
  }

  const isSelected = (option: string) => {
    const value = option.toLowerCase()
    if (value === 'all of the above') return focusArea.includes('all')
    return focusArea.includes(value)
  }

  const allFilled = Boolean(
    firstName && lastName && email && phone && agencyName && employeeCount && location && focusArea.length > 0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/contact-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          agencyName,
          employeeCount,
          location,
          focusArea,
          message: message || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={plusJakarta.variable}
      style={{
        fontFamily: 'var(--font-jakarta), sans-serif',
        minHeight: '100vh',
        background: c.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 560, marginBottom: 32 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: c.dark }}>
            Enlist<span style={{ color: c.blue }}>a</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: c.white,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: 'clamp(28px, 5vw, 40px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontWeight: 700, fontSize: 22, color: c.dark, marginBottom: 8 }}>
              Thank you!
            </h2>
            <p style={{ color: c.muted, fontSize: 15, marginBottom: 24 }}>
              We&apos;ll be in touch within 24 hours.
            </p>
            <Link
              href="/"
              style={{
                color: c.blue,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ← Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ fontWeight: 700, fontSize: 22, color: c.dark, margin: 0 }}>
                Get Enlista for Your Agency
              </h1>
              <p style={{ color: c.muted, fontSize: 14, marginTop: 6, marginBottom: 0 }}>
                Tell us about your agency and we&apos;ll be in touch within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* First + Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={LABEL}>First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="John"
                    style={INPUT}
                    {...FOCUS_HANDLERS}
                  />
                </div>
                <div>
                  <label style={LABEL}>Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Smith"
                    style={INPUT}
                    {...FOCUS_HANDLERS}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={LABEL}>Contact Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john@agency.com"
                  style={INPUT}
                  {...FOCUS_HANDLERS}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={LABEL}>Contact Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+971 50 123 4567"
                  style={INPUT}
                  {...FOCUS_HANDLERS}
                />
              </div>

              {/* Agency Name */}
              <div>
                <label style={LABEL}>Agency Name *</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                  placeholder="Dubai Realty Group"
                  style={INPUT}
                  {...FOCUS_HANDLERS}
                />
              </div>

              {/* Employee Count + Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={LABEL}>Number of Employees *</label>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    required
                    style={{
                      ...INPUT,
                      height: 42,
                      color: employeeCount ? c.text : c.placeholder,
                      appearance: 'none' as const,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      paddingRight: 36,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = c.blue; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = c.border; e.target.style.boxShadow = 'none' }}
                  >
                    <option value="" disabled>Select range</option>
                    {EMPLOYEE_RANGES.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Dubai, UAE"
                    style={INPUT}
                    {...FOCUS_HANDLERS}
                  />
                </div>
              </div>

              {/* Focus Area */}
              <div>
                <label style={LABEL}>Focus Area *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {FOCUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleFocus(option)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        border: `2px solid ${isSelected(option) ? c.blue : c.border}`,
                        background: isSelected(option) ? c.bluePale : c.white,
                        color: isSelected(option) ? c.blue : c.muted,
                        transition: 'all 0.15s',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={LABEL}>
                  Message <span style={{ color: c.placeholder, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your needs..."
                  style={{
                    ...INPUT,
                    height: 80,
                    resize: 'vertical' as const,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = c.blue; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)' }}
                  onBlur={(e) => { e.target.style.borderColor = c.border; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Error */}
              {error && (
                <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !allFilled}
                style={{
                  width: '100%',
                  background: c.blue,
                  color: 'white',
                  padding: 12,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading || !allFilled ? 'not-allowed' : 'pointer',
                  opacity: loading || !allFilled ? 0.5 : 1,
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                  marginTop: 4,
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer link */}
      <p style={{ marginTop: 20, fontSize: 13, color: c.muted }}>
        Already have an account?{' '}
        <Link href="/auth" style={{ color: c.blue, fontWeight: 600, textDecoration: 'none' }}>
          Login
        </Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev`

Navigate to `http://localhost:3000/contact-sales` and verify:
- White card renders on grey background
- All form fields are visible with white backgrounds
- Placeholder text is light grey (#94A3B8)
- Focus area chips toggle correctly
- "All of the Above" deselects individual options and vice versa

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/contact-sales/page.tsx
git commit -m "feat: add Contact Sales page with lead capture form"
```

---

### Task 5: Update Auth Page — Login Only by Default

**Files:**
- Modify: `app/(auth)/auth/AuthForm.tsx`

- [ ] **Step 1: Change default tab to signin**

In `AuthForm.tsx`, line 55, change:

```typescript
// OLD
const [tab, setTab] = useState<Tab>(tabParam === 'signin' ? 'signin' : 'signup')

// NEW
const [tab, setTab] = useState<Tab>(tabParam === 'signup' ? 'signup' : 'signin')
```

This makes `signin` the default when no `tab` param is provided, and only shows signup when explicitly requested via `?tab=signup`.

- [ ] **Step 2: Conditionally hide the tab switcher**

Replace the tab switcher block (lines 249-279) with:

```typescript
{/* Tab switcher — only show when signup tab is explicitly requested */}
{tabParam === 'signup' && (
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
)}
```

- [ ] **Step 3: Update the footer toggle text**

Replace the footer toggle (line 533-539) with:

```typescript
<p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748B', marginBottom: 0 }}>
  {tab === 'signin' ? (
    <>Don&apos;t have an account?{' '}<a href="/contact-sales" style={{ color: '#1D4ED8', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Contact Sales</a></>
  ) : (
    <>Already have an account?{' '}<button onClick={() => switchTab('signin')} style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'inherit' }}>Sign in</button></>
  )}
</p>
```

- [ ] **Step 4: Update the heading for login view**

In the wordmark section (lines 239-246), update the subtitle to be conditional:

```typescript
<p style={{ color: '#64748B', fontSize: 14, marginTop: 6, marginBottom: 0 }}>
  {tab === 'signin' ? 'Sign in to your agency account' : 'List it. In Arabic. In 30 seconds.'}
</p>
```

- [ ] **Step 5: Verify**

Run: `npm run dev`

- Navigate to `/auth` — should show login only, no tab switcher, footer says "Contact Sales"
- Navigate to `/auth?tab=signup` — should show tab switcher and full signup form
- Login form should work as before

- [ ] **Step 6: Commit**

```bash
git add app/\(auth\)/auth/AuthForm.tsx
git commit -m "feat: default auth page to login-only, hide signup tab unless explicitly requested"
```

---

### Task 6: Update Signup Redirect

**Files:**
- Modify: `app/(auth)/signup/page.tsx`

- [ ] **Step 1: Change redirect target**

Replace the entire file content:

```typescript
import { permanentRedirect } from 'next/navigation'

export default function SignupPage() {
  permanentRedirect('/contact-sales')
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(auth\)/signup/page.tsx
git commit -m "feat: redirect /signup to /contact-sales"
```

---

### Task 7: Update Homepage CTAs

**Files:**
- Modify: `app/home/page.tsx`

- [ ] **Step 1: Update header nav buttons (lines 168-200)**

Replace the header buttons div:

```typescript
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <a
    href="/auth"
    style={{
      display: "inline-block",
      border: `1.5px solid ${c.border}`,
      color: c.text,
      padding: "10px 24px",
      fontWeight: 500,
      fontSize: 13,
      borderRadius: 6,
      textDecoration: "none",
    }}
  >
    Login
  </a>
  <a
    href="/contact-sales"
    style={{
      display: "inline-block",
      background: c.blue,
      color: "white",
      padding: "10px 24px",
      fontFamily: "var(--font-jakarta), sans-serif",
      fontWeight: 600,
      fontSize: 13,
      borderRadius: 6,
      textDecoration: "none",
    }}
  >
    Contact Sales
  </a>
</div>
```

- [ ] **Step 2: Update hero CTAs (lines 257-293)**

Replace the hero buttons div with a single CTA:

```typescript
<div
  style={{
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 40,
  }}
>
  <a
    href="/contact-sales"
    style={{
      display: "inline-block",
      background: c.blue,
      color: "white",
      padding: "10px 24px",
      fontWeight: 600,
      fontSize: 13,
      borderRadius: 6,
      textDecoration: "none",
    }}
  >
    Contact Sales
  </a>
</div>
```

- [ ] **Step 3: Update pricing card CTAs**

For the Solo card (line 949-964), change:
- `href="#cta"` → `href="/contact-sales"`
- Text: `Get Started` → `Contact Sales`

For the Boutique card (line 1037-1052), change:
- `href="#cta"` → `href="/contact-sales"`
- Text: `Get Started` → `Contact Sales`

For the Agency card (line 1126-1141), it already says "Contact Sales" — just update:
- `href="#cta"` → `href="/contact-sales"`

- [ ] **Step 4: Update the bottom CTA section (lines 1146-1250)**

Replace the entire CTA section with a simpler version that links to Contact Sales instead of having an inline form:

```typescript
{/* CTA */}
<section
  id="cta"
  style={{ background: c.dark, padding: "80px 24px", margin: 0 }}
>
  <div
    style={{
      maxWidth: 640,
      margin: "0 auto",
      textAlign: "center",
    }}
  >
    <h2
      style={{
        fontWeight: 800,
        fontSize: "clamp(32px, 5vw, 52px)",
        color: "white",
        marginBottom: 16,
        lineHeight: 1.1,
      }}
    >
      Ready to transform your
      <br />
      listing workflow?
    </h2>
    <p
      style={{
        color: "rgba(255,255,255,0.45)",
        fontSize: 14,
        lineHeight: 1.8,
        marginBottom: 32,
        maxWidth: 440,
        margin: "0 auto 32px",
      }}
    >
      Talk to our team to see how Enlista can power your agency&apos;s listings, compliance, and analytics.
    </p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <a
        href="/contact-sales"
        style={{
          display: "inline-block",
          background: c.blue,
          color: "white",
          padding: "13px 32px",
          fontWeight: 600,
          fontSize: 14,
          borderRadius: 6,
          textDecoration: "none",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}
      >
        Contact Sales
      </a>
      <a
        href="/auth"
        style={{
          display: "inline-block",
          border: "1.5px solid rgba(255,255,255,0.2)",
          color: "white",
          padding: "13px 32px",
          fontWeight: 500,
          fontSize: 14,
          borderRadius: 6,
          textDecoration: "none",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}
      >
        Login
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Verify all homepage links**

Run: `npm run dev`

Check every CTA on the homepage:
- Header "Login" → `/auth`
- Header "Contact Sales" → `/contact-sales`
- Hero "Contact Sales" → `/contact-sales`
- Solo pricing "Contact Sales" → `/contact-sales`
- Boutique pricing "Contact Sales" → `/contact-sales`
- Agency pricing "Contact Sales" → `/contact-sales`
- Bottom CTA "Contact Sales" → `/contact-sales`
- Bottom CTA "Login" → `/auth`

- [ ] **Step 6: Commit**

```bash
git add app/home/page.tsx
git commit -m "feat: update all homepage CTAs to Contact Sales and Login"
```

---

### Task 8: Typecheck, Lint & Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Fix any issues found**

If typecheck or lint errors occur, fix them in the relevant files.

- [ ] **Step 4: Full smoke test**

Run: `npm run dev`

Test the complete flow:
1. Homepage loads → all CTAs say "Contact Sales" or "Login"
2. Click "Contact Sales" → form page renders with white card/inputs
3. Fill out form → submit → success message shows
4. Click "Login" → login page (no signup tab, "Contact Sales" link in footer)
5. Navigate to `/auth?tab=signup` → signup form still accessible
6. Navigate to `/signup` → redirects to `/contact-sales`

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve typecheck and lint errors"
```

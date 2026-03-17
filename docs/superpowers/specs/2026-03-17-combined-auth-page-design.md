# Combined Auth Page — Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Route:** `/auth?tab=signin` | `/auth?tab=signup`

---

## Overview

Replace the existing separate `/login` and `/signup` pages with a single combined auth page at `/auth`. The active tab (Sign In or Sign Up) is controlled by the `?tab=` query param. All landing page navigation buttons update to deep-link to the correct tab.

---

## Routes & Files

| Action | Change |
|---|---|
| Create | `app/(auth)/auth/page.tsx` — new combined auth page |
| Delete | `app/(auth)/login/page.tsx` — superseded |
| Delete | `app/(auth)/signup/page.tsx` — superseded |
| Update | `app/page.tsx` — fix all 4 nav/CTA anchor tags |

---

## Page Behaviour

### Tab State

- The page must be a Client Component (`'use client'`) and wrapped in `<Suspense fallback={null}>` at the parent level (or via a thin server component wrapper) because `useSearchParams()` requires a Suspense boundary in Next.js 14 App Router to avoid static rendering errors.
- Read `?tab=` query param on mount using `useSearchParams()`
- Default to `signup` if param is absent or invalid
- Toggling tabs calls `router.replace('/auth?tab=signin')` or `router.replace('/auth?tab=signup')` — no full navigation, just URL sync

### Already-Authenticated Users

- On mount, check for an existing Supabase session via `supabase.auth.getSession()`
- If a session exists, immediately `router.replace('/dashboard')` — do not render the auth form

### Sign Up Tab

**Fields (in order):**

| Field | Variable name | Type | `autoComplete` | Notes |
|---|---|---|---|---|
| First Name | `firstName` | text | `given-name` | Required |
| Last Name | `lastName` | text | `family-name` | Required, beside First Name on desktop |
| Agency Name | `agencyName` | text | `organization` | Required |
| City | `city` | text | `address-level2` | Required, beside Country on desktop |
| Country | `country` | text | `country-name` | Required |
| Agency Email | `agencyEmail` | email | `email` | Required |
| Work Email | `workEmail` | email | `email` | Required — Supabase auth identity |
| Phone Number | `phoneNumber` | tel | `tel` | Required |
| Password | `password` | password | `new-password` | Required, exactly 12 chars, complexity rules |
| Confirm Password | `confirmPassword` | password | `new-password` | Required, must match Password |

**Password rules (validated client-side before submit):**
- Length must be **exactly 12 characters** — no more, no less (explicit business requirement for fixed-length security policy)
- Must contain at least one uppercase letter (`A–Z`)
- Must contain at least one lowercase letter (`a–z`)
- Must contain at least one digit (`0–9`)
- Must contain at least one special character (`!@#$%^&*()_+-=[]{}|;':",.<>?/`)
- Password and Confirm Password must be identical
- Inline error messages shown below the password field on violation (e.g. "Password must be exactly 12 characters", "Must include an uppercase letter", etc.)

**Submit disabled until:**
- All fields are non-empty
- Password passes all rules
- Passwords match

**On valid submit:**
1. Call `supabase.auth.signUp({ email: workEmail, password, options: { data: { first_name: firstName, last_name: lastName, agency_name: agencyName, city, country, agency_email: agencyEmail, phone: phoneNumber } } })`
2. Pass no `emailRedirectTo` — Supabase project must have email confirmation disabled (confirm users immediately)
3. If `error` is returned → toast `error.message`, return
4. If `data.user` is `null` and `error` is also `null` → toast "Signup could not be completed. Please try again." and return (handles Supabase's silent no-op edge case)
5. If `data.user` is returned, insert into `agencies` table: `{ user_id: data.user.id, name: agencyName, email: agencyEmail, phone: phoneNumber }`
6. Ignore `23505` (duplicate key) error on agency insert
7. Show success toast: "Account created! Welcome to ListingsLaunch."
8. `router.push('/dashboard')`

**Error handling:**
- Supabase auth error → toast with `error.message`
- Unexpected exception → toast "An unexpected error occurred."
- Loading spinner on button during async call

### Sign In Tab

**Fields:**

| Field | Variable name | Type | `autoComplete` | Notes |
|---|---|---|---|---|
| Work Email | `email` | email | `email` | Required |
| Password | `password` | password | `current-password` | Required |

**On valid submit:**
1. Call `supabase.auth.signInWithPassword({ email, password })`
2. On success: `router.push('/dashboard')` + `router.refresh()`
3. On error: toast with `error.message`

---

## Visual Design

**Card:**
- Background: `#FFFFFF`, border: `1px solid #DDE3EC`, border-radius: `16px`
- Padding: `48px` desktop, `32px` mobile
- Max-width: `480px`, centered on `#F2F4F7` full-height background

**Wordmark (top of card):**
- "Listings" in `#0F1829` weight 800, "Launch" in `#1D4ED8`
- Subtitle below: "List it. In Arabic. In 30 seconds."

**Tab switcher:**
- Two buttons: "Sign Up" and "Sign In"
- Container: `background: #F2F4F7`, `border-radius: 8px`, `padding: 4px`
- Active tab: `background: #FFFFFF`, `color: #0F1829`, `font-weight: 600`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
- Inactive tab: `color: #64748B`, no background

**Form labels:**
- `font-size: 12px`, `font-weight: 600`, `color: #64748B`, `text-transform: uppercase`, `letter-spacing: 0.05em`

**Inputs:**
- `padding: 12px`, `border-radius: 6px`, `border: 1.5px solid #DDE3EC`
- Focus: `border-color: #1D4ED8`
- Error: `border-color: #EF4444`
- `font-size: 14px`, `color: #1E293B`, `background: #FFFFFF`, `box-sizing: border-box`

**Two-column layout (desktop only):**
- First Name + Last Name side by side
- City + Country side by side
- Single column on mobile (below 640px)

**Inline error messages:**
- `font-size: 12px`, `color: #EF4444`, margin-top `4px`

**Submit button:**
- Full width, `background: #1D4ED8`, `color: white`, `padding: 13px`
- `border-radius: 6px`, `font-weight: 600`, `font-size: 14px`
- Disabled state: `opacity: 0.5`, `cursor: not-allowed`
- Loading state: `Loader2` spinner icon + label text

---

## Landing Page Updates (`app/page.tsx`)

The following `<a>` tags change (pricing "Get Started" buttons are **not** changed — they remain as Stripe checkout calls):

| Context | Button text | Current `href` | New `href` |
|---|---|---|---|
| Desktop nav | "Sign in" | `#cta` | `/auth?tab=signin` |
| Desktop nav | "Get Started Free" | `#cta` | `/auth?tab=signup` |
| Mobile nav | "Sign in" | `#cta` | `/auth?tab=signin` |
| Mobile nav | "Get Started Free" | `#cta` | `/auth?tab=signup` |
| Hero section | "Start Free — 14 days" | `#cta` | `/auth?tab=signup` |

---

## Supabase Requirements

- Email confirmation must be **disabled** in Supabase project settings (Auth → Email → Confirm email: OFF) so users land in the dashboard immediately after signup without needing to verify their email.
- The `agencies` table must exist with columns: `user_id`, `name`, `email`, `phone`.
- No server-side middleware changes required — the existing middleware passes all requests through.

---

## Out of Scope

- Password reset / forgot password flow
- OAuth (Google, GitHub) sign-in
- Email verification
- Profile editing post-signup

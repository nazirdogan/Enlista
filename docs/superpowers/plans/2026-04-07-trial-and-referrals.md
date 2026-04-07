# Trial & Referral Credit System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 30-day no-credit-card free trial for all new signups, and a referral credit system where users earn 10 listing credits per converted referral.

**Architecture:** Trial status lives in a new `account_status` column on the `agencies` table (the codebase's user entity). Referral codes are auto-generated per-agency by a DB trigger. Credits flow: referral `listing_credits` are consumed first, then monthly `credits_remaining`, then `extra_credits`. A Vercel cron fires daily to expire trials and send reminder emails.

**Tech Stack:** Next.js 14, Supabase PostgreSQL (migrations), Resend (email), Stripe webhooks, Vercel Cron, Tailwind-adjacent inline styles (existing convention).

---

## Codebase Key Facts

- **User entity:** `agencies` table (not `auth.users`) — one agency per user
- **Auth:** Supabase Auth client-side; `user.id` maps to `agencies.user_id`
- **Credit columns on agencies:** `credits_remaining` (monthly), `extra_credits` (purchased packs)
- **Existing trial fields on agencies:** `is_trial` (bool), `trial_started_at` (timestamptz)
- **Email service:** `lib/email/resend.ts` — `sendTransactionalEmail(payload)`
- **Admin DB client:** `createAdminClient()` from `@/lib/supabase/admin` (bypasses RLS)
- **Server DB client:** `createClient()` from `@/lib/supabase/server` (respects RLS)
- **Existing credit check function:** `checkAndDecrementCredits(userId)` in `app/api/generate/route.ts`

---

## File Map

| Action | File |
|---|---|
| Create | `supabase/migrations/007_trial_referrals.sql` |
| Modify | `lib/email/resend.ts` |
| Create | `app/api/auth/post-signup/route.ts` |
| Modify | `app/(auth)/auth/AuthForm.tsx` |
| Modify | `middleware.ts` |
| Modify | `app/api/generate/route.ts` |
| Modify | `app/api/credits/route.ts` |
| Modify | `app/api/stripe/webhook/route.ts` |
| Create | `app/api/trial-status/route.ts` |
| Create | `components/TrialBanner.tsx` |
| Create | `components/TrialExpiredModal.tsx` |
| Modify | `app/(dashboard)/layout.tsx` |
| Create | `app/api/cron/expire-trials/route.ts` |
| Create | `vercel.json` |
| Modify | `app/(dashboard)/settings/page.tsx` |

---

## Task 1: Database Migration 007

**Files:**
- Create: `supabase/migrations/007_trial_referrals.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: 30-day free trial + referral credit system
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add account_status to agencies
alter table agencies
  add column if not exists account_status text not null default 'trial'
    check (account_status in ('trial', 'trial_expired', 'active', 'cancelled'));

-- 2. Add trial_ends_at and subscribed_at
alter table agencies
  add column if not exists trial_ends_at timestamptz,
  add column if not exists subscribed_at timestamptz;

-- 3. Backfill trial_ends_at: use trial_started_at if present, else created_at
update agencies
set trial_ends_at = coalesce(trial_started_at, created_at) + interval '30 days'
where trial_ends_at is null;

-- 4. Backfill account_status for already-paid accounts
update agencies
set account_status = 'active',
    subscribed_at = created_at  -- best estimate; real date in Stripe
where is_trial = false;

-- 5. Backfill account_status for existing trial accounts
update agencies
set account_status = case
  when trial_ends_at < now() then 'trial_expired'
  else 'trial'
end
where is_trial = true;

-- 6. Referral code generator (trigger-based to guarantee uniqueness)
create or replace function set_referral_code_on_insert()
returns trigger as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code  text;
  i     int;
begin
  if new.referral_code is null then
    loop
      code := 'ENL-';
      for i in 1..5 loop
        code := code || substr(chars, floor(random() * 36 + 1)::int, 1);
      end loop;
      exit when not exists (select 1 from agencies where referral_code = code);
    end loop;
    new.referral_code := code;
  end if;
  return new;
end;
$$ language plpgsql volatile;

drop trigger if exists set_referral_code on agencies;
create trigger set_referral_code
  before insert on agencies
  for each row execute function set_referral_code_on_insert();

-- 7. Add referral fields to agencies
alter table agencies
  add column if not exists referral_code text unique,
  add column if not exists referred_by_agency_id uuid references agencies(id),
  add column if not exists listing_credits integer not null default 0;

-- 8. Backfill referral codes for existing agencies (unique per row)
do $$
declare
  ag    record;
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code  text;
  i     int;
begin
  for ag in select id from agencies where referral_code is null loop
    loop
      code := 'ENL-';
      for i in 1..5 loop
        code := code || substr(chars, floor(random() * 36 + 1)::int, 1);
      end loop;
      exit when not exists (select 1 from agencies where referral_code = code);
    end loop;
    update agencies set referral_code = code where id = ag.id;
  end loop;
end;
$$;

-- 9. Create referrals table
create table if not exists referrals (
  id                 uuid primary key default gen_random_uuid(),
  referrer_agency_id uuid not null references agencies(id),
  referred_agency_id uuid not null references agencies(id),
  created_at         timestamptz not null default now(),
  converted_at       timestamptz,
  credits_awarded    boolean not null default false,
  credits_awarded_at timestamptz
);

-- 10. Add indexes
create index if not exists idx_agencies_referral_code   on agencies(referral_code);
create index if not exists idx_agencies_referred_by      on agencies(referred_by_agency_id);
create index if not exists idx_referrals_referrer        on referrals(referrer_agency_id);
create index if not exists idx_referrals_referred        on referrals(referred_agency_id);

-- 11. Add trial email event types to any type checks (email_events has no type constraint, safe)
-- No constraint change needed; email_events.email_type is free-form text.
```

- [ ] **Step 2: Apply migration locally**

```bash
cd /Users/nazir/ListingAI
npx supabase db push
# OR if using local dev:
npx supabase migration up
```

Expected: No errors. Check the agencies table has the new columns.

- [ ] **Step 3: Verify columns exist**

```bash
npx supabase db diff
```

Expected: Clean diff showing only the new columns and table.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/007_trial_referrals.sql
git commit -m "feat(db): add trial status, referral codes, and referrals table (migration 007)"
```

---

## Task 2: Extend Email Types

**Files:**
- Modify: `lib/email/resend.ts`

Add four new email types: `trial_started`, `trial_reminder_10`, `trial_reminder_3`, `trial_expired_user`, and `credits_awarded`.

- [ ] **Step 1: Update `EmailPayload` union type**

In `lib/email/resend.ts`, replace the existing `EmailPayload` type (lines 10–27) with:

```typescript
export type EmailPayload =
  | { type: 'welcome'; to: string; agencyName: string }
  | { type: 'trial_started'; to: string; agencyName: string; trialEndsAt: string }
  | { type: 'trial_reminder_10'; to: string; agencyName: string; trialEndsAt: string }
  | { type: 'trial_reminder_3'; to: string; agencyName: string; trialEndsAt: string }
  | { type: 'trial_expired_user'; to: string; agencyName: string }
  | { type: 'trial_expiry'; to: string; agencyName: string; expiresAt: string }
  | { type: 'payment_failed'; to: string; agencyName: string }
  | { type: 'subscription_confirmed'; to: string; agencyName: string; plan: string }
  | { type: 'credits_awarded'; to: string; agencyName: string; credits: number; newBalance: number; referredName: string }
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

- [ ] **Step 2: Update `subjects` map in `sendTransactionalEmail`**

In `lib/email/resend.ts`, update the `subjects` object inside `sendTransactionalEmail` to include the new types:

```typescript
const subjects: Record<string, string> = {
  welcome:             `Welcome to Enlista, ${agencyName}!`,
  trial_started:       `Your 30-day Enlista free trial has started`,
  trial_reminder_10:   `10 days left in your Enlista free trial`,
  trial_reminder_3:    `3 days left — upgrade your Enlista trial`,
  trial_expired_user:  `Your Enlista trial has expired`,
  trial_expiry:        `Your Enlista trial expires soon`,
  payment_failed:      `Action required: Payment failed for your Enlista subscription`,
  subscription_confirmed: `You're now on the ${plan} plan — welcome aboard`,
  credits_awarded:     `You earned listing credits on Enlista!`,
  contact_lead:        `New Agency Lead: ${'agencyName' in payload ? payload.agencyName : ''}`,
}
```

- [ ] **Step 3: Add HTML templates in `buildEmailHtml` switch**

In `lib/email/resend.ts`, inside the `switch (payload.type)` block in `buildEmailHtml`, add cases before the `default`:

```typescript
case 'trial_started':
  return `${base}
    <h2>Your 30-day free trial is active, ${payload.agencyName}!</h2>
    <p>You have full access to all Enlista features until <strong>${payload.trialEndsAt}</strong>.</p>
    <p>Generate your first listing at <a href="https://enlista.io/new">enlista.io/new</a>.</p>
    <p>No credit card required — upgrade anytime to continue after your trial.</p>
  ${footer}`

case 'trial_reminder_10':
  return `${base}
    <h2>10 days left in your free trial</h2>
    <p>Hi ${payload.agencyName}, your Enlista free trial ends on <strong>${payload.trialEndsAt}</strong>.</p>
    <p>Upgrade now to keep generating bilingual listings, WhatsApp copy, and more.</p>
    <p><a href="https://enlista.io/onboarding" style="background:#1D4ED8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;margin-top:8px;">Upgrade my plan →</a></p>
  ${footer}`

case 'trial_reminder_3':
  return `${base}
    <h2>Only 3 days left — don't lose your listings</h2>
    <p>${payload.agencyName}, your Enlista trial expires on <strong>${payload.trialEndsAt}</strong>.</p>
    <p>After expiry, listing generation is paused until you activate a plan. Your saved listings are safe.</p>
    <p><a href="https://enlista.io/onboarding" style="background:#EF4444;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;margin-top:8px;">Upgrade now →</a></p>
  ${footer}`

case 'trial_expired_user':
  return `${base}
    <h2>Your Enlista trial has ended</h2>
    <p>${payload.agencyName}, your 30-day free trial has expired.</p>
    <p>Upgrade to a paid plan to resume generating listings. Your saved listings are still there waiting for you.</p>
    <p><a href="https://enlista.io/onboarding" style="background:#1D4ED8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;margin-top:8px;">Choose a plan →</a></p>
  ${footer}`

case 'credits_awarded':
  return `${base}
    <h2>You earned ${payload.credits} listing credits!</h2>
    <p>${payload.agencyName}, <strong>${payload.referredName}</strong> just joined Enlista — and you earned <strong>${payload.credits} credits</strong>.</p>
    <p>Your current credit balance: <strong>${payload.newBalance} credits</strong></p>
    <p>These credits are applied automatically before your monthly quota on your next listing generation.</p>
  ${footer}`
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/nazir/ListingAI && npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors related to `lib/email/resend.ts`.

- [ ] **Step 5: Commit**

```bash
git add lib/email/resend.ts
git commit -m "feat(email): add trial lifecycle and credits_awarded email types"
```

---

## Task 3: Post-Signup API Route (Referral Attribution)

**Files:**
- Create: `app/api/auth/post-signup/route.ts`

This route is called client-side immediately after successful signup to:
1. Create a referral record if the user signed up via a referral link
2. Set `referred_by_agency_id` on the new agency

Trial fields (`account_status`, `trial_ends_at`) are set in the agencies INSERT itself (Task 4). Referral code is set by the DB trigger automatically.

- [ ] **Step 1: Create the route**

```typescript
// app/api/auth/post-signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  // Must be authenticated — user just signed up
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const refCode: string | null = body.refCode ?? null

  if (!refCode) {
    // No referral — nothing to do
    return NextResponse.json({ ok: true })
  }

  const db = createAdminClient()

  // Look up the new user's agency
  const { data: newAgency } = await db
    .from('agencies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!newAgency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
  }

  // Look up the referrer by referral code
  const { data: referrerAgency } = await db
    .from('agencies')
    .select('id')
    .eq('referral_code', refCode.toUpperCase())
    .single()

  if (!referrerAgency) {
    // Invalid code — not an error, just skip attribution
    return NextResponse.json({ ok: true })
  }

  // Prevent self-referral
  if (referrerAgency.id === newAgency.id) {
    return NextResponse.json({ ok: true })
  }

  // Set referred_by on the new agency
  await db
    .from('agencies')
    .update({ referred_by_agency_id: referrerAgency.id })
    .eq('id', newAgency.id)

  // Create referral record
  await db.from('referrals').insert({
    referrer_agency_id: referrerAgency.id,
    referred_agency_id: newAgency.id,
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "post-signup"
```

Expected: No output (no errors).

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/post-signup/route.ts
git commit -m "feat(api): add post-signup route for referral attribution"
```

---

## Task 4: Update AuthForm.tsx

**Files:**
- Modify: `app/(auth)/auth/AuthForm.tsx`

Changes:
1. Set `account_status`, `trial_started_at`, `trial_ends_at` in the agencies INSERT
2. Read `?ref=ENL-XXXXX` from URL and persist to localStorage
3. Call `/api/auth/post-signup` with the ref code after signup
4. Redirect to `/dashboard` (not `/onboarding`) — trial users get immediate access
5. Update the "14-day free trial" copy to "30-day free trial"

- [ ] **Step 1: Persist referral code from URL to localStorage**

In `AuthForm.tsx`, find the `useEffect` that persists the outreach token (around line 132–136). Add referral code persistence below it:

```typescript
// Persist outreach tracking token from URL to localStorage
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const t = params.get('t')
  if (t) localStorage.setItem('enlista_outreach_token', t)
  const ref = params.get('ref')
  if (ref) localStorage.setItem('enlista_ref_code', ref)
}, [])
```

- [ ] **Step 2: Update agencies INSERT to include trial fields**

In `AuthForm.tsx`, find the agencies insert (around line 208):

```typescript
// BEFORE:
const { error: agencyError } = await supabase.from('agencies').insert({
  user_id: data.user.id,
  name: agencyName,
  email: agencyEmail,
  phone: phoneNumber,
  city,
  country,
})

// AFTER:
const trialStartedAt = new Date().toISOString()
const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
const { error: agencyError } = await supabase.from('agencies').insert({
  user_id: data.user.id,
  name: agencyName,
  email: agencyEmail,
  phone: phoneNumber,
  city,
  country,
  account_status: 'trial',
  trial_started_at: trialStartedAt,
  trial_ends_at: trialEndsAt,
})
```

- [ ] **Step 3: Call post-signup route for referral attribution**

In `AuthForm.tsx`, after the outreach attribution block (around line 231), add the referral attribution call:

```typescript
// Attribute referral if user signed up via a referral link
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
```

- [ ] **Step 4: Redirect to `/dashboard` instead of `/onboarding`**

Find line 234: `router.push('/onboarding')`
Change to: `router.push('/dashboard')`

- [ ] **Step 5: Update "14-day" copy to "30-day"**

Find line 271: `'14-day free trial · Cancel anytime'`
Change to: `'30-day free trial · No credit card required'`

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "AuthForm"
```

Expected: No output.

- [ ] **Step 7: Commit**

```bash
git add app/(auth)/auth/AuthForm.tsx
git commit -m "feat(auth): trial fields on signup, referral code capture, redirect to dashboard"
```

---

## Task 5: Update Middleware

**Files:**
- Modify: `middleware.ts`

Change the dashboard route guard from checking `plan === 'free'` to checking `account_status`:
- `trial` → allow
- `active` → allow
- `trial_expired` | `cancelled` → redirect to `/onboarding`
- Agency missing (no row yet) → redirect to `/onboarding`

- [ ] **Step 1: Replace the plan check**

In `middleware.ts`, find the dashboard route guard section (lines 65–76):

```typescript
// BEFORE (lines 65–76):
const fromCheckout = request.nextUrl.searchParams.get('checkout')
if (!fromCheckout) {
  const { data: agency } = await supabase
    .from('agencies')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  // Free plan means no subscription started — send them to pick a plan
  if (agency?.plan === 'free') {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
}

// AFTER:
const fromCheckout = request.nextUrl.searchParams.get('checkout')
if (!fromCheckout) {
  const { data: agency } = await supabase
    .from('agencies')
    .select('account_status')
    .eq('user_id', user.id)
    .single()

  const status = agency?.account_status
  if (!status || status === 'trial_expired' || status === 'cancelled') {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
  // 'trial' and 'active' are allowed through
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "middleware"
```

Expected: No output.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(middleware): gate on account_status instead of plan for dashboard access"
```

---

## Task 6: Update Listing Generation Guard

**Files:**
- Modify: `app/api/generate/route.ts`

Two changes:
1. Add trial status check BEFORE the credit check
2. Update `checkAndDecrementCredits` to consume `listing_credits` first

- [ ] **Step 1: Update `AgencyCredits` interface to include new fields**

Find the `AgencyCredits` interface near the top of `app/api/generate/route.ts`. Update it to include `account_status`, `trial_ends_at`, and `listing_credits`:

```typescript
interface AgencyCredits {
  id: string
  plan: string
  account_status: string
  trial_ends_at: string | null
  credits_remaining: number
  extra_credits: number
  listing_credits: number
  credits_reset_at: string | null
}
```

- [ ] **Step 2: Update the agency select in `checkAndDecrementCredits`**

Find the agency fetch inside `checkAndDecrementCredits` (around line 156):

```typescript
// BEFORE:
const { data: agency, error: fetchErr } = await db
  .from('agencies')
  .select('id, plan, credits_remaining, extra_credits, credits_reset_at')
  .eq('user_id', userId)
  .single<AgencyCredits>()

// AFTER:
const { data: agency, error: fetchErr } = await db
  .from('agencies')
  .select('id, plan, account_status, trial_ends_at, credits_remaining, extra_credits, listing_credits, credits_reset_at')
  .eq('user_id', userId)
  .single<AgencyCredits>()
```

- [ ] **Step 3: Add trial status check at the START of `checkAndDecrementCredits` (after the agency fetch)**

Find the check `if (fetchErr || !agency)` and add the trial guard after it:

```typescript
if (fetchErr || !agency) {
  return { ok: false, error: 'Agency not found', creditsRemaining: 0, extraCredits: 0 }
}

// ── Trial status check ────────────────────────────────────────────────────
if (agency.account_status === 'trial') {
  const now = new Date()
  const trialEnds = agency.trial_ends_at ? new Date(agency.trial_ends_at) : null
  if (trialEnds && now > trialEnds) {
    // Expire the trial inline
    await db
      .from('agencies')
      .update({ account_status: 'trial_expired' })
      .eq('id', agency.id)
    return {
      ok: false,
      error: 'Your 30-day free trial has expired. Upgrade to keep generating listings.',
      creditsRemaining: 0,
      extraCredits: 0,
      trialExpired: true,
    }
  }
} else if (agency.account_status === 'trial_expired' || agency.account_status === 'cancelled') {
  return {
    ok: false,
    error: 'Your account does not have an active subscription. Please upgrade to continue.',
    creditsRemaining: 0,
    extraCredits: 0,
    upgradeRequired: true,
  }
}
```

- [ ] **Step 4: Update `checkAndDecrementCredits` return type to include new flags**

Update the function's return type signature:

```typescript
async function checkAndDecrementCredits(userId: string): Promise<
  | { ok: true; plan: string; creditsRemaining: number; extraCredits: number }
  | { ok: false; error: string; creditsRemaining: number; extraCredits: number; trialExpired?: boolean; upgradeRequired?: boolean }
>
```

- [ ] **Step 5: Add `listing_credits` deduction before monthly credits**

Find the deduction logic (around line 190–210) and prepend the `listing_credits` check:

```typescript
// BEFORE the existing deduction block:
const totalCredits = creditsRemaining + agency.extra_credits

if (totalCredits <= 0) {
  return {
    ok: false,
    error: 'No listing credits remaining...',
    ...
  }
}

// Deduct: use monthly credits first, then extra credits
let newMonthly = creditsRemaining
let newExtra = agency.extra_credits

// REPLACE with:
// Deduct listing_credits (referral credits) first, then monthly, then extra
if (agency.listing_credits > 0) {
  const { error: updateErr } = await db
    .from('agencies')
    .update({ listing_credits: agency.listing_credits - 1 })
    .eq('id', agency.id)
  if (updateErr) {
    console.error('Failed to decrement listing_credits:', updateErr)
    return { ok: false, error: 'Failed to update credits', creditsRemaining, extraCredits: agency.extra_credits }
  }
  return { ok: true, plan: agency.plan, creditsRemaining, extraCredits: agency.extra_credits }
}

const totalCredits = creditsRemaining + agency.extra_credits
if (totalCredits <= 0) {
  return {
    ok: false,
    error: 'No listing credits remaining. Purchase more credits or upgrade your plan.',
    creditsRemaining,
    extraCredits: agency.extra_credits,
  }
}

let newMonthly = creditsRemaining
let newExtra = agency.extra_credits
if (newMonthly > 0) {
  newMonthly -= 1
} else {
  newExtra -= 1
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "generate"
```

Expected: No output.

- [ ] **Step 7: Commit**

```bash
git add app/api/generate/route.ts
git commit -m "feat(generate): add trial status guard and listing_credits deduction priority"
```

---

## Task 7: Update Credits API

**Files:**
- Modify: `app/api/credits/route.ts`

Add `listingCredits`, `accountStatus`, `trialEndsAt`, and `daysRemaining` to the response so the frontend can show the trial banner and referral credits balance.

- [ ] **Step 1: Update the agency select**

In `app/api/credits/route.ts`, find the agency fetch (line 32):

```typescript
// BEFORE:
const { data: agency, error } = await db
  .from('agencies')
  .select('id, plan, credits_remaining, extra_credits, credits_reset_at')
  .eq('user_id', userId)
  .single()

// AFTER:
const { data: agency, error } = await db
  .from('agencies')
  .select('id, plan, account_status, trial_ends_at, credits_remaining, extra_credits, listing_credits, credits_reset_at')
  .eq('user_id', userId)
  .single()
```

- [ ] **Step 2: Compute trial info and add to response**

In `app/api/credits/route.ts`, update the return statement (around line 55):

```typescript
// Add trial calculation before return
const accountStatus: string = agency.account_status ?? 'active'
const trialEndsAt: string | null = agency.trial_ends_at ?? null
let daysRemaining: number | null = null
if (accountStatus === 'trial' && trialEndsAt) {
  const msLeft = new Date(trialEndsAt).getTime() - Date.now()
  daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
}

return NextResponse.json({
  plan: agency.plan,
  creditsRemaining,
  extraCredits: agency.extra_credits,
  listingCredits: agency.listing_credits ?? 0,
  totalCredits: creditsRemaining + agency.extra_credits,
  creditLimit: getPlanCreditLimit(agency.plan),
  nextReset: nextReset.toISOString(),
  accountStatus,
  trialEndsAt,
  daysRemaining,
})
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "credits/route"
```

Expected: No output.

- [ ] **Step 4: Commit**

```bash
git add app/api/credits/route.ts
git commit -m "feat(credits): include trial status and listing_credits in /api/credits response"
```

---

## Task 8: Update Stripe Webhook

**Files:**
- Modify: `app/api/stripe/webhook/route.ts`

Changes:
1. On `checkout.session.completed` (subscription): set `account_status = 'active'`, `subscribed_at = now()`
2. On `customer.subscription.deleted`: set `account_status = 'cancelled'`
3. On `invoice.paid`: award referral credits if this is the first payment from a referred user

- [ ] **Step 1: Update `checkout.session.completed` (subscription branch)**

Find the `agencies.update` call inside the subscription checkout branch (around line 121):

```typescript
// BEFORE:
const creditLimit = getPlanCreditLimit(plan)
await db.from('agencies').update({
  plan,
  is_trial: sub.status === 'trialing',
  credits_remaining: creditLimit,
  credits_reset_at: new Date().toISOString(),
}).eq('id', agencyId)

// AFTER:
const creditLimit = getPlanCreditLimit(plan)
const isTrialing = sub.status === 'trialing'
await db.from('agencies').update({
  plan,
  is_trial: isTrialing,
  account_status: isTrialing ? 'trial' : 'active',
  subscribed_at: isTrialing ? null : new Date().toISOString(),
  credits_remaining: creditLimit,
  credits_reset_at: new Date().toISOString(),
}).eq('id', agencyId)
```

- [ ] **Step 2: Update `invoice.paid` to award referral credits**

Find the `invoice.paid` case (around line 132). After the existing `agencies.update`, add the referral credit logic:

```typescript
case "invoice.paid": {
  const invoice = event.data.object as Stripe.Invoice
  const subscriptionId = invoice.parent?.subscription_details?.subscription
  if (!subscriptionId) break

  const sub = await stripe.subscriptions.retrieve(String(subscriptionId))
  const agencyId = sub.metadata?.agency_id
  const plan = sub.metadata?.plan
  if (!agencyId || !plan) break

  const creditLimit = getPlanCreditLimit(plan)
  await db.from('agencies').update({
    plan,
    is_trial: false,
    account_status: 'active',
    subscribed_at: new Date().toISOString(),
    credits_remaining: creditLimit,
    credits_reset_at: new Date().toISOString(),
  }).eq('id', agencyId)

  const periodEnd = sub.items.data[0]?.current_period_end
  await db.from('subscriptions').update({
    status: sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('stripe_subscription_id', sub.id)

  // ── Referral credit award ──────────────────────────────────────────────
  // Award 10 credits to the referrer if this is the first payment
  const { data: convertedAgency } = await db
    .from('agencies')
    .select('id, referred_by_agency_id, name')
    .eq('id', agencyId)
    .single()

  if (convertedAgency?.referred_by_agency_id) {
    const { data: referral } = await db
      .from('referrals')
      .select('id, credits_awarded')
      .eq('referred_agency_id', agencyId)
      .eq('referrer_agency_id', convertedAgency.referred_by_agency_id)
      .single()

    if (referral && !referral.credits_awarded) {
      // Award 10 credits to the referrer
      const { data: referrer } = await db
        .from('agencies')
        .select('id, email, name, listing_credits')
        .eq('id', convertedAgency.referred_by_agency_id)
        .single()

      if (referrer) {
        const newBalance = (referrer.listing_credits ?? 0) + 10
        await db
          .from('agencies')
          .update({ listing_credits: newBalance })
          .eq('id', referrer.id)

        await db
          .from('referrals')
          .update({
            credits_awarded: true,
            converted_at: new Date().toISOString(),
            credits_awarded_at: new Date().toISOString(),
          })
          .eq('id', referral.id)

        // Notify referrer by email
        if (referrer.email) {
          const { sendTransactionalEmail } = await import('@/lib/email/resend')
          await sendTransactionalEmail({
            type: 'credits_awarded',
            to: referrer.email,
            agencyName: referrer.name ?? 'your agency',
            credits: 10,
            newBalance,
            referredName: convertedAgency.name ?? 'A new user',
          }).catch(console.error)
        }
      }
    }
  }

  break
}
```

- [ ] **Step 3: Update `customer.subscription.deleted` to set `cancelled` status**

Find the deletion handler (around line 186):

```typescript
// BEFORE:
if (agencyId) {
  await db.from('agencies').update({
    plan: 'free',
    credits_remaining: 1,
    credits_reset_at: new Date().toISOString(),
  }).eq('id', agencyId)
}

// AFTER:
if (agencyId) {
  await db.from('agencies').update({
    plan: 'free',
    account_status: 'cancelled',
    credits_remaining: 1,
    credits_reset_at: new Date().toISOString(),
  }).eq('id', agencyId)
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "webhook"
```

Expected: No output.

- [ ] **Step 5: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat(stripe): set account_status on subscription events, award referral credits on first payment"
```

---

## Task 9: Trial Status API Route

**Files:**
- Create: `app/api/trial-status/route.ts`

A simple route the dashboard uses to get trial info without coupling to the credits endpoint.

- [ ] **Step 1: Create the route**

```typescript
// app/api/trial-status/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  let userId: string | null = null

  if (isDev && process.env.DEV_USER_ID) {
    userId = process.env.DEV_USER_ID
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    userId = user.id
  }

  const db = createAdminClient()
  const { data: agency } = await db
    .from('agencies')
    .select('account_status, trial_ends_at')
    .eq('user_id', userId)
    .single()

  if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const accountStatus: string = agency.account_status ?? 'active'
  const trialEndsAt: string | null = agency.trial_ends_at ?? null
  let daysRemaining: number | null = null

  if (accountStatus === 'trial' && trialEndsAt) {
    const msLeft = new Date(trialEndsAt).getTime() - Date.now()
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
  }

  return NextResponse.json({ accountStatus, trialEndsAt, daysRemaining })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/trial-status/route.ts
git commit -m "feat(api): add /api/trial-status route"
```

---

## Task 10: Trial Banner and Expiry Modal Components

**Files:**
- Create: `components/TrialBanner.tsx`
- Create: `components/TrialExpiredModal.tsx`
- Modify: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create `TrialBanner.tsx`**

```typescript
// components/TrialBanner.tsx
'use client'

import Link from 'next/link'

interface Props {
  daysRemaining: number
}

export default function TrialBanner({ daysRemaining }: Props) {
  const isUrgent = daysRemaining <= 5
  const bg = isUrgent ? '#FEF2F2' : '#EFF6FF'
  const border = isUrgent ? '#FECACA' : '#BFDBFE'
  const text = isUrgent ? '#991B1B' : '#1E3A8A'
  const btnBg = isUrgent ? '#EF4444' : '#1D4ED8'

  const message = daysRemaining === 0
    ? 'Your free trial ends today'
    : daysRemaining === 1
    ? '1 day left in your free trial'
    : `${daysRemaining} days left in your free trial`

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 8,
      padding: '10px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 13, color: text, fontWeight: 500 }}>
        {message} — upgrade to keep full access.
      </span>
      <Link
        href="/onboarding"
        style={{
          background: btnBg,
          color: 'white',
          padding: '6px 14px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Upgrade now →
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Create `TrialExpiredModal.tsx`**

```typescript
// components/TrialExpiredModal.tsx
'use client'

import Link from 'next/link'

export default function TrialExpiredModal() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#FEF2F2', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          ⏰
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F1829', margin: '0 0 10px' }}>
          Your free trial has ended
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
          Your 30-day free trial has expired. Choose a plan to keep generating bilingual listings, WhatsApp copy, and more.
        </p>
        <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 28px' }}>
          Your saved listings are safe and waiting for you.
        </p>

        <Link
          href="/onboarding"
          style={{
            display: 'block',
            background: '#1D4ED8',
            color: 'white',
            padding: '14px 24px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Choose a plan →
        </Link>

        <p style={{ marginTop: 16, fontSize: 12, color: '#94A3B8' }}>
          From AED 92/month · Cancel anytime
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update `app/(dashboard)/layout.tsx` to fetch trial status and render components**

In `app/(dashboard)/layout.tsx`, add the imports at the top with the other imports:

```typescript
import TrialBanner from '@/components/TrialBanner'
import TrialExpiredModal from '@/components/TrialExpiredModal'
```

Add state variables in `DashboardLayout` (after the existing `credits` state):

```typescript
const [accountStatus, setAccountStatus] = useState<string | null>(null)
const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
```

Update `fetchCredits` to also read trial info from the credits response (since we added it in Task 7):

```typescript
const fetchCredits = useCallback(async () => {
  try {
    const res = await fetch('/api/credits')
    if (res.ok) {
      const data = await res.json()
      setCredits(data)
      setAccountStatus(data.accountStatus ?? null)
      setDaysRemaining(data.daysRemaining ?? null)
    }
  } catch {
    // non-critical
  }
}, [])
```

In the JSX, find the `<main>` or content area where `{children}` is rendered. Add the banner ABOVE `{children}` and the modal conditionally outside the layout:

```typescript
{/* Trial expired modal — blocks the whole page */}
{accountStatus === 'trial_expired' && <TrialExpiredModal />}

{/* Inside the main content wrapper, before {children}: */}
{accountStatus === 'trial' && daysRemaining !== null && (
  <TrialBanner daysRemaining={daysRemaining} />
)}
{children}
```

Look for where `{children}` is rendered in the layout (inside the main flex content area). The modal should be rendered at the very bottom of the JSX return, just before the closing tag.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add components/TrialBanner.tsx components/TrialExpiredModal.tsx app/(dashboard)/layout.tsx
git commit -m "feat(ui): add trial banner, trial expired modal, wire into dashboard layout"
```

---

## Task 11: Vercel Cron — Trial Expiry and Reminders

**Files:**
- Create: `app/api/cron/expire-trials/route.ts`
- Create: `vercel.json`

The cron runs at 2 AM UTC daily. It:
1. Finds trials that expired → sets `trial_expired`, sends expiry email
2. Finds trials ending in 10 days → sends 10-day reminder (if not already sent)
3. Finds trials ending in 3 days → sends 3-day reminder (if not already sent)

Email deduplication uses the `email_events` table: check if `email_type` was already sent for `agency_id`.

- [ ] **Step 1: Create the cron route**

```typescript
// app/api/cron/expire-trials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionalEmail } from '@/lib/email/resend'

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()
  const now = new Date()

  const results = {
    expired: 0,
    reminder10: 0,
    reminder3: 0,
    errors: [] as string[],
  }

  // ── 1. Expire overdue trials ──────────────────────────────────────────────
  const { data: expiredAgencies } = await db
    .from('agencies')
    .select('id, email, name')
    .eq('account_status', 'trial')
    .lt('trial_ends_at', now.toISOString())

  for (const agency of expiredAgencies ?? []) {
    await db
      .from('agencies')
      .update({ account_status: 'trial_expired' })
      .eq('id', agency.id)

    if (agency.email) {
      try {
        const { data: sent } = await db
          .from('email_events')
          .select('id')
          .eq('agency_id', agency.id)
          .eq('email_type', 'trial_expired_user')
          .single()

        if (!sent) {
          await sendTransactionalEmail({
            type: 'trial_expired_user',
            to: agency.email,
            agencyName: agency.name ?? 'your agency',
          })
          await db.from('email_events').insert({
            agency_id: agency.id,
            email_type: 'trial_expired_user',
            recipient: agency.email,
            status: 'sent',
            sent_at: now.toISOString(),
          })
        }
      } catch (e) {
        results.errors.push(`expiry email for ${agency.id}: ${String(e)}`)
      }
    }
    results.expired++
  }

  // ── 2. 10-day reminder (trial ends between 9.5 and 10.5 days from now) ───
  const in10DaysMin = new Date(now.getTime() + 9.5 * 24 * 60 * 60 * 1000).toISOString()
  const in10DaysMax = new Date(now.getTime() + 10.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: remind10Agencies } = await db
    .from('agencies')
    .select('id, email, name, trial_ends_at')
    .eq('account_status', 'trial')
    .gte('trial_ends_at', in10DaysMin)
    .lte('trial_ends_at', in10DaysMax)

  for (const agency of remind10Agencies ?? []) {
    if (!agency.email) continue
    try {
      const { data: sent } = await db
        .from('email_events')
        .select('id')
        .eq('agency_id', agency.id)
        .eq('email_type', 'trial_reminder_10')
        .single()

      if (!sent) {
        const endsAt = new Date(agency.trial_ends_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
        await sendTransactionalEmail({
          type: 'trial_reminder_10',
          to: agency.email,
          agencyName: agency.name ?? 'your agency',
          trialEndsAt: endsAt,
        })
        await db.from('email_events').insert({
          agency_id: agency.id,
          email_type: 'trial_reminder_10',
          recipient: agency.email,
          status: 'sent',
          sent_at: now.toISOString(),
        })
        results.reminder10++
      }
    } catch (e) {
      results.errors.push(`reminder10 for ${agency.id}: ${String(e)}`)
    }
  }

  // ── 3. 3-day reminder (trial ends between 2.5 and 3.5 days from now) ──────
  const in3DaysMin = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000).toISOString()
  const in3DaysMax = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: remind3Agencies } = await db
    .from('agencies')
    .select('id, email, name, trial_ends_at')
    .eq('account_status', 'trial')
    .gte('trial_ends_at', in3DaysMin)
    .lte('trial_ends_at', in3DaysMax)

  for (const agency of remind3Agencies ?? []) {
    if (!agency.email) continue
    try {
      const { data: sent } = await db
        .from('email_events')
        .select('id')
        .eq('agency_id', agency.id)
        .eq('email_type', 'trial_reminder_3')
        .single()

      if (!sent) {
        const endsAt = new Date(agency.trial_ends_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
        await sendTransactionalEmail({
          type: 'trial_reminder_3',
          to: agency.email,
          agencyName: agency.name ?? 'your agency',
          trialEndsAt: endsAt,
        })
        await db.from('email_events').insert({
          agency_id: agency.id,
          email_type: 'trial_reminder_3',
          recipient: agency.email,
          status: 'sent',
          sent_at: now.toISOString(),
        })
        results.reminder3++
      }
    } catch (e) {
      results.errors.push(`reminder3 for ${agency.id}: ${String(e)}`)
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-trials",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Note: Vercel Cron calls the route with a `Authorization: Bearer <CRON_SECRET>` header automatically. Add `CRON_SECRET` to your Vercel environment variables (any random string).

Add `CRON_SECRET` to `.env.local` as well:
```
CRON_SECRET=your_random_secret_here
```

In the cron route, Vercel also sends `Authorization: Bearer <token>`. Update the secret check to also accept that header:

```typescript
// Replace the secret check with:
const authHeader = req.headers.get('authorization')
const cronSecret = process.env.CRON_SECRET
if (
  authHeader !== `Bearer ${cronSecret}` &&
  req.nextUrl.searchParams.get('secret') !== cronSecret
) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "cron"
```

Expected: No output.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/expire-trials/route.ts vercel.json
git commit -m "feat(cron): add daily trial expiry and reminder email job via Vercel Cron"
```

---

## Task 12: Referral Section in Settings

**Files:**
- Modify: `app/(dashboard)/settings/page.tsx`

Add a "Referrals" tab to the existing settings page (which already has 'profile' and 'subscription' tabs). The referrals section shows the referral link, stats, and credit balance.

- [ ] **Step 1: Add referral data types and state**

In `app/(dashboard)/settings/page.tsx`, update the `Tab` type and add referral state:

```typescript
// Update Tab type
type Tab = 'profile' | 'subscription' | 'referrals'

// Add referral state inside the component (after existing state):
const [referralCode, setReferralCode] = useState<string | null>(null)
const [referralStats, setReferralStats] = useState<{
  sent: number
  converted: number
  totalCreditsEarned: number
  currentBalance: number
} | null>(null)
const [referralCopied, setReferralCopied] = useState(false)
```

- [ ] **Step 2: Create `/api/referrals/stats` route**

```typescript
// app/api/referrals/stats/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  let userId: string | null = null

  if (isDev && process.env.DEV_USER_ID) {
    userId = process.env.DEV_USER_ID
  } else {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    userId = user.id
  }

  const db = createAdminClient()

  const { data: agency } = await db
    .from('agencies')
    .select('id, referral_code, listing_credits')
    .eq('user_id', userId)
    .single()

  if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: referrals } = await db
    .from('referrals')
    .select('id, credits_awarded')
    .eq('referrer_agency_id', agency.id)

  const sent = referrals?.length ?? 0
  const converted = referrals?.filter(r => r.credits_awarded).length ?? 0
  const totalCreditsEarned = converted * 10

  return NextResponse.json({
    referralCode: agency.referral_code,
    currentBalance: agency.listing_credits ?? 0,
    sent,
    converted,
    totalCreditsEarned,
  })
}
```

- [ ] **Step 3: Fetch referral stats in settings page**

In `app/(dashboard)/settings/page.tsx`, inside `fetchData` (or in a separate `useEffect`), add:

```typescript
// After the existing fetchData content, add referral fetch:
const fetchReferralStats = useCallback(async () => {
  const res = await fetch('/api/referrals/stats')
  if (res.ok) {
    const data = await res.json()
    setReferralCode(data.referralCode)
    setReferralStats({
      sent: data.sent,
      converted: data.converted,
      totalCreditsEarned: data.totalCreditsEarned,
      currentBalance: data.currentBalance,
    })
  }
}, [])

useEffect(() => {
  fetchReferralStats()
}, [fetchReferralStats])
```

- [ ] **Step 4: Add "Referrals" tab button**

Find where the 'profile' and 'subscription' tab buttons are rendered. Add a third tab:

```typescript
{(['profile', 'subscription', 'referrals'] as Tab[]).map((t) => (
  <button
    key={t}
    onClick={() => setTab(t)}
    style={{
      padding: '8px 16px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      fontWeight: tab === t ? 600 : 400,
      background: tab === t ? '#1D4ED8' : 'transparent',
      color: tab === t ? '#fff' : '#64748B',
      fontSize: 13,
      fontFamily: 'inherit',
      transition: 'all 0.15s',
    }}
  >
    {t.charAt(0).toUpperCase() + t.slice(1)}
  </button>
))}
```

- [ ] **Step 5: Add the referrals tab content**

After the subscription tab JSX, add:

```typescript
{tab === 'referrals' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F1829', marginBottom: 4 }}>Your Referral Link</h3>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
        Share this link. When someone signs up and activates a paid plan, you earn 10 listing credits.
      </p>
      {referralCode ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            readOnly
            value={`https://enlista.io/auth?tab=signup&ref=${referralCode}`}
            style={{ ...inputStyle, flex: 1, background: '#F8FAFC', color: '#475569', cursor: 'text' }}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://enlista.io/auth?tab=signup&ref=${referralCode}`)
              setReferralCopied(true)
              setTimeout(() => setReferralCopied(false), 2000)
            }}
            style={{
              padding: '11px 16px', borderRadius: 6, border: '1.5px solid #DDE3EC',
              background: referralCopied ? '#F0FDF4' : '#FFFFFF', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: referralCopied ? '#16A34A' : '#0F1829',
              fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >
            {referralCopied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      ) : (
        <p style={{ color: '#94A3B8', fontSize: 13 }}>Loading...</p>
      )}
    </div>

    {referralStats && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { label: 'Referrals sent', value: referralStats.sent },
          { label: 'Successful referrals', value: referralStats.converted },
          { label: 'Credits earned total', value: referralStats.totalCreditsEarned },
          { label: 'Current credit balance', value: referralStats.currentBalance },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#F8FAFC', borderRadius: 10, padding: '16px 20px',
            border: '1px solid #DDE3EC',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F1829' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    )}

    <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '14px 16px', border: '1px solid #BFDBFE' }}>
      <p style={{ fontSize: 13, color: '#1E3A8A', margin: 0, lineHeight: 1.6 }}>
        <strong>How it works:</strong> When someone signs up via your link and activates a paid plan, you instantly receive 10 listing credits. Credits are used automatically before your monthly quota. They never expire.
      </p>
    </div>
  </div>
)}
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "settings"
```

Expected: No output.

- [ ] **Step 7: Commit**

```bash
git add app/(dashboard)/settings/page.tsx app/api/referrals/stats/route.ts
git commit -m "feat(settings): add referrals tab with referral link, stats, and credit balance"
```

---

## Task 13: Show Listing Credits in Sidebar Nav

**Files:**
- Modify: `app/(dashboard)/layout.tsx`

Update the credits widget to also show `listing_credits` (referral credits) separately from monthly credits.

- [ ] **Step 1: Update `CreditInfo` interface**

In `app/(dashboard)/layout.tsx`, update the `CreditInfo` interface:

```typescript
interface CreditInfo {
  plan: string
  creditsRemaining: number
  extraCredits: number
  listingCredits: number   // add this
  totalCredits: number
  creditLimit: number
  nextReset: string
  accountStatus: string
  trialEndsAt: string | null
  daysRemaining: number | null
}
```

- [ ] **Step 2: Show listing credits in the sidebar widget**

In `app/(dashboard)/layout.tsx`, inside the `SidebarBottom` credits widget, after the `extraCredits` conditional block (around line 139), add:

```typescript
{credits.listingCredits > 0 && (
  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: '5px 0 0' }}>
    +{credits.listingCredits} referral credits
  </p>
)}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 4: Run final typecheck and lint**

```bash
npm run typecheck && npm run lint
```

Expected: Both pass cleanly.

- [ ] **Step 5: Commit**

```bash
git add app/(dashboard)/layout.tsx
git commit -m "feat(nav): show referral credit balance in sidebar credits widget"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Trial status enum on accounts | Task 1 (migration) |
| trial_started_at, trial_ends_at, subscribed_at | Tasks 1 + 4 |
| No credit card required on signup | Task 4 (no Stripe at signup) + Task 5 (middleware allows trial) |
| Full access during trial | Task 5 (middleware) |
| Block on trial_expired | Tasks 5 (middleware) + 6 (generate route) |
| Trial expiry inline check at generation | Task 6 |
| Daily cron to expire trials | Task 11 |
| Trial started email | Task 4 (send via post-signup — or add to AuthForm after agency insert) |
| Trial reminder day 20 (10 days left) | Task 11 (cron) |
| Trial reminder day 27 (3 days left) | Task 11 (cron) |
| Trial expired email | Task 11 (cron) |
| Dashboard trial banner | Task 10 |
| Urgent banner ≤5 days | Task 10 (TrialBanner uses isUrgent) |
| Full-screen modal on expiry | Task 10 (TrialExpiredModal) |
| referral_code auto-generated | Task 1 (DB trigger) |
| referred_by stored on agency | Tasks 1 (column) + 3 (route) |
| listing_credits column | Task 1 |
| referrals table | Task 1 |
| Referral tracking on signup via ?ref= | Task 4 (localStorage) + Task 3 (route) |
| Credits awarded on first payment | Task 8 (Stripe webhook invoice.paid) |
| listing_credits consumed first | Task 6 |
| Referral section in dashboard | Task 12 |
| Referral link with copy button | Task 12 |
| Stats: sent, converted, earned, balance | Tasks 12 + new /api/referrals/stats |
| Credit balance in nav | Task 13 |
| Credits awarded email | Tasks 2 + 8 |
| Account status set active on subscription | Task 8 |
| Account status set cancelled on deletion | Task 8 |
| Indexes on referral_code, referred_by | Task 1 |

### Missing: Trial Started Email
The spec requires a "Trial started" email at signup. This is not in the plan above. **Add to Task 4**:

After the agencies INSERT in `AuthForm.tsx`, fire-and-forget a POST to `/api/auth/post-signup` (already being called). Update that route to also send the trial started email:

In `app/api/auth/post-signup/route.ts`, at the end before the final `return NextResponse.json({ ok: true })`, add:

```typescript
// Send trial started email
const { data: agency } = await db
  .from('agencies')
  .select('email, name, trial_ends_at')
  .eq('user_id', user.id)
  .single()

if (agency?.email && agency?.trial_ends_at) {
  const trialEndsAt = new Date(agency.trial_ends_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const { sendTransactionalEmail } = await import('@/lib/email/resend')
  await sendTransactionalEmail({
    type: 'trial_started',
    to: agency.email,
    agencyName: agency.name ?? 'your agency',
    trialEndsAt,
  }).catch(console.error)
}
```

This email sends for ALL new signups regardless of whether they had a referral code, so it should be placed before the `if (!refCode)` early return check — or after handling the referral code, before the final return.

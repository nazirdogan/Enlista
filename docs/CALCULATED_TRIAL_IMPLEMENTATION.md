# Calculated Trial Implementation

## Overview

This document explains how the calculated trial period works — a system that bridges your 30-day free trial (at signup) with Stripe's subscription trial period, ensuring users are charged fairly no matter when they upgrade.

## The Problem It Solves

**Before:** Users got two separate trial periods:
- 30-day free trial from signup (stored in `agencies.trial_ends_at`)
- 14-day fixed trial in Stripe when they upgrade

This meant:
- User signs up Monday, upgrades on day 3 → gets 14 MORE days of trial (total 34 days) ❌
- User signs up Monday, upgrades on day 35 (trial expired) → still gets 14 days of trial in Stripe ❌

**After:** Users have ONE continuous trial period:
- Trial ends on `trial_ends_at` (30 days from signup)
- When upgrading, we calculate days remaining and apply that to Stripe
- User is charged on the original `trial_ends_at` date, regardless of when they upgrade ✅

## How It Works

### 1. User Signs Up
```
created_at = 2026-04-13
trial_started_at = 2026-04-13 (set by migration backfill)
trial_ends_at = 2026-05-13 (30 days from signup)
account_status = 'trial'
```

### 2. User Upgrades (Day 5 of trial)
```
checkout endpoint calculates:
  now = 2026-04-18
  trial_ends_at = 2026-05-13
  days_remaining = ceil((May 13 - Apr 18) / 86400000) = 25 days

Stripe subscription created with:
  trial_period_days = 25
  charged_date = 2026-05-13 (original trial_ends_at)
```

### 3. User Upgrades (Day 35, trial expired)
```
checkout endpoint calculates:
  now = 2026-05-18
  trial_ends_at = 2026-05-13
  days_remaining = -5 days → max(0, -5) = 0

Stripe subscription created with:
  trial_period_days = 0 (omitted from request)
  charged_immediately = true
```

## Code Changes

### 1. Database Migration (`008_trial_started_at.sql`)
Adds explicit `trial_started_at` column for clarity:
```sql
ALTER TABLE agencies ADD COLUMN trial_started_at timestamptz NOT NULL DEFAULT now();
```

Backfills from `created_at` for all existing users (all trials started at signup).

### 2. Checkout Endpoint (`app/api/stripe/checkout/route.ts`)

**Key change:** Replace hardcoded `trialDays = 14` with calculated logic:

```typescript
// Calculate remaining trial days from signup date
let trialDays: number | undefined
if (isNewSubscriber) {
  const { data: agencyTrial } = await supabase
    .from('agencies')
    .select('trial_started_at, trial_ends_at')
    .eq('id', agency.id)
    .single()

  if (agencyTrial?.trial_ends_at) {
    const now = new Date()
    const trialEnd = new Date(agencyTrial.trial_ends_at)
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Only apply trial if days remaining > 0; otherwise charge immediately
    trialDays = Math.max(0, daysRemaining) || undefined
  }
}
```

**Why `Math.ceil`?** Rounds UP to ensure users get the benefit of doubt. Day 29.5 → 30 days remaining.

**Why `|| undefined`?** When `daysRemaining = 0`, we omit `trial_period_days` from Stripe, triggering immediate charge.

### 3. Metadata Logging (optional but helpful)

Stripe metadata now includes:
```typescript
...(isNewSubscriber && trialDays !== undefined 
  ? { trial_days_calculated: String(trialDays) } 
  : {})
```

This appears in Stripe dashboard for debugging, e.g., `trial_days_calculated: "25"`.

## Webhook Behavior (No Changes Needed)

The `stripe/webhook` already handles trial-end correctly via Stripe's native `trial_end` timestamp:
```typescript
trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
```

This is synced to the `subscriptions` table and used by the `expire-trials` cron job.

## Edge Cases Handled

| Scenario | Before | After |
|----------|--------|-------|
| Upgrade day 3 of 30 | 14 days trial (expires day 17) | 27 days trial (expires day 30) |
| Upgrade day 29 of 30 | 14 days trial (expires day 43) | 1 day trial (expires day 30) |
| Upgrade day 30 (expires today) | 14 days trial (expires day 44) | 0 days (charged immediately) |
| Upgrade day 35 (expired) | 14 days trial (expires day 49) | 0 days (charged immediately) |
| Upgrade multiple times (existing sub) | N/A — fixed logic for new subs only | Same (no change to existing subscribers) |

## Testing Checklist

When testing locally or in staging:

- [ ] New user signs up → `trial_ends_at` = now + 30 days
- [ ] New user upgrades day 5 → Stripe trial ≈ 25 days
- [ ] New user upgrades day 30 → Stripe trial ≈ 0 days (charges immediately)
- [ ] New user upgrades day 35 → Stripe trial = 0 (charges immediately)
- [ ] Existing subscriber upgrades → uses old logic (no trial)
- [ ] Check Stripe dashboard → `trial_period_days` matches calculation
- [ ] Check `trial_days_calculated` in Stripe metadata matches days_remaining math

## Deployment Notes

1. **Migration**: Run `008_trial_started_at.sql` in Supabase
   - Adds `trial_started_at` column
   - Backfills from `created_at`
   - Sets NOT NULL constraint

2. **Code**: Deploy updated `app/api/stripe/checkout/route.ts`
   - Safe to deploy independently (backward compatible)
   - No API signature changes

3. **Monitoring**: Check Stripe logs for:
   - `trial_days_calculated` metadata
   - Subscription trial periods matching expectations

## Future Enhancements

- Add admin dashboard to view trial_started_at / trial_ends_at for each user
- Email notifications: "X days left in your trial" (use trial_ends_at)
- Analytics: track when users upgrade relative to trial progression
- Option to extend trial (manual override in admin panel)

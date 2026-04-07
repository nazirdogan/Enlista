# Enlista — 30-Day Free Trial & Referral Credit System

## Overview

Two interconnected features:
1. **30-Day Free Trial** — new users get full product access for 30 days, no credit card required at signup
2. **Referral Credit Bonus** — existing users earn 10 listing credits per *successful* referral (successful = referred user completes trial AND adds a payment method)

---

## Feature 1: 30-Day Free Trial

### Business Rules
- Every new account starts in `trial` status automatically on signup
- Trial duration: 30 calendar days from the moment of account creation
- No credit card required to start the trial
- Full product access during trial (bilingual listing generation, WhatsApp copy, Instagram caption, RERA check, lead scoring)
- On day 30 expiry: account moves to `trial_expired` status; listing generation is blocked until a paid plan is activated
- Users can upgrade to a paid plan at any point during or after the trial
- If a user adds a payment method and subscribes before trial ends, remaining trial days are not carried over (trial simply ends early and billing begins)

### Data Model Changes

**users table — add fields:**
- `account_status` (enum): `trial` | `trial_expired` | `active` | `cancelled`
- `trial_started_at` (timestamp): set at account creation
- `trial_ends_at` (timestamp): `trial_started_at + 30 days`
- `subscribed_at` (timestamp, nullable): date user converted to paid

### Logic / Endpoints

**On every listing generation request:**
- Check `account_status`
- If `trial`: check `trial_ends_at` vs now
  - If within trial: allow generation, proceed
  - If past `trial_ends_at`: set status to `trial_expired`, block request, return error with upgrade CTA
- If `active`: allow generation
- If `trial_expired` or `cancelled`: block, return upgrade prompt

**Trial expiry cron job** (run daily):
- Find all accounts where `account_status = 'trial'` AND `trial_ends_at < now()`
- Set `account_status = 'trial_expired'`
- Trigger expiry email (see Email Triggers below)

### UI/UX Requirements
- Dashboard banner showing trial days remaining (e.g. "12 days left in your free trial — Upgrade now")
- Banner turns red/urgent when ≤ 5 days remain
- On expiry: full-page modal blocking access with upgrade CTA, not just a banner
- Settings page shows trial status and end date clearly

### Email Triggers
| Trigger | Send at | Content |
|---|---|---|
| Trial started | Signup | Welcome + what you can do |
| Trial reminder | Day 20 | 10 days left, highlight value |
| Trial reminder | Day 27 | 3 days left, urgency |
| Trial expired | Day 30 | Expired — upgrade to keep access |

---

## Feature 2: Referral Credit System

### Business Rules
- Every user gets a unique referral link/code on account creation
- Referrer earns **10 listing credits** when a referral is **successful**
- **Successful referral definition:** the referred user must (a) sign up via the referral link AND (b) add a valid payment method (i.e. convert to paid at end of trial)
- Signing up alone does NOT trigger the credit reward — this prevents spam invites
- Credits are added to the referrer's account immediately upon the referred user's payment method being confirmed
- Credits are consumed before the subscription's monthly listing quota (credits are a top-up, not a replacement)
- Credits do not expire once earned
- There is no cap on how many referrals a user can make
- Referred user gets no extra benefit from using a referral link (the benefit is one-sided, for the referrer) — keep this simple for now

### Data Model Changes

**users table — add fields:**
- `referral_code` (string, unique): auto-generated on account creation (e.g. `ENL-A3X9K`)
- `referred_by_user_id` (FK to users, nullable): set if user signed up via a referral link
- `listing_credits` (integer, default 0): current credit balance

**referrals table — new table:**
- `id`
- `referrer_user_id` (FK to users)
- `referred_user_id` (FK to users)
- `created_at` (timestamp): when referred user signed up
- `converted_at` (timestamp, nullable): when referred user added payment method
- `credits_awarded` (boolean, default false)
- `credits_awarded_at` (timestamp, nullable)

### Logic / Endpoints

**On signup via referral link (`/signup?ref=ENL-A3X9K`):**
- Look up user by `referral_code`
- If found: create referral record with `referrer_user_id` and `referred_user_id`, set `referred_by_user_id` on new user
- If not found or no ref param: normal signup, no referral record

**On payment method confirmed (webhook or post-subscription hook):**
- Check if `referred_by_user_id` is set on the newly-converted user
- Look up the referral record
- If `credits_awarded = false`:
  - Add 10 to `referrer.listing_credits`
  - Set `referral.credits_awarded = true`, `referral.converted_at = now()`, `referral.credits_awarded_at = now()`
  - Send credit notification email to referrer

**On listing generation (update existing check):**
- If `listing_credits > 0`: deduct 1 credit before checking subscription quota
- If `listing_credits = 0`: proceed with normal subscription quota check

### UI/UX Requirements
- Referral section in dashboard/settings showing:
  - User's unique referral link (with one-click copy)
  - Count of referrals sent
  - Count of successful (converted) referrals
  - Total credits earned
  - Current credit balance
- In-app notification when credits are awarded: "🎉 You earned 10 credits — [Name] just joined Enlista!"
- Credit balance visible in the header/nav alongside listing count

### Email Triggers
| Trigger | Send at | Content |
|---|---|---|
| Credits awarded | When referral converts | "You earned 10 credits! Your balance is now X." |

---

## Out of Scope (for this implementation)
- Two-sided referral rewards (bonus for the referred user) — may revisit later
- Referral leaderboard or tiered rewards
- Credit expiry
- Credits purchasable separately

---

## Claude Code Prompt

Paste the following into Claude Code:

---

```
I need to implement two features for Enlista, an AI-powered property listing SaaS for Dubai real estate agents.

Please implement the following. Read this entire spec carefully before writing any code.

---

## FEATURE 1: 30-Day Free Trial

Every new user account should automatically start a 30-day free trial on signup. No credit card is required to sign up.

**Database changes required:**
Add the following fields to the users table:
- `account_status` (enum): values are 'trial', 'trial_expired', 'active', 'cancelled'. Default: 'trial'
- `trial_started_at` (timestamp): set to NOW() on account creation
- `trial_ends_at` (timestamp): set to NOW() + 30 days on account creation
- `subscribed_at` (timestamp, nullable): set when user converts to a paid plan

**Listing generation guard:**
On every listing generation request, before processing:
1. If account_status is 'trial': check if trial_ends_at has passed. If it has, set account_status to 'trial_expired' and return a 403 error with a message directing the user to upgrade. If trial is still active, allow the request.
2. If account_status is 'active': allow the request.
3. If account_status is 'trial_expired' or 'cancelled': return a 403 error with upgrade CTA.

**Daily cron job:**
Create a scheduled job that runs once daily to find all accounts where account_status = 'trial' AND trial_ends_at < NOW(), and sets them to 'trial_expired'. This job should also trigger an expiry notification email.

**Frontend — Dashboard banner:**
Show a banner on the dashboard displaying days remaining in the trial (e.g. "12 days left in your free trial"). When 5 or fewer days remain, make the banner visually urgent (red or warning color). On expiry, show a full-screen modal blocking access with an upgrade CTA — do not just use a banner.

---

## FEATURE 2: Referral Credit System

Users earn 10 listing credits when someone they referred successfully converts to a paid plan (i.e. signs up via their referral link AND adds a payment method). Credits are a top-up that get consumed before the user's monthly listing quota.

**Database changes required:**

Add to users table:
- `referral_code` (string, unique): auto-generated on account creation. Format: 'ENL-' followed by 5 uppercase alphanumeric characters. Must be unique across all users.
- `referred_by_user_id` (foreign key to users, nullable): set if user signed up via a referral link
- `listing_credits` (integer, default 0): current credit balance

Create a new referrals table:
- `id` (primary key)
- `referrer_user_id` (foreign key to users)
- `referred_user_id` (foreign key to users)
- `created_at` (timestamp)
- `converted_at` (timestamp, nullable)
- `credits_awarded` (boolean, default false)
- `credits_awarded_at` (timestamp, nullable)

**Signup flow — referral tracking:**
If the signup URL contains a `ref` query parameter (e.g. /signup?ref=ENL-A3X9K):
- Look up the user with that referral_code
- If found: create a referral record and set referred_by_user_id on the new user
- If not found: proceed with normal signup, no referral record

**On payment method confirmed:**
When a user successfully adds a payment method / converts to paid:
- Check if referred_by_user_id is set
- If yes: look up the referral record. If credits_awarded is false:
  - Add 10 to the referrer's listing_credits
  - Set credits_awarded = true, converted_at and credits_awarded_at = NOW()
  - Send a credit notification email to the referrer

**Listing generation — credits check:**
Update the listing generation logic so that if listing_credits > 0, deduct 1 credit first before checking the monthly subscription quota.

**Frontend — Referral dashboard section:**
In the user's settings or dashboard, add a referral section that shows:
- Their unique referral link (full URL with ref param), with a one-click copy button
- Number of referrals sent (total referral records created)
- Number of successful (converted) referrals
- Total credits ever earned
- Current credit balance

Also display the credit balance in the main navigation/header alongside the listing count.

Show an in-app notification when credits are awarded.

---

## General instructions:
- Write database migrations for all schema changes
- Add appropriate indexes (referral_code should be indexed for fast lookup; referred_by_user_id should be indexed)
- All new API endpoints should be authenticated
- Return clear, user-facing error messages (not raw error codes) wherever the user hits a trial or credit limit
- Do not implement: two-sided referral rewards, credit expiry, credit purchasing, referral leaderboards
```

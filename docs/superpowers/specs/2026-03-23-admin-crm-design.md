# Admin CRM — Design Spec
**Date:** 2026-03-23
**Status:** Approved by user
**Project:** Enlista (ListingAI)

---

## Overview

Build a private, admin-only CRM dashboard embedded in the existing Next.js app at `/admin`. The CRM gives the operator (Nazir) a single pane of glass over signups, subscriptions, listings, outreach, and transactional emails. It is inaccessible to regular agency users — protected server-side by an email allowlist checked against the Supabase session.

---

## Goals

1. Track every signup: who, where, what plan, what source
2. Monitor subscription revenue: MRR, ARR, LTV, churn, retention cohorts
3. Measure listing generation: volume, frequency, type, tone
4. Operate the WhatsApp outreach CRM: contacts, variant A/B performance, spend, ROAS
5. Monitor transactional email health via Resend API
6. Surface at-risk users and conversion opportunities proactively (alerts panel)

---

## Architecture

### Placement
- Route group: `app/(admin)/admin/` in the existing Next.js app
- Protected via `middleware.ts` — the current middleware is a pass-through stub and must be replaced with a full Supabase auth middleware. It must call `supabase.auth.getUser()` (not `getSession()` — Supabase's own guidance flags `getSession()` as unsafe in middleware as it does not verify the JWT). Admin routes additionally check that `user.email` is in the `ADMIN_EMAILS` env var (comma-separated).
- All `/api/admin/*` routes repeat the email check server-side as a second layer.
- No user-facing exposure; redirect to `/auth` for unauthenticated, 403 for authenticated non-admin.

### Data Sources
| Section | Source |
|---|---|
| Users / Signups | Supabase `agencies` table |
| Subscriptions | Supabase `subscriptions` table (new) + Stripe API (live status) |
| Listings | Supabase `listings` table |
| Outreach | Supabase `outreach_sends`, `outreach_clicks`, `outreach_replies`, `outreach_signups`, `outreach_optouts` |
| Ad Spend / ROAS | Meta Ads API (server-side, cached hourly in Supabase `admin_cache`) |
| Emails | Resend API (webhooks → Supabase `email_events` table) |

### New Database Tables Required
1. **`subscriptions`** — plan, plan_amount (integer AED, stored at creation time), status, stripe_customer_id, stripe_subscription_id, started_at, cancelled_at, current_period_end (timestamptz), trial_end (timestamptz), agency_id. MRR = `SUM(plan_amount)` from active subscriptions — stored at creation to survive price changes.
2. **`email_events`** — email_type, recipient, status (delivered/bounced/complained), resend_id, sent_at, agency_id
3. **`admin_cache`** — key (text PK), value (text), cached_at (timestamptz default now()), expires_at (timestamptz)

All three tables must have RLS enabled with no user-facing policies. All admin reads/writes go through `SUPABASE_SERVICE_ROLE_KEY` from API routes only — never the anon key.

### `agencies` Table Migration Required
The existing `agencies` table has no `city` or `country` columns. Phase 1 must include a migration adding:
- `city text` — populated from sign-up form (already captured in UI, needs to persist)
- `country text` — same

### Stripe Webhook Fix
The existing webhook at `/api/stripe/webhook` has TODO stubs. These must be completed to sync subscription state to the new `subscriptions` table on:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

**Prerequisite:** The existing `/api/stripe/checkout` route must be updated simultaneously to pass `agency_id` (from the authenticated user's session) in the Stripe session metadata. Without this, the webhook has no way to join a Stripe event back to a Supabase agency. This is a Phase 1 blocker.

### Resend Integration
- Install Resend SDK (`resend`), configure `RESEND_API_KEY` env var
- Implement transactional email sends via Resend SDK for four event types: `welcome`, `trial_expiry`, `payment_failed`, `subscription_confirmed`
- Register webhook endpoint `/api/resend/webhook` to receive delivery events → insert into `email_events`
- **Webhook security:** Verify Resend webhook signatures using the `svix` library before processing any event. Check `svix-id`, `svix-timestamp`, and `svix-signature` headers. Reject requests that fail verification with a 400.

### Meta Ads API Integration
- Server-side fetch to Meta Graph API for campaign spend data
- Cached hourly in `admin_cache` table (key: `meta_ads_spend_YYYY-MM`)
- ROAS calculated as: attributed subscription MRR from outreach signups ÷ total Meta spend

---

## Sections

### 1. Overview (`/admin`)
**KPI Cards (8):** Total signups, MRR, trial→paid conversion %, active trials, listings generated, outreach ROAS, churn rate, avg LTV

**Charts:**
- Signups & MRR trend — last 6 months bar chart (interactive, expandable)
- Plan distribution — donut chart

**Tables/Lists:**
- Recent signups (last 5) — agency, city, plan badge, listings count
- Alerts panel — trials expiring in 3 days, payment failures, 14-day inactive users, outreach variant winner recommendation

### 2. Users (`/admin/users`)
**Stats strip:** Total signups, active trials, paying, at-risk count, top city, top country

**Filters:** Search (name/email/city), plan filter tabs, country filter, at-risk filter, Export CSV

**Table columns:** Agency name + email, location (flag + city), plan badge, signup date, listings bar + count, last active (colour-coded: green <3d, amber 3–14d, red 14d+), acquisition source (WhatsApp variant or Organic), View button

**User detail view** (click View): full profile, listing history, subscription history, email history, outreach attribution

### 3. Subscriptions (`/admin/subscriptions`)
**KPIs (5):** MRR, ARR projected, avg LTV, churn rate, trial→paid %

**Charts:**
- MRR growth — last 6 months (interactive, expandable)
- Plan breakdown — per-plan user count + MRR contribution
- Retention cohort heatmap — monthly cohorts, % still active at M1–M5+ (green scale)

**Table:** Agency, plan badge, billing status (active/failed/cancelled/trial), started, renewal date, months active, LTV to date, Stripe deep-link

**Filters:** All / Active / Trial / Failed / Cancelled tabs, Export CSV

### 4. Listings (`/admin/listings`)
**KPIs (5):** Total generated, avg per user, publish rate, hours saved, top community

**Charts:**
- Monthly listings trend — last 6 months (interactive, expandable)
- Property type breakdown — horizontal bars
- Tone breakdown — horizontal bars (Professional / Luxury / Investment)

**Table:** Top agencies by listings — rank, agency, plan, total listings, avg/month, last generated

**Export CSV:** Full listings data across all agencies

### 5. Outreach (`/admin/outreach`)
**Tabs:** Campaign Overview / Contacts / Replies / Opt-outs

**KPIs (6):** Total sent, clicks (+ click rate), replies (+ reply rate), signups (+ signup rate), ad spend (Meta Ads), ROAS

**Variant cards (A1/A2/B1/B2):** Each showing sent, signup %, click %, reply % with progress bars. Winner badge on top performer. Paused badge on underperformers.

**Spend breakdown card:** Template costs, Meta Ads campaign spend, total, cost per click, cost per signup, attributed MRR

**ROAS card:** Big number + attribution math (signups attributed, converted to paid, avg first-month revenue, total outreach MRR)

**Contacts table:** Agent name + agency, masked phone, variant, sent date, funnel status (sent/clicked/replied/signed-up/opt-out), signup email if converted, plan if converted. Filters + Export CSV.

### 6. Emails (`/admin/emails`)
**Resend status banner:** Connected / disconnected, last sync time

**KPIs (4):** Emails sent (30d), delivery rate, bounced count, spam complaints

**Email type cards (4):** Welcome, Trial Expiry, Payment Failed, Subscription Confirmed — each with delivered count + %, bounced count, template name

**User email directory table:** Agency, work email, personal email, plan, welcome sent date, last email type, delivery status. Export CSV.

---

## UX & Interaction Design

### Animations & Transitions
- Page transitions: fade-in + slight upward slide (150ms ease-out) on route change
- Card entrance: staggered fade-in with 30ms delay between cards on page load
- Hover states: subtle `translateY(-2px)` lift + shadow increase on KPI cards
- Sidebar nav: smooth active indicator transition (200ms)
- Badge/status changes: colour transitions (150ms)

### Interactive Charts
- **Hover tooltip:** All bar charts show a floating tooltip on hover with exact value, % change vs previous period, and date
- **Expand to fullscreen:** Every chart has an expand icon (top-right). Click opens a modal with the chart rendered at full viewport width, with additional detail (e.g. stacked breakdown, data table below chart)
- Chart library: **Recharts** (already compatible with Next.js / React, no SSR issues)

### CSV Export
Available on every table and data section:
- Overview: signups summary, MRR summary
- Users: full user table
- Subscriptions: full subscription table
- Listings: full listings data (all agencies)
- Outreach: contacts table, variant performance summary
- Emails: email events log, user directory

Export is server-side (Next.js API route streams CSV), never client-side blob, to avoid loading full datasets into the browser.

---

## Security

- `middleware.ts` checks `user.email` (from `supabase.auth.getUser()`) against `ADMIN_EMAILS` env var before serving any `/admin` route
- All admin API routes (`/api/admin/*`) repeat the same email check server-side
- Meta Ads API token stored in env var, never exposed to client
- Resend API key stored in env var, never exposed to client
- Phone numbers in outreach contacts table are masked in the UI (`+971 50 ••• ••42`) — full number only accessible via direct Supabase query
- CSV exports are generated server-side and streamed; no raw DB dump exposed

---

## Additional Metrics (beyond user's initial list)

These were identified during codebase analysis as high-value additions:

1. **Trial → paid conversion rate** — the primary growth health metric
2. **Time-to-first-listing** — activation speed, reveals onboarding friction
3. **Churn early warning** — 14-day inactive users flagged in alerts + Users table
4. **Outreach ROAS per variant** — A1/A2/B1/B2 individual ROAS breakdown
5. **Geographic revenue concentration** — which cities/countries generate paid revenue (not just signups)
6. **Portal connection rate** — % of agencies who've connected Bayut/PF/Dubizzle (product adoption signal)

---

## Implementation Phases

### Phase 1 — Foundation
- DB migrations: `subscriptions`, `email_events`, `admin_cache` tables
- Fix Stripe webhook to sync subscription state
- Integrate Resend SDK + webhook endpoint
- Admin middleware (email allowlist)
- Layout: sidebar + shell

### Phase 2 — Core Pages
- Overview page (KPIs + charts + alerts)
- Users page (table + filters + user detail)
- Subscriptions page (KPIs + cohort + table)
- **Note:** Chart sections in Phase 2 should render fixed-height placeholder containers (`div` with min-height). Recharts is dropped in during Phase 4. This keeps Phase 2 pages functional and testable without the charting library.

### Phase 3 — Growth Pages
- Listings page
- Outreach page (all tabs)
- Emails page

### Phase 4 — Polish
- Recharts integration across all pages
- Animations & transitions
- Chart expand modals
- CSV export API routes

---

## Environment Variables Required (new)
```
ADMIN_EMAILS=nazir@example.com
RESEND_API_KEY=re_...
META_ADS_ACCESS_TOKEN=...
META_ADS_ACCOUNT_ID=act_...
```
(Existing: STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY — already in use)

---

## Out of Scope
- Per-user analytics visible to agency users (future phase)
- Email campaign builder / marketing emails (Resend transactional only)
- Portal sync management (portal_connections table exists but sync logic not built)
- Mobile-responsive admin (desktop-only for now)

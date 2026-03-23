# WhatsApp Outreach A/B Testing System — Design Spec
**Date:** 2026-03-21
**Product:** Enlista (UAE real estate AI SaaS)
**Goal:** Automated WhatsApp outreach to Dubai real estate agents with A/B tested message variants, full funnel tracking, and automated analysis every 100 messages.

---

## 1. Overview

An automated outreach system that sends WhatsApp messages to Dubai real estate agents sourced from `dubai_agents.html` (6,624 agents, 5,124 with WhatsApp). Four message variants are tested simultaneously. All three funnel metrics — replies, clicks, and signups — are tracked in Supabase. A Claude Code skill (`/analyze-outreach`) runs after every 100 sends to rank variants and surface the winner.

---

## 2. Meta WhatsApp Business API — Policy & Setup

### 2.1 Setup Prerequisites (Blocking — Must Complete Before Build)

1. Create/verify Meta Business Manager account
2. Register a dedicated phone number (cannot be a personal number already on WhatsApp)
3. Submit all 4 message variants as approved **Marketing Templates** — approval takes 24–72h and can be rejected
4. Complete Meta Business Verification (~1–3 business days)

### 2.2 Cold Outreach Policy Risk & Anti-Flagging Strategy

The Meta WhatsApp Business API requires opt-in before messaging. The agents in `dubai_agents.html` have not opted in. This is a known policy risk and a deliberate business decision.

**Volume ramp-up schedule** (new accounts start at Tier 1: 1,000/day max — earn higher tiers via quality rating):

| Week | Daily sends | Cumulative |
|---|---|---|
| Week 1 | 50/day | 350 |
| Week 2 | 100/day | 1,050 |
| Week 3 | 200/day | 2,450 |
| Week 4+ | 500/day | ~6,000+ |

Advance to next tier only if quality rating remains **High** or **Medium** in Meta Business Manager. If it drops to **Low**, freeze volume immediately.

**Send timing**
- Send only within Dubai business hours: **9am–6pm GST (UTC+4)**
- Spread sends evenly across the window using randomized delays of **30–90 seconds** between each message (not burst sending)
- Never send on Fridays (low response day in UAE) or public holidays

**Per-message personalization**
- Always include `[First Name]` and `[Agency]` — personalized messages have significantly lower block rates than identical bulk messages
- Each message has a unique `tracking_token` — no two messages are byte-for-byte identical

**Pre-send WhatsApp number validation**
- Before sending, validate each number is an active WhatsApp account using the Meta API's `/contacts` endpoint
- Skip and log non-WhatsApp numbers — sending to non-WA numbers wastes quota and degrades quality score

**Auto-pause thresholds** (enforced in the sending script):
- If **block rate > 2%** in any 100-message cohort → pause campaign, alert operator
- If **delivery failure rate > 10%** → pause and investigate number quality
- If Meta quality rating drops to **Low** → immediate stop, do not resume until rating recovers

**Opt-out handling**
- All messages include "Reply STOP to opt out"
- STOP replies are written to `outreach_optouts` immediately and excluded from all future sends
- Opt-outs are never retried under any circumstances

**Fallback**
If the account is suspended, fall back to manual WhatsApp Business App outreach for warm leads (agents who clicked or replied).

### 2.3 Template Approval Considerations

Variants A1 and A2 use a conversational/question-first opening. These may be flagged during template review for obscuring commercial intent. Submit them with clear product identification in the footer of the template:
> *"— Enlista | AI listing copy for Dubai agents | Reply STOP to opt out"*

If A1/A2 are rejected by Meta, B1/B2 will be the active variants and A/B will become B1 vs. B2 only.

---

## 3. Message Variants

All messages are in English. All include a unique tracked CTA link. Variants are assigned randomly (25% each).

### Category A — Curiosity / Soft Open

**Variant A1 — Problem probe**
> "Hey [First Name], quick question — how long does it take you to write up a listing for Bayut or Property Finder? We built something that gets it done in under 4 minutes, bilingual EN/AR. Genuinely curious if that's a pain point. [link]
>
> — Enlista | AI listing copy for Dubai agents | Reply STOP to opt out"

**Variant A2 — Social proof + curiosity**
> "Hey [First Name], we've been working with a few Dubai agencies on AI-generated listing copy — English and Arabic. Some agents are saving 2+ hours per listing. Not sure if it's relevant to your workflow, but would love to know what you think. [link]
>
> — Enlista | AI listing copy for Dubai agents | Reply STOP to opt out"

### Category B — Direct Trial Offer

**Variant B1 — Specificity-first**
> "Hey [First Name], we're giving Dubai agents a free 7-day trial of Enlista — AI that writes your property listings in English and Arabic in under 4 minutes. 3 listings, no credit card needed. [link]
>
> — Enlista | Reply STOP to opt out"

**Variant B2 — Value-first then offer**
> "Hey [First Name], agents on Enlista publish listings 3x faster with AI-generated EN/AR copy ready for Bayut, Property Finder, and Dubizzle. Free 7-day trial, 3 listings, no card needed. [link]
>
> — Enlista | Reply STOP to opt out"

### Performance Hypothesis
All variants include a CTA so signups are possible across all four. A1 is expected to generate the most replies and strong clicks. B1 is expected to perform well on specificity. The test will confirm which opening approach drives the best full-funnel conversion. Note: at 100 sends per variant the data is directional only, not statistically significant — winner declared at the direction level after 4 cohorts.

---

## 4. System Architecture

### 4.1 Stack
- **Sending:** Meta WhatsApp Business API (free tier)
- **Backend:** Node.js script in existing Next.js repo (`scripts/outreach/`)
- **Database:** Supabase (existing)
- **Tracking:** Unique per-agent tokens via Next.js API route
- **Analysis:** Claude Code skill (`/analyze-outreach`)

### 4.2 Sending Script (`scripts/outreach/send.ts`)
- Reads agent list from parsed `dubai_agents.html` data
- **Normalizes all phone numbers to E.164 format** (`+971XXXXXXXXX`) before any DB write or API call — skips and logs records that cannot be normalized
- Checks `outreach_optouts` table and skips opted-out numbers
- Checks `outreach_sends` for existing phone record — skips duplicates (deduplication guard)
- Assigns variant randomly (25% each) at send time
- Writes record to Supabase `outreach_sends` table **before** sending
- Sends via Meta WA Business API using the approved template for the assigned variant
- Configurable batch size (default: 100/day)
- After each batch of 100, checks total send count and triggers analysis if a new 100-message threshold is crossed

### 4.3 Database Schema

**`outreach_sends`**
```sql
id              uuid primary key default gen_random_uuid()
agent_name      text
agency          text
phone           text unique not null  -- E.164 format, UNIQUE enforces deduplication
variant         text not null  -- 'A1' | 'A2' | 'B1' | 'B2'
tracking_token  text unique not null
sent_at         timestamptz default now()
```

**`outreach_clicks`**
```sql
id              uuid primary key default gen_random_uuid()
tracking_token  text references outreach_sends(tracking_token)
clicked_at      timestamptz default now()
ip              text
```

**`outreach_replies`**
```sql
id              uuid primary key default gen_random_uuid()
send_id         uuid references outreach_sends(id)  -- resolved from phone at webhook time
phone           text not null
reply_text      text
replied_at      timestamptz default now()
```

**`outreach_signups`**
```sql
id              uuid primary key default gen_random_uuid()
tracking_token  text references outreach_sends(tracking_token)
user_id         uuid references auth.users
signed_up_at    timestamptz default now()
```

**`outreach_optouts`**
```sql
id              uuid primary key default gen_random_uuid()
phone           text unique not null
opted_out_at    timestamptz default now()
```

### 4.4 Tracking

| Metric | Mechanism |
|---|---|
| **Clicks** | Unique URL `enlista.ai/go?t=TOKEN` → Next.js API route logs click to `outreach_clicks` → redirects to signup page with token in URL |
| **Replies** | Meta WA inbound webhook → `/api/whatsapp/webhook` → verifies `X-Hub-Signature-256` header using app secret → resolves `send_id` from sender phone → logs to `outreach_replies`. If reply body is "STOP" (case-insensitive), writes to `outreach_optouts` instead |
| **Signups** | TOKEN is set in `localStorage` at click time in the `/go` redirect handler. Signup form reads it from `localStorage` on mount. On account creation, a Supabase Database Webhook (HTTP webhook to `/api/outreach/signup-hook`) writes the token + user_id to `outreach_signups` |

### 4.5 Webhook Security
`/api/whatsapp/webhook` verifies the `X-Hub-Signature-256` HMAC header using the Meta app secret before processing any payload — same pattern as the existing Stripe webhook at `/api/stripe/webhook/route.ts`.

### 4.6 Analysis Skill (`/analyze-outreach`)

**Trigger:** After each batch send completes, the sending script checks `SELECT COUNT(*) FROM outreach_sends`. If the count has crossed a new 100-message boundary since the last analysis run (tracked in a `outreach_meta` key-value table), the analysis runs automatically. Also invokable manually via `/analyze-outreach`.

**`outreach_meta`**
```sql
key   text primary key
value text
-- used for: last_analysis_count
```

**What the skill does:**
1. Queries Supabase for all sends grouped by variant with join counts for clicks, replies, signups
2. Calculates per-variant: reply rate %, click rate %, signup rate %
3. Ranks variants by signup rate (primary), click rate (secondary)
4. Flags current leader, notes if gap is directional only (< 400 total sends)
5. Recommends pausing bottom performer if it has <50% the signup rate of the leader after 200+ sends
6. Outputs formatted report to terminal
7. Saves report to `docs/outreach/reports/YYYY-MM-DD-cohort-N.md`

---

## 5. Site Changes

The following must be updated alongside this build:

1. **Free trial duration:** 14 days → 7 days across all site copy and the auth flow
2. **Listing cap:** 3-listing limit for trial accounts enforced server-side via a Postgres trigger on the `listings` table that raises an exception if `count(*) >= 3` for trial users — not just a UI check
3. **Brand name:** Update `AuthForm.tsx` and all references from "ListingsLaunch" → "Enlista"

---

## 6. Out of Scope
- Direct portal sync (agents copy-paste manually, unchanged)
- Arabic message variants (English only for this campaign)
- Reply automation / chatbot responses
- Paid WhatsApp template approval for marketing messages beyond the trial window

---

## 7. Success Criteria
- System sends to 100+ agents per day without manual intervention
- All 3 metrics tracked with <5% attribution loss
- Phone normalization step produces valid E.164 for >95% of records
- Analysis skill produces a clear variant ranking after each 100-message cohort
- Directional winner identified within first 400 sends (4 cohorts)

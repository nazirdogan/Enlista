# Enlista — Full Campaign Revamp
**Prepared:** 2026-04-14  
**Scope:** Ad account 3177835202244554 — full structural review, ROAS modelling, and revised campaign architecture

---

## 1. Current State Assessment

### What's running (and how it's performing)

| # | Campaign / Ad | Spend | Clicks | CTR | CPC | Trials | CPT | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | Trial Signups — RERA Compliance (Conversion) | ~£85 est. | ~270 | 0.52% | £0.32 | 1 | £97.81 | ⚠️ Keep — fix destination URL |
| 2 | Trial Signups — 720x Faster SMB (Conversion) | ~£13 est. | ~40 | 0.52% | £0.32 | 0 | — | ⚠️ Keep — fix destination URL |
| 3 | IG Traffic — "AED 6,000/Month" | £8.74 | 5 | 0.10% | £1.75 | — | — | 👀 Watch — most LPVs, weak CTR |
| 4 | IG Traffic — "Competitor Had Copy Ready" | £1.08 | 1 | 0.50% | £1.08 | — | — | ✅ Keep — best CTR of traffic ads |
| 5 | IG Traffic — "Two Days to Four Minutes" | £2.26 | 2 | 0.24% | £1.13 | — | — | ❌ Pause — poor CTR, high CPC |
| 6 | IG Traffic — "I'll Write It Tomorrow" | £4.34 | 0 | 0% | — | — | — | ❌ Cut immediately — zero engagement |
| 7 | Enterprise Leads | £0 | — | — | — | — | — | ⏸️ On hold — no delivery |
| 8 | WA Automations — Messages Dubai | £0 | — | — | — | — | — | 🟡 Draft — not live |

**Total spend to date:** £114.23 | **Total trials:** 1 | **Blended CPT:** £114.23

---

## 2. What to Cut Right Now

### ❌ "I'll Write It Tomorrow" — CUT IMMEDIATELY
**Why:** 2,635 impressions, 0 clicks, 0% CTR. The creative is not generating any interest whatsoever. The hook does not resonate. No amount of spend will fix a 0% CTR ad — the creative concept is wrong for the audience.

### ❌ "Two Days to Four Minutes" — PAUSE
**Why:** £1.13 CPC with only 2 clicks from 839 impressions. The CTR (0.24%) is the second-worst in the account. It's spending money on impressions without generating meaningful traffic. With limited budget available, this slot is better used by the new WhatsApp-angle content.

**Budget recovered by cutting both:** ~£6.60 that was being burned per week across dead creatives. Modest, but the bigger value is algorithm efficiency — Meta will stop spreading budget across poor performers.

---

## 3. What to Keep

### ✅ "Competitor Had Copy Ready" — KEEP RUNNING
Best CTR in the traffic campaigns at 0.50%, CPC of £1.08. The competitive framing ("your competitor already has their listing live") appears to resonate. Insufficient spend to make a final call — needs to reach £10+ before pausing. Keep at current budget level.

### ⚠️ "AED 6,000/Month" — WATCH FOR 7 DAYS
Weakest CTR of the survivors (0.10%) but generated the most landing page views (3 LPVs). The discrepancy suggests it may be getting clicks from a different traffic source or device format. Give it another 7 days post-billing fix before deciding.

### ✅ Trial Signups — KEEP, UPDATE DESTINATION
The CPC of £0.32 is genuinely excellent for Dubai real estate targeting — the ad is working at the click level. The 0.3% post-click conversion rate is the problem, not the creative. Both RERA Compliance and 720x Faster ads stay live; the fix is the destination URL (homepage → /auth?tab=signup) and adding Post 3 as a third creative to test.

---

## 4. Revamped Campaign Architecture

### Campaign 1: Trial Signups (Conversions) — REARCHITECTED
**Objective:** Conversions — StartTrial event  
**Daily budget:** £12–15/day (no change from current)  
**Destination URL (all ads):** `enlista.io/auth?tab=signup` ← CHANGE from homepage

| Ad | Status | Notes |
|---|---|---|
| RERA Compliance — Individual Agents | Keep | Fix destination URL |
| 720x Faster — SMB Founders | Keep | Fix destination URL |
| Post 3: "That lead went quiet. Enlista just woke them up." | **ADD NEW** | WhatsApp automation angle — strongest conversion candidate |

**Why Post 3 here:** The cold lead / auto follow-up scenario is specific, relatable, and shows the product outcome in a single frame. The WhatsApp screenshot format mimics native Instagram content (lower resistance than a polished ad). The 73%/0s stat pair closes efficiently. This is the right creative for a direct-response conversion campaign.

---

### Campaign 2: WhatsApp Automation — Traffic/Awareness (NEW)
**Objective:** Traffic — Landing page views  
**Daily budget:** £5–8/day  
**Destination URL:** `enlista.io` homepage (or a dedicated WA automation page if one exists)  
**Audience:** Dubai real estate agents / brokers — interest in WhatsApp, lead generation, CRM

| Ad | Notes |
|---|---|
| Post 2: "Reply within 5 minutes or lose the lead." | Primary creative — MIT credibility, 21x stat, problem-framing |

**Why Post 2 here, not in conversions:** This creative educates and creates urgency around the problem — it's not a direct conversion driver. Its job is to warm cold audiences who don't yet know they're losing leads. Run it as traffic, then retarget those visitors with Post 3 or the Trial Signups campaign. The 60s auto-reply punchline is Enlista's answer; the ad sets up the question.

---

### Campaign 3: Retargeting — HOLD (launch when pixel audience > 500)
**Objective:** Conversions — StartTrial event  
**Audience:** Website custom audience (all visitors, 30 days)  
**Creative:** Post 1: "340 WhatsApp conversations — Enlista handled 312 automatically"

**Why Post 1 here:** Social proof with real numbers lands hardest on people who already know what Enlista does. Cold audiences don't have the brand context to trust "340" — but someone who visited the site last week and didn't sign up does. This is a retargeting creative, not a cold-traffic creative. Don't activate until the pixel audience is large enough (500+).

---

## 5. ROAS Modelling

### Assumptions
> These are estimates based on pixel LTV data (`predicted_ltv: 95 AED` ≈ £20/month), Dubai PropTech SaaS benchmarks, and standard conversion rate modelling. Actual results will vary.

| Assumption | Value |
|---|---|
| Monthly ARPU | £20–£45 (AED 95–210/month) |
| Trial-to-paid conversion rate | 20–30% |
| Average customer retention | 6–9 months |
| LTV per customer (low) | £20 × 6 × 0.22 = **£26** |
| LTV per customer (mid) | £35 × 8 × 0.25 = **£70** |
| LTV per customer (high) | £45 × 9 × 0.28 = **£113** |

---

### Scenario A: Current (broken — homepage destination, no pixel until Apr 12)
| Metric | Value |
|---|---|
| Spend | £97.81 |
| Clicks | 310 |
| Post-click CVR | 0.32% |
| Trials generated | 1 |
| CPT | £97.81 |
| Estimated ROAS (low LTV) | 0.27x |
| Estimated ROAS (mid LTV) | 0.72x |
| Estimated ROAS (high LTV) | 1.16x |

**Summary:** Loss-making across all LTV assumptions. Not because the ads are bad — CPC of £0.32 is strong — but because 99.7% of clicks don't reach a conversion event.

---

### Scenario B: After destination URL fix + Post 3 added (expected)
**Assumption:** Fixing homepage → /auth?tab=signup improves post-click CVR from 0.32% to ~1.0–1.3% (3–4x improvement, consistent with landing page optimisation benchmarks). Post 3 improves CTR from 0.52% to ~0.9–1.1%.

| Metric | Value |
|---|---|
| Projected clicks (improved CTR) | ~480–560 |
| Post-click CVR | ~1.0–1.3% |
| Projected trials | 5–7 |
| Projected CPT | £14–£20 |
| Estimated ROAS (low LTV) | 1.3–1.8x |
| Estimated ROAS (mid LTV) | 3.6–4.9x |
| Estimated ROAS (high LTV) | 5.6–7.9x |

**Summary:** Crosses into profitability at mid-LTV assumptions. CPT of £14–20 is on-target (£15 is the stated target). This scenario is achievable with the destination URL fix alone — the creative improvement is incremental upside.

---

### Scenario C: Full revamp live — all 3 campaigns running (optimistic, 30-day horizon)
**Adds:** Traffic campaign warming the funnel, retargeting campaign converting warmed visitors, agency name friction removed from signup form.

| Metric | Value |
|---|---|
| Daily budget | £22–25/day total across all 3 campaigns |
| Projected monthly trials | 20–35 |
| Projected monthly paid conversions | 4–9 (at 20–25% trial-to-paid) |
| Blended CPT | £21–£37 |
| Monthly revenue (mid LTV × conversions) | £280–£630 |
| Monthly ad spend | £660–£750 |
| ROAS (monthly, immediate) | 0.4–0.8x |
| ROAS (LTV-adjusted, 6-month horizon) | 2.5–5.0x |

**Summary:** The immediate-month ROAS will still look negative — this is normal for a SaaS acquisition funnel where LTV is realised over months, not at signup. The metric to watch is CPT, not immediate ROAS. Target: CPT under £20 within 30 days. At that level, the unit economics work at any reasonable LTV above £40.

---

## 6. Summary: The Revamp in Three Actions

| Priority | Action | Impact |
|---|---|---|
| 🔴 1 | Fix billing. Then fix ALL ad destination URLs to `/auth?tab=signup` | Biggest single lever — fixes 99% of the post-click conversion problem |
| 🔴 2 | Pause "I'll Write It Tomorrow" and "Two Days to Four Minutes". Add Post 3 to Trial Signups campaign | Removes budget waste, adds strongest WhatsApp creative to conversion campaign |
| 🟡 3 | Launch new Traffic campaign with Post 2 (MIT 5-minute rule) at £5–8/day | Warms cold audiences for the conversion campaign, builds retargeting pool |
| ⚪ 4 | Hold Post 1 (340 conversations). Activate as retargeting when pixel audience hits 500+ | Social proof creative — wrong for cold traffic, powerful for warm re-engagement |

---

*All ROAS figures are estimates based on funnel modelling and industry benchmarks. Actual performance depends on audience quality, creative fatigue, and seasonal factors in Dubai real estate.*

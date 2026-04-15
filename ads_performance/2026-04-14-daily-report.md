# Enlista Ads — Daily Performance Report
**Date:** 2026-04-14
**Period assessed:** Last 7 days (7 Apr – 13 Apr 2026)

---

## ⚠️ CRITICAL ALERT: PAYMENT ERROR ON ALL CAMPAIGNS

**All active campaigns are showing "Payment error" status in Meta Ads Manager.** This means ad delivery has stopped across the entire account. No new impressions are being served. This is the most urgent issue and must be resolved before any other optimisations can take effect.

**Action required by Naz:** Log into Meta Ads Manager, go to Settings → Billing, and update or re-confirm the payment method. Once resolved, campaigns should resume automatically.

---

## Summary

All 5 active campaigns are currently halted due to a payment error on the account — delivery has stopped as of sometime in the past 7 days. The performance data below reflects what ran before the payment issue hit. Total spend for the period was **£114.23**, driven almost entirely by the Trial Signups (Conversions) campaign (£97.81). That campaign generated only **1 confirmed trial start** from 310 link clicks, suggesting a significant landing page or conversion tracking problem. Traffic campaigns all show CTR well below the 1.5% target and CPC above £1.00, but most have insufficient spend (under £10) to draw firm conclusions. The immediate priority is fixing the billing issue; strategy review is secondary but warranted.

---

## Campaign Breakdown (Last 7 Days)

| Campaign | Spend | Impressions | Reach | CTR | CPC | Link Clicks | Results | CPR | Frequency | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Enlista — Trial Signups (Conversions) | £97.81 | 59,475 | 41,252 | 0.52% | £0.32 | 310 | 1 trial start | £97.81 | 1.44 | ⛔ Payment error |
| Enlista — IG \| "AED 6,000/Month" (Traffic) | £8.74 | 5,198 | 3,702 | 0.10% | £1.75 | 5 | 3 LPVs | £2.91 | 1.40 | ⛔ Payment error |
| Enlista — IG \| "I'll Write It Tomorrow" (Traffic) | £4.34 | 2,635 | 2,137 | 0% | — | 0 | 0 | — | 1.23 | ⛔ Payment error |
| Enlista — IG \| "Two Days to Four Minutes" (Traffic) | £2.26 | 839 | 823 | 0.24% | £1.13 | 2 | 1 LPV | £2.26 | 1.02 | ⛔ Payment error |
| Enlista — IG \| "Competitor Had Copy Ready" (Traffic) | £1.08 | 199 | 174 | 0.50% | £1.08 | 1 | 1 LPV | £1.08 | 1.14 | ⛔ Payment error |
| Enlista — Enterprise Leads | £0 | — | — | — | — | — | — | — | — | ⛔ Payment error |
| Enlista — WA Automations \| Messages (Dubai) | £0 | — | — | — | — | — | — | — | — | 🟡 In draft |
| **TOTAL** | **£114.23** | **68,346** | ~46,285 | **0.47%** | £0.36 | **318** | — | — | 1.48 | — |

*LPV = Landing page view. Frequency thresholds (>3.0) not breached on any campaign.*

---

## Campaign Classification

| Campaign | Classification | Reason |
|---|---|---|
| Trial Signups (Conversions) | **UNDERPERFORMING** | CPR £97.81 vs £15 target; 1 conversion from 310 clicks (0.3% LPR) |
| AED 6,000/Month (Traffic) | **FLAT — Insufficient data** | £8.74 spent; CTR 0.10% (weak), CPC £1.75 (high) |
| I'll Write It Tomorrow (Traffic) | **UNDERPERFORMING — Insufficient data** | £4.34 spent; 0 clicks, 0% CTR |
| Two Days to Four Minutes (Traffic) | **UNDERPERFORMING — Insufficient data** | £2.26 spent; CTR 0.24%, CPC £1.13 |
| Competitor Had Copy Ready (Traffic) | **FLAT — Insufficient data** | £1.08 spent; CTR 0.50% (borderline), CPC £1.08 |

---

## Actions Taken Today

- **No budget or on/off changes made.** All campaigns are in payment error state — budget adjustments have no effect while delivery is halted. Changes are deferred until the billing issue is resolved.
- Payment error flagged as critical alert (see below).

---

## Alerts

1. 🚨 **CRITICAL — Payment Error on all active campaigns.** Meta has halted delivery across the account. All 5 active campaigns show "Payment error" in the Delivery column. Naz must fix the billing issue immediately in Meta Ads Manager → Settings → Billing.

2. ⚠️ **Very high CPR on Trial Signups.** £97.81 per trial start from 310 link clicks suggests either (a) the conversion pixel / "website start trial" event is not firing correctly, or (b) the landing page is converting at under 1% from click. Worth checking pixel health in Meta Events Manager.

3. ⚠️ **"I'll Write It Tomorrow" generated zero clicks** from 2,635 impressions. CPM is competitive (£1.65) but the creative is not driving any action — lowest performer among traffic campaigns.

4. ℹ️ **"AED 6,000/Month" had the most landing page views** (3 LPVs, £2.91 each) with the most impressions among traffic campaigns — worth watching once billing is resolved.

---

## Recommendation

**🚨 Fix the payment error first.** No strategy changes matter until delivery is restored.

Once billing is resolved, do NOT immediately scale or make major changes — let campaigns run for 3–5 more days to rebuild the learning phase data that was interrupted.

After a few days of clean data:
- If Trial Signups still shows CPR > £25: pause and investigate pixel + landing page
- If "AED 6,000/Month" continues to outperform other traffic campaigns on LPVs: increase its ad set budget by 20–30%
- If "I'll Write It Tomorrow" still has 0% CTR after £10+ spend: pause it
- Monitor all traffic campaigns until they hit £10+ spend before making pause decisions

---

## Strategy Rethink

*Triggered: Total spend > £50 with no campaign meeting performance targets.*

The account has spent £114.23 across 7 days with only 1 confirmed trial start. Even accounting for the payment error cutting delivery short, there are structural concerns worth addressing:

**1. Revised audience targeting approach**
- Narrow Trial Signups audience to RERA-licensed agents specifically (smaller but higher-intent pool)
- Test a lookalike audience built from existing Enlista email list / user base
- Consider excluding people who already visited the site but didn't sign up, then retarget them separately with a lower-friction offer

**2. New creative angle to test**
- All current traffic creatives lead with cost/time features ("4 minutes", "AED 6,000/month") — test a **social proof** angle instead: show a real broker testimonial or a side-by-side before/after of AI-generated vs manual listing copy
- The "Competitor Had Copy Ready" creative had the best CTR (0.50%) — its competitive framing may be resonating; explore variants of this angle

**3. Revised offer / CTA**
- "Start free trial" may be too high a commitment for cold traffic — test a lower-friction CTA: **"See an example listing" → email capture → nurture to trial**
- Consider offering first listing written free (reduces perceived risk vs open-ended trial)

**4. Budget allocation**
- Currently almost all spend (£97.81 of £114.23) is going to the conversion objective campaign
- Recommend shifting 30% of budget to traffic campaigns with the best CTR once billing is resolved, to build more top-of-funnel data before pushing conversion hard
- The Trial Signups CPC (£0.32) is actually very good — the problem is post-click conversion, not ad engagement

---

*Report generated automatically by Cowork scheduled task. Next review: 2026-04-15 9am.*

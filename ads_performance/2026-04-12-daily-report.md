# Enlista Ads — Daily Performance Report
**Date:** 2026-04-12 (Sunday)
**Period assessed:** Last 7 days (5 Apr – 11 Apr 2026)
**Account:** Nazir Dogan (3177835202244554)

---

## Summary

The Trial Signups (Conversions) campaign has reached approximately 28,500 unique people across its two active ad sets in the past 7 days but has recorded **zero website start trials** — the primary KPI. All four traffic campaigns are delivering at a very small scale (30–909 reach each), and the Amount Spent metric shows "—" across every campaign in Meta's reporting view, indicating either negligible actual spend or a data display issue that needs investigation. No campaign meets the PERFORMING threshold; all are classified as FLAT or UNDERPERFORMING with insufficient spend data to make confident budget reallocations today.

---

## Campaign Breakdown

| Campaign | Reach | Freq | Impressions | CTR | Link Clicks | CPC | Results | CPR | Budget/day | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Trial Signups (Conversions) | 28,545 | 1.22 | — | — | — | — | 0 trials | — | £50 (2×£25) | 🔴 UNDERPERFORMING |
| IG \| "AED 6,000/Month" (Traffic) | 909 | 1.15 | — | — | — | — | 1 LPV | £1.68 | £11 | 🟡 FLAT |
| IG \| "Two Days to Four Minutes" (Traffic) | 361 | 1.01 | — | — | — | — | 0 | — | £11 | 🟡 FLAT (insufficient data) |
| IG \| "I'll Write It Tomorrow" (Traffic) | 395 | 1.11 | — | — | — | — | 0 | — | £11 | 🟡 FLAT (insufficient data) |
| IG \| "Competitor Had Copy Ready" (Traffic) | 30 | 1.00 | — | — | — | — | 0 | — | £11 | 🟡 FLAT (insufficient data) |
| Enterprise Leads | — | — | — | — | — | — | — | — | £25 | ⚪ No ads / Draft |

> **Note on missing metrics:** Meta's Ads Manager is displaying "—" for Amount Spent, Impressions, CPM, Link Clicks, CTR, and CPC across all campaigns in the 7-day view. Reach and Frequency are populating correctly. This discrepancy suggests either (a) the campaigns have very low actual spend below Meta's display threshold, (b) the campaigns were recently launched with minimal delivery so far, or (c) a reporting display issue. This should be verified directly in the Billing & Payments section.

---

## Ad-Level Breakdown (Active Ads)

| Ad | Campaign | Reach | Freq | Results | Status |
|---|---|---|---|---|---|
| 720x Faster — SMB Founders — V1 — Copy | Trial Signups | 7,908 | 1.14 | 0 trials | Active |
| RERA Compliance — Individual Agents — V1 — Copy | Trial Signups | 7,170 | 1.08 | 0 trials | Active |
| Post 22 — "Two Days to Four Minutes" | IG Traffic | 361 | 1.01 | 0 LPVs | Active |
| Post 09 — "I'll Write It Tomorrow" (AED 6,000/Month ad set) | IG Traffic | 909 | 1.15 | 1 LPV | Active |
| Post 09 — "I'll Write It Tomorrow" (duplicate ad set) | IG Traffic | 395 | 1.11 | 0 LPVs | Active |
| Post 06 — "Competitor Had Copy Ready" | IG Traffic | 30 | 1.00 | 0 LPVs | Active |
| 720x Faster — SMB Founders — V1 (original) | Trial Signups | 7,977 | 1.29 | — | **OFF** |
| RERA Compliance — Individual Agents — V1 (original) | Trial Signups | 5,885 | 1.34 | — | **OFF** |

---

## Actions Taken Today

- **No budget changes made.** Amount Spent is not displaying for any campaign, making it impossible to confirm how much has been spent in this window. Reallocating budget without confirmed spend data risks misallocating funds.
- All active campaigns left running at current budgets.
- "Competitor Had Copy Ready" flagged for review — only 30 people reached in 7 days on an £11/day budget indicates severe under-delivery or audience overlap issues.

---

## Alerts

1. 🚨 **ZERO trial sign-ups from Trial Signups campaign** — 28,545 unique people reached, 0 website start trials recorded. Either conversion tracking (pixel) is broken, the landing page is not converting, or the audience is not qualified. This needs immediate investigation before spending continues at £50/day.

2. ⚠️ **Amount Spent, Impressions, CTR all showing "—"** for every campaign — this is an unusual reporting state. Check Billing & Payments to confirm the account is active and spending normally.

3. ⚠️ **"Review and publish (3)" notification active** — there are 3 pending changes in draft state awaiting review and publication. Review at your earliest opportunity.

4. ⚠️ **"Competitor Had Copy Ready" severely under-delivering** — only 30 reach in 7 days on £11/day budget. This is likely due to audience overlap with the other three traffic campaigns that all target the same "IG Feed + Stories + Reels | UAE Brokers | Static" ad set. 

5. ℹ️ **Two ads turned Off in Trial Signups campaign** — "720x Faster — SMB Founders — V1" and "RERA Compliance — Individual Agents — V1" are both Off; replaced by "Copy" versions. The Off versions had higher frequency (1.29 and 1.34), suggesting they may have been paused due to audience fatigue.

6. ℹ️ **"Post 09 — I'll Write It Tomorrow" appears in two different ad sets** — same creative is running in both the "AED 6,000/Month" campaign ad set (909 reach) and a separate ad set (395 reach). This duplication may cause internal audience overlap.

---

## Recommendation

**⚠️ INVESTIGATE BEFORE SPENDING MORE — DO NOT SCALE.**

Before making any budget or creative changes, two things must be confirmed:

1. **Check the Meta Pixel / conversion event** — Log into Events Manager and verify that the "Website Start Trial" event is firing correctly on the Enlista sign-up flow. With 28,545 people reached and 0 conversions, the most likely explanation is broken conversion tracking rather than zero intent from the audience.

2. **Check Billing & Payments** — Confirm the account is spending normally. The "—" values for Amount Spent across all campaigns is unusual and may indicate a billing hold or payment method issue.

Once these two items are confirmed, revisit the strategy rethink below.

---

## Strategy Rethink (Triggered: 0 conversions on primary campaign)

The Trial Signups campaign has reached enough people (28K+) to generate conversions if the product/audience fit exists, but has recorded none. This is not a "give it more time" situation — it requires a structural review.

### 1. Revised Audience Targeting

- **Verify current audience definition** — confirm both ad sets (SMB Founders, Individual Agents) are targeting RERA-licensed or actively practicing UAE real estate agents, not a broad interest-based audience.
- **Narrow to higher-intent signals**: target people with job titles containing "Real Estate Agent", "Property Consultant", "RERA Agent" and who live in Dubai/UAE.
- **Test a lookalike audience** from any existing user email list (even 50–100 signups is enough to seed a 1% LAL in UAE).
- **Consider adding behavioral targeting**: people who have engaged with real estate property listing pages or used real estate SaaS tools.

### 2. New Creative Angle to Test

Current ads test: "RERA Compliance" angle (Individual Agents) and "720x Faster" angle (SMB Founders). Both are benefit-led copy. Test a new format:

- **Social proof/testimonial format**: "I listed my JBR apartment in 4 minutes" — first-person testimonial from a Dubai broker
- **Before/after listing copy example**: Show a badly-written listing vs. Enlista's output side by side
- **Pain-point led**: "Spending 30 minutes writing each listing description? There's a tool for that." — simpler, more direct

### 3. Revised Offer / CTA

- Current CTA: "Start free trial" — this requires commitment. Test lower-friction offers:
  - **"Write your first listing free — no credit card"** — removes barrier
  - **"See what Enlista writes for your listing in 60 seconds"** — curiosity-led, interactive
  - **"Get 3 free listings written this week"** — quantity-limited offer creates urgency

### 4. Budget Strategy Recommendation

- **Pause all 4 traffic campaigns temporarily** if pixel issue is confirmed (they are testing creative for a broken funnel — wasteful until tracking is fixed)
- **Reduce Trial Signups to £10/day total** (£5/ad set) while investigating pixel
- Once pixel is confirmed working, scale the best-performing creative by 20-30% increments
- Consider switching one traffic campaign to **conversion objective** once the pixel is verified firing correctly

---

*Report generated by automated daily ads review — 2026-04-12*

---

## Investigation: Why Zero Conversions on Trial Signups Campaign

*Investigation completed: 2026-04-12*

### Verdict: Root Cause Confirmed — Meta Pixel Has Never Been Installed on the Enlista Website

The investigation into 28,545 reach and 0 conversions is resolved. This is not an audience problem, a creative problem, or a budget problem. **The Meta pixel has never been connected to the Enlista website**, making it physically impossible for Meta to record a single conversion, regardless of how many people clicked the ad and signed up.

---

### Evidence

**Pixel: "DGN Inspires" (ID: 245641816864695)**

| Field | Value |
|---|---|
| Created | 27 May 2020 |
| Last activity | **Never — "No activity received in the last 2,136 days"** |
| Websites connected | **0 — "No websites found"** |
| Integrations | **None** |
| Track events automatically | Off |
| Conversions API | Not set up |

The pixel was created in May 2020 (likely when the ad account was first opened) and has sat completely dormant ever since. It has never been placed on any website — not on enlista.io, not anywhere. The "Website Start Trial" event the campaign is optimising towards has fired exactly zero times in the entire history of this account.

This is confirmed at three levels:
1. **Overview tab** — "No activity was received in the selected time frame" (15 Mar – 11 Apr 2026)
2. **Overview tab** — table heading reads: "No activity has been received in the last 2,136 days"
3. **Settings tab** — "0 websites" and "No integrations" listed

The 30-day pattern of zero conversions (confirmed earlier: 15,474 reach on SMB Founders ad set, 13,071 on Individual Agents ad set — 0 conversions across the full campaign lifetime) is entirely explained by this single fact.

---

### What This Means in Practice

When someone sees the Enlista ad, clicks through, lands on the website, and starts a free trial, **that action is invisible to Meta**. The pixel isn't there to fire the `StartTrial` event. Meta's algorithm receives no feedback signal, so it cannot learn who converts, cannot optimise delivery towards likely converters, and reports 0 results — not because nobody converted, but because nobody was counted.

Every pound spent on the Trial Signups campaign since launch has been spent optimising for an event that the platform cannot see. The campaign is running as a de facto awareness campaign while paying conversion-objective CPMs.

---

### What Needs to Happen — Priority Order

**Step 1 — Immediately: Pause or reduce Trial Signups campaign spend**

There is no value in spending £50/day on a conversion campaign with no pixel. Reduce to £0 or to a minimal holding budget (e.g., £5/day total) until the pixel is live and verified.

**Step 2 — Install the pixel on the Enlista website**

The pixel ID to install is **245641816864695**. This needs to be placed in the `<head>` of every page on the Enlista site (enlista.io or equivalent). Options:
- If the site uses a tag manager (GTM, Segment): add the pixel via the tag manager — no code deploy needed
- If it's a custom-built site: add the base pixel code directly to the HTML `<head>`
- If it uses Shopify, WordPress, Webflow, or similar: use the native Meta pixel integration in the platform settings

**Step 3 — Set up the conversion event**

Once the base pixel fires on page load, you need the `StartTrial` (or equivalent) event to fire on the specific action — when a user completes the trial sign-up form. This requires either:
- Using Meta's **Event Setup Tool** (no-code, can click through the sign-up flow and tag the button) — accessible directly from Events Manager → Open Event Setup Tool
- Or adding the event code manually: `fbq('track', 'StartTrial');` on the page/confirmation that appears after sign-up

**Step 4 — Verify the pixel is firing**

Use the **Test Events** tab in Events Manager (the tab is available in the DGN Inspires pixel page). Navigate through the sign-up flow on the Enlista site while the Test Events tab is open — you should see events appear in real time within seconds.

Also install the **Meta Pixel Helper** Chrome extension to confirm the pixel fires on page load.

**Step 5 — Reactivate the campaign**

Once the pixel is verified firing and the conversion event is confirmed working:
- Restore Trial Signups budget to £50/day (or higher, now that Meta has a signal to optimise)
- Give the campaign a learning phase of approximately 50 conversion events before evaluating performance
- Only after consistent conversions are recording should creative, audience, or budget decisions be made

---

### Secondary Items to Review (After Pixel is Fixed)

These items were not the root cause of zero conversions but should be reviewed once the pixel is live:

**Landing page URL** — Confirm the ads are pointing to the correct trial sign-up page and that the page loads correctly on mobile (most Meta traffic is mobile). The destination URL in the active ads could not be extracted today due to a UI rendering issue, but should be verified in the ad edit panel.

**Audience targeting** — Both ad sets (SMB Founders, Individual Agents) should be confirmed as targeting RERA-licensed UAE real estate agents by job title and location, not broad interest-based audiences. Once conversions start recording, Meta will build lookalike signals from actual converters — this is more powerful than any manual targeting.

**Creative performance** — The current "RERA Compliance" and "720x Faster" angles cannot be properly evaluated until the pixel is working. After 50+ conversions record, review which ad set and creative is producing the lowest cost per trial, then scale that one.

---

### Revised Budget Recommendation (Supersedes Earlier Recommendation)

| Campaign | Previous recommendation | Revised recommendation |
|---|---|---|
| Trial Signups (Conversions) | Reduce to £10/day while investigating | **Pause immediately (£0/day)** until pixel is live |
| IG Traffic campaigns (×4) | Pause if pixel confirmed broken | **Pause all four** — they are warming audiences for a broken funnel |
| Enterprise Leads | No change | No change — still in draft |

Resume all campaigns after Step 4 (pixel verified firing) is complete.

---

*Investigation completed by automated ads review — 2026-04-12*

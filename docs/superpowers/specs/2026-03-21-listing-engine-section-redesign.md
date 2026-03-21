# Listing Engine Section Redesign

**Date:** 2026-03-21
**Status:** Approved

## Context

The landing page currently has a "Platform" section with the heading "Six modules. One subscription." and a bento grid showing six feature cards: AI Listing Copy Engine, Portal Sync, Lead Intelligence, RERA Compliance, Market Analytics, and Photo Suite. The majority of these features do not exist. The only live product is the AI listing copy engine — a tool that lets agents speak or fill in a form, then generates bilingual EN/AR property listing copy which they copy-paste into portals.

The section needs to be replaced with one that accurately represents the product, clearly explains what it does, and communicates ease of use.

## Goal

Replace the six-module bento grid with a focused section that:
- Shows exactly how the product works in three steps
- Communicates speed (30 seconds), ease (speak or fill a form), and quality (bilingual, portal-optimised, copy that sells)
- Includes a sample output card to prove the quality of the generated copy

## Design

### Section Header

- **Label (small caps, blue):** `How It Works`
- **Headline:** "A complete listing in 30 seconds. Bilingual. Built to sell."
- **Subline (muted):** "Speak or fill in the details — the AI handles the rest."

### 3-Step Flow

Three cards in a horizontal row on desktop, stacked vertically on mobile. Between each card on desktop: a `→` character in `c.muted` (#64748B), centered vertically. On mobile the connector is hidden — vertical spacing between stacked cards is sufficient.

Each card uses the existing `BentoCard` component (white background, `1px solid #DDE3EC` border, standard border radius). No accent colour variants — all three cards are plain white. The step number is rendered as a large (36px), lightweight (300 weight) numeral in `c.blue` (#1D4ED8), displayed above the card title.

**Step 1 — Speak or fill in the details**
Use your voice or a short form. Property type, size, key features — say it or type it.

**Step 2 — AI writes your listing**
Bilingual EN/AR copy generated in seconds. Optimised for Bayut, Property Finder, and Dubizzle.

**Step 3 — Copy and paste**
Done. Paste straight into any portal. No editing, no reformatting.

### Sample Output Card

Below the three-step flow: a single full-width `BentoCard` (white background, standard border) showing a realistic listing output. The card has a small label at the top: `Sample output — 2BR, Downtown Dubai` in small caps muted text.

The card body is split into two columns on desktop (left: English, right: Arabic), separated by a `1px solid #DDE3EC` vertical divider. On mobile, the columns stack with Arabic below English, and the divider becomes horizontal.

The Arabic column container must have `dir="rtl"` applied so the existing `[dir="rtl"]` CSS rule in `globals.css` (~line 45) activates correctly. That rule sets `font-family: "Plus Jakarta Sans", "Noto Naskh Arabic", sans-serif` — Noto Naskh Arabic is included as a fallback for Arabic glyphs. Arabic text should be `text-align: right`.

**English copy (left column):**

> Nestled in the heart of Downtown Dubai, this well-appointed 2-bedroom apartment offers sweeping views of the iconic Burj Khalifa skyline. Spanning 1,150 sq ft across a smart open-plan layout, the residence features floor-to-ceiling windows, a fully fitted kitchen, and two generously sized en-suite bedrooms. Residents enjoy access to a rooftop infinity pool, a state-of-the-art gymnasium, and 24-hour concierge service — all just steps from Dubai Mall and the Dubai Fountain.

**Arabic copy (right column, dir="rtl"):**

> تقع هذه الشقة المكوّنة من غرفتَي نوم في قلب وسط مدينة دبي، وتوفّر إطلالات خلّابة على أفق برج خليفة الشهير. تمتد الشقة على مساحة 1,150 قدم مربع بتصميم مفتوح ذكي، وتتميّز بنوافذ تمتد من الأرض إلى السقف، ومطبخ مجهّز بالكامل، وغرفتَي نوم واسعتَين مع حمّامَين ملحقَين. يتمتع السكان بالوصول إلى مسبح لا نهاية له على السطح، وصالة رياضية متكاملة، وخدمة كونسيرج على مدار الساعة — على بعد خطوات من دبي مول ونافورة دبي.

### Section Background

The section keeps the inherited `c.bg` (#F2F4F7) background (no explicit background set, same as current). The white `BentoCard` step cards and output card float naturally against this background without needing extra borders.

## Navigation

Three places in `app/page.tsx` reference the section with stale labels that must be updated:

1. Desktop nav menu (~line 179): `"Platform"` → `"How It Works"`
2. Mobile nav menu (~line 258): `"Platform"` → `"How It Works"`
3. Hero secondary CTA button (~line 396): label `"See the platform"` → `"See how it works"` (the `href="#features"` anchor is unchanged)

The `id="features"` on the section itself does not change.

## Scope

This change affects:
1. `app/page.tsx` — the `id="features"` section and the two nav menu entries ("Platform" → "How It Works")
2. `app/globals.css` — remove the three now-dead CSS classes: `.features-bento`, `.features-bento-wide`, and `.features-bento-tall` (lines ~56–68)

No other sections, components, or files are in scope.

## What to Remove

- The entire bento grid (6 cards)
- "Six modules. One subscription." heading
- "Platform" section label and nav label
- All references to: Portal Sync, Lead Intelligence, RERA Compliance, Market Analytics, Photo Suite
- Dead CSS classes: `.features-bento`, `.features-bento-wide`, `.features-bento-tall`

# Hero Section Redesign — Design Spec
**Date:** 2026-04-07  
**File:** `app/page.tsx`

---

## Summary

Rework the landing page hero section to showcase both core product features — voice-to-listing copy generation and WhatsApp lead automation — without using the word "AI". Replace the existing bento-grid graphic with a tabbed card. Rewrite all copy to be outcome-focused and agent-centric.

---

## Left Column — Copy

### Pill
```
For UAE property agents
```
Style: uppercase, small, blue on pale blue background (`#EFF6FF` / `#1D4ED8`), pill shape.

### Headline
```
Less typing.
More viewings.
More closings.
```
- Three lines, large (`clamp(36px, 5vw, 60px)`), `font-weight: 800`
- First two lines: dark (`#0F1829`)
- Third line: blue (`#1D4ED8`)
- No use of "AI" anywhere in the hero

### Subtitle
```
Describe a property and get a ready-to-publish listing in English 
and Arabic. Set up a WhatsApp flow once and every new enquiry gets 
handled — even at 2am.
```
- `font-size: 16px`, `color: #64748B`, `line-height: 1.8`, `max-width: 440px`

### CTAs
- Primary: **Start free trial** → `/auth?tab=signup` (blue button)
- Secondary: **Login** → `/auth` (outlined button)

### Trust signals
```
✓ No credit card required  ·  ✓ Setup in 5 minutes  ·  ✓ RERA compliant
```
- Small, muted, below CTAs

---

## Right Column — Tabbed Card Graphic

A single white card with a two-tab strip at the top. The panel area has a **fixed height** so the card does not resize when switching tabs. Height is set to match the taller WhatsApp tab.

### Tab strip
| Tab | Icon | Active state |
|-----|------|-------------|
| Listing copy | 🎙️ | Blue text + 2px blue bottom border |
| WhatsApp bot | 💬 | Muted text, no border |

Both panels use `position: absolute; inset: 0` inside a fixed-height relative container so height never changes on tab switch.

---

### Tab 1 — Listing copy

**Section 1: "You said" input box**
- Dashed border, rounded, light background
- Label: `🎙 YOU SAID` (small caps, muted)
- Content (italic, muted): `"3 bed in downtown, has a burj view, private gym, good finishes, asking 4.2 mill, vacant now"`

**Section 2: Transform divider**
- Horizontal rule with centred label: `✦ listing written in 8s`
- Blue text, `font-weight: 600`

**Section 3: Dark copy block** (`background: #0F1829`, fills remaining height)
- Top row: `listing_copy.txt` label (muted monospace) + `EN + AR ✓` (muted, right-aligned)
- Body: generated listing copy in monospace, light on dark:
  > "Exceptional 3-bedroom apartment in Downtown Dubai with sweeping Burj Khalifa views, a private gym, and premium finishes throughout. Vacant and ready for immediate handover. AED 4.2M."
- Bottom section (separated by faint rule): three platform readiness rows:

| Row | Left label | Centre label | Right badge |
|-----|-----------|--------------|-------------|
| 🏠 Portals | Bayut · Property Finder · Dubizzle (blue pills) | — | Ready ✓ (green) |
| 📸 Instagram | — | Caption + hashtags | Ready ✓ (green) |
| 💬 WhatsApp | — | Broadcast message | Ready ✓ (green) |

---

### Tab 2 — WhatsApp bot

**Header row:** `New enquiry · Ahmed K. · just now` + `< 2 min · 24/7` (green badge, right)

**Conversation thread:**
1. Lead (right, green bubble): `"Hi, I'm interested in the Downtown 3BR listing"`
2. Bot (left, grey bubble, WhatsApp avatar): `"Hi Ahmed! Great choice. Are you looking to buy or rent? I can arrange a viewing for today or tomorrow. 🏠"`
3. Lead (right): `"Buy. Can we do tomorrow at 5pm?"`
4. Bot (left): `"Perfect, booked you in for tomorrow at 5pm. The agent will confirm shortly. ✅"`

**Stats row (3 columns):**
| Stat | Value | Colour |
|------|-------|--------|
| Reply rate | 98% | Green |
| Avg response | <2m | Blue |
| Always on | 24/7 | Dark |

---

## What to Remove

- The existing `mobileMenuOpen` state (moved to `PublicNav`)
- The existing bento-grid hero graphic (stats row, bar chart, portal status card, AI copy card)
- The existing headline: *"Listing management that actually moves the needle."*
- The existing subtitle mentioning "AI-powered listing copy, multi-portal sync, lead scoring"

---

## What Stays Unchanged

- Everything below the hero section (`#features`, testimonials, pricing, FAQ, footer)
- All existing colour tokens (`c.blue`, `c.dark`, `c.muted`, etc.)
- The `PublicNav` component at the top
- CTA href values

---

## Implementation Notes

- The tabbed card must be a client component (`useState` for active tab)
- Fixed panel height: set empirically to fit the WhatsApp tab at all common viewport widths — approximately `370px` at desktop
- On mobile (`< md`), the two-column grid collapses to single column; the card stacks below the copy
- No "AI" in any visible text across the hero

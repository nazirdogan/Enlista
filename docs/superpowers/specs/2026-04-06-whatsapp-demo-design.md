# WhatsApp Automation Interactive Demo — Design Spec

**Date:** 2026-04-06  
**Status:** Approved

---

## Overview

Two shareable demo pages that let a prospect experience the WhatsApp qualification bot as if they were a real lead. No sales rep needed — the prospect types their own replies and the bot responds in real time. Both pages link to `/contact-sales` at the end.

---

## Pages

### Page A — `/demo/whatsapp`

**Purpose:** Clean, focused demo. Prospect lands, reads one line of context, and immediately starts chatting.

**Layout:**
- Light `#F2F4F7` background matching the existing site
- Centered phone mockup (260px wide, portrait, rounded corners, dark bezel)
- Above the phone: small "● Live Demo" badge + one-line prompt: *"You just enquired about a 2BR in Dubai Marina. The bot is already responding."*
- Below the phone: progress indicator (dots or "Question X of 5")
- Restart button appears after the conversation ends

**Phone UI (authentic WhatsApp):**
- Dark teal header (`#128C7E`) with bot avatar (WA icon) + "Enlista Bot · online"
- Chat area background: `#ECE5DD` (WhatsApp wallpaper beige)
- Bot messages: white left-aligned bubbles with `2px 10px 10px 10px` border-radius
- Prospect replies: `#DCF8C6` green right-aligned bubbles
- Timestamps + double-tick (✓✓) on every message
- Typing indicator (animated 3-dot pulse) appears before each bot reply, lasts 1.5–2s

**Input:**
- Fixed at the bottom of the phone frame
- Free-text input (prospect types anything) OR numbered shortcuts (1, 2, 3)
- Send button (green circle with arrow icon)
- Enter key also submits

---

### Page C — `/demo/whatsapp-story`

**Purpose:** Narrative experience with a beginning, middle, and end. Better for cold prospects who need more context.

**Act 1 — The Scene (full-screen dark intro):**
- Dark background (`#0F1829`)
- Property image placeholder (blurred/stylized Dubai Marina photo or gradient)
- Headline: *"You just enquired about a property in Dubai Marina."*
- Subtext: *"Normally, you'd wait hours for a callback. Not anymore."*
- CTA button: "See what happens next →" → transitions to Act 2

**Act 2 — Live Chat:**
- Identical phone mockup and conversation engine as Page A
- Same typing UX, same 5 questions, same bot script
- Progress bar or step indicator visible above/below phone
- When the 5th answer is submitted → auto-transitions to Act 3 after a 2s "scoring" animation

**Act 3 — The Reveal (full-screen dark):**
- Headline: *"Here's what your agent just received."*
- Animated card slides in: the WhatsApp notification mock
  - "🔥 HOT Lead — Enlista"
  - Property, Lead name (pulled from any name they typed or defaulted to "You"), Budget, Timeline, Financing, Score
  - Lead score: large animated number counting up to the score (e.g. 88/100) with HOT/WARM/COLD badge
- Second card slides in (1s later): viewing booking confirmation
  - "📅 Viewing booked: Mon 7 Apr — 10:00 AM"
- Final CTA: "Want this for your agency?" → `/contact-sales`
- Restart link below CTA

---

## Shared Conversation Engine

Both pages use the same decision tree. The bot sends 5 questions sequentially. Answers are matched by keyword or number (fuzzy — "cash", "cash buyer", "1" all map to Cash).

| # | Bot Message | Answer Options | Scoring |
|---|-------------|----------------|---------|
| 1 | Budget? (1. Below AED 1.9M · 2. AED 1.9–2.2M · 3. Above 2.2M) | 1/2/3 or free text | In-range = +30 |
| 2 | Timeline? (1. <1 month · 2. 1–3 months · 3. 3–6 months · 4. Just exploring) | 1/2/3/4 | <3 months = +20 |
| 3 | Cash buyer or mortgage? | cash/mortgage | Cash = +20, Mortgage = +10 |
| 4 | Personal use, investment, or holiday home? | personal/investment/holiday | Any = +15 |
| 5 | Are you a UAE resident? | yes/no | Yes = +3 |

**Score bands:**
- 68–100 → 🔥 HOT
- 40–67 → 🌡️ WARM  
- 0–39 → ❄️ COLD

**Bot reply copy** for each question is pre-written (see existing `/whatsapp-automation` page). The bot's closing message after Q5:

> *"Thanks! 🎯 Based on your answers, you look like a great fit. Ahmed will be in touch within 30 minutes. Would you like to book a viewing now? Reply BOOK to pick a slot."*

If prospect types BOOK → bot sends viewing slot options (3 hardcoded slots). Picking a slot closes the conversation with a confirmation.

---

## Technical

**Routes:**
- `app/(public)/demo/whatsapp/page.tsx` — Page A
- `app/(public)/demo/whatsapp-story/page.tsx` — Page C

**Shared logic:**
- `lib/demo/whatsapp-conversation.ts` — conversation state machine (questions, answer matching, scoring)
- No backend required — all state is local React (`useState`)

**Font:** Plus Jakarta Sans (already imported in the existing whatsapp-automation page)

**No auth required** — these are public pages

**`.gitignore`:** Add `.superpowers/` if not already present

---

## Out of Scope

- Real WhatsApp API integration (this is demo-only)
- Saving prospect responses anywhere
- Customisable property details per demo session
- Mobile-specific layout optimisation (desktop-first, but must not break on mobile)

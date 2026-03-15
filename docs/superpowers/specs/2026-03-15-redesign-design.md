# Site Redesign — Sidebar SaaS (Option 3)

**Date:** 2026-03-15
**Scope:** All app pages — dashboard, auth, and all sub-routes
**Goal:** Replace the current parchment/copper/Cormorant aesthetic with the landing page's design system across every page of the app.

---

## 1. Design Tokens

Replace all existing Tailwind custom colors and fonts with the landing page system.

### Colors

| Token | Value | Usage |
|---|---|---|
| `bg` | `#F2F4F7` | App background |
| `white` | `#FFFFFF` | Cards, surfaces |
| `dark` | `#0F1829` | Sidebar, dark cards |
| `blue` | `#1D4ED8` | Primary CTA, active nav, links |
| `blueLight` | `#3B82F6` | Chart fills, secondary accents |
| `bluePale` | `#EFF6FF` | Highlight backgrounds |
| `text` | `#1E293B` | Body text |
| `muted` | `#64748B` | Secondary text, labels |
| `border` | `#DDE3EC` | Card borders, dividers |
| `green` | `#059669` | Published status, success |
| `amber` | `#D97706` | Warning, hot leads |

### Typography

- **Body / UI:** Plus Jakarta Sans, weights 300–800
- **Monospace:** JetBrains Mono (stats, code snippets, generated copy)
- **Remove:** Cormorant Garamond, DM Sans

### Tailwind Config Changes

- Replace `parchment`, `navy`, `copper`, `ink`, `arabic-red`, `copper-light`, `copper-hover` with the token set above
- Add `fontFamily.sans` → Plus Jakarta Sans
- Add `fontFamily.mono` → JetBrains Mono

---

## 2. Layout Shell (`app/(dashboard)/layout.tsx`)

Replace the current top-navbar with a fixed left sidebar layout.

### Sidebar
- **Width:** `240px`, fixed, full-height, `background: #0F1829`
- **Top:** `ListingsLaunch` wordmark — Jakarta Sans 800, white, with `Launch` in `#3B82F6`
- **Nav items:** Dashboard, New Listing, My Listings, Portals, Analytics, Settings
  - Default state: white/50% text, no background
  - Active state: `#1D4ED8` background pill, white text, rounded-md
  - Icons: lucide-react icons alongside each label
- **Bottom:** User email (muted white), Sign Out button (white/40% text, hover white)

### Content Area
- `margin-left: 240px`, `background: #F2F4F7`, scrollable
- Inner padding: `32px`
- No max-width constraint on the outer wrapper (each page controls its own max-width)

### Mobile (< 768px)
- Sidebar hidden by default
- Slim top bar (`48px`) with wordmark + hamburger button
- Sidebar slides in as an overlay when open
- Backdrop closes sidebar on click

---

## 3. Auth Pages

### Login (`app/(auth)/login/page.tsx`)
- Full-screen `#F2F4F7` background, centered vertically and horizontally
- White card (`480px` max-width), `border-radius: 12px`, `border: 1px solid #DDE3EC`, `padding: 48px`
- Wordmark at top: `ListingsLaunch` in Jakarta Sans 800
- Tagline: "List it. In Arabic. In 30 seconds." in muted small caps
- Email + Password fields: full bordered inputs (not bare underlines), `border: 1.5px solid #DDE3EC`, `border-radius: 6px`
- Submit button: full-width, `#1D4ED8` blue, white text, Jakarta Sans 600
- Link to signup at bottom

### Signup (`app/(auth)/signup/page.tsx`)
- Same card layout as login
- Agency email, password, agency name fields
- Same blue submit button

---

## 4. Dashboard Home (`app/(dashboard)/page.tsx`)

### Stat Row
Three bento cards at top (white, bordered, `border-radius: 12px`):
- Total Listings (count + "↑ X%" green badge)
- Published (count)
- Portals Live (Bayut / PF / Dubizzle green badges)

### Enquiries Chart Widget
- White card with "Enquiries this week" label + `+24%` blue badge
- 7-bar chart (matching landing page hero chart aesthetic)
- Day labels in JetBrains Mono

### Recent Listings
- White card with "Recent Listings" heading + "View All →" link
- Listings rendered as divide-y rows: property name (Jakarta Sans 600), specs (muted small caps), price, status badge, portal badges
- Empty state: dashed border card with "No listings yet" and blue CTA button

---

## 5. My Listings (`app/(dashboard)/listings/page.tsx`)

- Page heading: "My Listings" in Jakarta Sans 800 + "+ New Listing" blue button (top right)
- Search input: white card input with `Search` icon, bordered
- Filter pills: badge-style buttons — All / Draft / Published / Sale / Rent; active pill uses `#1D4ED8` bg
- Listings list: white card, divide-y rows
  - Property title (Jakarta Sans 600, link → detail page)
  - Specs row (muted, small caps)
  - Price (Jakarta Sans 700)
  - Status badge (green "Published" / grey "Draft")
  - Portal badges (green badge per portal)
  - Edit → link, delete icon with confirm inline
- Empty state: dashed border card

---

## 6. Listing Detail (`app/(dashboard)/listings/[id]/page.tsx`)

This page is complex and must preserve all existing functionality. Only the visual treatment changes — no logic changes.

**Property summary bar (sticky below sidebar top)**
- Replaces the current `top-16` sticky bar
- White card with property badge, bed/bath, price, community, "← All Listings" link
- Uses the new border/badge tokens

**EN / AR double-spread**
- Replaces the parchment two-column split
- EN panel: white card with "AI Copy — EN" label (SectionLabel component), editable textarea (bordered), CopyButton (restyled to blue border), WordCount (muted)
- AR panel: same white card, `dir="rtl"`, "AI Copy — AR" label, editable textarea, CopyButton, WordCount

**Output Variants tabs (WhatsApp / Instagram / Short Teaser)**
- Preserve the three-tab pattern
- Tab bar: restyled with blue active underline/text instead of copper
- WhatsApp panel: light blue-tinted bg (`#EFF6FF`) instead of green-50
- Instagram panel: keep gradient bg, restyle copy buttons to blue border
- Teaser panel: white card, Jakarta Sans instead of Cormorant

**Portal Publishing section**
- Preserve the three-portal "Mark Published" / "Live on X" pattern
- Restyle portal cards to BentoCard components with green badges for published state
- "Mark Published" button: blue border + blue text (not copper)

**Fixed bottom action bar**
- Preserve the fixed bottom bar
- Fix positioning: `left-[240px]` instead of `left-0` to account for sidebar width
- On mobile (sidebar hidden): `left-0`
- Restyle: white background, `border-top: 1px solid #DDE3EC`, blue "Save Changes" button, muted "← Back to Listings" link

---

## 7. New Listing (`app/(dashboard)/new/page.tsx`)

Keep the existing single-scroll form structure and all business logic unchanged. Only restyle visually.

**VoiceInput component:** Keep it. Restyle the component's button/card to use the new tokens (blue border, white bg) — no logic changes.

**Section labels:** Replace copper `text-copper` section labels ("01 — Property Type" etc.) with SectionLabel component (uppercase blue, letter-spacing).

**Property type buttons:** Active state uses `#1D4ED8` bg + white text instead of copper. Inactive: `#DDE3EC` border + muted text.

**Listing type (Sale/Rent) toggle:** Active: `#0F1829` dark bg + white text. Matches landing page button pattern.

**Stepper (Bedrooms/Bathrooms/Parking):** Replace Cormorant numeral with Jakarta Sans 800. Buttons: `#DDE3EC` border, blue on hover.

**Text inputs:** Replace bare border-b style with full bordered inputs: `border: 1.5px solid #DDE3EC`, `border-radius: 6px`, `padding: 10px 12px`. Focus: `border-color: #1D4ED8`.

**Community select:** Same bordered style. Background: white.

**Features grid:** Active feature: blue pale bg (`#EFF6FF`) + blue border + blue text. Inactive: `#DDE3EC` border + muted text.

**Tone cards:** Active: blue pale bg + blue border. Inactive: `#DDE3EC` border.

**Generate button:** Full-width blue button matching landing page CTA style. Loading skeleton bars: blue-tinted.

---

## 8. Portals (`app/(dashboard)/portals/page.tsx`)

Preserve all connect/disconnect/API-key logic unchanged. Only restyle.

**Page heading:** Jakarta Sans 800 "Portal Connections" + muted subtitle.

**Info banner:** Restyle amber `bg-amber-50 border-amber-200` banner to use `#FFFBEB` bg and `#D97706` border (amber token).

**Each portal card (BentoCard):**
- Portal name: Jakarta Sans 700, `#1E293B` text (not colored per portal)
- Description: muted 13px
- **Connected state:** green "● Connected" badge (top right), masked API key in JetBrains Mono, listings count in muted, red "Disconnect" button with border
- **Disconnected state:** grey "● Disconnected" badge, inline API Key + API Secret bordered inputs (replacing bare border-b style), blue "Connect [Portal]" button

**No "Sync All" button** — it doesn't exist in current code, do not add it.

---

## 9. Analytics (`app/(dashboard)/analytics/page.tsx`)

Preserve all real-data sections. Only restyle — no logic changes.

**Stat row (4 bento cards):** Total Listings, Published, Top Community, Hours Saved — each as a BentoCard with the stat value in Jakarta Sans 800 dark, label in muted small caps. Replace Cormorant italic with Jakarta Sans.

**Listings per Month chart:** Replace copper bar color with `#1D4ED8` blue. Keep existing month-label logic. Wrap in a white BentoCard with "Listings per Month" heading.

**By Property Type:** Replace `bg-navy` bar with `#1D4ED8` blue. Replace Cormorant heading with Jakarta Sans 700. Wrap in white BentoCard.

**Portal Distribution:** Three portal cards → BentoCard each. Replace Cormorant italic count with Jakarta Sans 800. Replace colored dot with colored Badge (blue/green/amber per portal). Keep existing `portalCounts` data.

**Time Saved callout:** Replace copper Cormorant giant number with Jakarta Sans 800 `#1D4ED8` blue. Keep the callout as a BentoCard with dark bg (`#0F1829`) and white text for visual emphasis.

---

## 10. Settings (`app/(dashboard)/settings/page.tsx`)

Preserve both tabs and all existing fields. Only restyle.

**Tabs (Agency Profile / Subscription):** Replace copper active tab underline with blue (`#1D4ED8`).

**Agency Profile tab — all fields preserved:**
- Agency Name, RERA License, Phone, Email — replace bare border-b inputs with full bordered inputs
- Default Listing Tone cards — active: blue pale bg + blue border (not copper)
- Default Disclaimer textarea — bordered style
- "Save Profile" button — blue (not copper)

**Subscription tab — all sections preserved:**
- Current Plan card: BentoCard, Jakarta Sans headings
- Monthly Usage progress bar — replace copper fill with `#1D4ED8` blue; red at >80% stays
- Agency Plan upgrade card: replace copper border with blue border, blue "Upgrade" button

**No "Danger Zone"** — it doesn't exist in current code, do not add it.

---

## 11. Component Extraction

Extract shared primitives to `components/ui/`. Use these consistently across ALL pages.

- `Badge` — blue / green / amber variants (port from landing page). Used in: dashboard stats, listing status, portal status, output tabs, all badge instances.
- `SectionLabel` — uppercase blue label (replaces copper section labels everywhere). Used in: all section headers across all pages.
- `BentoCard` — white bordered card with `border-radius: 12px`, `border: 1px solid #DDE3EC`, white bg. Used in: every card container across all pages.
- `PageHeading` — Jakarta Sans 800 page title + optional right-side action slot (e.g. "+ New Listing" button). Used in: listings, analytics, portals, settings page tops.
- `StatusBadge` — Published (green) / Draft (grey) / Live (green) / Disconnected (grey) etc. Thin wrapper around Badge with preset colors per status string.

---

## 12. Files to Change

| File | Change |
|---|---|
| `tailwind.config.ts` | Replace color/font tokens |
| `app/layout.tsx` | Update font imports (Plus Jakarta Sans, JetBrains Mono) |
| `app/(dashboard)/layout.tsx` | Full rewrite — sidebar layout |
| `app/(dashboard)/page.tsx` | Full rewrite — bento stats + chart + listings |
| `app/(dashboard)/listings/page.tsx` | Full rewrite — search + filter + card list |
| `app/(dashboard)/listings/[id]/page.tsx` | Full rewrite — two-column edit + copy |
| `app/(dashboard)/new/page.tsx` | Full rewrite — stepped form |
| `app/(dashboard)/portals/page.tsx` | Full rewrite — portal bento cards |
| `app/(dashboard)/analytics/page.tsx` | Full rewrite — stat row + chart + table |
| `app/(dashboard)/settings/page.tsx` | Full rewrite — sectioned form card |
| `app/(auth)/login/page.tsx` | Full rewrite — centered card |
| `app/(auth)/signup/page.tsx` | Full rewrite — centered card |
| `components/ui/` (new) | Badge, SectionLabel, BentoCard, PageHeading, StatusBadge |

---

## 13. Additional Changes

**`app/layout.tsx` — font + Toaster update:**
- Replace `Cormorant_Garamond` and `DM_Sans` imports with `Plus_Jakarta_Sans` and `JetBrains_Mono`
- Replace CSS variables `--font-cormorant` and `--font-dm-sans` with `--font-jakarta` and `--font-jetbrains`
- Update `<body>` className: `font-sans bg-[#F2F4F7] text-[#1E293B]`
- Update `<Toaster>` styles: `background: "#FFFFFF"`, `color: "#1E293B"`, `border: "1px solid #DDE3EC"`, `borderRadius: "8px"`

**`components/VoiceInput.tsx` — restyle only:**
- Replace all copper/parchment/navy tokens with new tokens
- No logic changes

## 14. Out of Scope

- No changes to Supabase queries or business logic
- No changes to API routes
- No changes to `middleware.ts`
- No new pages added

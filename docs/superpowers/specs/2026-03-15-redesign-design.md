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

Two-column layout on desktop (single column on mobile):

**Left column:** Edit form in a white card
- All listing fields: property type, bedrooms, bathrooms, size, community, building, price, listing type
- Bordered inputs, blue Save button

**Right column:** Generated copy cards
- EN copy: dark card (`#0F1829`) with "AI Copy — EN" label, JetBrains Mono text, green "Generated" badge
- AR copy: same dark card with "AI Copy — AR" label
- "Regenerate" button below each card

---

## 7. New Listing (`app/(dashboard)/new/page.tsx`)

- White card, centered (`640px` max-width)
- Step indicator at top: 3 steps (Details → Generate → Publish), active step in blue
- Step 1: listing fields (bordered inputs)
- Step 2: generated copy rendered in dark card (EN + AR), "Regenerate" button
- Step 3: portal selection checkboxes + blue "Publish to Portals" button
- Back / Next navigation buttons

---

## 8. Portals (`app/(dashboard)/portals/page.tsx`)

- Page heading "Portal Connections" + section label
- Three bento cards (one per portal: Bayut, Property Finder, Dubizzle):
  - Portal name (Jakarta Sans 700)
  - Status badge: green "● Live" or amber "● Syncing" or grey "Not Connected"
  - Last synced timestamp in JetBrains Mono
  - Connect / Disconnect button
- Sync All button (blue, top right)

---

## 9. Analytics (`app/(dashboard)/analytics/page.tsx`)

- Stat bento row: Total Listings, Published, Portals Live
- Bar chart card: "Listing Activity" with weekly bars (matching landing page chart style)
- Top Listings table: white card with columns — Property, Portal, Status, Views (mock data if no real analytics)

---

## 10. Settings (`app/(dashboard)/settings/page.tsx`)

- White card with section headings (Jakarta Sans 700)
- Sections: Profile (name, email), Agency (agency name), Security (change password)
- Each section: bordered inputs, blue Save button per section
- Danger zone: red-tinted "Delete Account" section at bottom

---

## 11. Component Extraction

To avoid duplication, extract shared primitives to `components/ui/`:

- `Badge` — blue / green / amber variants (port from landing page)
- `SectionLabel` — uppercase blue label
- `BentoCard` — white bordered card with border-radius 12
- `PageHeading` — Jakarta Sans 800 page title + optional right-side action slot
- `StatusBadge` — Published (green) / Draft (grey) / Live (green) etc.

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

## 13. Out of Scope

- No changes to Supabase queries or business logic
- No changes to API routes
- No changes to `middleware.ts`
- No new pages added

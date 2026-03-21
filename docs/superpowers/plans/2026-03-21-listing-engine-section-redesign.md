# Listing Engine Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake six-module bento grid on the landing page with an honest 3-step "How It Works" section that shows exactly what the AI listing engine does.

**Architecture:** All changes are contained in two files — `app/page.tsx` (JSX + nav labels) and `app/globals.css` (remove dead classes, add new responsive rules). No new components or files are created.

**Tech Stack:** Next.js 14, React (inline styles), Tailwind for layout utilities, globals.css for responsive overrides.

---

## File Map

| File | What changes |
|------|-------------|
| `app/page.tsx` | Nav label "Platform" → "How It Works" (×2), hero CTA label, entire `id="features"` section replaced |
| `app/globals.css` | Remove `.features-bento`, `.features-bento-wide`, `.features-bento-tall`; add `.how-it-works-steps`, `.how-it-works-connector`, `.sample-output-columns`, `.sample-output-divider`, `.sample-output-ar` |

---

## Task 1: Update nav labels and hero CTA

**Files:**
- Modify: `app/page.tsx` (lines 179, 258, 408)

- [ ] **Step 1: Update desktop nav array**

Find this in `app/page.tsx` (~line 179):
```tsx
{["Platform", "Clients", "Pricing"].map((label, i) => {
  const hrefs = ["#features", "#testimonials", "#pricing"];
```
Change `"Platform"` to `"How It Works"`:
```tsx
{["How It Works", "Clients", "Pricing"].map((label, i) => {
  const hrefs = ["#features", "#testimonials", "#pricing"];
```

- [ ] **Step 2: Update mobile nav array**

Find this in `app/page.tsx` (~line 258):
```tsx
{["Platform", "Clients", "Pricing"].map((label, i) => {
  const hrefs = ["#features", "#testimonials", "#pricing"];
```
Change `"Platform"` to `"How It Works"`:
```tsx
{["How It Works", "Clients", "Pricing"].map((label, i) => {
  const hrefs = ["#features", "#testimonials", "#pricing"];
```

- [ ] **Step 3: Update hero secondary CTA label**

Find this in `app/page.tsx` (~line 408):
```tsx
                See the platform
```
Change to:
```tsx
                See how it works
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: update nav and hero CTA labels for listing engine section"
```

---

## Task 2: Remove dead CSS classes

**Files:**
- Modify: `app/globals.css` (lines 55–69)

- [ ] **Step 1: Remove the bento grid media query block**

Find and delete this entire block from `app/globals.css`:
```css
/* Mobile: features bento collapses to single column */
@media (max-width: 767px) {
  .features-bento {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto !important;
  }
  .features-bento-wide {
    grid-column: span 1 !important;
    padding: 24px !important;
  }
  .features-bento-tall {
    grid-row: span 1 !important;
  }
}
```

- [ ] **Step 2: Add new responsive rules in its place**

In the same location, add:
```css
/* Mobile: how it works section */
@media (max-width: 767px) {
  .how-it-works-steps {
    flex-direction: column !important;
  }
  .how-it-works-connector {
    display: none !important;
  }
  .sample-output-columns {
    flex-direction: column !important;
    gap: 24px !important;
  }
  .sample-output-divider {
    width: 100% !important;
    height: 1px !important;
    align-self: auto !important;
  }
  .sample-output-ar {
    padding-left: 0 !important;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "refactor: replace bento CSS with how-it-works responsive rules"
```

---

## Task 3: Replace the features section

**Files:**
- Modify: `app/page.tsx` (lines 582–877, the `{/* Features */}` section)

- [ ] **Step 1: Delete the entire current Features section**

Find the block starting with `{/* Features */}` and ending at the closing `</section>` tag (currently lines 582–877). Delete it entirely. The section starts with:
```tsx
      {/* Features */}
      <section
        id="features"
        style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
```
And ends just before `{/* Testimonials */}`.

- [ ] **Step 2: Insert the new How It Works section in its place**

Paste the following in place of the deleted section:

```tsx
      {/* How It Works */}
      <section
        id="features"
        style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2
            style={{
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: c.dark,
              marginBottom: 12,
            }}
          >
            A complete listing in 30 seconds.
            <br />
            Bilingual. Built to sell.
          </h2>
          <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7 }}>
            Speak or fill in the details — the AI handles the rest.
          </p>
        </div>

        {/* 3-step flow */}
        <div
          className="how-it-works-steps"
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            marginBottom: 16,
          }}
        >
          <BentoCard style={{ flex: 1, padding: 32 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: c.blue,
                display: "block",
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              1
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              Speak or fill in the details
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              Use your voice or a short form. Property type, size, key
              features — say it or type it.
            </p>
          </BentoCard>

          <div
            className="how-it-works-connector"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: 20,
              color: c.muted,
              flexShrink: 0,
            }}
          >
            →
          </div>

          <BentoCard style={{ flex: 1, padding: 32 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: c.blue,
                display: "block",
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              2
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              AI writes your listing
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              Bilingual EN/AR copy generated in seconds. Optimised for
              Bayut, Property Finder, and Dubizzle.
            </p>
          </BentoCard>

          <div
            className="how-it-works-connector"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: 20,
              color: c.muted,
              flexShrink: 0,
            }}
          >
            →
          </div>

          <BentoCard style={{ flex: 1, padding: 32 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: c.blue,
                display: "block",
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              3
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              Copy and paste
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              Done. Paste straight into any portal. No editing, no
              reformatting.
            </p>
          </BentoCard>
        </div>

        {/* Sample output card */}
        <BentoCard style={{ padding: 40, marginTop: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: c.muted,
              display: "block",
              marginBottom: 24,
            }}
          >
            Sample output — 2BR, Downtown Dubai
          </span>
          <div
            className="sample-output-columns"
            style={{ display: "flex", gap: 0 }}
          >
            {/* English column */}
            <div style={{ flex: 1, paddingRight: 32 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: c.blue,
                  marginBottom: 12,
                }}
              >
                EN
              </p>
              <p style={{ color: c.text, fontSize: 14, lineHeight: 1.9 }}>
                Nestled in the heart of Downtown Dubai, this well-appointed
                2-bedroom apartment offers sweeping views of the iconic Burj
                Khalifa skyline. Spanning 1,150 sq ft across a smart
                open-plan layout, the residence features floor-to-ceiling
                windows, a fully fitted kitchen, and two generously sized
                en-suite bedrooms. Residents enjoy access to a rooftop
                infinity pool, a state-of-the-art gymnasium, and 24-hour
                concierge service — all just steps from Dubai Mall and the
                Dubai Fountain.
              </p>
            </div>

            {/* Vertical divider */}
            <div
              className="sample-output-divider"
              style={{
                width: 1,
                background: c.border,
                flexShrink: 0,
                alignSelf: "stretch",
              }}
            />

            {/* Arabic column */}
            <div
              dir="rtl"
              className="sample-output-ar"
              style={{ flex: 1, paddingLeft: 32, textAlign: "right" }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: c.blue,
                  marginBottom: 12,
                }}
              >
                AR
              </p>
              <p style={{ color: c.text, fontSize: 14, lineHeight: 1.9 }}>
                تقع هذه الشقة المكوّنة من غرفتَي نوم في قلب وسط مدينة
                دبي، وتوفّر إطلالات خلّابة على أفق برج خليفة الشهير. تمتد
                الشقة على مساحة 1,150 قدم مربع بتصميم مفتوح ذكي، وتتميّز
                بنوافذ تمتد من الأرض إلى السقف، ومطبخ مجهّز بالكامل،
                وغرفتَي نوم واسعتَين مع حمّامَين ملحقَين. يتمتع السكان
                بالوصول إلى مسبح لا نهاية له على السطح، وصالة رياضية
                متكاملة، وخدمة كونسيرج على مدار الساعة — على بعد خطوات من
                دبي مول ونافورة دبي.
              </p>
            </div>
          </div>
        </BentoCard>
      </section>
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: replace six-module bento grid with how-it-works section"
```

---

## Task 4: Verify

- [ ] **Step 1: Run typecheck and lint**

```bash
npm run typecheck && npm run lint
```

Expected: no errors, no warnings. Fix any issues before marking complete.

- [ ] **Step 2: Visual check**

Start the dev server (`npm run dev`) and verify at `http://localhost:3000`:
- The Features section now shows "How It Works" with the 3-step flow and sample output card
- Nav bar links read "How It Works", "Clients", "Pricing"
- Hero secondary CTA reads "See how it works"
- On a narrow viewport (< 768px), the three step cards stack vertically and the `→` connectors disappear
- The sample output card shows English on the left and Arabic on the right (desktop), stacked on mobile
- Arabic text is right-aligned

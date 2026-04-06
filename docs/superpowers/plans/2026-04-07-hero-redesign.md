# Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the landing page hero with new outcome-focused copy and a tabbed card graphic showcasing voice-to-listing and WhatsApp bot features.

**Architecture:** Extract the tabbed hero graphic into `components/HeroCard.tsx` (client component, owns tab state). `app/page.tsx` replaces its hero section JSX with the new copy + `<HeroCard />`. No backend changes.

**Tech Stack:** Next.js 14, React, TypeScript, inline styles (project convention), Tailwind for responsive breakpoints.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `components/HeroCard.tsx` | **Create** | Tabbed graphic card — listing copy tab + WhatsApp bot tab, fixed height |
| `app/page.tsx` | **Modify** | Replace hero section JSX with new pill/headline/subtitle/CTAs + `<HeroCard />` |

---

## Task 1: Create `HeroCard` component

**Files:**
- Create: `components/HeroCard.tsx`

- [ ] **Step 1: Create the file with the listing copy tab**

Create `components/HeroCard.tsx`:

```tsx
'use client'

import { useState } from 'react'

const blue = '#1D4ED8'
const dark = '#0F1829'
const muted = '#64748B'
const border = '#DDE3EC'
const green = '#059669'

export function HeroCard() {
  const [tab, setTab] = useState<'listing' | 'whatsapp'>('listing')

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${border}`,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Tab strip */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        {(['listing', 'whatsapp'] as const).map((t) => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? blue : '#94a3b8',
                borderBottom: active ? `2px solid ${blue}` : '2px solid transparent',
                background: active ? '#fff' : '#FAFAFA',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            >
              {t === 'listing' ? '🎙️ Listing copy' : '💬 WhatsApp bot'}
            </button>
          )
        })}
      </div>

      {/* Fixed-height panel container */}
      <div style={{ position: 'relative', height: 370, flexShrink: 0 }}>

        {/* Listing tab */}
        <div style={{
          position: 'absolute', inset: 0, padding: 16,
          display: tab === 'listing' ? 'flex' : 'none',
          flexDirection: 'column', gap: 10,
        }}>
          {/* You said */}
          <div style={{
            border: '1px dashed #CBD5E1', borderRadius: 10,
            padding: '10px 12px', flexShrink: 0,
          }}>
            <div style={{
              fontSize: 8, color: '#94a3b8', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5,
            }}>
              🎙 You said
            </div>
            <div style={{ fontSize: 10, color: muted, lineHeight: 1.75, fontStyle: 'italic' }}>
              &ldquo;3 bed in downtown, has a burj view, private gym, good finishes, asking 4.2 mill, vacant now&rdquo;
            </div>
          </div>

          {/* Transform divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ flex: 1, height: 1, background: border }} />
            <div style={{ fontSize: 9, color: blue, fontWeight: 600, whiteSpace: 'nowrap' }}>
              ✦ listing written in 8s
            </div>
            <div style={{ flex: 1, height: 1, background: border }} />
          </div>

          {/* Dark copy block */}
          <div style={{
            background: dark, borderRadius: 10, padding: 14,
            flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {/* File header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-jetbrains), monospace' }}>
                listing_copy.txt
              </span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>EN + AR ✓</span>
            </div>

            {/* Generated copy */}
            <div style={{
              fontSize: 10, color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.85, fontFamily: 'var(--font-jetbrains), monospace', flex: 1,
            }}>
              &ldquo;Exceptional 3-bedroom apartment in Downtown Dubai with sweeping Burj Khalifa views, a private gym, and premium finishes throughout. Vacant and ready for immediate handover. AED&nbsp;4.2M.&rdquo;
            </div>

            {/* Platform readiness rows */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, flexShrink: 0,
            }}>
              {[
                {
                  icon: '🏠', label: 'Portals',
                  mid: (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['Bayut', 'Property Finder', 'Dubizzle'].map((p) => (
                        <span key={p} style={{
                          background: 'rgba(29,78,216,0.35)', color: '#93C5FD',
                          fontSize: 8, padding: '2px 7px', borderRadius: 6, fontWeight: 600,
                        }}>{p}</span>
                      ))}
                    </div>
                  ),
                },
                { icon: '📸', label: 'Instagram', mid: <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Caption + hashtags</span> },
                { icon: '💬', label: 'WhatsApp', mid: <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Broadcast message</span> },
              ].map(({ icon, label, mid }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', minWidth: 80 }}>{icon} {label}</span>
                  {mid}
                  <span style={{
                    background: green, color: '#fff',
                    fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                  }}>Ready ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp tab */}
        <div style={{
          position: 'absolute', inset: 0, padding: 16,
          display: tab === 'whatsapp' ? 'flex' : 'none',
          flexDirection: 'column', gap: 8,
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: muted }}>
              New enquiry · Ahmed K. · just now
            </span>
            <span style={{
              marginLeft: 'auto', background: '#E8FFF1', color: green,
              fontSize: 8, fontWeight: 600, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap',
            }}>
              &lt; 2 min · 24/7
            </span>
          </div>

          {/* Conversation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {/* Lead message */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                background: '#DCF8C6', borderRadius: '10px 10px 0 10px',
                padding: '8px 12px', fontSize: 10, maxWidth: '78%', lineHeight: 1.6, color: '#1a1a1a',
              }}>
                Hi, I&apos;m interested in the Downtown 3BR listing
              </div>
            </div>
            {/* Bot reply 1 */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 6 }}>
              <WaAvatar />
              <div style={{
                background: '#f1f0f0', borderRadius: '10px 10px 10px 0',
                padding: '8px 12px', fontSize: 10, maxWidth: '82%', lineHeight: 1.6, color: '#374151',
              }}>
                Hi Ahmed! Great choice. Are you looking to buy or rent? I can arrange a viewing for today or tomorrow. 🏠
              </div>
            </div>
            {/* Lead reply */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                background: '#DCF8C6', borderRadius: '10px 10px 0 10px',
                padding: '8px 12px', fontSize: 10, maxWidth: '78%', lineHeight: 1.6, color: '#1a1a1a',
              }}>
                Buy. Can we do tomorrow at 5pm?
              </div>
            </div>
            {/* Bot reply 2 */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 6 }}>
              <WaAvatar />
              <div style={{
                background: '#f1f0f0', borderRadius: '10px 10px 10px 0',
                padding: '8px 12px', fontSize: 10, maxWidth: '82%', lineHeight: 1.6, color: '#374151',
              }}>
                Perfect, booked you in for tomorrow at 5pm. The agent will confirm shortly. ✅
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, flexShrink: 0 }}>
            {[
              { val: '98%', label: 'Reply rate', color: green },
              { val: '<2m', label: 'Avg response', color: blue },
              { val: '24/7', label: 'Always on', color: dark },
            ].map(({ val, label, color }) => (
              <div key={label} style={{
                background: '#F8FAFF', border: `1px solid ${border}`,
                borderRadius: 8, padding: 10, textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color }}>{val}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function WaAvatar() {
  return (
    <div style={{
      width: 22, height: 22, background: '#25D366', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/HeroCard.tsx
git commit -m "feat: add HeroCard tabbed graphic component"
```

---

## Task 2: Replace the hero section in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the HeroCard import**

At the top of `app/page.tsx`, after the existing imports, add:

```tsx
import { HeroCard } from '@/components/HeroCard'
```

- [ ] **Step 2: Replace the hero section JSX**

Find and replace the entire `{/* Hero */}` section (from `<section` through its closing `</section>` tag at line ~483) with:

```tsx
{/* Hero */}
<section style={{ padding: '64px 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 48,
    alignItems: 'center',
  }}>
    {/* Left: copy */}
    <div>
      {/* Pill */}
      <div style={{
        display: 'inline-block',
        background: c.bluePale,
        color: c.blue,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        padding: '5px 12px',
        borderRadius: 20,
        marginBottom: 18,
      }}>
        For UAE property agents
      </div>

      {/* Headline */}
      <h1 style={{
        fontWeight: 800,
        fontSize: 'clamp(36px, 5vw, 60px)',
        lineHeight: 1.08,
        color: c.dark,
        marginBottom: 20,
      }}>
        Less typing.<br />
        More viewings.<br />
        <span style={{ color: c.blue }}>More closings.</span>
      </h1>

      {/* Subtitle */}
      <p style={{
        color: c.muted,
        fontSize: 16,
        lineHeight: 1.8,
        maxWidth: 440,
        marginBottom: 36,
      }}>
        Describe a property and get a ready-to-publish listing in English and Arabic.
        Set up a WhatsApp flow once and every new enquiry gets handled — even at 2am.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <a
          href="/auth?tab=signup"
          style={{
            display: 'inline-block',
            background: c.blue,
            color: 'white',
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 6,
            textDecoration: 'none',
          }}
        >
          Start free trial
        </a>
        <a
          href="/auth"
          style={{
            display: 'inline-block',
            border: `1.5px solid ${c.border}`,
            color: c.text,
            padding: '10px 24px',
            fontWeight: 500,
            fontSize: 13,
            borderRadius: 6,
            textDecoration: 'none',
          }}
        >
          Login
        </a>
      </div>

      {/* Trust signals */}
      <p style={{ fontSize: 11, color: c.muted }}>
        ✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 5 minutes &nbsp;·&nbsp; ✓ RERA compliant
      </p>
    </div>

    {/* Right: tabbed graphic */}
    <HeroCard />
  </div>
</section>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run the dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Check:
- Pill reads "For UAE property agents"
- Headline reads "Less typing. / More viewings. / More closings." with last line in blue
- Subtitle mentions property description and WhatsApp flow
- Two CTA buttons present: "Start free trial" and "Login"
- Trust signals below CTAs
- Right card shows "🎙️ Listing copy" tab active by default
- Listing tab shows "You said" dashed box → divider → dark copy block → three platform rows
- Clicking "💬 WhatsApp bot" tab switches content, card height stays the same
- WhatsApp tab shows conversation thread + 3 stats
- No "AI" visible anywhere in the hero

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: rework hero section — outcome copy, voice-to-listing + WhatsApp tabbed card"
```

---

## Self-Review

**Spec coverage:**
- ✅ Pill: "For UAE property agents"
- ✅ Headline: "Less typing. More viewings. More closings." — third line blue
- ✅ Subtitle: describe property → EN + AR listing; WhatsApp flow → leads handled 24/7
- ✅ CTA primary: Start free trial → `/auth?tab=signup`
- ✅ CTA secondary: Login → `/auth`
- ✅ Trust signals: no credit card, 5 min setup, RERA
- ✅ Listing tab: "You said" dashed box, transform divider, dark copy block with platform rows
- ✅ Platform rows: Portals (Bayut/PF/Dubizzle), Instagram, WhatsApp — each with Ready ✓
- ✅ WhatsApp tab: conversation, stats (98% / <2m / 24/7)
- ✅ Fixed height — both panels `position: absolute; inset: 0` inside `height: 370px` container
- ✅ No "AI" anywhere in hero text
- ✅ Old bento grid removed (replaced entirely)

**Placeholder scan:** None found.

**Type consistency:** `tab` is `'listing' | 'whatsapp'` throughout. `WaAvatar` is defined before use. All colour constants defined at file top.

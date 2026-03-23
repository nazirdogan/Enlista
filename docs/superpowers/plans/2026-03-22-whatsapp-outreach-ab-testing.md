# WhatsApp Outreach A/B Testing System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated WhatsApp outreach system that sends 4 A/B tested message variants to Dubai real estate agents, tracks replies/clicks/signups in Supabase, and runs automated analysis every 100 messages.

**Architecture:** A Node.js sending script reads the agent directory, assigns variants, and sends via Meta WhatsApp Business API with randomized delays and anti-flagging safeguards. Three tracking mechanisms (click redirect, WA webhook, signup attribution via localStorage) write to dedicated Supabase tables. A Claude Code skill queries the data after every 100 sends and ranks variants.

**Tech Stack:** Next.js 14, Supabase, Meta WhatsApp Business API, Vitest, TypeScript

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `supabase/migrations/002_outreach.sql` | All outreach tables + 3-listing cap trigger |
| `lib/outreach/variants.ts` | 4 message templates + token generation |
| `lib/outreach/meta-api.ts` | Meta WA API client (send, validate contacts) |
| `lib/outreach/normalize-phone.ts` | E.164 normalization for UAE numbers |
| `lib/outreach/analysis.ts` | Supabase query + report formatting logic |
| `scripts/outreach/parse-agents.ts` | Parse `dubai_agents.html` → `agents.json` |
| `scripts/outreach/send.ts` | Main sending orchestrator |
| `scripts/outreach/analyze.ts` | Standalone analysis runner script |
| `app/api/go/route.ts` | Click tracking redirect handler |
| `app/api/whatsapp/webhook/route.ts` | Inbound WA webhook (replies + opt-outs) |
| `app/api/outreach/signup-hook/route.ts` | Signup attribution — called from AuthForm |
| `.claude/skills/analyze-outreach.md` | `/analyze-outreach` Claude Code skill |
| `scripts/outreach/agents.json` | Generated agent list (gitignored) |

### Modified files
| File | Change |
|---|---|
| `app/(auth)/auth/AuthForm.tsx` | Fix brand name + read/send outreach token on signup |
| `.gitignore` | Add `scripts/outreach/agents.json` |

### Test files
| File | Tests |
|---|---|
| `lib/outreach/__tests__/normalize-phone.test.ts` | E.164 normalization edge cases |
| `lib/outreach/__tests__/variants.test.ts` | Token uniqueness, variant rendering |
| `app/api/go/__tests__/route.test.ts` | Click logging + redirect |
| `app/api/whatsapp/__tests__/webhook.test.ts` | Signature verification, reply/optout routing |

---

## Task 1: Install Vitest + configure test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest @vitejs/plugin-react vite
```

- [ ] **Step 2: Install undici for Web API polyfill in tests**

```bash
npm install --save-dev undici
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

Create `vitest.setup.ts`:
```typescript
// Polyfill Web API globals (Request, Response, Headers) for API route tests
import { Request, Response, Headers, fetch } from 'undici'
Object.assign(globalThis, { Request, Response, Headers, fetch })
```

- [ ] **Step 4: Add test script to package.json**

In `package.json` scripts, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify Vitest works**

```bash
npm test
```
Expected: "No test files found" — no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.ts vitest.setup.ts package-lock.json
git commit -m "chore: add Vitest test runner with Web API polyfill"
```

---

## Task 2: Database migration — outreach tables + 3-listing cap

**Files:**
- Create: `supabase/migrations/002_outreach.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/002_outreach.sql`:
```sql
-- Outreach sends (one row per message sent)
create table outreach_sends (
  id              uuid primary key default gen_random_uuid(),
  agent_name      text,
  agency          text,
  phone           text unique not null,
  variant         text not null check (variant in ('A1','A2','B1','B2')),
  tracking_token  text unique not null,
  sent_at         timestamptz default now()
);

-- Click events
create table outreach_clicks (
  id              uuid primary key default gen_random_uuid(),
  tracking_token  text references outreach_sends(tracking_token) on delete cascade,
  clicked_at      timestamptz default now(),
  ip              text
);

-- Inbound replies from agents
create table outreach_replies (
  id          uuid primary key default gen_random_uuid(),
  send_id     uuid references outreach_sends(id) on delete set null,
  phone       text not null,
  reply_text  text,
  replied_at  timestamptz default now()
);

-- Signup attributions
create table outreach_signups (
  id              uuid primary key default gen_random_uuid(),
  tracking_token  text references outreach_sends(tracking_token) on delete set null,
  user_id         uuid references auth.users on delete cascade,
  signed_up_at    timestamptz default now()
);

-- Opt-outs (STOP replies)
create table outreach_optouts (
  id            uuid primary key default gen_random_uuid(),
  phone         text unique not null,
  opted_out_at  timestamptz default now()
);

-- Key-value store for outreach state
create table outreach_meta (
  key   text primary key,
  value text not null
);
insert into outreach_meta (key, value) values ('last_analysis_count', '0');

-- 3-listing cap for trial users
-- is_trial defaults to true for new accounts.
-- IMPORTANT: This column must be flipped to false by the Stripe webhook
-- (app/api/stripe/webhook/route.ts) when a subscription becomes active.
-- Existing rows before this migration are assumed to be active/paying users
-- and are explicitly set to false to avoid breaking them.
alter table agencies add column if not exists is_trial boolean default true;
alter table agencies add column if not exists trial_started_at timestamptz default now();

-- Mark all pre-existing agencies as non-trial (they were created before trial system existed)
update agencies set is_trial = false where created_at < now();

-- Trigger: block listing creation when trial user has >= 3 listings
create or replace function check_trial_listing_limit()
returns trigger as $$
declare
  listing_count integer;
  user_is_trial boolean;
begin
  select is_trial into user_is_trial
  from agencies
  where user_id = new.user_id
  limit 1;

  if user_is_trial then
    select count(*) into listing_count
    from listings
    where user_id = new.user_id;

    if listing_count >= 3 then
      raise exception 'Trial accounts are limited to 3 listings. Upgrade to continue.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger enforce_trial_listing_limit
  before insert on listings
  for each row execute function check_trial_listing_limit();
```

- [ ] **Step 2: Apply migration to local Supabase**

```bash
npx supabase db push
```
Expected: Migration applied without errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_outreach.sql
git commit -m "feat: add outreach tables and trial listing cap trigger"
```

---

## Task 3: Phone number normalization

**Files:**
- Create: `lib/outreach/normalize-phone.ts`
- Create: `lib/outreach/__tests__/normalize-phone.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/outreach/__tests__/normalize-phone.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { normalizePhone } from '../normalize-phone'

describe('normalizePhone', () => {
  it('passes through valid E.164', () => {
    expect(normalizePhone('+971501234567')).toBe('+971501234567')
  })

  it('adds UAE country code to 10-digit local number', () => {
    expect(normalizePhone('0501234567')).toBe('+971501234567')
  })

  it('adds + prefix to number starting with 971', () => {
    expect(normalizePhone('971501234567')).toBe('+971501234567')
  })

  it('strips spaces and dashes', () => {
    expect(normalizePhone('+971 50 123 4567')).toBe('+971501234567')
    expect(normalizePhone('+971-50-123-4567')).toBe('+971501234567')
  })

  it('returns null for non-normalizable numbers', () => {
    expect(normalizePhone('abc')).toBeNull()
    expect(normalizePhone('123')).toBeNull()
    expect(normalizePhone('')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- normalize-phone
```
Expected: FAIL — `normalize-phone` module not found.

- [ ] **Step 3: Implement normalizePhone**

Create `lib/outreach/normalize-phone.ts`:
```typescript
/**
 * Normalizes a phone number to E.164 format for UAE numbers.
 * Returns null if the number cannot be normalized.
 */
export function normalizePhone(raw: string): string | null {
  if (!raw) return null

  // Strip whitespace, dashes, parentheses
  const cleaned = raw.replace(/[\s\-().]/g, '')

  // Already valid E.164
  if (/^\+971\d{9}$/.test(cleaned)) return cleaned

  // Starts with 971 (missing +)
  if (/^971\d{9}$/.test(cleaned)) return `+${cleaned}`

  // Local UAE number starting with 0 (e.g. 0501234567)
  if (/^0\d{9}$/.test(cleaned)) return `+971${cleaned.slice(1)}`

  // 9-digit local (e.g. 501234567)
  if (/^[5-9]\d{8}$/.test(cleaned)) return `+971${cleaned}`

  return null
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- normalize-phone
```
Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/outreach/normalize-phone.ts lib/outreach/__tests__/normalize-phone.test.ts
git commit -m "feat: add UAE phone number E.164 normalization"
```

---

## Task 4: Message variants + token generation

**Files:**
- Create: `lib/outreach/variants.ts`
- Create: `lib/outreach/__tests__/variants.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/outreach/__tests__/variants.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { renderVariant, generateToken, VARIANTS } from '../variants'

describe('VARIANTS', () => {
  it('has exactly 4 variants', () => {
    expect(Object.keys(VARIANTS)).toHaveLength(4)
    expect(Object.keys(VARIANTS)).toEqual(['A1', 'A2', 'B1', 'B2'])
  })
})

describe('renderVariant', () => {
  it('interpolates first name and link', () => {
    const msg = renderVariant('B1', 'Ahmed', 'https://enlista.ai/go?t=abc123')
    expect(msg).toContain('Ahmed')
    expect(msg).toContain('https://enlista.ai/go?t=abc123')
    expect(msg).not.toContain('[First Name]')
    expect(msg).not.toContain('[link]')
  })

  it('renders all 4 variants without placeholders', () => {
    for (const variant of ['A1','A2','B1','B2'] as const) {
      const msg = renderVariant(variant, 'Sara', 'https://enlista.ai/go?t=xyz')
      expect(msg).not.toContain('[')
      expect(msg).not.toContain(']')
    }
  })
})

describe('generateToken', () => {
  it('generates a 16-char hex string', () => {
    const token = generateToken()
    expect(token).toMatch(/^[a-f0-9]{16}$/)
  })

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, generateToken))
    expect(tokens.size).toBe(100)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- variants
```
Expected: FAIL.

- [ ] **Step 3: Implement variants**

Create `lib/outreach/variants.ts`:
```typescript
import { randomBytes } from 'crypto'

export type VariantId = 'A1' | 'A2' | 'B1' | 'B2'

export const VARIANTS: Record<VariantId, string> = {
  A1: `Hey [First Name], quick question — how long does it take you to write up a listing for Bayut or Property Finder? We built something that gets it done in under 4 minutes, bilingual EN/AR. Genuinely curious if that's a pain point. [link]

— Enlista | AI listing copy for Dubai agents | Reply STOP to opt out`,

  A2: `Hey [First Name], we've been working with a few Dubai agencies on AI-generated listing copy — English and Arabic. Some agents are saving 2+ hours per listing. Not sure if it's relevant to your workflow, but would love to know what you think. [link]

— Enlista | AI listing copy for Dubai agents | Reply STOP to opt out`,

  B1: `Hey [First Name], we're giving Dubai agents a free 7-day trial of Enlista — AI that writes your property listings in English and Arabic in under 4 minutes. 3 listings, no credit card needed. [link]

— Enlista | Reply STOP to opt out`,

  B2: `Hey [First Name], agents on Enlista publish listings 3x faster with AI-generated EN/AR copy ready for Bayut, Property Finder, and Dubizzle. Free 7-day trial, 3 listings, no card needed. [link]

— Enlista | Reply STOP to opt out`,
}

export function renderVariant(
  variant: VariantId,
  firstName: string,
  link: string
): string {
  return VARIANTS[variant]
    .replaceAll('[First Name]', firstName)
    .replaceAll('[link]', link)
}

export function generateToken(): string {
  return randomBytes(8).toString('hex')
}

export function pickVariant(index: number): VariantId {
  const variants: VariantId[] = ['A1', 'A2', 'B1', 'B2']
  return variants[index % 4]
}

export function randomVariant(): VariantId {
  const variants: VariantId[] = ['A1', 'A2', 'B1', 'B2']
  return variants[Math.floor(Math.random() * 4)]
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- variants
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/outreach/variants.ts lib/outreach/__tests__/variants.test.ts
git commit -m "feat: add message variants and token generation"
```

---

## Task 5: Agent list parser

**Files:**
- Create: `scripts/outreach/parse-agents.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Add agents.json to .gitignore**

Open `.gitignore` and add:
```
scripts/outreach/agents.json
```

- [ ] **Step 2: Create the parser script**

Create `scripts/outreach/parse-agents.ts`:
```typescript
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface Agent {
  name: string
  firstName: string
  agency: string
  phone: string | null
  whatsapp: string | null
  instagram: string | null
}

function extractText(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i'))
  return match ? match[1].trim() : ''
}

function extractHref(html: string, pattern: string): string | null {
  const regex = new RegExp(`href="([^"]*${pattern}[^"]*)"`, 'i')
  const match = html.match(regex)
  return match ? match[1] : null
}

function parseAgentsHtml(htmlPath: string): Agent[] {
  const html = readFileSync(htmlPath, 'utf-8')

  // Extract table rows (skip header)
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  const rows: Agent[] = []
  let match
  let isFirst = true

  while ((match = rowRegex.exec(html)) !== null) {
    if (isFirst) { isFirst = false; continue } // skip thead row

    const row = match[1]
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []
    if (cells.length < 2) continue

    const nameCell = cells[0] || ''
    const phoneCell = cells[2] || ''
    const waCell = cells[3] || ''
    const igCell = cells[4] || ''

    const fullName = nameCell.replace(/<[^>]+>/g, '').trim()
    const agency = nameCell.match(/class="agency-name"[^>]*>([^<]*)</)?.[1]?.trim() || ''

    const phoneHref = extractHref(phoneCell, 'tel:')
    const phone = phoneHref ? phoneHref.replace('tel:', '') : null

    const waHref = extractHref(waCell, 'wa.me')
    const whatsapp = waHref ? waHref.match(/wa\.me\/(\d+)/)?.[1] ?? null : null

    const igHref = extractHref(igCell, 'instagram')
    const instagram = igHref || null

    if (!fullName || fullName === '') continue

    const firstName = fullName.split(/\s+/)[0]

    rows.push({ name: fullName, firstName, agency, phone, whatsapp, instagram })
  }

  return rows
}

// Run
const htmlPath = join(process.cwd(), 'dubai_agents.html')
const agents = parseAgentsHtml(htmlPath)
const withWhatsapp = agents.filter(a => a.whatsapp)

console.log(`Parsed ${agents.length} agents, ${withWhatsapp.length} with WhatsApp`)

const outPath = join(process.cwd(), 'scripts/outreach/agents.json')
writeFileSync(outPath, JSON.stringify(withWhatsapp, null, 2))
console.log(`Written to ${outPath}`)
```

- [ ] **Step 3: Add parse script to package.json**

In `package.json` scripts:
```json
"outreach:parse": "npx tsx scripts/outreach/parse-agents.ts"
```

- [ ] **Step 4: Run the parser**

```bash
npm run outreach:parse
```
Expected: Output like `Parsed 6624 agents, 5124 with WhatsApp`. Check `scripts/outreach/agents.json` has valid JSON array.

- [ ] **Step 5: Commit**

```bash
git add scripts/outreach/parse-agents.ts package.json .gitignore
git commit -m "feat: add agent list parser for dubai_agents.html"
```

---

## Task 6: Meta WhatsApp Business API client

**Files:**
- Create: `lib/outreach/meta-api.ts`

> **Note:** This task requires real Meta credentials. The client is written and tested with mocks here; live testing happens in Task 10.

- [ ] **Step 1: Add env vars to .env.local**

Add to `.env.local` (never commit this file):
```
META_WA_PHONE_NUMBER_ID=your_phone_number_id
META_WA_ACCESS_TOKEN=your_access_token
META_WA_APP_SECRET=your_app_secret
META_WA_VERIFY_TOKEN=your_chosen_verify_token
NEXT_PUBLIC_BASE_URL=https://enlista.ai
```

- [ ] **Step 2: Create the Meta API client**

Create `lib/outreach/meta-api.ts`:
```typescript
const BASE = 'https://graph.facebook.com/v19.0'
const PHONE_ID = process.env.META_WA_PHONE_NUMBER_ID!
const TOKEN = process.env.META_WA_ACCESS_TOKEN!

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send a free-form text message via WhatsApp Business API.
 * Note: Only works within a 24h customer service window.
 * For cold outreach, use sendTemplate instead.
 */
export async function sendMessage(
  toPhone: string,
  body: string
): Promise<SendResult> {
  const res = await fetch(`${BASE}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone.replace('+', ''),
      type: 'text',
      text: { body },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return { success: false, error: data?.error?.message ?? 'Unknown error' }
  }

  return { success: true, messageId: data?.messages?.[0]?.id }
}

/**
 * Send using an approved Marketing template.
 * templateName must match the approved name in Meta Business Manager.
 * bodyParams are the variable substitutions for {{1}}, {{2}}, etc.
 */
export async function sendTemplate(
  toPhone: string,
  templateName: string,
  bodyParams: string[]
): Promise<SendResult> {
  const components = bodyParams.length > 0
    ? [{
        type: 'body',
        parameters: bodyParams.map(text => ({ type: 'text', text })),
      }]
    : []

  const res = await fetch(`${BASE}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone.replace('+', ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components,
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data?.error?.message ?? 'Unknown error' }
  }
  return { success: true, messageId: data?.messages?.[0]?.id }
}

/**
 * Check if a phone number has an active WhatsApp account.
 * Returns true if the number is on WhatsApp.
 */
export async function isWhatsAppNumber(phone: string): Promise<boolean> {
  const res = await fetch(`${BASE}/${PHONE_ID}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blocking: 'wait',
      contacts: [phone.replace('+', '')],
      force_check: false,
    }),
  })

  if (!res.ok) return false
  const data = await res.json()
  return data?.contacts?.[0]?.status === 'valid'
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/outreach/meta-api.ts
git commit -m "feat: add Meta WhatsApp Business API client"
```

---

## Task 7: Click tracking redirect handler (`/api/go`)

**Files:**
- Create: `app/api/go/route.ts`
- Create: `app/api/go/__tests__/route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `app/api/go/__tests__/route.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [{ tracking_token: 'abc123' }], error: null }),
    })),
  })),
}))

describe('GET /api/go', () => {
  it('redirects to /auth with token when token is valid', async () => {
    const { GET } = await import('../route')
    const req = new Request('https://enlista.ai/api/go?t=abc123', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    })
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth?t=abc123')
  })

  it('redirects to /auth without token when token is missing', async () => {
    const { GET } = await import('../route')
    const req = new Request('https://enlista.ai/api/go')
    const res = await GET(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('/auth')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- app/api/go
```
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement the route**

Create `app/api/go/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth`)
  }

  // Log the click (fire and forget — don't block redirect on DB write)
  const supabase = createClient()
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  supabase
    .from('outreach_clicks')
    .insert({ tracking_token: token, ip })
    .then(() => {}) // intentionally not awaited

  return NextResponse.redirect(`${baseUrl}/auth?t=${token}`, { status: 307 })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- app/api/go
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/go/route.ts app/api/go/__tests__/route.test.ts
git commit -m "feat: add click tracking redirect handler /api/go"
```

---

## Task 8: WhatsApp inbound webhook (replies + opt-outs)

**Files:**
- Create: `app/api/whatsapp/webhook/route.ts`
- Create: `app/api/whatsapp/__tests__/webhook.test.ts`

- [ ] **Step 1: Write failing tests**

Create `app/api/whatsapp/__tests__/webhook.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createHmac } from 'crypto'

const APP_SECRET = 'test_secret'
process.env.META_WA_APP_SECRET = APP_SECRET
process.env.META_WA_VERIFY_TOKEN = 'test_verify_token'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [{ id: 'send-uuid' }], error: null }),
      single: vi.fn().mockResolvedValue({ data: { id: 'send-uuid' }, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}))

function makeSignature(body: string): string {
  return 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex')
}

describe('POST /api/whatsapp/webhook', () => {
  it('rejects requests with invalid signature', async () => {
    const { POST } = await import('../webhook/route')
    const body = JSON.stringify({ object: 'whatsapp_business_account' })
    const req = new Request('https://enlista.ai/api/whatsapp/webhook', {
      method: 'POST',
      body,
      headers: { 'x-hub-signature-256': 'sha256=badsignature' },
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('accepts requests with valid signature', async () => {
    const { POST } = await import('../webhook/route')
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] })
    const req = new Request('https://enlista.ai/api/whatsapp/webhook', {
      method: 'POST',
      body,
      headers: { 'x-hub-signature-256': makeSignature(body) },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})

describe('GET /api/whatsapp/webhook (verification)', () => {
  it('responds to Meta verification challenge', async () => {
    const { GET } = await import('../webhook/route')
    const url = 'https://enlista.ai/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token&hub.challenge=challenge123'
    const req = new Request(url)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toBe('challenge123')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- webhook
```
Expected: FAIL.

- [ ] **Step 3: Implement the webhook route**

Create `app/api/whatsapp/webhook/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

const APP_SECRET = process.env.META_WA_APP_SECRET!
const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN!

function verifySignature(body: string, signature: string): boolean {
  const expected = 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex')
  return expected === signature
}

// GET — Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// POST — inbound messages
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const payload = JSON.parse(rawBody)
  const supabase = createClient()

  const messages =
    payload?.entry?.[0]?.changes?.[0]?.value?.messages ?? []

  for (const msg of messages) {
    if (msg.type !== 'text') continue

    const phone = `+${msg.from}`
    const text: string = msg.text?.body ?? ''

    // Opt-out handling
    if (text.trim().toUpperCase() === 'STOP') {
      await supabase.from('outreach_optouts').upsert({ phone }, { onConflict: 'phone' })
      continue
    }

    // Resolve send_id from phone
    const { data: send } = await supabase
      .from('outreach_sends')
      .select('id')
      .eq('phone', phone)
      .single()

    await supabase.from('outreach_replies').insert({
      send_id: send?.id ?? null,
      phone,
      reply_text: text,
    })
  }

  return new NextResponse('OK', { status: 200 })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- webhook
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/whatsapp/webhook/route.ts app/api/whatsapp/__tests__/webhook.test.ts
git commit -m "feat: add WhatsApp inbound webhook with signature verification"
```

---

## Task 9: Signup token attribution

**Files:**
- Create: `app/api/outreach/signup-hook/route.ts`
- Modify: `app/(auth)/auth/AuthForm.tsx`

- [ ] **Step 1: Create the signup attribution API route**

Create `app/api/outreach/signup-hook/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { token, userId } = await req.json()

  if (!token || !userId) {
    return NextResponse.json({ error: 'Missing token or userId' }, { status: 400 })
  }

  // Verify the request comes from an authenticated session
  // and that the userId matches the session user
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Non-fatal — token may not exist in outreach_sends (organic signup)
  await supabase
    .from('outreach_signups')
    .insert({ tracking_token: token, user_id: userId })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Update AuthForm — fix brand name (two locations) + add outreach attribution**

In `app/(auth)/auth/AuthForm.tsx`:

**Fix 1 — toast on line 186:**
Find:
```typescript
toast.success('Account created! Welcome to ListingsLaunch.')
```
Replace with:
```typescript
toast.success('Account created! Welcome to Enlista.')

// Attribute signup to outreach campaign if token present
const outreachToken = typeof window !== 'undefined'
  ? localStorage.getItem('enlista_outreach_token')
  : null
if (outreachToken && data.user?.id) {
  fetch('/api/outreach/signup-hook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: outreachToken, userId: data.user.id }),
  }).then(() => localStorage.removeItem('enlista_outreach_token'))
}
```

**Fix 2 — visible wordmark on line 219:**
Find the JSX wordmark (it looks like):
```tsx
Listings<span style={{ color: '#1D4ED8' }}>Launch</span>
```
Replace with:
```tsx
Enli<span style={{ color: '#1D4ED8' }}>sta</span>
```

- [ ] **Step 3: Persist token from URL to localStorage on auth page**

In `app/(auth)/auth/AuthForm.tsx`, find where the component mounts (look for `useEffect` or add one). Add:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const t = params.get('t')
  if (t) localStorage.setItem('enlista_outreach_token', t)
}, [])
```

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add app/api/outreach/signup-hook/route.ts app/(auth)/auth/AuthForm.tsx
git commit -m "feat: signup token attribution and brand name fix (ListingsLaunch → Enlista)"
```

---

## Task 10: Main sending script

**Files:**
- Create: `scripts/outreach/send.ts`
- Modify: `package.json`

- [ ] **Step 1: Create the sending script**

Create `scripts/outreach/send.ts`:
```typescript
import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { normalizePhone } from '../../lib/outreach/normalize-phone'
import { randomVariant, renderVariant, generateToken } from '../../lib/outreach/variants'
import { sendTemplate, isWhatsAppNumber } from '../../lib/outreach/meta-api'
import { runAnalysis } from '../../lib/outreach/analysis'

// Load env manually for script context
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://enlista.ai'
const BATCH_SIZE = parseInt(process.env.OUTREACH_BATCH_SIZE ?? '100')

/// Dubai business hours: 9am–6pm GST (UTC+4)
// UAE weekend is Fri-Sat (day 5 and 6). Sunday (day 0) IS a work day.
function isWithinSendWindow(): boolean {
  const now = new Date()
  const gst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
  const hour = gst.getHours()
  const day = gst.getDay() // 0=Sun, 5=Fri, 6=Sat
  if (day === 5 || day === 6) return false // No weekends
  return hour >= 9 && hour < 18
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomDelay(): number {
  // 30–90 seconds between sends
  return (30 + Math.floor(Math.random() * 60)) * 1000
}

async function getOptouts(): Promise<Set<string>> {
  const { data } = await supabase.from('outreach_optouts').select('phone')
  return new Set((data ?? []).map((r: { phone: string }) => r.phone))
}

async function getSentPhones(): Promise<Set<string>> {
  const { data } = await supabase.from('outreach_sends').select('phone')
  return new Set((data ?? []).map((r: { phone: string }) => r.phone))
}

async function checkAndRunAnalysis(): Promise<void> {
  // Use count: 'exact' + head: true — result is on the `count` property, not `data`
  const { count: currentCount } = await supabase
    .from('outreach_sends')
    .select('*', { count: 'exact', head: true })

  const { data: metaData } = await supabase
    .from('outreach_meta')
    .select('value')
    .eq('key', 'last_analysis_count')
    .single()

  const lastCount = parseInt(metaData?.value ?? '0')
  const total = currentCount ?? 0

  if (Math.floor(total / 100) > Math.floor(lastCount / 100)) {
    console.log(`\n📊 ${total} sends reached — running analysis...\n`)
    await runAnalysis(supabase)
    await supabase
      .from('outreach_meta')
      .update({ value: String(total) })
      .eq('key', 'last_analysis_count')
  }
}

async function main() {
  if (!isWithinSendWindow()) {
    console.log('Outside Dubai business hours (9am–6pm GST, Mon–Thu). Exiting.')
    process.exit(0)
  }

  const agentsPath = join(process.cwd(), 'scripts/outreach/agents.json')
  const agents: Array<{ name: string; firstName: string; agency: string; whatsapp: string }> =
    JSON.parse(readFileSync(agentsPath, 'utf-8'))

  const optouts = await getOptouts()
  const alreadySent = await getSentPhones()

  const eligible = agents.filter(a => {
    const phone = normalizePhone(`+${a.whatsapp}`)
    if (!phone) return false
    if (optouts.has(phone)) return false
    if (alreadySent.has(phone)) return false
    return true
  })

  console.log(`${eligible.length} eligible agents. Sending up to ${BATCH_SIZE}.`)

  let sent = 0
  let blocked = 0
  const BLOCK_RATE_THRESHOLD = 0.02 // 2%

  for (const agent of eligible.slice(0, BATCH_SIZE)) {
    const phone = normalizePhone(`+${agent.whatsapp}`)!
    const token = generateToken()
    const variant = randomVariant()
    const link = `${BASE_URL}/api/go?t=${token}`

    // Pre-validate: confirm number is on WhatsApp before spending quota
    const isWA = await isWhatsAppNumber(phone)
    if (!isWA) {
      console.warn(`[SKIP] ${phone} — not a WhatsApp number`)
      continue
    }

    // Write to DB before sending
    const { error: dbError } = await supabase.from('outreach_sends').insert({
      agent_name: agent.name,
      agency: agent.agency,
      phone,
      variant,
      tracking_token: token,
    })

    if (dbError) {
      console.warn(`DB error for ${phone}: ${dbError.message}`)
      continue
    }

    // Send via approved Marketing Template
    // Template names must match approved names in Meta Business Manager.
    // Each variant maps to its own approved template.
    const templateMap: Record<string, string> = {
      A1: 'enlista_outreach_a1',
      A2: 'enlista_outreach_a2',
      B1: 'enlista_outreach_b1',
      B2: 'enlista_outreach_b2',
    }
    const result = await sendTemplate(phone, templateMap[variant], [agent.firstName, link])

    if (result.success) {
      sent++
      console.log(`[${sent}/${BATCH_SIZE}] ✓ ${agent.firstName} (${variant}) — ${phone}`)
    } else {
      blocked++
      console.warn(`[FAIL] ${phone}: ${result.error}`)
    }

    // Anti-flagging: check block rate after every 10 sends
    if ((sent + blocked) % 10 === 0 && sent + blocked > 0) {
      const blockRate = blocked / (sent + blocked)
      if (blockRate > BLOCK_RATE_THRESHOLD) {
        console.error(`\n🛑 Block rate ${(blockRate * 100).toFixed(1)}% exceeds 2% threshold. Pausing campaign.`)
        process.exit(1)
      }
    }

    // Anti-flagging: randomized delay between sends
    if (sent < BATCH_SIZE) await sleep(randomDelay())
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${blocked}`)

  await checkAndRunAnalysis()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Install dotenv and tsx**

```bash
npm install --save-dev dotenv tsx
```

- [ ] **Step 3: Add send script to package.json**

```json
"outreach:send": "npx tsx scripts/outreach/send.ts",
"outreach:send:dry": "OUTREACH_BATCH_SIZE=5 npx tsx scripts/outreach/send.ts"
```

- [ ] **Step 4: Dry run (5 messages, confirm no errors before live send)**

```bash
npm run outreach:send:dry
```
Expected: Attempts to send to 5 agents, logs results. Confirm Supabase rows appear in `outreach_sends`.

- [ ] **Step 5: Commit**

```bash
git add scripts/outreach/send.ts package.json package-lock.json
git commit -m "feat: add automated WhatsApp sending script with anti-flagging"
```

---

## Task 11: Analysis library + `/analyze-outreach` skill

**Files:**
- Create: `lib/outreach/analysis.ts`
- Create: `.claude/skills/analyze-outreach.md`

- [ ] **Step 1: Create the analysis query library**

Create `lib/outreach/analysis.ts`:
```typescript
import type { SupabaseClient } from '@supabase/supabase-js'

interface VariantStats {
  variant: string
  sent: number
  replies: number
  clicks: number
  signups: number
  replyRate: string
  clickRate: string
  signupRate: string
}

export async function runAnalysis(supabase: SupabaseClient): Promise<void> {
  // Fetch all data
  const { data: sends } = await supabase.from('outreach_sends').select('id, variant, tracking_token, phone')
  const { data: clicks } = await supabase.from('outreach_clicks').select('tracking_token')
  const { data: replies } = await supabase.from('outreach_replies').select('send_id')
  const { data: signups } = await supabase.from('outreach_signups').select('tracking_token')

  if (!sends || sends.length === 0) {
    console.log('No sends yet.')
    return
  }

  const clickSet = new Set((clicks ?? []).map((c: { tracking_token: string }) => c.tracking_token))
  const replySet = new Set((replies ?? []).filter((r: { send_id: string | null }) => r.send_id).map((r: { send_id: string }) => r.send_id))
  const signupSet = new Set((signups ?? []).map((s: { tracking_token: string }) => s.tracking_token))

  const stats: Record<string, { sent: number; replies: number; clicks: number; signups: number }> = {
    A1: { sent: 0, replies: 0, clicks: 0, signups: 0 },
    A2: { sent: 0, replies: 0, clicks: 0, signups: 0 },
    B1: { sent: 0, replies: 0, clicks: 0, signups: 0 },
    B2: { sent: 0, replies: 0, clicks: 0, signups: 0 },
  }

  for (const send of sends) {
    const s = stats[send.variant]
    if (!s) continue
    s.sent++
    if (clickSet.has(send.tracking_token)) s.clicks++
    if (replySet.has(send.id)) s.replies++
    if (signupSet.has(send.tracking_token)) s.signups++
  }

  const rows: VariantStats[] = Object.entries(stats).map(([variant, s]) => ({
    variant,
    ...s,
    replyRate: s.sent > 0 ? `${((s.replies / s.sent) * 100).toFixed(1)}%` : '—',
    clickRate: s.sent > 0 ? `${((s.clicks / s.sent) * 100).toFixed(1)}%` : '—',
    signupRate: s.sent > 0 ? `${((s.signups / s.sent) * 100).toFixed(1)}%` : '—',
  }))

  // Sort by signup rate desc — sort on raw numbers before formatting
  const rawSignupRate = (s: { sent: number; signups: number }) =>
    s.sent > 0 ? s.signups / s.sent : 0

  const variantOrder = Object.entries(stats).sort(
    ([, a], [, b]) => rawSignupRate(b) - rawSignupRate(a)
  ).map(([v]) => v)

  rows.sort((a, b) => variantOrder.indexOf(a.variant) - variantOrder.indexOf(b.variant))

  const total = sends.length
  const cohort = Math.floor(total / 100)

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  ENLISTA OUTREACH ANALYSIS — Cohort ${cohort} (${total} total sends)`)
  console.log(`${'─'.repeat(60)}`)
  console.log(`  ${'Variant'.padEnd(8)} ${'Sent'.padEnd(6)} ${'Replies'.padEnd(9)} ${'Clicks'.padEnd(8)} ${'Signups'.padEnd(9)} Reply%  Click%  Signup%`)
  console.log(`  ${'─'.repeat(58)}`)

  for (const r of rows) {
    console.log(
      `  ${r.variant.padEnd(8)} ${String(r.sent).padEnd(6)} ${String(r.replies).padEnd(9)} ${String(r.clicks).padEnd(8)} ${String(r.signups).padEnd(9)} ${r.replyRate.padEnd(8)} ${r.clickRate.padEnd(8)} ${r.signupRate}`
    )
  }

  console.log(`${'─'.repeat(60)}`)

  const winner = rows[0]
  const loser = rows[rows.length - 1]

  console.log(`\n  🏆 Leader: ${winner.variant} (${winner.signupRate} signup rate)`)

  if (total >= 200) {
    const winnerPct = parseFloat(winner.signupRate)
    const loserPct = parseFloat(loser.signupRate)
    if (winnerPct > 0 && loserPct < winnerPct / 2) {
      console.log(`  ⚠️  Consider pausing ${loser.variant} — signup rate is less than half of leader`)
    }
  } else {
    console.log(`  ℹ️  Directional data only — need ${200 - total} more sends for reliable comparison`)
  }

  console.log()

  // Save report
  const { writeFileSync, mkdirSync } = await import('fs')
  const { join } = await import('path')
  const date = new Date().toISOString().slice(0, 10)
  const dir = join(process.cwd(), 'docs/outreach/reports')
  mkdirSync(dir, { recursive: true })
  const reportPath = join(dir, `${date}-cohort-${cohort}.md`)
  const report = `# Outreach Analysis — Cohort ${cohort}\n**Date:** ${date}\n**Total sends:** ${total}\n\n| Variant | Sent | Replies | Clicks | Signups | Reply% | Click% | Signup% |\n|---|---|---|---|---|---|---|---|\n${rows.map(r => `| ${r.variant} | ${r.sent} | ${r.replies} | ${r.clicks} | ${r.signups} | ${r.replyRate} | ${r.clickRate} | ${r.signupRate} |`).join('\n')}\n\n**Leader:** ${winner.variant} — ${winner.signupRate} signup rate\n`
  writeFileSync(reportPath, report)
  console.log(`  Report saved to ${reportPath}\n`)
}
```

- [ ] **Step 2: Create the Claude Code skill**

Create `.claude/skills/analyze-outreach.md`:
```markdown
---
name: analyze-outreach
description: Run the Enlista WhatsApp outreach A/B analysis. Queries Supabase and prints a ranked report of all 4 variants by reply rate, click rate, and signup rate.
---

Run the outreach analysis:

1. Use the Bash tool to run:
   \`\`\`bash
   npx tsx -e "
   import { createClient } from '@supabase/supabase-js';
   import { runAnalysis } from './lib/outreach/analysis';
   import 'dotenv/config';
   const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
   runAnalysis(sb).catch(console.error);
   "
   \`\`\`

2. The report is printed to the terminal and saved to `docs/outreach/reports/`.

3. If a variant is flagged for pausing, report it clearly to the user and ask whether to update `OUTREACH_PAUSED_VARIANTS` in `.env.local`.
```

- [ ] **Step 3: Create dedicated analyze script**

Create `scripts/outreach/analyze.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { runAnalysis } from '../../lib/outreach/analysis'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

runAnalysis(supabase).catch(err => {
  console.error(err)
  process.exit(1)
})
```

Add to `package.json` scripts:
```json
"outreach:analyze": "npx tsx scripts/outreach/analyze.ts"
```

- [ ] **Step 4: Commit**

```bash
git add lib/outreach/analysis.ts .claude/skills/analyze-outreach.md package.json
git commit -m "feat: add outreach analysis library and /analyze-outreach skill"
```

---

## Task 12: Site changes — 7-day trial copy + brand name

**Files:**
- Modify: `app/(auth)/auth/AuthForm.tsx` (already done in Task 9 for brand name)
- Search and update all remaining "14-day" → "7-day" references

- [ ] **Step 1: Find all 14-day references**

```bash
grep -r "14.day\|14-day\|14 day\|fourteen" app/ components/ lib/ public/ --include="*.tsx" --include="*.ts" --include="*.html" -l
```

- [ ] **Step 2: Update each file found**

Replace all instances of "14-day free trial" → "7-day free trial" and "14 days" → "7 days" in each file returned.

- [ ] **Step 3: Find remaining ListingsLaunch brand references**

```bash
grep -r "ListingsLaunch\|ListingAI\|Listara" app/ components/ lib/ --include="*.tsx" --include="*.ts" -l
```

- [ ] **Step 4: Update brand name in each file found**

Replace all instances with "Enlista".

- [ ] **Step 5: Run typecheck and lint**

```bash
npm run typecheck && npm run lint
```
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: update trial to 7-day/3-listing cap, fix brand name to Enlista site-wide"
```

---

## Task 13: Final integration check

- [ ] **Step 1: Run all tests**

```bash
npm test
```
Expected: All tests PASS.

- [ ] **Step 2: Run typecheck and lint**

```bash
npm run typecheck && npm run lint
```
Expected: No errors.

- [ ] **Step 3: Dry-run the sending script (5 messages)**

```bash
npm run outreach:send:dry
```
Confirm: 5 rows appear in `outreach_sends` in Supabase, variant distribution looks random.

- [ ] **Step 4: Test the click redirect**

Visit `http://localhost:3000/api/go?t=FAKE_TOKEN` — should redirect to `/auth?t=FAKE_TOKEN`. Confirm no 500 errors.

- [ ] **Step 5: Test the webhook verification endpoint**

```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=testchallenge"
```
Expected: `testchallenge` returned with 200.

- [ ] **Step 6: Run analysis with empty data**

```bash
npm run outreach:analyze
```
Expected: "No sends yet." — no crash.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: WhatsApp outreach A/B testing system complete"
```

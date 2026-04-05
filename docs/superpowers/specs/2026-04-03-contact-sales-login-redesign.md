# Contact Sales & Login Redesign

**Date:** 2026-04-03
**Status:** Draft

## Summary

Shift Enlista from self-serve individual agent signups to agency-focused B2B sales. Replace the public signup flow with a "Contact Sales" form, simplify the auth page to login-only, and update all homepage CTAs accordingly.

## Goals

- Remove self-serve signup as the primary conversion path
- Add a Contact Sales form that captures agency leads and emails them to nazir@enlista.io
- Store leads in the database for tracking
- Keep signup accessible via direct URL (`/auth?tab=signup`) for post-sale onboarding
- Simplify the login page to email + password only

## Non-Goals

- Phone-based login (future consideration)
- Admin dashboard for leads (can be added later)
- Changes to the dashboard or post-login experience
- Changes to Stripe/subscription flow

---

## 1. Homepage Changes

### Header Navigation

| Current | New |
|---------|-----|
| "Sign in" (text link → `#cta`) | "Login" (text link → `/auth`) |
| "Get Started Free" (blue button → `#cta`) | "Contact Sales" (blue button → `/contact-sales`) |

### Hero Section

| Current | New |
|---------|-----|
| "Start Free — 7 days" (primary CTA) | "Contact Sales" (single primary CTA → `/contact-sales`) |
| "See the platform" (secondary CTA) | Removed |

### Other CTAs

All instances of "Get Started", "Start Free", "Sign Up" throughout the homepage must be updated to route to `/contact-sales`.

---

## 2. Contact Sales Page

**Route:** `/contact-sales`
**File:** `app/(public)/contact-sales/page.tsx`
**Auth required:** No (public page)

### Page Design

- White card on the site background (#F2F4F7)
- Centered form, max-width 560px
- Heading: "Get Enlista for Your Agency"
- Subheading: "Tell us about your agency and we'll be in touch within 24 hours."
- Follows Enlista theme: Inter font, #1D4ED8 primary blue, #1E293B text, #DDE3EC borders

### Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | text input | Yes | Grid row with Last Name |
| Last Name | text input | Yes | Grid row with First Name |
| Contact Email | email input | Yes | Full width |
| Contact Number | tel input | Yes | Full width |
| Agency Name | text input | Yes | Full width |
| Number of Employees | select dropdown | Yes | Options: 1–5, 6–15, 16–50, 51–100, 100+ |
| Location | text input | Yes | Grid row with Employee count |
| Focus Area | chip multi-select | Yes | Options: Leasing, Sales, Off-Plan, All of the Above. "All of the Above" deselects others and vice versa. |
| Message | textarea | No | Placeholder: "Tell us about your needs..." |

### Input Styling

- White background (#FFFFFF) for card and all inputs
- Dark labels (#1E293B, 13px, font-weight 500)
- Light grey placeholders (#94A3B8)
- Border: #DDE3EC, 8px radius
- Focus state: blue border (#1D4ED8) with subtle blue ring

### Submit Button

- Full width, #1D4ED8 background, white text, 8px radius
- Label: "Submit"

### Success State

- Replace form with a success message: "Thank you! We'll be in touch within 24 hours."
- Show a "Back to Home" link

### Validation

- Client-side: all required fields filled, valid email format, valid phone format
- Server-side: same validations repeated in the API route
- Focus area: at least one option selected

---

## 3. Contact Sales API

**Route:** `POST /api/contact-sales`
**File:** `app/api/contact-sales/route.ts`
**Auth required:** No (public endpoint)

### Request Body

```typescript
{
  firstName: string
  lastName: string
  email: string
  phone: string
  agencyName: string
  employeeCount: string  // "1-5" | "6-15" | "16-50" | "51-100" | "100+"
  location: string
  focusArea: string[]    // ["leasing", "sales", "off-plan"] or ["all"]
  message?: string
}
```

### Flow

1. Validate all required fields server-side
2. Insert into `contact_leads` table via Supabase admin client
3. Send branded HTML email to nazir@enlista.io via Resend
4. Return `{ success: true }` or `{ error: string }`

### Rate Limiting

Basic protection: reject if same email submitted within the last 5 minutes (check DB).

---

## 4. Database: `contact_leads` Table

**Migration file:** `supabase/migrations/XXX_contact_leads.sql`

```sql
CREATE TABLE contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  location TEXT NOT NULL,
  focus_area TEXT[] NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- `status` values: `new`, `contacted`, `converted`
- No RLS needed — only accessed via admin/service role
- No foreign keys — these are pre-signup leads, not linked to auth users

---

## 5. Lead Notification Email

**Sent via:** Resend
**To:** nazir@enlista.io
**From:** Enlista <hello@enlista.ai>
**Subject:** "New Agency Lead: {Agency Name}"

### Email Content (branded HTML)

- Enlista header/logo
- Lead details in a clean table/card layout:
  - Name, Email, Phone
  - Agency Name, Employees, Location
  - Focus Area
  - Message (if provided)
- Timestamp of submission
- Styled consistently with existing Enlista emails (blue primary, clean layout)

---

## 6. Auth Page Changes

**File:** `app/(auth)/auth/AuthForm.tsx`

### Default Behavior Change

- When navigating to `/auth` (no tab parameter), show login form only — no signup tab visible
- When navigating to `/auth?tab=signup`, show the full signup form as it exists today (hidden but functional for direct links you send to agencies)

### Login Form Updates

- Heading: "Welcome Back"
- Subheading: "Sign in to your agency account"
- Fields: Email + Password only (no change to current login fields)
- White card background, white inputs, same styling as Contact Sales form
- Below the sign-in button: "Don't have an account? **Contact Sales**" (link to `/contact-sales`)

### Route Changes

- `/signup` redirect page — update to redirect to `/contact-sales` instead of `/auth?tab=signup`
- `/login` redirect page — keep as-is (redirects to `/auth?tab=signin`)

---

## 7. Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `app/(public)/contact-sales/page.tsx` | Contact Sales form page |
| `app/api/contact-sales/route.ts` | Form submission API |
| `supabase/migrations/XXX_contact_leads.sql` | Database table |

### Modified Files

| File | Changes |
|------|---------|
| `app/home/page.tsx` | Header buttons, hero CTA, any other signup CTAs |
| `app/(auth)/auth/AuthForm.tsx` | Hide signup tab by default, update login UI, add Contact Sales link |
| `app/(auth)/signup/page.tsx` | Redirect to `/contact-sales` instead of `/auth?tab=signup` |
| `lib/email/resend.ts` | Add `contact_lead` email template |

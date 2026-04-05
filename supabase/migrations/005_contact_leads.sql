-- 005_contact_leads.sql
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

-- Index for rate-limiting check (recent submissions by email)
CREATE INDEX idx_contact_leads_email_created ON contact_leads (email, created_at DESC);

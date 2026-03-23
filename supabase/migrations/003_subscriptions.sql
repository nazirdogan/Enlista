create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade not null,
  plan text not null, -- solo | boutique | agency
  plan_amount integer not null, -- AED, stored at creation to survive price changes
  status text not null default 'trialing', -- trialing | active | past_due | cancelled
  stripe_customer_id text,
  stripe_subscription_id text unique,
  started_at timestamptz default now(),
  cancelled_at timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table subscriptions enable row level security;
-- No user-facing policies — admin reads via service role key only

create table email_events (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete set null,
  email_type text not null, -- welcome | trial_expiry | payment_failed | subscription_confirmed
  recipient text not null,
  status text not null default 'sent', -- sent | delivered | bounced | complained
  resend_id text unique,
  sent_at timestamptz default now()
);
alter table email_events enable row level security;
-- No user-facing policies

create table admin_cache (
  key text primary key,
  value text not null,
  cached_at timestamptz default now(),
  expires_at timestamptz not null
);
alter table admin_cache enable row level security;
-- No user-facing policies

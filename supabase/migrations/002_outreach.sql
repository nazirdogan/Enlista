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

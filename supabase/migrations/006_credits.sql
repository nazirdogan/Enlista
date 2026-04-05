-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: Credit-based pricing system
--
-- New plans: free (1 credit/mo) | plus (5/mo, $25) | pro (15/mo, $40) | enterprise
-- Extra credits: purchasable in packs, don't reset monthly
-- Credits are consumed at generation time, not save time
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add plan + credit columns to agencies
alter table agencies
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'plus', 'pro', 'enterprise')),
  add column if not exists credits_remaining integer not null default 1,
  add column if not exists extra_credits integer not null default 0,
  add column if not exists credits_reset_at timestamptz default now();

-- 2. Migrate existing paid users (is_trial = false) to 'pro' plan
--    so they aren't locked out. Real plan can be reconciled via Stripe data.
update agencies
set
  plan = 'pro',
  credits_remaining = 15,
  credits_reset_at = now()
where is_trial = false;

-- 3. Set free plan limits for remaining trial accounts
update agencies
set
  plan = 'free',
  credits_remaining = 1,
  credits_reset_at = now()
where is_trial = true;

-- 4. Helper function: credit limit per plan
create or replace function get_plan_credit_limit(plan_name text)
returns integer as $$
begin
  case plan_name
    when 'free'       then return 1;
    when 'plus'       then return 5;
    when 'pro'        then return 15;
    when 'enterprise' then return 9999;
    else                   return 1;
  end case;
end;
$$ language plpgsql immutable;

-- 5. Drop old trial listing trigger and replace with credit-based enforcement
drop trigger if exists enforce_trial_listing_limit on listings;
drop function if exists check_trial_listing_limit();

-- 6. Credit enforcement trigger (safety net — primary check is in the API)
create or replace function check_credit_limit()
returns trigger as $$
declare
  ag record;
  total_credits integer;
begin
  select plan, credits_remaining, extra_credits, credits_reset_at
  into ag
  from agencies
  where user_id = new.user_id
  limit 1;

  if not found then
    return new; -- no agency row yet, allow (signup flow)
  end if;

  -- Auto-reset if the reset date is from a previous calendar month
  if ag.credits_reset_at is null or
     date_trunc('month', ag.credits_reset_at) < date_trunc('month', now()) then
    update agencies
    set
      credits_remaining = get_plan_credit_limit(ag.plan),
      credits_reset_at  = now()
    where user_id = new.user_id;
    ag.credits_remaining := get_plan_credit_limit(ag.plan);
  end if;

  total_credits := ag.credits_remaining + ag.extra_credits;

  if total_credits <= 0 then
    raise exception 'No listing credits remaining. Purchase more credits or upgrade your plan.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger enforce_credit_limit
  before insert on listings
  for each row execute function check_credit_limit();

-- 7. Update the subscriptions plan constraint to include new plan names
alter table subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'plus', 'pro', 'enterprise', 'solo', 'boutique', 'agency'));
  -- keeping old values so existing rows don't break

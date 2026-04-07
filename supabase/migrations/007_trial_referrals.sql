-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Trial status, referral codes, and referrals table
--
-- Adds account_status lifecycle, trial_ends_at, referral code generation,
-- referred_by linkage, listing_credits, and a referrals tracking table.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add new columns to agencies
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'trial'
    CHECK (account_status IN ('trial', 'trial_expired', 'active', 'cancelled')),
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_agency_id uuid REFERENCES agencies(id),
  ADD COLUMN IF NOT EXISTS listing_credits integer NOT NULL DEFAULT 0;

-- 2. Backfill trial_ends_at for all rows
UPDATE agencies
SET trial_ends_at = COALESCE(trial_started_at, created_at) + INTERVAL '30 days';

-- 3. Backfill account_status and subscribed_at for active (non-trial) users
UPDATE agencies
SET
  account_status = 'active',
  subscribed_at  = created_at
WHERE is_trial = false;

-- 4. Backfill account_status for trial rows based on whether trial has expired
UPDATE agencies
SET account_status = CASE
  WHEN trial_ends_at < NOW() THEN 'trial_expired'
  ELSE 'trial'
END
WHERE is_trial = true;

-- 5. Referral code generation function (BEFORE INSERT trigger)
CREATE OR REPLACE FUNCTION set_referral_code_on_insert()
RETURNS trigger AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code  text;
  i     int;
BEGIN
  IF new.referral_code IS NULL THEN
    LOOP
      code := 'ENL-';
      FOR i IN 1..5 LOOP
        code := code || substr(chars, floor(random() * 36 + 1)::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM agencies WHERE referral_code = code);
    END LOOP;
    new.referral_code := code;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql VOLATILE;

DROP TRIGGER IF EXISTS set_referral_code ON agencies;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON agencies
  FOR EACH ROW EXECUTE FUNCTION set_referral_code_on_insert();

-- 6. Backfill referral codes for existing rows that have none
DO $$
DECLARE
  rec   record;
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code  text;
  i     int;
BEGIN
  FOR rec IN SELECT id FROM agencies WHERE referral_code IS NULL LOOP
    LOOP
      code := 'ENL-';
      FOR i IN 1..5 LOOP
        code := code || substr(chars, floor(random() * 36 + 1)::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM agencies WHERE referral_code = code);
    END LOOP;
    UPDATE agencies SET referral_code = code WHERE id = rec.id;
  END LOOP;
END;
$$;

-- 7. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_agency_id uuid        NOT NULL REFERENCES agencies(id),
  referred_agency_id uuid        NOT NULL REFERENCES agencies(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  converted_at       timestamptz,
  credits_awarded    boolean     NOT NULL DEFAULT false,
  credits_awarded_at timestamptz
);

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_agencies_referral_code ON agencies(referral_code);
CREATE INDEX IF NOT EXISTS idx_agencies_referred_by   ON agencies(referred_by_agency_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer     ON referrals(referrer_agency_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred     ON referrals(referred_agency_id);

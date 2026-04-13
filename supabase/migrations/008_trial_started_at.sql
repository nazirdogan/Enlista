-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008: Add trial_started_at for calculated trial logic
--
-- Adds explicit trial_started_at column to track when a user's 30-day trial
-- began, enabling calculated trial periods when upgrading (remaining days =
-- trial_ends_at - now).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add trial_started_at column
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;

-- 2. Backfill trial_started_at from created_at (all users started trial at signup)
UPDATE agencies
SET trial_started_at = created_at
WHERE trial_started_at IS NULL;

-- 3. Set NOT NULL constraint (after backfill)
ALTER TABLE agencies
  ALTER COLUMN trial_started_at SET NOT NULL;

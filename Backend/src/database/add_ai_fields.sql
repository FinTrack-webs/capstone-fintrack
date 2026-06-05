BEGIN;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS ai_confidence  NUMERIC(5, 4),
  ADD COLUMN IF NOT EXISTS account_type   VARCHAR(10) DEFAULT 'personal';

COMMIT;

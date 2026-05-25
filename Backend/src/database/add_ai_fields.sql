BEGIN;

-- Hanya 2 kolom baru — classification_status sudah ada
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS ai_confidence  NUMERIC(5, 4),
  ADD COLUMN IF NOT EXISTS account_type   VARCHAR(10) DEFAULT 'personal';

-- account_type: 'personal' | 'business' — menentukan model AI yang dipakai

COMMIT;

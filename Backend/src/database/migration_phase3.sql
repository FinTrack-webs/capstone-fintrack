-- ============================================================
-- FinTrack Phase 3 Migration (Email Verification)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom email_verified ke tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- 2. Set true untuk user lama (legacy) agar tidak terkunci saat login
UPDATE users SET email_verified = true WHERE email_verified = false;

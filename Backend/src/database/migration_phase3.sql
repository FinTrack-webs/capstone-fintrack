ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

UPDATE users SET email_verified = true WHERE email_verified = false;
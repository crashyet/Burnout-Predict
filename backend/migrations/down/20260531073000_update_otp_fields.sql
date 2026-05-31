-- Revert OTP column changes
ALTER TABLE users RENAME COLUMN otp TO verification_token;
ALTER TABLE users DROP COLUMN IF EXISTS otp_expiry;

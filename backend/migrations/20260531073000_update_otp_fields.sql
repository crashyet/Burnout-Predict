-- Rename verification_token to otp and add otp_expiry to users table
ALTER TABLE users RENAME COLUMN verification_token TO otp;
ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP;

ALTER TABLE users ADD COLUMN recovery_hash TEXT;
CREATE TABLE auth_attempts (
  bucket TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);
CREATE TRIGGER revoke_sessions_on_password_change
AFTER UPDATE OF password_hash ON users
BEGIN
  DELETE FROM sessions WHERE user_id = NEW.id;
  UPDATE users SET recovery_hash = NULL WHERE id = NEW.id;
END;

-- Atomic per-account daily attempt limits; not a substitute for provider billing limits.
CREATE TABLE IF NOT EXISTS ai_usage (
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  action TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (owner_id, day, action)
);

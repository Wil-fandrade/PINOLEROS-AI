CREATE TABLE creative_references (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  r2_key TEXT NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX creative_references_enabled ON creative_references(enabled, created_at);

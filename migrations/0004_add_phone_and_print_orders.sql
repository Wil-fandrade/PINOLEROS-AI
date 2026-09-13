ALTER TABLE users ADD COLUMN phone TEXT;

CREATE TABLE IF NOT EXISTS print_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  design_id TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_print_orders_user_created ON print_orders(user_id, created_at DESC);

-- PINOLEROS.AI's first persistent resource: a saved design draft.
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'Sin estilo',
  prompt TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at DESC);

-- Initial content lets the first dashboard render useful examples before user accounts exist.
INSERT OR IGNORE INTO designs (id, title, style, prompt) VALUES
  ('sample-urban-vibes', 'Urban Vibes', 'Streetwear', 'Diseño urbano con neón y energía callejera'),
  ('sample-anime-warrior', 'Anime Warrior', 'Anime', 'Guerrero futurista en estilo anime'),
  ('sample-golden-lion', 'Golden Lion', 'Realista', 'León dorado con iluminación dramática'),
  ('sample-skull-graffiti', 'Skull Graffiti', 'Graffiti', 'Calavera colorida sobre mural de graffiti');

-- pgvector extension (already enabled but safe to re-run)
CREATE EXTENSION IF NOT EXISTS vector;

-- Recipes (knowledge base — preloaded recipes to match against)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  embedding VECTOR(512),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Images (user-uploaded images as data assets)
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  embedding VECTOR(512),
  matched_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- HNSW indexes for cosine similarity search
CREATE INDEX IF NOT EXISTS recipes_embedding_idx
  ON recipes USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS images_embedding_idx
  ON images USING hnsw (embedding vector_cosine_ops);

-- RLS: deny all by default. service_role (used by the API) bypasses RLS,
-- so the server keeps full access while anon/authenticated keys are blocked.
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

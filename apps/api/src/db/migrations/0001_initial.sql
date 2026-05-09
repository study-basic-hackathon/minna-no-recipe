-- pgvector extension (already enabled but safe to re-run)
CREATE EXTENSION IF NOT EXISTS vector;

-- Training images (knowledge base — labeled food images used as the
-- vector-search target. Not "recipes" — they are just images per category.)
CREATE TABLE IF NOT EXISTS training_images (
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
  matched_training_image_id UUID REFERENCES training_images(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--Recipes レシピテーブル
CREATE TABLE IF NOT EXISTS recipes (
  recipe_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--Ingredients 材料テーブル
CREATE TABLE IF NOT EXISTS ingredients (
  ingredient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--Steps 手順テーブル
CREATE TABLE IF NOT EXISTS steps (
  step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (recipe_id, step_number)
);

-- HNSW indexes for cosine similarity search
CREATE INDEX IF NOT EXISTS training_images_embedding_idx
  ON training_images USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS images_embedding_idx
  ON images USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS recipes_embedding_idx
  ON recipes USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS ingredients_embedding_idx
  ON ingredients USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS steps_embedding_idx
  ON steps USING hnsw (embedding vector_cosine_ops);

-- RLS: deny all by default. service_role (used by the API) bypasses RLS,
-- so the server keeps full access while anon/authenticated keys are blocked.
ALTER TABLE training_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

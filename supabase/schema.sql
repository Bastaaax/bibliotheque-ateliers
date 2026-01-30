-- Schema SQL pour la Bibliothèque d'Ateliers
-- À exécuter dans Supabase SQL Editor
-- Remplacez TON_EMAIL_ADMIN@example.com par l'email du premier admin

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'contributor')) DEFAULT 'contributor',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.email = 'bboisjot@sgdf.fr' THEN 'admin'
      ELSE 'contributor'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  duration_minutes INTEGER,
  participants_min INTEGER,
  participants_max INTEGER,
  materials JSONB DEFAULT '[]'::jsonb,
  objectives JSONB DEFAULT '[]'::jsonb,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT CHECK (source IN ('manual', 'notion', 'gdrive')) DEFAULT 'manual',
  source_id TEXT,
  source_url TEXT
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('workshop_type', 'stage_type', 'custom')) DEFAULT 'custom',
  color TEXT DEFAULT '#003a5d',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workshop_tags (
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (workshop_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('notion', 'gdrive')) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('contributor')) DEFAULT 'contributor',
  invited_by UUID REFERENCES profiles(id),
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (voir le PRD pour les politiques complètes)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_workshops_creator ON workshops(creator_id);
CREATE INDEX idx_workshops_created_at ON workshops(created_at DESC);
CREATE INDEX idx_workshop_tags_workshop ON workshop_tags(workshop_id);
CREATE INDEX idx_workshop_tags_tag ON workshop_tags(tag_id);
CREATE INDEX idx_attachments_workshop ON attachments(workshop_id);

-- Full-text search
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_workshops_search ON workshops USING GIN(search_vector);

CREATE OR REPLACE FUNCTION search_workshops(search_query TEXT)
RETURNS TABLE (id UUID, title TEXT, description TEXT, rank REAL) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.title, w.description, ts_rank(w.search_vector, query) AS rank
  FROM workshops w, plainto_tsquery('french', search_query) query
  WHERE w.search_vector @@ query
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

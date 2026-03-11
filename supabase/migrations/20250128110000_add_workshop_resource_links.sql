-- Ressources / liens (PPT, doc à imprimer, etc.) pour un atelier
-- Chaque entrée : { "label": "Support PPT", "url": "https://..." }
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS resource_links JSONB DEFAULT '[]'::jsonb;

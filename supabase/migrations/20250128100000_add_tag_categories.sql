-- Catégories de tags (regroupent les tags)
CREATE TABLE IF NOT EXISTS tag_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lier les tags aux catégories
ALTER TABLE tags ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES tag_categories(id) ON DELETE SET NULL;

-- Catégories par défaut
INSERT INTO tag_categories (id, name, sort_order) VALUES
  (uuid_generate_v4(), 'Type d''atelier', 0),
  (uuid_generate_v4(), 'Type de stage', 1),
  (uuid_generate_v4(), 'Autre', 2)
ON CONFLICT (name) DO NOTHING;

-- Rattacher les tags existants aux catégories (si category existe encore)
DO $$
DECLARE
  cat_workshop_id UUID;
  cat_stage_id UUID;
  cat_other_id UUID;
BEGIN
  SELECT id INTO cat_workshop_id FROM tag_categories WHERE name = 'Type d''atelier' LIMIT 1;
  SELECT id INTO cat_stage_id FROM tag_categories WHERE name = 'Type de stage' LIMIT 1;
  SELECT id INTO cat_other_id FROM tag_categories WHERE name = 'Autre' LIMIT 1;
  IF cat_workshop_id IS NOT NULL THEN
    UPDATE tags SET category_id = cat_workshop_id WHERE category = 'workshop_type';
  END IF;
  IF cat_stage_id IS NOT NULL THEN
    UPDATE tags SET category_id = cat_stage_id WHERE category = 'stage_type';
  END IF;
  IF cat_other_id IS NOT NULL THEN
    UPDATE tags SET category_id = cat_other_id WHERE category = 'custom';
  END IF;
END $$;

-- RLS pour tag_categories
ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tag categories are viewable by authenticated users"
  ON tag_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can insert tag categories"
  ON tag_categories FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can update tag categories"
  ON tag_categories FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can delete tag categories"
  ON tag_categories FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

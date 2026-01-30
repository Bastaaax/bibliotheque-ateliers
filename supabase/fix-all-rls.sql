-- À exécuter dans Supabase > SQL Editor > New query
-- Crée toutes les policies RLS pour que l'app fonctionne (évite 403)

-- ========== PROFILES ==========
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ========== WORKSHOPS ==========
DROP POLICY IF EXISTS "Workshops are viewable by authenticated users" ON workshops;
DROP POLICY IF EXISTS "Users can insert their own workshops" ON workshops;
DROP POLICY IF EXISTS "Users can update their own workshops" ON workshops;
DROP POLICY IF EXISTS "Users can delete their own workshops" ON workshops;

CREATE POLICY "Workshops are viewable by authenticated users"
  ON workshops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own workshops"
  ON workshops FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own workshops"
  ON workshops FOR UPDATE TO authenticated
  USING (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can delete their own workshops"
  ON workshops FOR DELETE TO authenticated
  USING (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ========== TAGS ==========
DROP POLICY IF EXISTS "Tags are viewable by authenticated users" ON tags;
DROP POLICY IF EXISTS "Only admins can insert tags" ON tags;
DROP POLICY IF EXISTS "Only admins can update tags" ON tags;
DROP POLICY IF EXISTS "Only admins can delete tags" ON tags;

CREATE POLICY "Tags are viewable by authenticated users"
  ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can insert tags"
  ON tags FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can update tags"
  ON tags FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can delete tags"
  ON tags FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ========== WORKSHOP_TAGS ==========
DROP POLICY IF EXISTS "Workshop tags are viewable by authenticated users" ON workshop_tags;
DROP POLICY IF EXISTS "Users can manage tags for their workshops" ON workshop_tags;

CREATE POLICY "Workshop tags are viewable by authenticated users"
  ON workshop_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage tags for their workshops"
  ON workshop_tags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workshops w
      WHERE w.id = workshop_tags.workshop_id
      AND (w.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workshops w
      WHERE w.id = workshop_tags.workshop_id
      AND (w.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ========== ATTACHMENTS ==========
DROP POLICY IF EXISTS "Attachments are viewable by authenticated users" ON attachments;
DROP POLICY IF EXISTS "Users can manage attachments for their workshops" ON attachments;

CREATE POLICY "Attachments are viewable by authenticated users"
  ON attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage attachments for their workshops"
  ON attachments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workshops w
      WHERE w.id = attachments.workshop_id
      AND (w.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workshops w
      WHERE w.id = attachments.workshop_id
      AND (w.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ========== INTEGRATIONS ==========
DROP POLICY IF EXISTS "Users can view their own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can manage their own integrations" ON integrations;

CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own integrations"
  ON integrations FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ========== INVITATIONS ==========
DROP POLICY IF EXISTS "Only admins can view invitations" ON invitations;
DROP POLICY IF EXISTS "Only admins can manage invitations" ON invitations;

CREATE POLICY "Only admins can view invitations"
  ON invitations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can manage invitations"
  ON invitations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

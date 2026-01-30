-- À exécuter dans Supabase > SQL Editor > New query
-- Corrige les policies RLS pour la table profiles (évite 403 / "violates row-level security")

-- 1. Supprimer les anciennes policies profiles (au cas où)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. Recréer les policies
-- Tout le monde (authentifié) peut LIRE les profils
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Chacun peut MODIFIER son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Chacun peut CRÉER son propre profil (id = son user id)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies Storage pour la Bibliothèque d'Ateliers
-- À exécuter dans Supabase > SQL Editor **après** avoir créé les buckets
-- (workshop-attachments et avatars) dans Storage > New bucket.

-- ========== Bucket workshop-attachments ==========

-- 1. Les utilisateurs connectés peuvent déposer des fichiers
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workshop-attachments');

-- 2. Les utilisateurs connectés peuvent voir/télécharger les fichiers
CREATE POLICY "Attachments are viewable by authenticated users"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workshop-attachments');

-- 3. L'auteur du fichier ou un admin peut supprimer
CREATE POLICY "Users can delete their workshop attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'workshop-attachments'
  AND (
    auth.uid() = owner
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- ========== Bucket avatars ==========

-- 1. Les utilisateurs connectés peuvent déposer leur avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Tout le monde peut voir les avatars (bucket public)
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 3. Chacun peut mettre à jour/supprimer son propre dossier
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

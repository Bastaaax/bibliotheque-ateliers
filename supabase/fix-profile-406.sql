-- Créer le profil manquant pour éviter l'erreur 406
-- À exécuter dans Supabase > SQL Editor
-- Remplace TON_EMAIL par ton email de connexion

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '2d55a723-a4c7-4d1b-84ea-13f0e3c8655e'::uuid,
  'TON_EMAIL',  -- ← remplace par ton email (ex: bastien@exemple.fr)
  NULL,         -- ou ton nom si tu veux
  'contributor'
)
ON CONFLICT (id) DO NOTHING;

-- Donner le rôle admin à un utilisateur (à exécuter dans Supabase SQL Editor)
-- Choisir UNE des deux méthodes ci-dessous.

-- Méthode 1 : par email (remplacer par ton email de connexion)
UPDATE profiles
SET role = 'admin'
WHERE email = 'ton@email.com';

-- Méthode 2 : par id (récupérer l'id dans Authentication > Users, puis coller ici)
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = 'uuid-de-ton-utilisateur';

-- Vérifier le résultat :
-- SELECT id, email, full_name, role FROM profiles WHERE role = 'admin';

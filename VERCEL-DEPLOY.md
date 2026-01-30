# Déployer sur Vercel

## 1. Connexion à Vercel

1. Va sur [vercel.com](https://vercel.com) et connecte-toi (ou crée un compte).
2. Choisis **« Sign in with GitHub »** pour lier ton compte GitHub.

## 2. Importer le projet

1. Sur le tableau de bord Vercel, clique sur **« Add New… »** → **« Project »**.
2. Dans la liste des dépôts GitHub, trouve **bibliotheque-ateliers** (ou ton repo).
3. Clique sur **« Import »** à côté.

## 3. Configuration du projet

Vercel détecte automatiquement un projet Vite (Framework Preset: **Vite**, Build Command: **npm run build**, Output Directory: **dist**). Tu peux laisser tel quel.

**Important :** ajoute les variables d’environnement pour Supabase :

1. Dans la page de configuration, ouvre la section **« Environment Variables »**.
2. Ajoute :

   | Name                  | Value                    |
   |-----------------------|--------------------------|
   | `VITE_SUPABASE_URL`   | L’URL de ton projet Supabase |
   | `VITE_SUPABASE_ANON_KEY` | La clé **anon** / **public** de Supabase |

   (Tu les trouves dans Supabase : **Project Settings** → **API**.)

3. Coche **Production**, **Preview** et **Development** pour chaque variable.
4. Clique sur **« Deploy »**.

## 4. Après le déploiement

- Vercel te donne une URL du type `bibliotheque-ateliers-xxx.vercel.app`.
- À chaque `git push` sur la branche connectée (souvent `main`), Vercel redéploie automatiquement.
- Tu peux ajouter un nom de domaine personnalisé dans **Project** → **Settings** → **Domains**.

## Rappel

Sans `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sur Vercel, l’app s’affichera mais la connexion et les données ne fonctionneront pas. Pense à les configurer avant ou juste après le premier déploiement.

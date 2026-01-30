# Bibliothèque d'Ateliers

Application web de gestion de fiches d'ateliers de formation : import, création, organisation et partage avec un système de tags.

## Stack

- **Frontend** : React 18, TypeScript, Vite
- **UI** : TailwindCSS, Shadcn/ui
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **État** : TanStack Query, React Hook Form, Zod
- **Éditeur** : TipTap

## Prérequis

- Node.js 18 ou plus
- Un projet [Supabase](https://supabase.com)

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/TON_USERNAME/workshop-library.git
cd workshop-library

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec ton VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécuter le script `supabase/schema.sql` (remplacer l’email admin dans le trigger si besoin).
3. Créer les buckets Storage `workshop-attachments` et `avatars` (voir `supabase/GUIDE-STORAGE.md`).
4. Exécuter `supabase/storage-policies.sql` après création des buckets.

## Lancer le projet

```bash
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualiser le build
- `npm run lint` — linter

## Licence

Projet privé / usage interne.

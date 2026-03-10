# Checklist : voir les changements en local et en prod

## En local

1. **Ouvre le bon dossier**  
   Le projet doit être `mon-projet` (celui qui contient `src/`, `package.json`, `vite.config.ts`).

2. **Installe les dépendances** (si besoin)
   ```bash
   cd /chemin/vers/mon-projet
   npm install
   ```

3. **Lance le serveur de dev**
   ```bash
   npm run dev
   ```

4. **Ouvre l’app**  
   Dans le navigateur : l’URL indiquée (souvent `http://localhost:5173`).

5. **Force le rechargement**  
   Pour éviter le cache : **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac), ou onglet « Application » → Vider le cache.

**Où voir les changements :**
- **Intégrations** : menu → Intégrations → tu dois voir le bandeau « Google Drive et Notion sont en pause » (plus les cartes de connexion).
- **Ateliers** : créer ou modifier un atelier → champ « Emoji » + éditeur avec barre (tableaux, couleurs, surlignage).
- **Carte atelier** : si un atelier a un emoji, il s’affiche à côté du titre.

---

## En production

1. **Build**
   ```bash
   cd /chemin/vers/mon-projet
   npm run build
   ```

2. **Déploiement**  
   Selon ta plateforme (Vercel, Netlify, autre) :
   - soit **push Git** si le déploiement est automatique ;
   - soit **upload du dossier `dist/`** (ou import du dépôt) après `npm run build`.

3. **Base de données (Supabase prod)**  
   Pour l’emoji sur les ateliers, exécute dans le **SQL Editor** du projet Supabase de prod :
   ```sql
   ALTER TABLE workshops ADD COLUMN IF NOT EXISTS icon TEXT;
   ```

4. **Cache / CDN**  
   Après déploiement : rechargement forcé (Ctrl+Shift+R) ou attente de l’expiration du cache.

---

## Vérifier que c’est la bonne version

- **Intégrations** : si tu vois encore « Connectez Notion ou Google Drive » et les boutons de connexion, c’est l’ancienne version.
- **Nouvelle version** : page Intégrations = uniquement le titre « Intégrations » + bandeau ambre « Google Drive et Notion sont en pause ».

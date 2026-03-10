# Lancer le projet (depuis le terminal)

Guide pas à pas pour démarrer la Bibliothèque d’Ateliers en local.

---

## 1. Ouvrir un terminal

- **Sur Mac** : `Terminal` ou `iTerm`, ou dans Cursor : **Terminal** → **Nouveau terminal**.
- Tu dois pouvoir taper des commandes (prompt du type `bastax@... %` ou `$`).

---

## 2. Aller dans le dossier du projet

Tape (ou copie-colle) :

```bash
cd /Users/bastax/mon-projet
```

Appuie sur **Entrée**. Tu es maintenant dans le dossier du projet.

---

## 3. Vérifier Node.js (optionnel)

Le projet demande **Node.js 18 ou plus**. Vérifie :

```bash
node --version
```

Tu dois voir un numéro du type `v18.x.x` ou `v20.x.x`. Si tu as une erreur ou une version trop ancienne, installe une version récente depuis [nodejs.org](https://nodejs.org).

---

## 4. Installer les dépendances (première fois seulement)

Si tu n’as jamais lancé le projet sur cette machine, installe les paquets :

```bash
npm install
```

Attends la fin (peut prendre 1–2 minutes). À faire une seule fois (ou après un `git pull` qui modifie `package.json`).

---

## 5. Vérifier le fichier `.env.local`

Le projet a besoin de variables d’environnement pour Supabase (et optionnellement Google Drive).

- Vérifie qu’il existe un fichier **`.env.local`** à la racine du projet (à côté de `package.json`).
- S’il n’existe pas : copie **`.env.local.example`** et renomme la copie en **`.env.local`**.
- Ouvre **`.env.local`** et vérifie qu’il contient au moins :

```env
VITE_SUPABASE_URL=https://dqkrfhmpvsbvhnkofvni.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_cr8A1DIpZvAbKdudOklclQ_2_nQgDiw
```

(Si tu utilises un autre projet Supabase, remplace par ton URL et ta clé.)

Optionnel (pour Google Drive) :

```env
VITE_GOOGLE_CLIENT_ID=589176853780-e2psp7lbb1mi4n1745elo86n3mtuhv6o.apps.googleusercontent.com
```

Sauvegarde le fichier puis ferme-le.

---

## 6. Lancer l’application

Dans le même terminal (toujours dans `/Users/bastax/mon-projet`) :

```bash
npm run dev
```

Tu dois voir quelque chose comme :

```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

---

## 7. Ouvrir l’app dans le navigateur

- Ouvre ton navigateur (Chrome, Firefox, Safari, etc.).
- Va à l’adresse : **http://localhost:5173**
- Tu dois voir la page de connexion (ou le tableau de bord si tu es déjà connecté).

Pour arrêter le serveur : dans le terminal, appuie sur **Ctrl+C**.

---

## Récap des commandes (dans l’ordre)

```bash
cd /Users/bastax/mon-projet
npm install
npm run dev
```

Puis ouvre **http://localhost:5173** dans le navigateur.

---

## En cas de problème

- **« command not found: npm »** → Node.js n’est pas installé ou pas dans le PATH. Installe Node.js depuis [nodejs.org](https://nodejs.org).
- **« supabaseUrl is required »** ou page blanche → vérifie que **`.env.local`** existe, contient `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, et **redémarre** le serveur (Ctrl+C puis `npm run dev`).
- **Le port 5173 est déjà utilisé** → Vite proposera un autre port (ex. 5174) ; utilise l’URL affichée dans le terminal.

# Guide pas à pas : connecter Google Drive à ta plateforme

Ce guide te mène du début à la fin, sans rien supposer. Tu auras besoin de :
- un compte Google (Gmail) ;
- ton projet Supabase (l’URL que tu as dans `.env.local` : `VITE_SUPABASE_URL`) ;
- environ 15–20 minutes.

---

## Étape 0 : récupérer l’URL de ton projet Supabase

1. Ouvre ton fichier **`.env.local`** à la racine du projet (ou copie depuis **`.env.local.example`**).
2. Repère la ligne qui commence par **`VITE_SUPABASE_URL=`**.
3. La valeur ressemble à : `https://abcdefghijk.supabase.co`
4. La partie **entre `https://` et `.supabase.co`** s’appelle le **« project ref »** (ex. `abcdefghijk`).
5. **Note-la** quelque part (ex. : `abcdefghijk`) — tu en auras besoin pour l’URI de redirection Google.

Si tu n’as pas encore de projet Supabase : va sur [supabase.com](https://supabase.com), crée un compte, crée un projet, puis récupère l’URL du projet dans **Settings > API** (Project URL).

---

## Partie 1 : Google Cloud (créer le projet et les identifiants OAuth)

### 1.1 Aller sur Google Cloud Console

1. Ouvre ton navigateur et va sur : **https://console.cloud.google.com/**
2. Connecte-toi avec ton compte Google (Gmail) si ce n’est pas déjà fait.

### 1.2 Créer un nouveau projet

1. En haut de la page, à gauche du logo Google Cloud, tu vois le **nom du projet actuel** (ou « Sélectionner un projet »).
2. Clique dessus.
3. Dans la fenêtre qui s’ouvre, clique sur **« NOUVEAU PROJET »** (en haut à droite).
4. **Nom du projet** : mets par exemple `Bibliotheque Ateliers` (ou ce que tu veux).
5. **Emplacement** : laisse par défaut (aucune organisation).
6. Clique sur **« CRÉER »**.
7. Attends quelques secondes, puis **sélectionne ce nouveau projet** en cliquant à nouveau sur le nom du projet en haut et en le choisissant dans la liste.

### 1.3 Activer l’API Google Drive

1. Dans le menu de gauche (☰), va dans **« APIs et services »** > **« Bibliothèque »** (ou cherche « Bibliothèque » dans la barre de recherche en haut).
2. Dans la barre de recherche de la bibliothèque, tape : **Google Drive API**.
3. Clique sur **« Google Drive API »** dans les résultats.
4. Clique sur le bouton bleu **« ACTIVER »**.
5. Une fois activé, tu reviens sur la fiche de l’API ; c’est bon.

### 1.4 Configurer l’écran de consentement OAuth (obligatoire pour OAuth)

1. Menu de gauche : **« APIs et services »** > **« Écran de consentement OAuth »**.
2. **Type d’utilisateur** : choisis **« Externe »** (pour que n’importe quel utilisateur avec un compte Google puisse se connecter). Clique sur **« CRÉER »**.
3. **Page « Informations sur l’application »** :
   - **Nom de l’application** : par ex. `Bibliothèque d’Ateliers`
   - **Adresse e-mail d’assistance utilisateur** : ton email (obligatoire)
   - **Logo** : optionnel, tu peux passer
   - Clique sur **« ENREGISTRER ET SUIVANT »**
4. **Page « Champs d’application »** :
   - Clique sur **« AJOUTER OU SUPPRIMER DES CHAMPS D’APPLICATION »**.
   - Dans la liste, cherche **« Google Drive »** et coche au minimum :
     - **`.../auth/drive.readonly`** — Accès en lecture à tes fichiers Drive
     - **`.../auth/drive.file`** — Accès aux fichiers créés/ouverts par l’app
   - Clique sur **« Mettre à jour »**, puis **« ENREGISTRER ET SUIVANT »**.
5. **Page « Utilisateurs de test »** (si ton app est en « Test ») :
   - Tu peux ajouter ton propre email pour tester sans passer en production. Optionnel.
   - Clique sur **« ENREGISTRER ET SUIVANT »**.
6. **Résumé** : clique sur **« RETOUR AU TABLEAU DE BORD »**.

### 1.5 Créer les identifiants OAuth (ID client + secret)

1. Menu de gauche : **« APIs et services »** > **「 Identifiants 」**.
2. Clique sur **« + CRÉER DES IDENTIFIANTS »** (en haut).
3. Choisis **「 Identifiant client OAuth »**.
4. **Type d’application** : **「 Application Web 」**.
5. **Nom** : laisse par défaut (ex. « Client Web 1 ») ou mets « Bibliothèque Ateliers ».
6. **URI de redirection autorisés** :
   - Clique sur **「 AJOUTER UN URI 」**.
   - Saisis exactement (en remplaçant `TON_PROJECT_REF` par la valeur de l’étape 0) :
     ```
     https://TON_PROJECT_REF.supabase.co/functions/v1/google-oauth-callback
     ```
     Exemple si ton project ref est `dqkrfhmpvsbvhnkofvni` :
     ```
     https://dqkrfhmpvsbvhnkofvni.supabase.co/functions/v1/google-oauth-callback
     ```
   - Pas d’espace, pas de slash à la fin. Une seule ligne.
7. Clique sur **「 CRÉER 」**.
8. Une fenêtre s’ouvre avec :
   - **ID client** : une longue chaîne qui se termine par `....apps.googleusercontent.com`
   - **Secret client** : clique sur **「 AFFICHER 」** puis **copie** le secret (et garde-le secret).
9. **Garde ces deux valeurs** : tu en auras besoin pour le frontend (ID client) et pour Supabase (ID + secret).

---

## Partie 2 : Configurer ton projet (frontend + Supabase)

### 2.1 Fichier `.env.local` (pour l’app qui tourne en local ou sur Vercel)

1. À la racine de ton projet (`mon-projet`), ouvre ou crée le fichier **`.env.local`**.
2. Ajoute une ligne avec ton **ID client Google** (celui qui se termine par `apps.googleusercontent.com`) :

   ```
   VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
   ```

   Remplace par ta vraie valeur, sans espaces autour du `=`.

3. Si tu déploies sur **Vercel** : va dans ton projet Vercel > **Settings** > **Environment Variables**, ajoute la même variable :
   - **Name** : `VITE_GOOGLE_CLIENT_ID`
   - **Value** : ton ID client Google
   - Puis redéploie l’app.

### 2.2 Secrets Supabase (pour les Edge Functions)

Les Edge Functions ont besoin du **secret client** Google et de l’URL de ton app. Tu peux faire ça de deux façons.

#### Option A : Depuis le dashboard Supabase (le plus simple)

1. Va sur **https://supabase.com/dashboard** et ouvre **ton projet**.
2. Dans le menu de gauche : **Project Settings** (icône engrenage) > **Edge Functions**.
3. Repère la section **「 Secrets 」** (ou **「 Function Secrets 」**).
4. Ajoute les secrets un par un (bouton **「 Add new secret 」** ou **「 New secret 」**) :

   | Nom du secret           | Valeur à mettre |
   |-------------------------|------------------|
   | `GOOGLE_CLIENT_ID`      | Ton **ID client** Google (ex. `xxx.apps.googleusercontent.com`) |
   | `GOOGLE_CLIENT_SECRET`  | Ton **Secret client** Google (celui que tu as affiché à l’étape 1.5) |
   | `APP_ORIGIN`            | URL de ton app : en local `http://localhost:5173`, en prod `https://ton-domaine.vercel.app` (sans slash à la fin) |

5. Sauvegarde chaque secret.

Si tu vois déjà **SUPABASE_ANON_KEY** ou **SUPABASE_URL** dans la liste, ne les supprime pas. Sinon, certains projets exposent déjà la clé anon aux Edge Functions ; si après le déploiement tu as une erreur du type « invalid key », reviens ici et ajoute aussi **SUPABASE_ANON_KEY** avec la valeur de ta clé **anon** (Settings > API > anon / publishable key).

#### Option B : En ligne de commande (si tu as Supabase CLI)

À la racine du projet, dans un terminal :

```bash
# Remplace par tes vraies valeurs, sans espaces autour du =
supabase secrets set GOOGLE_CLIENT_ID="ton-id-client.apps.googleusercontent.com"
supabase secrets set GOOGLE_CLIENT_SECRET="ton-secret-client"
supabase secrets set APP_ORIGIN="http://localhost:5173"
```

Pour la production, refais la même chose avec l’URL de prod :

```bash
supabase secrets set APP_ORIGIN="https://ton-app.vercel.app"
```

---

## Partie 3 : Déployer les Edge Functions sur Supabase

Les Edge Functions sont les petits programmes qui parlent à Google et à ta base. Ils doivent être déployés sur Supabase.

### 3.1 Installer Supabase CLI (si ce n’est pas déjà fait)

1. Ouvre un terminal (Terminal, iTerm, ou le terminal intégré de Cursor).
2. Sur **Mac** (avec Homebrew) :
   ```bash
   brew install supabase/tap/supabase
   ```
   Sinon : va sur **https://supabase.com/docs/guides/cli** et suis les instructions pour ton système.
3. Vérifie :
   ```bash
   supabase --version
   ```

### 3.2 Se connecter à Supabase et lier le projet

1. Dans le terminal, va dans ton projet :
   ```bash
   cd /Users/bastax/mon-projet
   ```
2. Connecte-toi à Supabase :
   ```bash
   supabase login
   ```
   Une page va s’ouvrir dans le navigateur pour te connecter ; valide.
3. Lie ton projet Supabase (remplace `TON_PROJECT_REF` par la valeur de l’étape 0) :
   ```bash
   supabase link --project-ref TON_PROJECT_REF
   ```
   Exemple :
   ```bash
   supabase link --project-ref dqkrfhmpvsbvhnkofvni
   ```
   Si on te demande le mot de passe de la base, tu peux le laisser vide ou le récupérer dans Supabase Dashboard > **Settings** > **Database**.

### 3.3 Déployer les 3 fonctions

Toujours dans le même dossier (`/Users/bastax/mon-projet`) :

```bash
supabase functions deploy google-oauth-callback
supabase functions deploy google-drive-list
supabase functions deploy google-drive-import
```

Chaque commande doit se terminer sans erreur (message du type « Function deployed »). Si une erreur indique qu’un secret manque, reviens à la partie 2.2 et ajoute les secrets demandés.

---

## Partie 4 : Tester

1. **Redémarre ton app** (si elle tourne en local) :
   ```bash
   npm run dev
   ```
2. Ouvre **http://localhost:5173** (ou ton URL Vercel).
3. Connecte-toi à ta plateforme (login normal).
4. Va dans **Intégrations** (menu ou URL `/integrations`).
5. Clique sur **「 Connecter Google Drive 」**.
   - Tu dois être redirigé vers Google pour autoriser l’accès.
   - Après avoir accepté, tu reviens sur la page Intégrations avec un message du type « Google Drive connecté ».
6. En dessous, la section **「 Importer depuis Drive 」** doit apparaître avec une liste de tes Google Docs et PDF.
7. Clique sur **「 Ajouter à la bibliothèque 」** pour un Google Doc : un nouvel atelier doit être créé dans ta bibliothèque.

---

## En cas de problème

- **« Configuration manquante » / « VITE_GOOGLE_CLIENT_ID »**  
  → Vérifie que `.env.local` contient bien `VITE_GOOGLE_CLIENT_ID=...` et redémarre `npm run dev`.

- **« redirect_uri_mismatch » sur Google**  
  → L’URI dans Google Cloud (Identifiants > ton client OAuth > URI de redirection) doit être **exactement** :  
  `https://TON_PROJECT_REF.supabase.co/functions/v1/google-oauth-callback`  
  (même projet ref que dans `VITE_SUPABASE_URL`).

- **« server_config » ou erreur après avoir cliqué sur « Autoriser »**  
  → Les secrets Supabase (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_ORIGIN`) ne sont pas bons ou pas définis. Vérifie la partie 2.2.

- **« Google Drive not connected » quand tu cliques sur Actualiser / Importer**  
  → Soit la connexion n’a pas été enregistrée (revérifier callback + secrets), soit tu n’es plus connecté à la plateforme ; reconnecte-toi puis réessaie « Connecter Google Drive ».

- **La liste des fichiers ne s’affiche pas**  
  → Vérifie que les 3 Edge Functions sont bien déployées (`supabase functions list`) et que tu es connecté à la plateforme avec un compte qui a bien fait « Connecter Google Drive » une fois.

Si tu veux, tu peux m’envoyer le message d’erreur exact (et indiquer à quelle étape ça bloque), et on pourra cibler la correction.

# Guide : Buckets Storage et policies Supabase

## C’est quoi un « bucket » ?

Un **bucket** est un espace de stockage de fichiers dans Supabase (comme un dossier).  
L’app en utilise deux :

| Bucket | Rôle |
|--------|------|
| **workshop-attachments** | Fichiers joints aux ateliers (PDF, images, etc.) |
| **avatars** | Photos de profil des utilisateurs |

Sans ces buckets, l’upload de pièces jointes et d’avatars ne fonctionnera pas.

---

## Étape 1 : Créer les buckets dans Supabase

1. Ouvre ton **projet Supabase** : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Dans le menu de gauche, clique sur **Storage**.
3. Clique sur **New bucket**.
4. **Premier bucket :**
   - Name : `workshop-attachments`
   - Public bucket : **coche la case** (pour que les liens de téléchargement soient utilisables sans clé).
   - Clique sur **Create bucket**.
5. Clique à nouveau sur **New bucket**.
6. **Deuxième bucket :**
   - Name : `avatars`
   - Public bucket : **coche la case**.
   - Clique sur **Create bucket**.

Tu dois voir les deux buckets dans la liste (workshop-attachments et avatars).

---

## Étape 2 : C’est quoi les « policies » ?

Les **policies** (politiques) définissent **qui a le droit de faire quoi** sur les fichiers :

- **Qui** peut déposer un fichier (upload).
- **Qui** peut voir / télécharger un fichier (read).
- **Qui** peut supprimer un fichier (delete).

Sans policies, même connecté, l’app n’aura pas les droits et les uploads / lectures échoueront.

---

## Étape 3 : Ajouter les policies

Deux possibilités.

### Option A : Via l’interface Supabase (recommandé au début)

1. Toujours dans **Storage**, clique sur le bucket **workshop-attachments**.
2. Onglet **Policies** (ou **Policies** dans le menu du bucket).
3. Clique sur **New policy**.
4. Crée **3 policies** comme suit (tu peux utiliser un template ou « For full customization ») :

**Policy 1 – Upload (INSERT)**  
- Policy name : `Authenticated users can upload attachments`  
- Allowed operation : **INSERT**  
- Target roles : **authenticated**  
- USING expression : laisse vide ou `true`  
- WITH CHECK expression : `bucket_id = 'workshop-attachments'`

**Policy 2 – Lecture (SELECT)**  
- Policy name : `Attachments are viewable by authenticated users`  
- Allowed operation : **SELECT**  
- Target roles : **authenticated**  
- USING expression : `bucket_id = 'workshop-attachments'`

**Policy 3 – Suppression (DELETE)**  
- Policy name : `Users can delete their workshop attachments`  
- Allowed operation : **DELETE**  
- Target roles : **authenticated**  
- USING expression :  
  `bucket_id = 'workshop-attachments' AND (auth.uid() = owner OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`

5. Répète pour le bucket **avatars** si tu veux autoriser l’upload d’avatars (sinon tu peux le faire plus tard).

### Option B : Via le SQL Editor

1. Dans Supabase, va dans **SQL Editor**.
2. Ouvre le fichier **supabase/storage-policies.sql** (dans ce projet).
3. Copie tout son contenu dans l’éditeur SQL.
4. **Important :** exécute ce script **après** avoir créé les deux buckets (workshop-attachments et avatars) à la main, car le SQL ne crée pas les buckets, il ajoute seulement les policies.

Ensuite, exécute la requête (Run).

---

## Récap

1. **Storage** → **New bucket** → `workshop-attachments` (public).
2. **New bucket** → `avatars` (public).
3. Pour chaque bucket, **Policies** → ajouter les règles (option A) ou exécuter **storage-policies.sql** (option B).

Après ça, l’app pourra envoyer et afficher les pièces jointes des ateliers (et les avatars si tu as mis les policies pour `avatars`).

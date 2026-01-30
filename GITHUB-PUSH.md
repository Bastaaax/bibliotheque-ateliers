# Publier sur GitHub – dépôt Bibliothèque d’Ateliers

## 1. Changer le remote (bon dépôt)

Tu as déjà un `origin` qui pointe vers **Portefolio-Bastien-Boisjot**. Pour ce projet, il faut pointer vers le dépôt de la **Bibliothèque d’Ateliers**.

**Depuis le dossier du projet** (`/Users/bastax/mon-projet`) :

```bash
cd /Users/bastax/mon-projet
```

- Si tu as **créé un nouveau dépôt** sur GitHub pour ce projet (ex. `workshop-library`) :

```bash
# Remplacer l’URL par la tienne (ton pseudo + nom du dépôt)
git remote remove origin
git remote add origin https://github.com/Bastaaax/workshop-library.git
```

- Si tu veux **garder le nom** `origin` mais changer l’URL (même dépôt que ci‑dessus) :

```bash
git remote set-url origin https://github.com/Bastaaax/workshop-library.git
```

(Adapte `Bastaaax` et `workshop-library` si ton pseudo ou le nom du dépôt est différent.)

---

## 2. S’authentifier avec un token (obligatoire)

GitHub n’accepte plus le mot de passe pour `git push`. Il faut un **Personal Access Token (PAT)**.

### Créer un token

1. GitHub → **Settings** (ton profil, en haut à droite) → **Developer settings** (menu de gauche).
2. **Personal access tokens** → **Tokens (classic)**.
3. **Generate new token** → **Generate new token (classic)**.
4. Donne un nom (ex. `Mac mon-projet`), choisis une expiration (ex. 90 jours).
5. Coche au minimum : **repo** (accès aux dépôts).
6. **Generate token**.
7. **Copie le token** tout de suite (il ne sera plus affiché).

### Utiliser le token pour push

Quand tu fais :

```bash
git push -u origin master
```

Git va demander **Username** et **Password** :

- **Username** : `Bastaaax` (ton pseudo GitHub).
- **Password** : **colle le token** (pas ton mot de passe GitHub).

Pour ne pas le retaper à chaque fois, tu peux enregistrer le token :

```bash
git config --global credential.helper store
```

Au prochain `git push`, après avoir entré une fois username + token, ils seront enregistrés (dans `~/.git-credentials`).

---

## 3. Pousser le code

```bash
cd /Users/bastax/mon-projet
git push -u origin master
```

Si GitHub te propose d’utiliser la branche `main` :

```bash
git branch -M main
git push -u origin main
```

---

## En résumé

1. Aller dans **mon-projet** : `cd /Users/bastax/mon-projet`
2. Mettre le bon dépôt en `origin` : `git remote set-url origin https://github.com/Bastaaax/NOM_DU_REPO.git`
3. Créer un **Personal Access Token** sur GitHub (Settings → Developer settings → Personal access tokens).
4. Faire `git push -u origin master` et utiliser le **token** comme mot de passe.

# Utiliser le template Notion-like officiel TipTap

Le [template Notion-like](https://tiptap.dev/docs/ui-components/templates/notion-like-editor) de TipTap est un éditeur bloc complet (slash commands, barre flottante, collaboration, etc.). Il fait partie du **Start plan** (abonnement ou essai).

## Actuellement dans le projet

L’éditeur utilise **TipTap open-source** avec :

- **Barre d’outils** en haut (titres, gras, italique, listes, tableaux, couleurs, etc.)
- **BubbleMenu** : barre flottante type Notion au survol/sélection (gras, italique, souligné, surligné)
- Un seul éditeur monté à la fois par section (performance)

## Installer le template officiel Notion-like

Si vous avez un compte [TipTap Cloud](https://tiptap.dev/) avec un abonnement **Start** ou un **essai** :

1. **Lancer le CLI** (dans le dossier du projet) :
   ```bash
   npx @tiptap/cli@latest add notion-like-editor
   ```
2. Suivre les instructions (connexion éventuelle, choix du template).
3. **Configurer** selon la doc :
   - Variables d’environnement (collaboration, AI) : voir [la doc](https://tiptap.dev/docs/ui-components/templates/notion-like-editor#environment-variables)
   - Fichier `tiptap-collab-utils.ts` (ou équivalent) pour JWT, etc.
4. **Remplacer** l’éditeur actuel : importer le composant généré (ex. `NotionEditor`) dans `WorkshopEditor.tsx` ou `DerouleTableEditor.tsx` à la place de `WorkshopEditor`.

## Référence

- [Template Notion-like – TipTap](https://tiptap.dev/docs/ui-components/templates/notion-like-editor)
- [TipTap UI Components](https://tiptap.dev/docs/ui-components)

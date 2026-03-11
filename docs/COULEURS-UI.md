# Couleurs utilisées dans l’interface

Ce fichier décrit **où** chaque couleur est utilisée. Les valeurs réelles sont dans `src/styles/_sgdf-tokens.scss` et `src/index.css` (`:root`).

---

## Résumé rapide

| Rôle | Couleur actuelle | Où c’est utilisé |
|------|------------------|-------------------|
| **Header / nav** | Bleu marine `#003a5d` | Bandeau du haut, menu mobile (fond) |
| **Bouton principal (CTA)** | Bleu ciel sky `#0ea5e9` | « Nouvel atelier », boutons primary, focus des champs |
| **Texte du bouton sur header** | Bleu marine `#003a5d` | Texte du bouton blanc « Nouvel atelier » dans le header |
| **Fond de page** | Gris neutre clair `#f4f4f5` | Arrière-plan général (body) |
| **Cartes / contenants** | Blanc `#ffffff` | Cartes ateliers, modales, panneaux |
| **Texte principal** | Gris foncé `~#3f3f46` | Corps de texte |
| **Texte secondaire** | Gris moyen `~#71717a` | Labels, métadonnées, placeholders |
| **Bordures** | Gris clair `~#d4d4d8` | Champs, cartes, séparateurs |
| **Badge Admin (dropdown)** | Sky très clair + texte sky | Fond `primary/10`, texte `primary` |

---

## Détail par token

### 1. Bleu marine SGDF (identité / header)
- **Token** : `--sgdf-color-default`, `--sgdf-color-bg-primary`, `--sgdf-color-bg-primary-hovered`
- **Valeur** : `#003a5d` (hover `#0b2b40`)
- **Utilisation** : Fond du header, fond du menu mobile, couleur du texte du bouton « Nouvel atelier » dans le header (`text-sgdf-default`).

### 2. Bleu ciel « primary » (actions, focus)
- **Tokens** : `--sgdf-color-primary-500` = `#0ea5e9`, et dans `index.css` : `--primary`, `--ring`, `--accent` (dérivés)
- **Utilisation** :
  - Boutons « primary » (ex. « Enregistrer », « Nouvel atelier » en dehors du header)
  - Anneau de focus des inputs/boutons (ring)
  - Slider (barre de progression)
  - Liens (`text-primary`), onglet actif dans le dropdown profil
  - Tags sélectionnés (ring primary)

### 3. Fonds
- **Fond page** : `--background` → gris très clair `#f4f4f5`
- **Cartes / modales** : `--card`, `--popover`, `--background` (blanc) sur les composants
- **Zones atténuées** : `bg-muted` (gris très clair), `bg-muted/20`, `bg-muted/40` pour barres d’outils, en-têtes de blocs

### 4. Texte
- **Principal** : `--foreground` (gris foncé)
- **Secondaire** : `--muted-foreground` (gris moyen) pour labels, métadonnées, placeholders
- **Sur header** : blanc (`text-white`)

### 5. Destructive / Success
- **Destructive** : rouge (supprimer, erreurs)
- **Success** : vert `#22c55e` (défini dans les tokens, utilisé si vous ajoutez des toasts/états succès)

### 6. Branches SGDF (badges/tags)
- LJ `#ff8300`, SG `#0077b3`, PC `#d03f15`, Compagnons `#007254`, etc.  
- Utilisables pour les pastilles de tags (couleurs stockées en base par tag).

---

## Comment modifier les couleurs

1. **Header / identité bleu marine**  
   Modifier dans `_sgdf-tokens.scss` :
   - `--sgdf-color-default`
   - `--sgdf-color-bg-primary`
   - `--sgdf-color-bg-primary-hovered`

2. **Boutons principaux et focus (bleu ciel)**  
   - Soit dans `_sgdf-tokens.scss` : `--sgdf-color-primary-500`, `-600`, `-700`  
   - Soit dans `index.css` dans `:root` : `--primary`, `--ring` (en HSL pour compatibilité composants).  
   Pour tout mettre en bleu marine : remplacer `--primary` et `--ring` par les valeurs HSL de `#003a5d` (ex. `202 100% 18%`).

3. **Fond de page**  
   Dans `index.css` : `--background` (actuellement `240 5% 96%` ≈ #f4f4f5).

4. **Texte**  
   Dans `index.css` : `--foreground`, `--muted-foreground`.

Après modification des tokens ou de `:root`, un simple rechargement (ou rebuild) suffit pour voir le résultat.

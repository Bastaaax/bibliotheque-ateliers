-- Fiche synthèse pour formateurs : texte libre à imprimer pour les stagiaires
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS fiche_synthese TEXT DEFAULT '';

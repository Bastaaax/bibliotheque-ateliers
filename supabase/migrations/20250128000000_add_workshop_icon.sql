-- Ajoute la colonne icon (emoji) à la table workshops
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS icon TEXT;

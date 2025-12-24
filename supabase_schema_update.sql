-- Ajout de la colonne audio_url à la table posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS audio_url text;

-- (Optionnel) Commentaire pour documentation
COMMENT ON COLUMN public.posts.audio_url IS 'URL du fichier audio (message vocal) stocké dans Supabase Storage';

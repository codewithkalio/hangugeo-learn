-- Remove anon-specific bulk-insert guard. Anon role already has no table access (REVOKE in 20260301164503).
-- App does not use Supabase anonymous auth; this trigger was redundant.

DROP TRIGGER IF EXISTS block_anon_bulk_flashcard_insert_trigger ON public.flashcards;
DROP FUNCTION IF EXISTS public.block_anon_bulk_flashcard_insert();

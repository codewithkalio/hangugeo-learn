-- Block anonymous (demo) users from bulk-inserting flashcards (CSV import).
-- Single-row inserts (Add Flashcard) and the initial demo seed (user had 0 cards) are allowed.

CREATE OR REPLACE FUNCTION public.block_anon_bulk_flashcard_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count bigint;
  uid uuid;
  current_total bigint;
BEGIN
  IF (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true' THEN
    RETURN NULL;
  END IF;

  SELECT count(*) INTO inserted_count FROM ins;
  IF inserted_count <= 1 THEN
    RETURN NULL;
  END IF;

  SELECT user_id INTO uid FROM ins LIMIT 1;
  SELECT count(*) INTO current_total FROM public.flashcards WHERE user_id = uid;
  IF (current_total - inserted_count) <= 0 THEN
    RETURN NULL;
  END IF;

  RAISE EXCEPTION 'CSV import is disabled in demo mode';
END;
$$;

CREATE TRIGGER block_anon_bulk_flashcard_insert_trigger
  AFTER INSERT ON public.flashcards
  REFERENCING NEW TABLE AS ins
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.block_anon_bulk_flashcard_insert();

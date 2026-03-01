
-- Step 1: Revoke all anon access to all tables
REVOKE ALL ON TABLE public.flashcards FROM anon;
REVOKE ALL ON TABLE public.categories FROM anon;
REVOKE ALL ON TABLE public.drill_results FROM anon;

-- Step 2: Restrict authenticated role to only needed operations
-- First revoke all, then grant back specifically
REVOKE ALL ON TABLE public.flashcards FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.flashcards TO authenticated;

REVOKE ALL ON TABLE public.categories FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;

REVOKE ALL ON TABLE public.drill_results FROM authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.drill_results TO authenticated;

-- Step 3: Auto-enable RLS on any new table created in public schema
CREATE OR REPLACE FUNCTION public.auto_enable_rls()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
    WHERE command_tag = 'CREATE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY;', obj.object_identity);
  END LOOP;
END;
$$;

-- Create the event trigger
DROP EVENT TRIGGER IF EXISTS auto_enable_rls_trigger;
CREATE EVENT TRIGGER auto_enable_rls_trigger
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION public.auto_enable_rls();

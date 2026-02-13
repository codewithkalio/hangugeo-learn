
-- flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  korean TEXT NOT NULL,
  english TEXT NOT NULL,
  category TEXT,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own flashcards" ON public.flashcards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcards" ON public.flashcards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON public.flashcards FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON public.flashcards FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- drill_results table
CREATE TABLE public.drill_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  total_cards INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  cards JSONB NOT NULL,
  category TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drill_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own drill_results" ON public.drill_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drill_results" ON public.drill_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drill_results" ON public.drill_results FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drill_results" ON public.drill_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE (user_id, name)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- grammar_patterns table
CREATE TABLE public.grammar_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  times_practiced INTEGER NOT NULL DEFAULT 0,
  correct_first_attempt INTEGER NOT NULL DEFAULT 0,
  correct_second_attempt INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 4,
  consecutive_fluent INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, pattern_key)
);

ALTER TABLE public.grammar_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own grammar_patterns" ON public.grammar_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own grammar_patterns" ON public.grammar_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own grammar_patterns" ON public.grammar_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own grammar_patterns" ON public.grammar_patterns FOR DELETE USING (auth.uid() = user_id);

-- conjugation_results table
CREATE TABLE public.conjugation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_questions INTEGER NOT NULL,
  correct_first INTEGER NOT NULL,
  correct_second INTEGER NOT NULL,
  incorrect INTEGER NOT NULL,
  questions JSONB NOT NULL
);

ALTER TABLE public.conjugation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own conjugation_results" ON public.conjugation_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conjugation_results" ON public.conjugation_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conjugation_results" ON public.conjugation_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conjugation_results" ON public.conjugation_results FOR DELETE USING (auth.uid() = user_id);

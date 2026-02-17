ALTER TABLE public.flashcards 
ADD COLUMN confidence_score integer NOT NULL DEFAULT 0,
ADD COLUMN weight integer NOT NULL DEFAULT 4,
ADD COLUMN consecutive_fluent integer NOT NULL DEFAULT 0;
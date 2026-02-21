import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Flashcard, DrillResult, GrammarPattern, ConjugationResult, ConjugationQuestion } from '@/lib/types';

async function retryFetch<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries || !err?.message?.includes('Load failed')) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}

const DEFAULT_CATEGORIES = ['Noun', 'Grammar Point', 'Modifier', 'Particle', 'Verb'];

export function useAppData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // ── Flashcards ──
  const { data: flashcards = [] } = useQuery({
    queryKey: ['flashcards', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(row => ({
        id: row.id,
        korean: row.korean,
        english: row.english,
        category: row.category ?? undefined,
        note: (row as any).note ?? undefined,
        createdAt: row.created_at,
        correctCount: row.correct_count,
        incorrectCount: row.incorrect_count,
        confidenceScore: (row as any).confidence_score ?? 0,
        weight: (row as any).weight ?? 4,
        consecutiveFluent: (row as any).consecutive_fluent ?? 0,
      })) as Flashcard[];
    },
    enabled: !!userId,
  });

  // ── Drill Results ──
  const { data: drillResults = [] } = useQuery({
    queryKey: ['drillResults', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drill_results')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(row => ({
        id: row.id,
        date: row.date,
        direction: row.direction as DrillResult['direction'],
        totalCards: row.total_cards,
        correctCount: row.correct_count,
        cards: row.cards as { cardId: string; confidence: number }[],
        category: row.category ?? undefined,
      })) as DrillResult[];
    },
    enabled: !!userId,
  });

  // ── Categories (seed defaults on first load) ──
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;

      if (data.length === 0 && userId) {
        const rows = DEFAULT_CATEGORIES.map(name => ({ user_id: userId, name }));
        const { data: seeded, error: seedErr } = await supabase
          .from('categories')
          .insert(rows)
          .select();
        if (seedErr) throw seedErr;
        return (seeded ?? []).map(r => r.name);
      }

      return data.map(r => r.name);
    },
    enabled: !!userId,
  });

  // ── Grammar Patterns ──
  const { data: grammarPatterns = [] } = useQuery({
    queryKey: ['grammarPatterns', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grammar_patterns')
        .select('*')
        .order('pattern_key');
      if (error) throw error;
      return (data ?? []).map(row => ({
        id: row.id,
        patternKey: row.pattern_key,
        enabled: row.enabled,
        timesPracticed: row.times_practiced,
        correctFirstAttempt: row.correct_first_attempt,
        correctSecondAttempt: row.correct_second_attempt,
        totalAttempts: row.total_attempts,
        lastPracticedAt: row.last_practiced_at,
        confidenceScore: row.confidence_score,
        weight: row.weight,
        consecutiveFluent: row.consecutive_fluent,
      })) as GrammarPattern[];
    },
    enabled: !!userId,
  });

  // ── Conjugation Results ──
  const { data: conjugationResults = [] } = useQuery({
    queryKey: ['conjugationResults', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conjugation_results')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(row => ({
        id: row.id,
        date: row.date,
        totalQuestions: row.total_questions,
        correctFirst: row.correct_first,
        correctSecond: row.correct_second,
        incorrect: row.incorrect,
        questions: row.questions as unknown as ConjugationQuestion[],
      })) as ConjugationResult[];
    },
    enabled: !!userId,
  });

  // ── Mutations ──
  const addFlashcardMut = useMutation({
    mutationFn: async (card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount' | 'confidenceScore' | 'weight' | 'consecutiveFluent'>) => {
      console.log('[addFlashcard] Inserting card:', { korean: card.korean, english: card.english, category: card.category, note: card.note });
      return retryFetch(async () => {
        const { data, error } = await supabase
          .from('flashcards')
          .insert({ user_id: userId!, korean: card.korean, english: card.english, category: card.category ?? null, note: card.note ?? null } as any)
          .select()
          .single();
        if (error) {
          console.error('[addFlashcard] Supabase error:', JSON.stringify(error));
          throw error;
        }
        console.log('[addFlashcard] Success:', data);
        return data;
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }),
    onError: (error) => console.error('[addFlashcard] Mutation error:', JSON.stringify(error)),
  });

  const updateFlashcardMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Flashcard> }) => {
      console.log('[updateFlashcard] Updating card:', { id, updates });
      return retryFetch(async () => {
        const mapped: Record<string, unknown> = {};
        if (updates.korean !== undefined) mapped.korean = updates.korean;
        if (updates.english !== undefined) mapped.english = updates.english;
        if (updates.category !== undefined) mapped.category = updates.category ?? null;
        if (updates.note !== undefined) mapped.note = updates.note ?? null;
        const { error } = await supabase.from('flashcards').update(mapped as any).eq('id', id);
        if (error) {
          console.error('[updateFlashcard] Supabase error:', JSON.stringify(error));
          throw error;
        }
        console.log('[updateFlashcard] Success');
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }),
    onError: (error) => console.error('[updateFlashcard] Mutation error:', JSON.stringify(error)),
  });

  const deleteFlashcardMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('flashcards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }),
  });

  const addCategoryMut = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('categories').insert({ user_id: userId!, name } as any);
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', userId] }),
  });

  const addDrillResultMut = useMutation({
    mutationFn: async (result: Omit<DrillResult, 'id' | 'date'>) => {
      const correctCount = result.cards.filter(c => c.confidence >= 3).length;
      const { error: drillErr } = await supabase.from('drill_results').insert({
        user_id: userId!,
        direction: result.direction,
        total_cards: result.totalCards,
        correct_count: correctCount,
        cards: result.cards as unknown as Record<string, unknown>[],
        category: result.category ?? null,
      } as any);
      if (drillErr) throw drillErr;

      for (const c of result.cards) {
        const card = flashcards.find(f => f.id === c.cardId);
        if (!card) continue;
        let newConsecutiveFluent = c.confidence === 4 ? (card.consecutiveFluent + 1) : 0;
        let newWeight = 5 - c.confidence;
        if (newConsecutiveFluent >= 5) newWeight = 1;
        await supabase.from('flashcards').update({
          confidence_score: c.confidence,
          weight: newWeight,
          consecutive_fluent: newConsecutiveFluent,
        } as any).eq('id', c.cardId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      queryClient.invalidateQueries({ queryKey: ['drillResults', userId] });
    },
  });

  const toggleGrammarPatternMut = useMutation({
    mutationFn: async ({ patternKey, enabled }: { patternKey: string; enabled: boolean }) => {
      const existing = grammarPatterns.find(p => p.patternKey === patternKey);
      if (existing) {
        const { error } = await supabase.from('grammar_patterns').update({ enabled }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('grammar_patterns').insert({
          user_id: userId!, pattern_key: patternKey, enabled,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grammarPatterns', userId] }),
  });

  const addConjugationResultMut = useMutation({
    mutationFn: async (result: Omit<ConjugationResult, 'id' | 'date'>) => {
      const { error } = await supabase.from('conjugation_results').insert({
        user_id: userId!,
        total_questions: result.totalQuestions,
        correct_first: result.correctFirst,
        correct_second: result.correctSecond,
        incorrect: result.incorrect,
        questions: result.questions as unknown as Record<string, unknown>[],
      } as any);
      if (error) throw error;

      // Update grammar pattern stats
      for (const q of result.questions) {
        const pattern = grammarPatterns.find(p => p.patternKey === q.patternKey);
        if (!pattern) continue;
        const isFirst = q.resultFirstAttempt === true;
        const isSecond = q.resultSecondAttempt === true;
        const correct = isFirst || isSecond;
        const newConsecutiveFluent = isFirst ? pattern.consecutiveFluent + 1 : 0;
        const newConfidence = isFirst ? 4 : isSecond ? 3 : 1;
        let newWeight = 5 - newConfidence;
        if (newConsecutiveFluent >= 5) newWeight = 1;

        await supabase.from('grammar_patterns').update({
          times_practiced: pattern.timesPracticed + 1,
          correct_first_attempt: pattern.correctFirstAttempt + (isFirst ? 1 : 0),
          correct_second_attempt: pattern.correctSecondAttempt + (isSecond ? 1 : 0),
          total_attempts: pattern.totalAttempts + 1,
          last_practiced_at: new Date().toISOString(),
          confidence_score: newConfidence,
          weight: newWeight,
          consecutive_fluent: newConsecutiveFluent,
        }).eq('id', pattern.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grammarPatterns', userId] });
      queryClient.invalidateQueries({ queryKey: ['conjugationResults', userId] });
    },
  });

  // ── Stable callbacks ──
  const addFlashcard = useCallback(
    (card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount' | 'confidenceScore' | 'weight' | 'consecutiveFluent'>) => {
      return addFlashcardMut.mutateAsync(card);
    },
    [addFlashcardMut]
  );

  const updateFlashcard = useCallback(
    (id: string, updates: Partial<Flashcard>) => {
      return updateFlashcardMut.mutateAsync({ id, updates });
    },
    [updateFlashcardMut]
  );

  const deleteFlashcard = useCallback(
    (id: string) => {
      deleteFlashcardMut.mutate(id);
    },
    [deleteFlashcardMut]
  );

  const addCategory = useCallback(
    (name: string) => {
      addCategoryMut.mutate(name);
    },
    [addCategoryMut]
  );

  const addDrillResult = useCallback(
    (result: Omit<DrillResult, 'id' | 'date'>) => {
      addDrillResultMut.mutate(result);
    },
    [addDrillResultMut]
  );

  const toggleGrammarPattern = useCallback(
    (patternKey: string, enabled: boolean) => {
      toggleGrammarPatternMut.mutate({ patternKey, enabled });
    },
    [toggleGrammarPatternMut]
  );

  const addConjugationResult = useCallback(
    (result: Omit<ConjugationResult, 'id' | 'date'>) => {
      addConjugationResultMut.mutate(result);
    },
    [addConjugationResultMut]
  );

  return {
    data: {
      flashcards,
      drillResults,
      categories,
      grammarPatterns,
      conjugationResults,
      streak: 0,
      lastDrillDate: null,
    },
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addCategory,
    addDrillResult,
    toggleGrammarPattern,
    addConjugationResult,
  };
}

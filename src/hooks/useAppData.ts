import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  captureCategoryCreated,
  captureDrillCompleted,
  captureFlashcardDeleted,
  captureFlashcardSaved,
  captureFlashcardSaveFailed,
} from '@/lib/analytics';
import { Flashcard, DrillResult } from '@/lib/types';
import { categoryNameSchema, flashcardInputSchema, flashcardUpdateSchema } from '@/lib/flashcardSanitize';

function debugConsole(method: 'log' | 'error', message: string, details?: unknown) {
  if (!import.meta.env.DEV) return;
  if (details === undefined) {
    console[method](message);
    return;
  }
  console[method](message, details);
}

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




  // ── Mutations ──
  const addFlashcardMut = useMutation({
    mutationFn: async (card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount' | 'confidenceScore' | 'weight' | 'consecutiveFluent'>) => {
      const sanitizedCard = flashcardInputSchema.parse(card);
      debugConsole('log', '[addFlashcard] Inserting card:', sanitizedCard);
      return retryFetch(async () => {
        const { data, error } = await supabase
          .from('flashcards')
          .insert({ user_id: userId!, korean: sanitizedCard.korean, english: sanitizedCard.english, category: sanitizedCard.category ?? null, note: sanitizedCard.note ?? null } as any)
          .select()
          .single();
        if (error) {
          debugConsole('error', '[addFlashcard] Supabase error:', JSON.stringify(error));
          throw error;
        }
        debugConsole('log', '[addFlashcard] Success:', data);
        return data;
      });
    },
    onSuccess: (_data, card) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      captureFlashcardSaved('create', card);
    },
    onError: (error) => {
      debugConsole('error', '[addFlashcard] Mutation error:', JSON.stringify(error));
      captureFlashcardSaveFailed('create', error);
    },
  });

  const updateFlashcardMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Flashcard> }) => {
      const sanitizedUpdates = flashcardUpdateSchema.parse(updates);
      debugConsole('log', '[updateFlashcard] Updating card:', { id, updates: sanitizedUpdates });
      return retryFetch(async () => {
        const mapped: Record<string, unknown> = {};
        if (Object.prototype.hasOwnProperty.call(updates, 'korean')) mapped.korean = sanitizedUpdates.korean;
        if (Object.prototype.hasOwnProperty.call(updates, 'english')) mapped.english = sanitizedUpdates.english;
        if (Object.prototype.hasOwnProperty.call(updates, 'category')) mapped.category = sanitizedUpdates.category ?? null;
        if (Object.prototype.hasOwnProperty.call(updates, 'note')) mapped.note = sanitizedUpdates.note ?? null;
        if (Object.keys(mapped).length === 0) return;
        const { error } = await supabase.from('flashcards').update(mapped as any).eq('id', id);
        if (error) {
          debugConsole('error', '[updateFlashcard] Supabase error:', JSON.stringify(error));
          throw error;
        }
        debugConsole('log', '[updateFlashcard] Success');
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      captureFlashcardSaved('update', variables.updates);
    },
    onError: (error) => {
      debugConsole('error', '[updateFlashcard] Mutation error:', JSON.stringify(error));
      captureFlashcardSaveFailed('update', error);
    },
  });

  const deleteFlashcardMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('flashcards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      captureFlashcardDeleted();
    },
  });

  const addCategoryMut = useMutation({
    mutationFn: async (name: string) => {
      const sanitizedName = categoryNameSchema.parse(name);
      const { error } = await supabase.from('categories').insert({ user_id: userId!, name: sanitizedName } as any);
      if (error) {
        if (error.code === '23505') return 'duplicate' as const;
        throw error;
      }
      return 'created' as const;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
      captureCategoryCreated('flashcard_form', result === 'duplicate');
    },
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
    onSuccess: (_data, result) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      queryClient.invalidateQueries({ queryKey: ['drillResults', userId] });
      const correctCount = result.cards.filter(c => c.confidence >= 3).length;
      captureDrillCompleted(result, correctCount);
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




  return {
    data: {
      flashcards,
      drillResults,
      categories,
      streak: 0,
      lastDrillDate: null,
    },
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addCategory,
    addDrillResult,
  };
}

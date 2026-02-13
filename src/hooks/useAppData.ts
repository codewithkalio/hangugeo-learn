import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Flashcard, DrillResult } from '@/lib/types';

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
        createdAt: row.created_at,
        correctCount: row.correct_count,
        incorrectCount: row.incorrect_count,
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
        cards: row.cards as { cardId: string; correct: boolean }[],
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
        // Seed defaults
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
    mutationFn: async (card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount'>) => {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({ user_id: userId!, korean: card.korean, english: card.english, category: card.category ?? null } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }),
  });

  const updateFlashcardMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Flashcard> }) => {
      const mapped: Record<string, unknown> = {};
      if (updates.korean !== undefined) mapped.korean = updates.korean;
      if (updates.english !== undefined) mapped.english = updates.english;
      if (updates.category !== undefined) mapped.category = updates.category ?? null;
      const { error } = await supabase.from('flashcards').update(mapped as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', userId] }),
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
      if (error && error.code !== '23505') throw error; // ignore duplicate
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', userId] }),
  });

  const addDrillResultMut = useMutation({
    mutationFn: async (result: Omit<DrillResult, 'id' | 'date'>) => {
      // Insert drill result
      const { error: drillErr } = await supabase.from('drill_results').insert({
        user_id: userId!,
        direction: result.direction,
        total_cards: result.totalCards,
        correct_count: result.correctCount,
        cards: result.cards as unknown as Record<string, unknown>[],
        category: result.category ?? null,
      } as any);
      if (drillErr) throw drillErr;

      // Update card stats
      for (const c of result.cards) {
        const update = c.correct
          ? { correct_count: (flashcards.find(f => f.id === c.cardId)?.correctCount ?? 0) + 1 }
          : { incorrect_count: (flashcards.find(f => f.id === c.cardId)?.incorrectCount ?? 0) + 1 };
        await supabase.from('flashcards').update(update).eq('id', c.cardId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', userId] });
      queryClient.invalidateQueries({ queryKey: ['drillResults', userId] });
    },
  });

  // ── Stable callbacks matching old interface ──
  const addFlashcard = useCallback(
    (card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount'>) => {
      addFlashcardMut.mutate(card);
    },
    [addFlashcardMut]
  );

  const updateFlashcard = useCallback(
    (id: string, updates: Partial<Flashcard>) => {
      updateFlashcardMut.mutate({ id, updates });
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

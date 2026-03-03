import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDemoFlashcards,
  getDemoDrillResults,
  getDemoCategories,
  setDemoFlashcards,
  setDemoDrillResults,
  setDemoCategories,
} from '@/lib/demoStorage';
import type { Flashcard, DrillResult } from '@/lib/types';

const DEMO_QUERY_KEY = 'demo';

export function useDemoData() {
  const queryClient = useQueryClient();

  const { data: flashcards = [] } = useQuery({
    queryKey: ['flashcards', DEMO_QUERY_KEY],
    queryFn: getDemoFlashcards,
  });

  const { data: drillResults = [] } = useQuery({
    queryKey: ['drillResults', DEMO_QUERY_KEY],
    queryFn: getDemoDrillResults,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', DEMO_QUERY_KEY],
    queryFn: getDemoCategories,
  });

  const addFlashcardMut = useMutation({
    mutationFn: async (card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount' | 'confidenceScore' | 'weight' | 'consecutiveFluent'>) => {
      const newCard: Flashcard = {
        ...card,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        correctCount: 0,
        incorrectCount: 0,
        confidenceScore: 0,
        weight: 5,
        consecutiveFluent: 0,
      };
      const next = [newCard, ...getDemoFlashcards()];
      setDemoFlashcards(next);
      return newCard;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', DEMO_QUERY_KEY] }),
  });

  const updateFlashcardMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Flashcard> }) => {
      const list = getDemoFlashcards();
      const idx = list.findIndex(f => f.id === id);
      if (idx === -1) return;
      const next = [...list];
      next[idx] = { ...next[idx], ...updates };
      setDemoFlashcards(next);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', DEMO_QUERY_KEY] }),
  });

  const deleteFlashcardMut = useMutation({
    mutationFn: async (id: string) => {
      const next = getDemoFlashcards().filter(f => f.id !== id);
      setDemoFlashcards(next);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards', DEMO_QUERY_KEY] }),
  });

  const addCategoryMut = useMutation({
    mutationFn: async (name: string) => {
      const list = getDemoCategories();
      if (list.includes(name)) return;
      setDemoCategories([...list, name].sort());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', DEMO_QUERY_KEY] }),
  });

  const addDrillResultMut = useMutation({
    mutationFn: async (result: Omit<DrillResult, 'id' | 'date'>) => {
      const newResult: DrillResult = {
        ...result,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
      };
      const results = [newResult, ...getDemoDrillResults()];
      setDemoDrillResults(results);

      const cards = getDemoFlashcards();
      let updated = false;
      const nextCards = cards.map(card => {
        const entry = result.cards.find(cc => cc.cardId === card.id);
        if (!entry) return card;
        updated = true;
        const newConsecutiveFluent = entry.confidence === 4 ? card.consecutiveFluent + 1 : 0;
        let newWeight = 5 - entry.confidence;
        if (newConsecutiveFluent >= 5) newWeight = 1;
        return {
          ...card,
          confidenceScore: entry.confidence,
          weight: newWeight,
          consecutiveFluent: newConsecutiveFluent,
        };
      });
      if (updated) setDemoFlashcards(nextCards);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', DEMO_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['drillResults', DEMO_QUERY_KEY] });
    },
  });

  const addFlashcard = useCallback(
    (card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount' | 'confidenceScore' | 'weight' | 'consecutiveFluent'>) =>
      addFlashcardMut.mutateAsync(card),
    [addFlashcardMut]
  );

  const updateFlashcard = useCallback(
    (id: string, updates: Partial<Flashcard>) =>
      updateFlashcardMut.mutateAsync({ id, updates }),
    [updateFlashcardMut]
  );

  const deleteFlashcard = useCallback(
    (id: string) => deleteFlashcardMut.mutate(id),
    [deleteFlashcardMut]
  );

  const addCategory = useCallback(
    (name: string) => addCategoryMut.mutate(name),
    [addCategoryMut]
  );

  const addDrillResult = useCallback(
    (result: Omit<DrillResult, 'id' | 'date'>) => addDrillResultMut.mutate(result),
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

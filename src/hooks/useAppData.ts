import { useState, useEffect, useCallback } from 'react';
import { AppData, DEFAULT_APP_DATA, Flashcard, DrillResult } from '@/lib/types';

const STORAGE_KEY = 'korean-learn-data';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_APP_DATA, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_APP_DATA };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => { saveData(data); }, [data]);

  const addFlashcard = useCallback((card: Omit<Flashcard, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount'>) => {
    const newCard: Flashcard = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
    };
    setData(prev => ({ ...prev, flashcards: [newCard, ...prev.flashcards] }));
    return newCard;
  }, []);

  const updateFlashcard = useCallback((id: string, updates: Partial<Flashcard>) => {
    setData(prev => ({
      ...prev,
      flashcards: prev.flashcards.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const deleteFlashcard = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      flashcards: prev.flashcards.filter(c => c.id !== id),
    }));
  }, []);

  const addCategory = useCallback((name: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.includes(name) ? prev.categories : [...prev.categories, name],
    }));
  }, []);

  const addDrillResult = useCallback((result: Omit<DrillResult, 'id' | 'date'>) => {
    const newResult: DrillResult = {
      ...result,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    setData(prev => {
      // Update streak
      const today = new Date().toDateString();
      const lastDrill = prev.lastDrillDate ? new Date(prev.lastDrillDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let streak = prev.streak;
      if (lastDrill === today) {
        // same day, no change
      } else if (lastDrill === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }

      // Update card stats
      const flashcards = prev.flashcards.map(card => {
        const drillCard = result.cards.find(c => c.cardId === card.id);
        if (!drillCard) return card;
        return {
          ...card,
          correctCount: card.correctCount + (drillCard.correct ? 1 : 0),
          incorrectCount: card.incorrectCount + (drillCard.correct ? 0 : 1),
        };
      });

      return {
        ...prev,
        flashcards,
        drillResults: [newResult, ...prev.drillResults],
        streak,
        lastDrillDate: new Date().toISOString(),
      };
    });
  }, []);

  return {
    data,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addCategory,
    addDrillResult,
  };
}

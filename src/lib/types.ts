export interface Flashcard {
  id: string;
  korean: string;
  english: string;
  category?: string;
  note?: string;
  createdAt: string;
  correctCount: number;
  incorrectCount: number;
}

export interface DrillResult {
  id: string;
  date: string;
  direction: 'en-to-kr' | 'kr-to-en';
  totalCards: number;
  correctCount: number;
  cards: { cardId: string; correct: boolean }[];
  category?: string;
}

export interface AppData {
  flashcards: Flashcard[];
  drillResults: DrillResult[];
  categories: string[];
  streak: number;
  lastDrillDate: string | null;
}

export const DEFAULT_APP_DATA: AppData = {
  flashcards: [],
  drillResults: [],
  categories: ['Greetings', 'Food', 'Travel', 'Numbers', 'Daily Life'],
  streak: 0,
  lastDrillDate: null,
};

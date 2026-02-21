export interface Flashcard {
  id: string;
  korean: string;
  english: string;
  category?: string;
  note?: string;
  createdAt: string;
  correctCount: number;
  incorrectCount: number;
  confidenceScore: number;
  weight: number;
  consecutiveFluent: number;
}

export interface DrillResult {
  id: string;
  date: string;
  direction: 'en-to-kr' | 'kr-to-en';
  totalCards: number;
  correctCount: number;
  cards: { cardId: string; confidence: number }[];
  category?: string;
}

export interface AppData {
  flashcards: Flashcard[];
  drillResults: DrillResult[];
  categories: string[];
  streak: number;
  lastDrillDate: string | null;
}

export interface GrammarPattern {
  id: string;
  patternKey: string;
  enabled: boolean;
  timesPracticed: number;
  correctFirstAttempt: number;
  correctSecondAttempt: number;
  totalAttempts: number;
  lastPracticedAt: string | null;
  confidenceScore: number;
  weight: number;
  consecutiveFluent: number;
}

export interface ConjugationQuestion {
  patternKey: string;
  baseSentence: string;
  englishPrompt: string;
  correctTiles: string[];
  resultFirstAttempt: boolean | null;
  resultSecondAttempt: boolean | null;
}

export interface ConjugationResult {
  id: string;
  date: string;
  totalQuestions: number;
  correctFirst: number;
  correctSecond: number;
  incorrect: number;
  questions: ConjugationQuestion[];
}

export const DEFAULT_APP_DATA: AppData = {
  flashcards: [],
  drillResults: [],
  categories: ['Greetings', 'Food', 'Travel', 'Numbers', 'Daily Life'],
  streak: 0,
  lastDrillDate: null,
};

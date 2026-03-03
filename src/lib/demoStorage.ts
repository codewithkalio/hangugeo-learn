import { DEMO_CATEGORIES, DEMO_WORDS } from './demoSeedData';
import type { Flashcard, DrillResult } from './types';

const KEY_FLASHCARDS = 'hangugeo-demo-flashcards';
const KEY_DRILL_RESULTS = 'hangugeo-demo-drill-results';
const KEY_CATEGORIES = 'hangugeo-demo-categories';

function genId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Build initial demo flashcards from DEMO_WORDS with UUIDs and default stats */
export function getInitialDemoFlashcards(): Flashcard[] {
  return DEMO_WORDS.map(w => ({
    id: genId(),
    korean: w.korean,
    english: w.english,
    category: w.category,
    note: w.note || undefined,
    createdAt: nowIso(),
    correctCount: 0,
    incorrectCount: 0,
    confidenceScore: 0,
    weight: 5,
    consecutiveFluent: 0,
  }));
}

/** Initial demo categories (same as DEMO_CATEGORIES) */
export function getInitialDemoCategories(): string[] {
  return [...DEMO_CATEGORIES];
}

function readFlashcards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(KEY_FLASHCARDS);
    if (!raw) {
      const initial = getInitialDemoFlashcards();
      localStorage.setItem(KEY_FLASHCARDS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Flashcard[];
    return Array.isArray(parsed) ? parsed : getInitialDemoFlashcards();
  } catch {
    return getInitialDemoFlashcards();
  }
}

function readDrillResults(): DrillResult[] {
  try {
    const raw = localStorage.getItem(KEY_DRILL_RESULTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DrillResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCategories(): string[] {
  try {
    const raw = localStorage.getItem(KEY_CATEGORIES);
    if (!raw) {
      const initial = getInitialDemoCategories();
      localStorage.setItem(KEY_CATEGORIES, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : getInitialDemoCategories();
  } catch {
    return getInitialDemoCategories();
  }
}

export function getDemoFlashcards(): Flashcard[] {
  return readFlashcards();
}

export function getDemoDrillResults(): DrillResult[] {
  return readDrillResults();
}

export function getDemoCategories(): string[] {
  return readCategories();
}

export function setDemoFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(KEY_FLASHCARDS, JSON.stringify(cards));
}

export function setDemoDrillResults(results: DrillResult[]): void {
  localStorage.setItem(KEY_DRILL_RESULTS, JSON.stringify(results));
}

export function setDemoCategories(categories: string[]): void {
  localStorage.setItem(KEY_CATEGORIES, JSON.stringify(categories));
}

/** Clear all demo data and re-initialize from seed (for Reset) */
export function resetDemoStorage(): void {
  localStorage.setItem(KEY_FLASHCARDS, JSON.stringify(getInitialDemoFlashcards()));
  localStorage.setItem(KEY_DRILL_RESULTS, JSON.stringify([]));
  localStorage.setItem(KEY_CATEGORIES, JSON.stringify(getInitialDemoCategories()));
}

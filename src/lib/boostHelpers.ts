import { Flashcard } from '@/lib/types';
import {
  Zap, Heart, Clock, BookOpen, MessageCircle, Hash, Star, Compass,
  type LucideIcon,
} from 'lucide-react';

// ── Audio ──

export function speakKorean(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const normal = new SpeechSynthesisUtterance(text);
  normal.lang = 'ko-KR';
  normal.rate = 1.0;

  const slow = new SpeechSynthesisUtterance(text);
  slow.lang = 'ko-KR';
  slow.rate = 0.4;

  normal.onend = () => {
    setTimeout(() => window.speechSynthesis.speak(slow), 400);
  };

  window.speechSynthesis.speak(normal);
}

export function isSpeechAvailable(): boolean {
  return 'speechSynthesis' in window;
}

// ── Word Selection ──

export interface BoostWordSet {
  weakWords: Flashcard[];
  anchorWords: Flashcard[];
  allWords: Flashcard[];
}

export function pickBoostWords(
  allCards: Flashcard[],
  sessionResults?: { cardId: string; confidence: number }[],
): BoostWordSet {
  const sessionWeakIds = new Set<string>();
  const sessionWeak: Flashcard[] = [];

  if (sessionResults) {
    for (const r of sessionResults) {
      if (r.confidence <= 2) {
        const card = allCards.find(c => c.id === r.cardId);
        if (card) {
          sessionWeak.push(card);
          sessionWeakIds.add(card.id);
        }
      }
    }
  }

  const bankWeak = allCards
    .filter(c => c.confidenceScore <= 2 && !sessionWeakIds.has(c.id))
    .sort((a, b) => b.weight - a.weight);

  const weakPool = [...sessionWeak, ...bankWeak].slice(0, 5);
  const weakIds = new Set(weakPool.map(c => c.id));

  const anchorPool = allCards
    .filter(c => c.confidenceScore >= 3 && !weakIds.has(c.id));
  const anchorWords = shuffleArray(anchorPool).slice(0, Math.min(3, Math.max(2, anchorPool.length)));

  return {
    weakWords: weakPool,
    anchorWords,
    allWords: [...weakPool, ...anchorWords],
  };
}

export function hasWeakWords(
  allCards: Flashcard[],
  sessionResults?: { cardId: string; confidence: number }[],
): boolean {
  if (sessionResults?.some(r => r.confidence <= 2)) return true;
  return allCards.some(c => c.confidenceScore <= 2);
}

// ── Shuffle ──

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Icon Mapping for Abstract Words ──

interface IconMapping {
  icon: LucideIcon;
  color: string; // tailwind class
  bgColor: string;
}

const CATEGORY_ICON_MAP: Record<string, IconMapping> = {
  Verb: { icon: Zap, color: 'text-accent', bgColor: 'bg-accent/15' },
  Grammar: { icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/15' },
  'Grammar Point': { icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/15' },
  Modifier: { icon: Star, color: 'text-secondary', bgColor: 'bg-secondary/15' },
  Particle: { icon: Hash, color: 'text-success', bgColor: 'bg-success/15' },
  Greetings: { icon: MessageCircle, color: 'text-accent', bgColor: 'bg-accent/15' },
  Food: { icon: Heart, color: 'text-destructive', bgColor: 'bg-destructive/15' },
  Travel: { icon: Compass, color: 'text-secondary', bgColor: 'bg-secondary/15' },
  Numbers: { icon: Hash, color: 'text-success', bgColor: 'bg-success/15' },
  'Daily Life': { icon: Clock, color: 'text-primary', bgColor: 'bg-primary/15' },
};

const DEFAULT_ICON_MAPPING: IconMapping = {
  icon: Star,
  color: 'text-muted-foreground',
  bgColor: 'bg-muted',
};

export function getIconForWord(category?: string): IconMapping {
  if (!category) return DEFAULT_ICON_MAPPING;
  return CATEGORY_ICON_MAP[category] ?? DEFAULT_ICON_MAPPING;
}

// ── Distractors ──

export function pickDistractors(
  correctId: string,
  pool: Flashcard[],
  count: number,
  field: 'korean' | 'english',
): string[] {
  const others = pool.filter(c => c.id !== correctId);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count).map(c => c[field]);
}

/**
 * Conjugation practice session helpers:
 * question picking, tile decomposition, distractor generation, explanations
 */

import { GrammarPattern, Flashcard, ConjugationQuestion } from './types';
import {
  PATTERN_DEFS,
  PATTERN_MAP,
  conjugate,
  objectParticle,
  SENTENCE_TEMPLATES,
} from './conjugationData';

// ─── Question picking (weighted by pattern performance) ─────────────

export interface SessionQuestion {
  patternKey: string;
  verbStem: string;
  verbEnglish: string;
  noun: string;
  nounKorean: string;
  baseSentence: string;
  englishPrompt: string;
  correctAnswer: string;
  correctTiles: string[];
  allTiles: string[];
}

/**
 * Pick `count` questions for a session, weighted by pattern performance.
 * Prefers verbs the user already knows well (high confidence) so cognitive
 * load stays on conjugation, not word recall.
 */
export function pickSessionQuestions(
  enabledPatterns: GrammarPattern[],
  flashcards: Flashcard[],
  count = 5,
): SessionQuestion[] {
  if (enabledPatterns.length === 0) return [];

  const verbs = flashcards
    .filter(f => f.category?.toLowerCase() === 'verb')
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
  const nouns = flashcards
    .filter(f => f.category?.toLowerCase() === 'noun')
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  if (verbs.length === 0 || nouns.length === 0) return [];

  // Weighted pattern selection — higher weight = more likely to appear
  const questions: SessionQuestion[] = [];
  const usedCombos = new Set<string>();

  for (let i = 0; i < count; i++) {
    const pattern = weightedPick(enabledPatterns);
    const verb = randomFrom(verbs.slice(0, Math.max(5, verbs.length)));
    const noun = randomFrom(nouns.slice(0, Math.max(5, nouns.length)));

    const comboKey = `${pattern.patternKey}-${verb.id}`;
    if (usedCombos.has(comboKey) && i < count * 3) {
      i--;
      continue;
    }
    usedCombos.add(comboKey);

    // Extract verb stem (remove 다 if present)
    const verbStem = verb.korean.endsWith('다')
      ? verb.korean.slice(0, -1)
      : verb.korean;

    const patternDef = PATTERN_MAP[pattern.patternKey];
    const conjugated = conjugate(verbStem, pattern.patternKey);
    const particle = objectParticle(noun.korean);

    const baseSentence = `${noun.korean}${particle} ${verbStem}다`;
    const englishPrompt = `Change to: ${patternDef?.label || pattern.patternKey}`;
    const correctAnswer = `${noun.korean}${particle} ${conjugated}`;

    const correctTiles = decomposeToTiles(conjugated);
    const distractors = generateDistractorTiles(correctTiles, pattern.patternKey);
    const allTiles = shuffle([...correctTiles, ...distractors]);

    questions.push({
      patternKey: pattern.patternKey,
      verbStem,
      verbEnglish: verb.english,
      noun: noun.english,
      nounKorean: noun.korean,
      baseSentence,
      englishPrompt,
      correctAnswer,
      correctTiles,
      allTiles,
    });
  }

  return questions;
}

function weightedPick(patterns: GrammarPattern[]): GrammarPattern {
  const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const p of patterns) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return patterns[patterns.length - 1];
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Tile decomposition ─────────────────────────────────────────────

/**
 * Split a conjugated form into morpheme-level tiles.
 * Uses spaces and common suffixes as split points.
 */
export function decomposeToTiles(conjugated: string): string[] {
  // Split on spaces first
  const parts = conjugated.split(' ').filter(Boolean);
  if (parts.length > 1) {
    return parts;
  }
  // Single word: try to split into stem + ending
  // For simple cases, return as single tile
  // For longer forms, split at natural morpheme boundaries
  if (conjugated.length <= 2) return [conjugated];

  // Common endings to split off
  const endings = ['요', '다', '서', '면', '지만', '면서', '는데도'];
  for (const end of endings) {
    if (conjugated.endsWith(end) && conjugated.length > end.length) {
      return [conjugated.slice(0, -end.length), end];
    }
  }

  return [conjugated];
}

// ─── Distractor tiles ───────────────────────────────────────────────

const NEAR_MISS_MAP: Record<string, string[]> = {
  '아': ['어'],
  '어': ['아'],
  '았': ['었'],
  '었': ['았'],
  '아요': ['어요'],
  '어요': ['아요'],
  '을': ['ㄹ'],
  'ㄹ': ['을'],
  '습니다': ['ㅂ니다'],
  'ㅂ니다': ['습니다'],
  '세요': ['셔요'],
  '고': ['게'],
  '면': ['니까'],
  '지만': ['는데'],
  '해요': ['하요'],
};

/**
 * Generate 2-3 distractor tiles that are plausible but wrong.
 */
export function generateDistractorTiles(correctTiles: string[], _patternKey: string): string[] {
  const distractors = new Set<string>();

  // Add near-miss variants of correct tiles
  for (const tile of correctTiles) {
    const nearMisses = NEAR_MISS_MAP[tile];
    if (nearMisses) {
      nearMisses.forEach(nm => distractors.add(nm));
    }
  }

  // Add some generic distractors
  const genericDistractors = ['요', '고', '지', '에서', '는', '가', '을', '았', '었', '겠'];
  while (distractors.size < 2) {
    const d = randomFrom(genericDistractors);
    if (!correctTiles.includes(d)) {
      distractors.add(d);
    }
  }

  // Limit to 3 distractors
  return [...distractors].slice(0, 3);
}

// ─── Explanations ───────────────────────────────────────────────────

const EXPLANATIONS: Record<string, string> = {
  informal_polite_present: 'Remove 다 from the dictionary form. If the last vowel is ㅏ or ㅗ, add 아요. Otherwise add 어요. 하다 becomes 해요.',
  informal_polite_past: 'Take the 아/어 form and add ㅆ어요. The tense marker ㅆ attaches to the vowel.',
  informal_polite_future: 'If the stem has no 받침, add ㄹ 거예요. With 받침 (except ㄹ), add 을 거예요. ㄹ 받침 stays as ㄹ 거예요.',
  negative_present: 'Place 안 before the verb in its 아/어요 form. Example: 안 먹어요.',
  want_to: 'Add 고 싶어요 directly to the verb stem (no vowel harmony needed).',
  can_do: 'Same ㄹ/을 rule as future: no 받침 → ㄹ 수 있어요, with 받침 → 을 수 있어요.',
  progressive: 'Add 고 있어요 directly to the stem. Like English "-ing".',
  imperative_polite: 'No 받침 or ㄹ 받침 → 세요. Other 받침 → 으세요.',
  lets_suggestive: 'No 받침 or ㄹ 받침 → ㅂ시다. Other 받침 → 읍시다.',
  formal_present: 'With 받침 (not ㄹ) → 습니다. No 받침 or ㄹ → ㅂ니다 (drop ㄹ).',
  formal_past: 'Take the 아/어 form and add ㅆ습니다.',
  because_reason: 'Take the 아/어 form and add 서. The reason comes first, result second.',
  but_contrast: 'Add 지만 directly to the stem. No conjugation needed.',
  if_conditional: 'No 받침 or ㄹ → 면. Other 받침 → 으면.',
  when_time: 'Same rule as future tense: ㄹ/을 때.',
  try_experience: 'Take the 아/어 form and add 봐요 (shortened from 보아요).',
  must_obligation: 'Take the 아/어 form and add 야 해요.',
  should_not: 'Conditional form + 안 돼요. -(으)면 안 돼요.',
  reported_speech: 'Add 다고 해요 to the stem for statements.',
  seems_like: 'Add 는 것 같아요 for present tense appearance.',
  plan_to: 'No 받침 → 려고 해요. With 받침 → 으려고 해요.',
  while_doing: 'No 받침 or ㄹ → 면서. Other 받침 → 으면서. Two simultaneous actions.',
  after_doing: 'Add 고 나서 to the stem. Sequential actions.',
  despite: 'Add 는데도 to the stem. Unexpected result.',
};

export function getExplanation(patternKey: string): string {
  return EXPLANATIONS[patternKey] || 'Review the grammar rule for this pattern.';
}

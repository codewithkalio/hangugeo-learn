import { z } from 'zod';

export const FLASHCARD_FIELD_LIMITS = {
  korean: 500,
  english: 500,
  category: 100,
  note: 1000,
} as const;

/** Strip HTML tags, javascript: protocols, and on* event handlers. */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function requiredSanitizedString(fieldName: string, max: number) {
  return z
    .string()
    .trim()
    .transform(stripHtml)
    .pipe(
      z
        .string()
        .min(1, `${fieldName} is required`)
        .max(max, `${fieldName} must be ${max} characters or fewer`)
    );
}

function optionalSanitizedString(max: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z
      .string()
      .trim()
      .transform(stripHtml)
      .pipe(z.string().max(max, `Must be ${max} characters or fewer`))
      .optional()
  );
}

export const flashcardInputSchema = z.object({
  korean: requiredSanitizedString('korean', FLASHCARD_FIELD_LIMITS.korean),
  english: requiredSanitizedString('english', FLASHCARD_FIELD_LIMITS.english),
  category: optionalSanitizedString(FLASHCARD_FIELD_LIMITS.category),
  note: optionalSanitizedString(FLASHCARD_FIELD_LIMITS.note),
});

export const flashcardUpdateSchema = z.object({
  korean: requiredSanitizedString('korean', FLASHCARD_FIELD_LIMITS.korean).optional(),
  english: requiredSanitizedString('english', FLASHCARD_FIELD_LIMITS.english).optional(),
  category: optionalSanitizedString(FLASHCARD_FIELD_LIMITS.category),
  note: optionalSanitizedString(FLASHCARD_FIELD_LIMITS.note),
});

export const categoryNameSchema = requiredSanitizedString('category', FLASHCARD_FIELD_LIMITS.category);

export type SanitizedFlashcardInput = z.output<typeof flashcardInputSchema>;
export type SanitizedFlashcardUpdates = z.output<typeof flashcardUpdateSchema>;

import { posthog } from '@/lib/posthog';
import type { DrillResult, Flashcard } from '@/lib/types';

// Keep analytics intentionally small and sanitized.
// Allowed: product events that describe outcomes or usage patterns.
// Avoid: flashcard text, notes, raw search queries, raw URLs with query params,
// raw console logs, and full error messages or stacks.
type FlashcardMode = 'create' | 'update';
type CategorySource = 'flashcard_form';
type ExceptionSource = 'window.onerror' | 'window.onunhandledrejection';

type AnalyticsEvents = {
  flashcard_saved: {
    mode: FlashcardMode;
    has_category: boolean;
    has_note: boolean;
  };
  flashcard_deleted: Record<string, never>;
  flashcard_save_failed: {
    mode: FlashcardMode;
    error_type: string;
    error_code?: string;
    http_status?: number;
    is_network_error: boolean;
  };
  category_created: {
    source: CategorySource;
    was_duplicate: boolean;
  };
  drill_completed: {
    direction: DrillResult['direction'];
    total_cards: number;
    correct_count: number;
    has_category: boolean;
  };
};

function isAnalyticsEnabled() {
  return Boolean(import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_POSTHOG_HOST);
}

function captureEvent<K extends keyof AnalyticsEvents>(event: K, properties: AnalyticsEvents[K]) {
  if (!isAnalyticsEnabled()) return;
  posthog.capture(event, properties);
}

function getErrorObject(error: unknown): Record<string, unknown> | null {
  if (error && typeof error === 'object') {
    return error as Record<string, unknown>;
  }
  return null;
}

function getSanitizedErrorProperties(error: unknown) {
  const errorObject = getErrorObject(error);
  const errorType =
    (typeof errorObject?.name === 'string' && errorObject.name) ||
    (typeof error === 'string' ? 'StringError' : 'UnknownError');
  const errorCode =
    typeof errorObject?.code === 'string'
      ? errorObject.code
      : typeof errorObject?.error_code === 'string'
        ? errorObject.error_code
        : undefined;
  const httpStatus =
    typeof errorObject?.status === 'number'
      ? errorObject.status
      : typeof errorObject?.statusCode === 'number'
        ? errorObject.statusCode
        : undefined;
  const message =
    (typeof errorObject?.message === 'string' && errorObject.message) ||
    (typeof error === 'string' ? error : '');

  return {
    error_type: errorType,
    error_code: errorCode,
    http_status: httpStatus,
    is_network_error: /network|fetch|load failed|failed to fetch/i.test(message),
  };
}

function getSanitizedPathname(urlOrPath?: string | null) {
  if (!urlOrPath) return undefined;

  try {
    return new URL(urlOrPath, window.location.origin).pathname;
  } catch {
    return undefined;
  }
}

export function capturePageView(pathname: string) {
  if (!isAnalyticsEnabled()) return;

  const sanitizedPathname = getSanitizedPathname(pathname) ?? pathname;
  posthog.capture('$pageview', {
    pathname: sanitizedPathname,
    $current_url: `${window.location.origin}${sanitizedPathname}`,
  });
}

export function captureFlashcardSaved(
  mode: FlashcardMode,
  card: Pick<Flashcard, 'category' | 'note'> | Partial<Pick<Flashcard, 'category' | 'note'>>
) {
  captureEvent('flashcard_saved', {
    mode,
    has_category: Boolean(card.category),
    has_note: Boolean(card.note),
  });
}

export function captureFlashcardDeleted() {
  captureEvent('flashcard_deleted', {});
}

export function captureFlashcardSaveFailed(mode: FlashcardMode, error: unknown) {
  captureEvent('flashcard_save_failed', {
    mode,
    ...getSanitizedErrorProperties(error),
  });
}

export function captureCategoryCreated(source: CategorySource, wasDuplicate: boolean) {
  captureEvent('category_created', {
    source,
    was_duplicate: wasDuplicate,
  });
}

export function captureDrillCompleted(result: Omit<DrillResult, 'id' | 'date'>, correctCount: number) {
  captureEvent('drill_completed', {
    direction: result.direction,
    total_cards: result.totalCards,
    correct_count: correctCount,
    has_category: Boolean(result.category),
  });
}

export function captureException(
  source: ExceptionSource,
  error: unknown,
  metadata?: { sourceUrl?: string | null; lineno?: number; colno?: number }
) {
  if (!isAnalyticsEnabled()) return;

  const sanitizedPathname = getSanitizedPathname(metadata?.sourceUrl);

  posthog.capture('$exception', {
    source,
    ...getSanitizedErrorProperties(error),
    source_pathname: sanitizedPathname,
    source_line: metadata?.lineno,
    source_column: metadata?.colno,
  });
}

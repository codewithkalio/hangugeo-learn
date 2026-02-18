

# Fix "TypeError: Load failed" on Consecutive Card Adds (Mobile)

## Problem
On mobile browsers (iOS Chrome/Safari), adding two flashcards in a row fails on the second attempt with `TypeError: Load failed`. This is a well-known mobile browser issue where `fetch` requests are cancelled or disrupted -- often caused by page navigation triggering background refetches that interfere with subsequent requests.

## Root Cause
After a successful save, `navigate('/cards')` fires, and `onSuccess` invalidates the flashcards query (triggering a refetch). When the user navigates back to `/cards/new` quickly, the previous refetch may still be in-flight or the browser's network layer is in a disrupted state, causing the next `fetch` to fail with "Load failed".

## Solution: Add retry logic to the mutation

### `src/hooks/useAppData.ts`

Add a simple retry wrapper and apply it to `addFlashcardMut.mutationFn`:

```typescript
async function retryFetch<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries || !err?.message?.includes('Load failed')) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}
```

Wrap the Supabase insert call inside `retryFetch(...)` so that transient "Load failed" errors are automatically retried (up to 2 retries with 500ms delay).

Apply the same pattern to `updateFlashcardMut` for consistency.

### `src/main.tsx` (or QueryClient config)

Also configure `react-query`'s global retry to handle transient network errors:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: 1 },
  },
});
```

This provides a two-layer safety net: the custom retry for "Load failed" specifically, and react-query's built-in retry as a fallback.

## No other files affected.


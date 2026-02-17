

# Add Logging and Error Handling for Card Creation

## Problem
On iPhone 13 / Firefox, new cards silently fail to save roughly 1 in 3 times. The current code has two issues that could cause this:

1. **Fire-and-forget mutation** -- `addFlashcard` calls `mutate()` (not `mutateAsync`), so errors are swallowed silently. The success toast fires immediately regardless of whether the insert actually succeeded.
2. **No error feedback** -- there is no `onError` handler on `addFlashcardMut`, and no logging anywhere in the flow.
3. **Immediate navigation** -- `navigate('/cards')` runs right after `mutate()`, before the insert completes. On slower mobile connections this could cause the mutation to be cancelled.

## Changes

### 1. `src/hooks/useAppData.ts` -- Add logging and error callbacks

- Add `console.log` in `addFlashcardMut.mutationFn` before and after the Supabase insert, logging the card payload and response.
- Add `console.error` when the insert fails.
- Add an `onError` callback to `addFlashcardMut` that logs the full error object.
- Change `addFlashcard` wrapper to return the mutation promise using `mutateAsync` instead of `mutate`, so the caller can await it.

### 2. `src/pages/FlashcardForm.tsx` -- Await the mutation before navigating

- Make `handleSave` an `async` function.
- `await addFlashcard(...)` inside a try/catch block.
- Only show the success toast and navigate on success.
- On catch, show an error toast ("Failed to save card -- please try again") and stay on the form so no data is lost.
- Add a loading state (disable the Save button while saving) to prevent double-taps.

### 3. `src/hooks/useAppData.ts` -- Same treatment for `updateFlashcardMut`

- Add logging and switch to `mutateAsync` so edits also get proper error handling.

---

### Technical Detail

```text
Before (fire-and-forget):
  handleSave() -> addFlashcardMut.mutate(card)  // no await
                -> toast.success(...)            // always fires
                -> navigate('/cards')            // always fires

After (awaited):
  handleSave() -> await addFlashcardMut.mutateAsync(card)
                   success -> toast.success(...) -> navigate('/cards')
                   error   -> toast.error(...)   -> stay on form
```

The console logs will automatically appear in the browser tools, and Lovable will capture them so we can review them if the issue persists.


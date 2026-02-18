

# Fix Error Logging for Flashcard Add

## Problem
When adding a flashcard fails on mobile, the console logs show `[object Object]` instead of the actual error details. This makes debugging impossible. The Supabase error object needs to be serialized properly.

## Root Cause
`console.error('[addFlashcard] Supabase error:', error)` -- on mobile Safari/Chrome, complex objects are often rendered as `[object Object]` instead of being expanded. The error details (message, code, hint) are lost.

## Changes

### `src/hooks/useAppData.ts` -- Serialize error objects in all logging

Update the `addFlashcardMut` error logging to use `JSON.stringify` so the full error is visible on mobile:

```typescript
// Before
console.error('[addFlashcard] Supabase error:', error);

// After
console.error('[addFlashcard] Supabase error:', JSON.stringify(error));
```

Apply the same fix to:
- `addFlashcardMut.onError`
- `updateFlashcardMut` error logging
- `updateFlashcardMut.onError`

Also update `FlashcardForm.tsx` catch block:

```typescript
// Before
console.error('[FlashcardForm] Save failed:', error);

// After
console.error('[FlashcardForm] Save failed:', JSON.stringify(error));
```

This will reveal the actual Supabase error (e.g., RLS violation, column mismatch, network error) so we can fix the underlying issue.

## Why not fix the root cause directly?
Without seeing the actual error message, we cannot determine the root cause. This logging fix is the necessary first step. Once deployed, reproducing the error will give us the exact Supabase error details to resolve the underlying issue.

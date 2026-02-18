

# Improve Empty State Messages in Flashcard Bank

## Problem
When a search returns no results but cards exist in the bank, the message says "No flashcards yet / Create your first card" -- which is misleading.

## Changes

### `src/pages/FlashcardBank.tsx` -- Two distinct empty states

**When `data.flashcards.length === 0`** (truly no cards):
- Show the current "No flashcards yet / Create your first card" message with the link to add a card.

**When `filtered.length === 0` but cards exist** (no search/filter matches):
- Show a message like "No matches found" with a smaller prompt to add a new card with the current search term.

### Technical Detail

Replace the single empty-state block with a conditional:

```typescript
if (filtered.length === 0 && data.flashcards.length === 0) {
  // "No flashcards yet -- Create your first card"
} else if (filtered.length === 0) {
  // "No matches found" + option to add a new card with search term
}
```

No other files are affected.


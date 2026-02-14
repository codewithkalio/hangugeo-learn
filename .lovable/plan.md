

# Add Notes Field to Flashcards

## Overview

Add an optional "notes" field to flashcards, stored in Supabase, displayed during drills, and editable when creating/editing cards (max 30 characters).

## What Changes

- A new "Notes" input appears on the Add/Edit Flashcard form (30 character limit)
- During drills, the note displays in gray italicized text below the category badge on the answer side of the card
- No other UI changes

## Technical Details

### 1. Database Migration

Add a nullable `note` column to the `flashcards` table:

```sql
ALTER TABLE flashcards ADD COLUMN note text;
```

### 2. Type Definition (`src/lib/types.ts`)

Add `note?: string` to the `Flashcard` interface.

### 3. Data Hook (`src/hooks/useAppData.ts`)

- Map `row.note` in the flashcards query
- Include `note` in `addFlashcard` insert and `updateFlashcard` update mutations

### 4. Flashcard Form (`src/pages/FlashcardForm.tsx`)

- Add `note` state, pre-populated from existing card when editing
- Add a new input field labeled "Notes (optional)" with `maxLength={30}` and a character counter
- Pass `note` through to `addFlashcard` / `updateFlashcard`

### 5. Flashcard Drill (`src/pages/FlashcardDrill.tsx`)

- On the flipped (answer) side of the card, render the note below the category badge:
  ```tsx
  {flipped && currentCard.note && (
    <p className="mt-2 text-sm text-muted-foreground italic">{currentCard.note}</p>
  )}
  ```
- The note only shows on the answer side, regardless of drill direction


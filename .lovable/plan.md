

# Implement Spaced Repetition (CBR Algorithm) -- Keeping Direction

## Overview

Replace the binary correct/incorrect drill with a confidence-based repetition algorithm. Users rate confidence 1-4 after each card. Cards get weights controlling how often they appear. Direction (Korean-to-English or English-to-Korean) remains as a secondary option below the session mode selector.

## Database Migration

Add three columns to `flashcards`:

- `confidence_score` integer NOT NULL DEFAULT 0
- `weight` integer NOT NULL DEFAULT 4
- `consecutive_fluent` integer NOT NULL DEFAULT 0

No changes to `drill_results` schema (the `cards` JSONB column format changes from `{ cardId, correct }` to `{ cardId, confidence }` but no migration needed).

## Files to Modify

### 1. `src/lib/types.ts`

- Add `confidenceScore`, `weight`, `consecutiveFluent` to `Flashcard`
- Change `DrillResult.cards` type to `{ cardId: string; confidence: number }[]`
- Replace `correctCount` in `DrillResult` with computed values downstream

### 2. `src/hooks/useAppData.ts`

- Map new columns in flashcard query (`confidence_score`, `weight`, `consecutive_fluent`)
- Rewrite `addDrillResultMut`:
  - Store `{ cardId, confidence }` format
  - Post-session: update each card's `weight = 5 - confidence`, `confidence_score`, and `consecutive_fluent`
  - If `consecutive_fluent >= 5`, set weight to near-zero (0.5 rounded to 1)

### 3. `src/pages/FlashcardDrill.tsx` -- Full Rewrite

**Setup phase:**
- Primary selector: "Smart Session" vs "Category Focus" (two big buttons)
- If Category Focus, show category dropdown
- Secondary selector (below): Direction toggle -- Korean-to-English or English-to-Korean (same two-button row as today)
- Card count summary and Start button

**Drill phase:**
- Weighted random card selection from remaining pool (no sequential index)
- Tap-to-flip card display (same as today, respecting chosen direction)
- After flip, show 4 confidence buttons instead of binary Missed/Got it:
  - 1: "No idea" -- red tint
  - 2: "Familiar" -- orange tint
  - 3: "Got it" -- blue tint
  - 4: "Fluent" -- green tint
- Tooltip icon next to the rating buttons explaining the scale
- Brief animated label after rating (e.g., "Will appear very frequently" for 1, "Will surface rarely" for 4)
- Card removed from pool after rating; next card drawn by weight
- Progress shows remaining cards count

**Summary phase:**
- Confidence distribution: how many cards rated 1, 2, 3, 4
- "Review these" section for cards rated 1 or 2
- Again / Done buttons

### 4. `src/pages/Dashboard.tsx`

- "Due for Review" counts cards with `weight >= 3`
- Accuracy/progress stat shows average confidence or percentage of cards at confidence 3+

## Weighted Random Selection

```text
function drawNextCard(pool):
  totalWeight = sum of all weights in pool
  r = Math.random() * totalWeight
  cumulative = 0
  for each card in pool:
    cumulative += card.weight
    if r <= cumulative: return card
```

## Weight Update (Post-Session)

```text
for each rated card:
  weight = 5 - confidence
  if confidence == 4: consecutiveFluent += 1
  else: consecutiveFluent = 0
  if consecutiveFluent >= 5: weight = 1 (maintenance mode)
  save weight, confidenceScore, consecutiveFluent
```

## No New Files Needed

All changes fit within existing files. No RLS changes required -- existing policies cover the new columns automatically.


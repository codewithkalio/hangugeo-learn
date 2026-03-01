

## Demo Mode: Shorter Word Boost Rounds

### What changes

Pass the demo-mode flag into `pickBoostWords` and into each round component so that demo users get 2 cards per round instead of 5.

### Steps

1. **`pickBoostWords` in `src/lib/boostHelpers.ts`** — Add an optional `isDemo` parameter. When true, slice `weakPool` to 2 (instead of 5) and `anchorWords` to 1 (instead of 2-3).

2. **`WordBoost.tsx`** — Import `useAuth` and `isDemoUser`. Pass `isDemo` flag to `pickBoostWords` so it returns a smaller word set.

3. **`MatchPairs.tsx`** — The component already slices to 6 pairs via `words.slice(0, 6)`. With fewer `allWords` passed in (3 instead of 8), this naturally produces fewer tiles. No change needed.

4. **`ListenChoose.tsx` and `TypeItOut.tsx`** — These iterate over the `words` prop directly, so they'll automatically show fewer cards when given fewer words. No change needed.

### Summary of card counts

| Mode | Weak words | Anchors | Listen & Choose | Match Pairs | Type It Out |
|------|-----------|---------|-----------------|-------------|-------------|
| Normal | up to 5 | 2-3 | 5 cards | up to 6 pairs | 5 cards |
| Demo | up to 2 | 1 | 2 cards | up to 3 pairs | 2 cards |




## Plan: Replace Word Boost Icon from `Zap` to `Sparkles`

Two files need changes. `Sparkles` is already imported in both `BoostSummary.tsx` and `FlashcardDrill.tsx`, so no new imports needed there.

### Changes

| File | What changes |
|---|---|
| **Dashboard.tsx** (line 3, 54) | Add `Sparkles` to import; replace `<Zap>` with `<Sparkles>` on the Word Boost link |
| **WordBoost.tsx** (line 3, 73) | Replace `Zap` with `Sparkles` in import; replace `<Zap>` with `<Sparkles>` in the page heading |

### No changes needed
- **FlashcardDrill.tsx** — already uses `Sparkles` for the "Boost Weak Words" button
- **BoostSummary.tsx** — already uses `Sparkles` for the accuracy display
- **Start Drill** button on Dashboard keeps `Zap`


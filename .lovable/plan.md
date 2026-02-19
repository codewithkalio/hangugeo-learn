

# Word Boost -- Reinforcement Activity (MVP)

## Overview

A post-drill activity called **Word Boost** that reinforces weak words through four mini-activity rounds with audio (Web Speech API) and visuals (Unsplash images for concrete nouns, colored Lucide icons for abstract concepts).

## Word Selection Logic (Updated)

The selection follows a two-tier fallback:

1. **First choice**: Pick words rated confidence 1-2 from the most recent drill session results
2. **Fallback**: If fewer than 5 weak words came from the session, fill remaining slots from the entire flashcard bank -- any card with `confidenceScore` of 1 or 2, sorted by highest `weight` first
3. **Anchor words**: Always add 2-3 cards with `confidenceScore >= 3` for confidence boosting
4. If the user has zero weak words anywhere (bank-wide), the "Boost Weak Words" button is hidden entirely

```text
Session weak words (conf 1-2)
        |
        v
  >= 5 words? ----YES----> Use those 5
        |
        NO
        v
  Fill from bank (conf 1-2, sorted by weight desc)
        |
        v
  >= 1 word total? --YES--> Use up to 5
        |
        NO
        v
  Hide Boost button
```

## User Flow

1. User completes a drill and sees the Summary screen
2. If weak words exist (from session or bank), a "Boost Weak Words" button appears
3. Tapping it launches `/boost` with 4 sequential rounds:
   - **Listen and Choose**: Korean audio plays; pick correct English from 4 options
   - **Picture Match**: See image/icon; pick correct Korean word from 4 options
   - **Match Pairs**: 4x3 memory grid, tap to match Korean-English pairs
   - **Type It Out**: See English + hear Korean; type the Korean answer
4. Boost Summary shows accuracy and encouragement

## Audio -- Web Speech API

- `speakKorean(text)` helper using `SpeechSynthesisUtterance` with `lang: 'ko-KR'`
- Speaker icon button for replay
- If `speechSynthesis` unavailable, skip Listen and Choose round and hide speaker buttons

## Visuals -- Unsplash + Lucide Icons

- **Unsplash**: Supabase Edge Function `fetch-image` proxies search API, returns small photo URL for concrete nouns
- **Lucide Icons**: Mapping of abstract categories to icon + color combos (e.g., verbs -> Zap/orange, feelings -> Heart/red, time -> Clock/green)
- Rendered as large colored icons on a soft background circle

## New Files

- `src/pages/WordBoost.tsx` -- Main page with phase management (listen-choose, picture-match, match-pairs, type-it, summary)
- `src/components/boost/ListenChoose.tsx` -- Audio quiz round
- `src/components/boost/PictureMatch.tsx` -- Visual association round
- `src/components/boost/MatchPairs.tsx` -- Memory grid round
- `src/components/boost/TypeItOut.tsx` -- Active recall typing round
- `src/components/boost/BoostSummary.tsx` -- Results and encouragement
- `src/lib/boostHelpers.ts` -- `speakKorean()`, `pickBoostWords()`, `getIconForWord()`, `shuffleArray()`
- `supabase/functions/fetch-image/index.ts` -- Unsplash proxy edge function

## Changes to Existing Files

- **`src/pages/FlashcardDrill.tsx`**: Add "Boost Weak Words" button in summary phase; pass session card results + IDs via route state to `/boost`; only show button if weak words exist in session OR bank
- **`src/App.tsx`**: Add `/boost` route (protected, with AppLayout)

## `pickBoostWords` Logic Detail

```text
function pickBoostWords(allCards, sessionResults?):
  1. sessionWeak = session cards rated 1-2 (if session provided)
  2. bankWeak = all cards with confidenceScore 1-2, excluding already-picked session cards
  3. weakPool = [...sessionWeak, ...bankWeak sorted by weight desc].slice(0, 5)
  4. anchorPool = cards with confidenceScore >= 3, excluding weakPool, shuffled, take 2-3
  5. return { weakWords: weakPool, anchorWords: anchorPool }
```

## Secret Required

- `UNSPLASH_ACCESS_KEY` -- from a free Unsplash developer account (unsplash.com/developers)


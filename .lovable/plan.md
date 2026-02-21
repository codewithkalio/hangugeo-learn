

# Verb Conjugation Practice

## What's Being Built

A new **Conjugation Practice** activity where you transform Korean sentences between grammar patterns by tapping morpheme tiles. You'll select which grammar patterns you've learned in Settings, and the activity generates exercises from your flashcard vocabulary. Sessions are 5 questions each, with one retry allowed and rule-specific explanations on failure.

The activity launches from the **Home page only** -- no new nav entries in the bottom bar or sidebar.

---

## How It Works

1. **Settings** -- A new "Grammar Patterns I've Learned" section with 26 patterns in three collapsible groups (Early, Intermediate, Advanced). Check/uncheck freely.
2. **Home page** -- A new quick-action card appears when you have at least one pattern enabled and enough verbs/nouns in your flashcard bank.
3. **Practice session** -- 5 transformation questions per session. Each shows a sentence in informal polite present and asks you to conjugate it to a target pattern using morpheme tiles.
4. **Feedback** -- Correct on first try = advance. Wrong = one retry with tiles staying in place. Wrong again = show correct answer with an explanation of the rule.
5. **Results** -- Summary screen consistent with existing Drill and Word Boost patterns, with per-pattern accuracy tracking.

---

## Implementation Sequence

### Step 1: Database Tables and RLS

Two new tables:

**grammar_patterns**
- id, user_id, pattern_key, enabled, times_practiced, correct_first_attempt, correct_second_attempt, total_attempts, last_practiced_at, confidence_score (default 0), weight (default 4), consecutive_fluent (default 0)
- Unique constraint on (user_id, pattern_key)
- RLS: users CRUD only their own rows

**conjugation_results**
- id, user_id, date, total_questions, correct_first, correct_second, incorrect, questions (jsonb)
- RLS: users CRUD only their own rows

### Step 2: Types and Static Data

- **src/lib/types.ts** -- Add `GrammarPattern` and `ConjugationResult` interfaces
- **src/lib/conjugationData.ts** -- All 26 pattern definitions (key, label, group, Korean suffix), sentence templates, and the `conjugate()` function handling vowel harmony, consonant/vowel stems, and irregular verbs via lookup table

### Step 3: Conjugation Engine Helpers

- **src/lib/conjugationHelpers.ts**
  - `pickSessionQuestions()` -- selects 5 questions weighted by pattern performance
  - `decomposeToTiles()` -- splits conjugated forms into morpheme tiles
  - `generateDistractorTiles()` -- near-miss tiles (e.g. 았 vs 었)
  - `getExplanation()` -- rule-specific feedback text

### Step 4: Data Layer Updates

- **src/hooks/useAppData.ts** -- Add queries for `grammar_patterns` and `conjugation_results`, plus mutations for toggling patterns, saving results, and updating pattern stats
- **src/contexts/AppContext.tsx** -- Extend context type and fallback with grammar pattern data and mutations

### Step 5: Settings UI

- **src/components/settings/GrammarPatterns.tsx** -- Three collapsible groups with checkboxes for each pattern (Korean label + English description). Toggles persist to `grammar_patterns` table.
- **src/pages/Settings.tsx** -- Add a "Grammar Patterns" card linking to the new component (inline or at `/settings/grammar`)

### Step 6: Activity Components

- **src/components/conjugation/TilePool.tsx** -- Two zones (construction area + tile pool), tap to move tiles between zones, auto-evaluate when correct tile count reached, generous tap target spacing
- **src/components/conjugation/QuestionCard.tsx** -- Shows base sentence, English instruction, TilePool, and handles first-attempt / retry / show-answer states
- **src/components/conjugation/ConjugationSummary.tsx** -- Results screen following existing BoostSummary pattern

### Step 7: Main Page and Routing

- **src/pages/ConjugationPractice.tsx** -- Manages intro -> drill (5 questions) -> summary flow. Checks for sufficient verbs/nouns and shows a message if not enough.
- **src/App.tsx** -- Add `/conjugation` route (protected, with AppLayout)

### Step 8: Dashboard Integration

- **src/pages/Dashboard.tsx** -- Add a "Conjugation Practice" quick-action card (similar style to the Word Boost card), visible only when the user has enabled at least one grammar pattern AND has enough verbs and nouns in their flashcard bank

---

## Technical Notes

- The conjugation engine handles Korean morphophonemic rules: vowel harmony (아/어), consonant vs vowel stem detection for (으) insertion, and a lookup table for common irregular verbs (ㅂ, ㄷ, ㅅ, ㅎ, 르, ㄹ irregulars)
- Pattern weighting reuses the same CBR algorithm as flashcard drills -- patterns with low confidence scores surface more frequently
- Vocabulary selection prefers high-confidence flashcards so the cognitive load stays on conjugation, not word recall
- All user inputs in the tile interface are pre-defined morpheme options (no free-text input), so injection risk is minimal
- No changes to BottomNav or DesktopSidebar


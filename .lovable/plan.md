

## Plan: Add Verb Conjugation to Reverted Features

Add a new entry under the **Reverted Features** section in `docs/APP_SUMMARY.md` (after the Picture Match entry at line 200), and update the Picture Match "What remains" line to reflect that the edge function has now been removed.

### Changes to `docs/APP_SUMMARY.md`

**1. Update Picture Match "What remains" (line 200)**

Replace the current text noting the edge function is "still deployed" with: the `fetch-image` edge function and its source code have been fully removed from the project.

**2. Append new entry after line 200**

Add a **Verb Conjugation Practice** subsection covering:

- **What it was:** A conjugation drill where users transformed Korean sentences between 26 grammar patterns (Early/Intermediate/Advanced) by tapping morpheme tiles. Sessions were 5 questions each with one retry per question and rule-specific explanations on failure.
- **How it worked:** Users enabled grammar patterns in Settings. A quick-action card appeared on the Dashboard when patterns were enabled and sufficient verbs/nouns existed. The conjugation engine handled vowel harmony, consonant/vowel stems, and irregular verbs. Pattern weighting reused the CBR algorithm. Vocabulary selection preferred high-confidence flashcards to keep cognitive load on conjugation.
- **What it included:** Two new database tables (`grammar_patterns`, `conjugation_results`), a conjugation engine with morpheme decomposition and distractor generation, a tile-based interaction UI, Settings integration, and Dashboard conditional visibility.
- **Why it was reverted:** (To be confirmed — the plan document does not state the reason. Will note it was reverted without specifying cause unless you provide one.)
- **What remains:** Nothing — all code and database tables were removed.


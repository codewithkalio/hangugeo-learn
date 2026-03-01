# 🌸 한국어 Learn — App Summary

A Korean language flashcard learning app with spaced repetition, multi-round reinforcement drills, and a neumorphic SoftUI design system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + custom SoftUI design system |
| Animation | Framer Motion |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) |
| Analytics | PostHog (autocapture, session recording) |
| Charts | Recharts |
| Fonts | Nunito (display), Inter (body) |
| Color Palette | `#066057`, `#318067`, `#4BC1A0`, `#C9D1A5`, `#E1814C`, `#D05657` + Sunflower accent `#F0B429` |

---

## Features

### 1. Authentication

- **Magic link** login in production, **email/password** in development
- Auto-detects environment via `window.location.hostname`
- Protected routes via `<ProtectedRoute>` wrapper
- User session managed through Supabase Auth + React context

### 2. Flashcard CRUD

- Create, edit, and delete flashcards with fields: **Korean**, **English**, **Category**, **Note**
- **Hangul detection** auto-prefills the Korean field when Hangul characters are typed into either input
- Inline category creation — type a new category name directly in the select dropdown
- Each card tracks: `correctCount`, `incorrectCount`, `confidenceScore`, `weight`, `consecutiveFluent`

### 3. Flashcard Bank

- Searchable list with real-time text filtering across Korean and English fields
- Category filter dropdown
- Per-card accuracy percentage badge
- Animated list with Framer Motion staggered entrance
- Contextual empty states with call-to-action buttons (e.g., "Add your first card")

### 4. Flashcard Drill

- **Two session modes:**
  - **Smart Session** — weighted random selection, capped at 15 cards per session
  - **Category Focus** — drill only cards from a chosen category
- **Direction toggle:** Korean → English or English → Korean
- **Flip-card UI** with tap-to-reveal interaction
- **Korean TTS** button on the Korean-language side
- **4-point confidence rating:** No idea (1), Familiar (2), Got it (3), Fluent (4)
- **CBR spaced repetition algorithm:**
  - `weight = 5 − confidence`
  - Consecutive "Fluent" ratings apply decay: `weight = max(1, weight − consecutiveFluent)`
  - Higher-weight cards are drawn more frequently
- **No-repeat rule:** each card appears only once per session
- **Session summary:** confidence distribution grid, average score, review list for weak cards, optional Word Boost link

### 5. Word Boost

A multi-round reinforcement module for weak words, accessible after a drill session.

- **Round 1 — Listen & Choose:** Audio plays a Korean word; user picks the correct English translation from 4 options
- **Round 2 — Match Pairs:** Grid of Korean and English tiles; user matches pairs by tapping
- **Round 3 — Type It Out:** User types the Korean word from an English prompt
- **Round 4 — Summary:** Per-round score breakdown with overall performance

**Word selection logic (tiered):**
1. Words rated ≤ 2 in the current drill session
2. Words with lowest confidence scores across the entire bank
3. Anchor words (random high-confidence cards for variety)

**Graceful fallbacks:**
- If Web Speech API is unavailable, Round 1 is skipped entirely
- If no weak words exist, a celebratory empty state is shown
- Conditional visibility on Dashboard — Word Boost link only appears when weak words exist

### 6. Korean TTS

- Uses the **Web Speech API** (`speechSynthesis`)
- **Two-pass playback:** first at normal rate, then at slow rate (0.7×)
- Feature detection — TTS buttons only render when a Korean voice is available
- Shared helper: `speakKorean()` in `lib/boostHelpers.ts`

### 7. CSV Import

- Dialog-based import flow with file picker
- Parses CSV with column mapping (Korean, English, Category, Note)
- **Zod schema validation** for each row
- **HTML/XSS sanitization** via `lib/csvSanitize.ts` — strips tags and dangerous patterns
- **Duplicate detection** with resolution options: keep original or keep CSV version
- Auto-seeds new categories found in the CSV into the categories table

### 8. Stats Page

- **Overview cards:** total cards, total drills, average confidence, current streak
- **SVG confidence ring:** circular progress indicator for overall confidence
- **Category bar chart:** Recharts horizontal bar chart showing per-category performance
- **Weakest words list:** cards with the lowest confidence scores
- **Recent drills history:** last 10 drill sessions with date, direction, and score

### 9. Dashboard

- Time-based greeting ("Good morning/afternoon/evening")
- **Quick action cards:** Start Drill, Word Boost (conditional), Flashcard Bank, Add Card
- Stats summary cards with key metrics
- Staggered entrance animations via Framer Motion
- Sunflower yellow (`#F0B429`) accent on Zap and Sparkles icons

### 10. Navigation

- **Mobile:** bottom navigation bar with 5 tabs (Home, Cards, Drill, Stats, Settings)
- **Desktop:** persistent left sidebar with the same navigation items
- Responsive layout switches at the `md` breakpoint
- Active route highlighting with SoftUI accent styles

### 11. SoftUI Design System

- **Neumorphic shadows:** custom `soft-card`, `soft-btn`, `soft-inset` CSS classes
- **Light and dark themes** via CSS custom properties and `next-themes`
- Semantic color tokens: `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--success`
- Consistent border-radius scale, font-weight tokens, and spacing
- Sunflower yellow `#F0B429` used as icon accent color for Zap and Sparkles icons

### 12. PostHog Analytics

- **Autocapture** enabled for clicks, form submissions, page views
- **Session recording** for replay and debugging
- **Page view tracking** on route changes
- **User identification** linked to Supabase auth user ID
- **Global error forwarding** via `lib/errorCapture.ts` — captures unhandled errors and sends to PostHog

### 13. Security

- **Row Level Security (RLS)** on all tables — users can only CRUD their own data
- **CSV sanitization** guards against HTML injection and XSS in imported data
- **Protected routes** redirect unauthenticated users to `/auth`
- **Retry logic** on Supabase queries for transient network failures
- Input fields use controlled React state (no `dangerouslySetInnerHTML`)

---

## Database Schema

### `flashcards`

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID | FK to auth.users, RLS scoped |
| korean | TEXT | Required |
| english | TEXT | Required |
| category | TEXT | Nullable |
| note | TEXT | Nullable |
| correct_count | INT | Default 0 |
| incorrect_count | INT | Default 0 |
| confidence_score | INT | Default 0 |
| weight | INT | Default 5 |
| consecutive_fluent | INT | Default 0 |
| created_at | TIMESTAMPTZ | Auto-set |

### `drill_results`

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID | FK to auth.users, RLS scoped |
| date | TIMESTAMPTZ | Auto-set |
| direction | TEXT | 'en-to-kr' or 'kr-to-en' |
| total_cards | INT | |
| correct_count | INT | |
| cards | JSONB | Array of `{cardId, confidence}` |
| category | TEXT | Nullable |

### `categories`

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID | FK to auth.users, RLS scoped |
| name | TEXT | Required |

---

## Reverted Features

### Picture Match Round (Word Boost)

- **What it was:** A fourth round in the Word Boost flow where users matched Korean words to Unsplash images
- **How it worked:** The `fetch-image` edge function proxied requests to the Unsplash API, returning relevant photos for English translations. Users tapped the image that matched the spoken Korean word.
- **Why it was reverted:** Image relevance was unreliable (e.g., searching "hello" returned generic photos), and the round added latency from API calls. The simpler **Match Pairs** text-based round replaced it with better reliability and instant load times.

### Verb Conjugation Practice

- **What it was:** A conjugation drill where users transformed Korean sentences across 26 grammar patterns (Early/Intermediate/Advanced) by tapping morpheme tiles. Sessions were 5 questions each, with one retry per question and rule-specific explanations on failure.
- **How it worked:** Users enabled grammar patterns in Settings. A quick-action card appeared on the Dashboard when patterns were enabled and sufficient verbs/nouns existed. The conjugation engine handled vowel harmony, consonant/vowel stems, and irregular verbs (ㄷ, ㅂ, ㅅ, ㅎ, 르, ㄹ). Pattern weighting reused the CBR algorithm. Vocabulary selection preferred high-confidence flashcards to keep cognitive load on conjugation rather than recall.
- **What it included:** Two new database tables (`grammar_patterns`, `conjugation_results`), a conjugation engine with morpheme decomposition and distractor generation, a tile-based interaction UI, Settings integration, and Dashboard conditional visibility.
- **Why it was reverted:** The dynamic nature of this feature was its downfall.  Using the user's existing vocabulary to build sentences resulted in unintelligible sentences (ex: "I slept the book" or "You will drive the house").  The complexity of Korean verb conjugation would require many iterations to nail this approach.  
- **What remains:** Nothing — all code and database tables were removed.  Reverted on Feb 21.

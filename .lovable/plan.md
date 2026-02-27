

## Plan: Create App Summary Document

Create a single Markdown file at `docs/APP_SUMMARY.md` documenting all features built, the tech stack, database schema, and reverted features.

### File to create

**`docs/APP_SUMMARY.md`** — comprehensive summary covering:

1. **Tech Stack** — React 18, TypeScript, Vite, Tailwind (SoftUI), Framer Motion, Supabase, PostHog, Nunito/Inter fonts, color palette
2. **Authentication** — Magic link (production) / email-password (dev), protected routes, auto mode detection
3. **Flashcard CRUD** — Create/edit/delete with Korean, English, category, note fields; Hangul detection for smart field prefill; inline category creation
4. **Flashcard Bank** — Searchable/filterable list, per-card accuracy stats, animated list, contextual empty states with CTAs
5. **Flashcard Drill** — Smart Session (weighted, 15-card cap) and Category Focus modes; Korean↔English direction toggle; flip-card with TTS; 4-point confidence rating; CBR spaced repetition algorithm (weight = 5 − confidence, consecutive fluent decay); no-repeat rule; session summary with confidence distribution
6. **Word Boost** — 4-round reinforcement (Listen & Choose, Match Pairs, Type It Out, Summary); tiered word selection (session weak → bank weak → anchors); conditional visibility; graceful fallbacks
7. **Korean TTS** — Web Speech API, two-pass playback (normal then slow), feature detection
8. **CSV Import** — Dialog with file parsing, Zod validation, HTML/XSS sanitization, duplicate detection with keep-original/keep-CSV options, auto category seeding
9. **Stats Page** — Overview cards, SVG confidence ring, Recharts category bar chart, weakest words list, recent drills history
10. **Dashboard** — Greeting, quick actions, conditional Word Boost link, stats summary cards, staggered animations
11. **Navigation** — Mobile bottom nav + desktop sidebar, responsive layout
12. **SoftUI Design System** — Neumorphic shadows, light/dark themes, custom CSS classes, Sunflower yellow icon accent
13. **PostHog Analytics** — Autocapture, session recording, page views, user identification, global error forwarding
14. **Edge Functions** — `fetch-image` Unsplash proxy
15. **Security** — RLS, CSV sanitization, protected routes, retry logic
16. **Database Schema** — flashcards, drill_results, categories tables; 4 migrations
17. **Reverted Features** — Picture Match round (Word Boost) replaced by Match Pairs; `fetch-image` edge function remains but the image-based round was removed

### Technical details

Single file creation, no code changes. Content sourced from full codebase review of all pages, components, hooks, helpers, contexts, edge functions, migrations, and design tokens.


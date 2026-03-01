

## Demo Mode — Implementation Plan

### Overview
Add a "Try Demo" button on the Auth page that instantly logs visitors in via Supabase anonymous auth, seeds 50 Korean vocabulary flashcards, and shows a persistent banner with Reset and Sign Up actions.

### Steps

1. **Enable anonymous sign-ins** — Manual step in Supabase Dashboard: Authentication → Settings → toggle on "Allow anonymous sign-ins"

2. **Create demo seed data** (`src/lib/demoSeedData.ts`) — Static array of 50 Korean words across 7 categories (Greetings, Food, Travel, Numbers, Daily Life, Verbs, Modifiers) with Korean text, English translation, category, and a short note

3. **Create demo helper utilities** (`src/lib/demoHelpers.ts`)
   - `isDemoUser(user)` — checks `user.is_anonymous`
   - `seedDemoCards(userId)` — bulk-inserts categories + 50 flashcards
   - `resetDemo(userId)` — deletes all user data (flashcards, drill_results, categories), then re-seeds

4. **Update Auth page** (`src/pages/Auth.tsx`) — Add a "Try Demo" button below the sign-in form that calls `signInAnonymously()`, seeds data, and redirects to `/`

5. **Create DemoBanner component** (`src/components/DemoBanner.tsx`) — Slim animated banner shown for anonymous users with:
   - "Exploring demo mode" label
   - Reset button (with AlertDialog confirmation)
   - Sign Up CTA (navigates to `/auth`)

6. **Update AppLayout** (`src/components/AppLayout.tsx`) — Render `<DemoBanner />` above main content when `isDemoUser` is true

7. **Invalidate queries after seed/reset** — Call `queryClient.invalidateQueries` for flashcards, drillResults, and categories so the UI refreshes immediately

### What stays unchanged
- Database schema (no migrations needed)
- RLS policies (anonymous users get `authenticated` role with a real `auth.uid()`)
- API hardening (anonymous auth uses `authenticated` role, not the revoked `anon` Postgres role)


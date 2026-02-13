# Set Up Supabase Backend Database with RLS

## Overview

Migrate the app from localStorage to Supabase database tables. Each user's flashcards, drill results, and categories will be stored in the database, secured with Row-Level Security (RLS) policies so users can only access their own data.

## What You'll See

- All data (flashcards, drill results, categories) persisted in the cloud instead of localStorage
- Daily streak data will be excluded
- Data syncs across devices when logged in
- No visible UI changes -- everything works the same, just backed by Supabase

## Technical Details

### 1. Create Database Tables (SQL Migration)

**flashcards**

- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL, references auth.users(id) on delete cascade)
- `korean` (text, NOT NULL)
- `english` (text, NOT NULL)
- `category` (text, nullable)
- `correct_count` (integer, default 0)
- `incorrect_count` (integer, default 0)
- `created_at` (timestamptz, default now())

**drill_results**

- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL, references auth.users(id) on delete cascade)
- `direction` (text, NOT NULL) -- 'en-to-kr' or 'kr-to-en'
- `total_cards` (integer, NOT NULL)
- `correct_count` (integer, NOT NULL)
- `cards` (jsonb, NOT NULL) -- array of {cardId, correct}
- `category` (text, nullable)
- `date` (timestamptz, default now())

**categories**

- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL, references auth.users(id) on delete cascade)
- `name` (text, NOT NULL)
- unique constraint on (user_id, name)
  &nbsp;

### 2. RLS Policies (one per table, same pattern)

For each table, enable RLS and create four policies:

- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`

All policies are scoped to `authenticated` role only.

### 3. Seed Default Categories

Insert default categories per user via application code on first login (not in the migration). When the categories table is empty for a user, the app will insert the defaults: Noun, Grammar Point, Modifier, Particle, Verb.

### 4. Rewrite `useAppData` Hook

Replace the localStorage-based `useAppData` hook with Supabase queries:

- Use `@tanstack/react-query` (already installed) for data fetching with `useQuery` and `useMutation`
- `addFlashcard` -> `supabase.from('flashcards').insert()`
- `updateFlashcard` -> `supabase.from('flashcards').update().eq('id', id)`
- `deleteFlashcard` -> `supabase.from('flashcards').delete().eq('id', id)`
- `addCategory` -> `supabase.from('categories').insert()`
- `addDrillResult` -> insert into `drill_results`, update card stats in `flashcards`, and upsert `user_streaks`
- All queries filtered by the authenticated user (RLS handles security, but explicit filters improve clarity)
- Seed default categories on first load if none exist

### 5. Update `AppContext`

Update the context to pass through the new hook's return values. The interface stays the same so consuming components (Dashboard, FlashcardBank, FlashcardDrill, Stats, FlashcardForm) require minimal changes.

### 6. Update Type Definitions

Add Supabase-compatible types alongside the existing frontend types. The `id` fields become `string` (uuid from DB), timestamps become ISO strings -- these already match the current types.
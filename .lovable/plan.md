

# CSV Import Feature with Input Sanitization

## Overview

Add a CSV import flow from the Settings page. The user uploads a CSV with `korean, english, category, note` columns. Before importing, a dialog asks how to handle duplicates. All input is sanitized to prevent injection attacks.

## User Flow

1. User taps "Import CSV" on the Settings page
2. A dialog opens with a file input for selecting a `.csv` file
3. After selecting a file, the dialog parses and validates it client-side, showing a summary (e.g., "12 cards found, 3 duplicates")
4. A radio group asks: "How should we handle duplicates?" with two options:
   - Keep original (skip duplicates)
   - Keep CSV version (overwrite category/note of existing card)
5. User confirms, import runs
6. A toast shows the result (e.g., "Imported 9 new cards, skipped 3 duplicates")

## Input Sanitization

Every field from the CSV will be validated and sanitized before it touches the database:

- **Strip HTML/script tags**: Remove any `<script>`, `<img onerror=...>`, event handler attributes, and other HTML tags using a regex strip pass
- **Length limits**: `korean` and `english` capped at 500 characters, `category` at 100 characters, `note` at 1000 characters
- **Trim whitespace**: All fields trimmed of leading/trailing whitespace
- **Reject empty required fields**: Rows missing `korean` or `english` after sanitization are skipped
- **Zod validation**: Each row is validated through a zod schema before insertion
- **Supabase parameterized queries**: The Supabase SDK already uses parameterized queries, which prevents SQL injection by design -- but the sanitization above catches XSS and other payload types

A dedicated `sanitizeCsvRow` utility function will handle the cleaning, and a `csvRowSchema` zod schema will enforce the constraints.

## Technical Details

### New File: `src/pages/CsvImport.tsx`

A dialog component containing:

- File input accepting `.csv` only
- Client-side CSV parser (split-based, supports quoted fields)
- Header validation (must contain `korean` and `english` columns, case-insensitive)
- Sanitization pass on every parsed row using the utility function
- Duplicate detection against existing flashcards from `useAppData`
- Summary display (new count, duplicate count, skipped/invalid count)
- Radio group for duplicate handling
- Import button that:
  - Inserts new rows via `supabase.from('flashcards').insert(...)`
  - For "keep CSV" mode, updates duplicates via `supabase.from('flashcards').update(...)`
  - Seeds any new categories via `addCategory`
  - Invalidates the flashcards query cache
- Toast notification with results

### Modified File: `src/pages/Settings.tsx`

- Add an "Import CSV" menu item below the Stats link (same card style with `Upload` icon and chevron)
- Clicking it opens the `CsvImport` dialog via state toggle

### Sanitization Details

```text
csvRowSchema = z.object({
  korean:   z.string().trim().min(1).max(500).transform(stripHtml),
  english:  z.string().trim().min(1).max(500).transform(stripHtml),
  category: z.string().trim().max(100).transform(stripHtml).optional(),
  note:     z.string().trim().max(1000).transform(stripHtml).optional(),
})

stripHtml(input):
  - Remove all HTML tags via regex: /<[^>]*>/g
  - Remove javascript: protocol references
  - Remove on* event handler patterns (onerror, onclick, etc.)
  - Collapse multiple whitespace
```

### No Database Changes Required

The existing `flashcards` and `categories` tables already have the needed columns and RLS policies in place.


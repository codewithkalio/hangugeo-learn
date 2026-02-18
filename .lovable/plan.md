

# Unify Flashcard Search and Add Flow

## Overview
Make the Flashcard Bank search bar the single entry point for all flashcard CRUD. Remove the floating "+" button, add an inline "Add Card" action tied to the current search term, and pass that term to the form page with smart field detection (Hangul vs English).

## Changes

### 1. FlashcardBank.tsx -- Enhanced search + add entry point

- **Search includes notes**: Extend the filter logic to also match against `c.note`.
- **Clear button**: Add an "X" button inside the search input that appears when the field is non-empty, clearing the search on click.
- **Show notes in results**: Display `card.note` (if present) in each result row as a small italic gray line below the English text.
- **Remove floating "+" FAB**: Delete the fixed-position `<Link to="/cards/new">` at the bottom.
- **Add "Add Card" button near the top**: Place a `<Plus>` icon button next to the search bar (right side, before the category filter). When clicked, navigate to `/cards/new?q={encodeURIComponent(search)}` so the search term is passed along.
- **Empty state**: Update the empty-state "Create your first card" link to also pass the search term as a query param.

### 2. FlashcardForm.tsx -- Accept and pre-populate from query param

- Read `q` from `useSearchParams()` on mount (only for new cards, not edits).
- Detect if `q` contains any Hangul characters (regex `/[\u3131-\uD79D]/`). If yes, set it as the Korean field; otherwise, set it as the English field.
- Always auto-focus the Korean input field using a `useRef` + `useEffect`.
- Remove the "Similar cards" section at the bottom (this functionality is now handled by the search page itself).

### 3. Dashboard.tsx -- Redirect "Add Flashcard" to search page

- Change the "Add Flashcard" button link from `/cards/new` to `/cards` so it routes to the Flashcard Bank (the unified search/add page).

### 4. Routes (App.tsx) -- No changes needed

The `/cards/new` route still exists for the form; it just receives an optional `?q=` query param now.

---

## Technical Details

**Hangul detection** in FlashcardForm:
```typescript
const hasHangul = (str: string) => /[\u3131-\uD79D]/.test(str);
```

**Query param flow**:
- FlashcardBank navigates: `navigate(`/cards/new?q=${encodeURIComponent(search)}`)`
- FlashcardForm reads: `const [searchParams] = useSearchParams(); const q = searchParams.get('q') || '';`

**Auto-focus**: `useRef<HTMLInputElement>` on the Korean input + `useEffect(() => ref.current?.focus(), [])`.

**Search filter update** (FlashcardBank):
```typescript
const matchSearch =
  c.korean.includes(search) ||
  c.english.toLowerCase().includes(search.toLowerCase()) ||
  (c.note && c.note.toLowerCase().includes(search.toLowerCase()));
```


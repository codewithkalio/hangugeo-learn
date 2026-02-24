

## Replace Flashcard Icons with CopyPlus and Restore Dashboard Emoji

Two changes:

### 1. Replace all `Layers` flashcard icons with `CopyPlus`

Every place where `Layers` is used to represent flashcards gets swapped to `CopyPlus`.

| File | Line(s) | Change |
|---|---|---|
| **DesktopSidebar.tsx** | 2, 8 | Import `CopyPlus` instead of `Layers`; use it for the Flashcards nav link |
| **BottomNav.tsx** | 2, 8 | Import `CopyPlus` instead of `Layers`; use it for the Cards tab |
| **FlashcardBank.tsx** | 4, 44 | Import `CopyPlus` instead of `Layers`; use in page heading |
| **FlashcardDrill.tsx** | 4, 253 | Import `CopyPlus` instead of `Layers`; use in "Review these" label |
| **Dashboard.tsx** | 3, 45, 77 | Import `CopyPlus` instead of `Layers`; use in "Add Flashcard" quick action and "Due for Review" stat card |

### 2. Restore 👋 emoji on Dashboard heading

| File | Line(s) | Change |
|---|---|---|
| **Dashboard.tsx** | 3, 31 | Remove `Hand` import; replace `<Hand className="h-7 w-7 text-primary" />` with the `👋` emoji |

### Technical notes
- `CopyPlus` is confirmed available in the installed `lucide-react` v0.462.0
- No new dependencies needed
- Sizing stays consistent: `h-5 w-5` for sidebar/headings, `h-4 w-4` for inline, `h-6 w-6` for dashboard action cards


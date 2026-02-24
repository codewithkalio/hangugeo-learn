

## Updated Plan: Replace Emojis with Lucide Icons

Same plan as before with one change: **use `Layers` instead of `BookOpen`** for flashcard-related icons.

### Updated mapping

| File | Emoji removed | Lucide replacement |
|---|---|---|
| **DesktopSidebar.tsx** | `🏠` `📚` `⚡` `⚙️` | Use existing `icon` property — but change `BookOpen` to `Layers` in the `links` array |
| **FlashcardBank.tsx** | `📚` in heading | `Layers` icon |
| | `📭` empty state | `Inbox` icon |
| | `🔍` no-match state | `SearchX` icon |
| **FlashcardDrill.tsx** | `📖` "Review these" label | `Layers` icon |
| **Dashboard.tsx** | `👋` in heading | `Hand` icon |
| | `⚡` in Word Boost link | `Zap` icon |
| **FlashcardDrill.tsx** | `⚡` heading / button | `Zap` icon |
| | `🎉`/`👍`/`💪` summary | `Trophy`/`ThumbsUp`/`Dumbbell` |
| **WordBoost.tsx** | `⚡` heading | `Zap` icon |
| | `🎉` no weak words | `PartyPopper` icon |
| **Settings.tsx** | `⚙️` heading | `Settings` icon |
| **Auth.tsx** | `✨` buttons | `Sparkles` icon |
| | `🛠` dev label | `Wrench` icon |
| **BoostSummary.tsx** | `🌟`/`👍`/`💪` | `Trophy`/`ThumbsUp`/`Dumbbell` |

### Kept as-is
- 🇰🇷 and 🇺🇸 flag emojis remain unchanged everywhere

### Technical notes
- `Layers` is available in `lucide-react` — no new dependencies
- In `DesktopSidebar.tsx`, the `links` array already has an `icon` field; change `BookOpen` import to `Layers` and update the entry, then render `<Icon className="h-5 w-5" />` instead of `<span>{emoji}</span>`
- Sizing: `h-5 w-5` for headings, `h-4 w-4` for inline/button contexts


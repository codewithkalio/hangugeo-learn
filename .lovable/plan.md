

## Plan: Apply Sunflower Yellow (#F0B429) to Zap and Sparkles Icons

Apply `text-[#F0B429]` to every `<Zap>` and `<Sparkles>` icon across three files.

### Changes

| File | Line | Current | New class |
|---|---|---|---|
| **Dashboard.tsx** | 41 | `<Zap className="h-6 w-6" />` | `<Zap className="h-6 w-6 text-[#F0B429]" />` |
| **Dashboard.tsx** | 54 | `<Sparkles className="h-5 w-5" />` | `<Sparkles className="h-5 w-5 text-[#F0B429]" />` |
| **FlashcardDrill.tsx** | 124 | `<Zap className="h-5 w-5 text-primary" />` | `<Zap className="h-5 w-5 text-[#F0B429]" />` |
| **FlashcardDrill.tsx** | 201 | `<Zap className="h-4 w-4" />` | `<Zap className="h-4 w-4 text-[#F0B429]" />` |
| **FlashcardDrill.tsx** | 269 | `<Sparkles className="h-4 w-4" />` | `<Sparkles className="h-4 w-4 text-[#F0B429]" />` |
| **WordBoost.tsx** | 73 | `<Sparkles className="h-5 w-5 text-primary" />` | `<Sparkles className="h-5 w-5 text-[#F0B429]" />` |

Six total icon color changes across three files. No structural or import changes needed.


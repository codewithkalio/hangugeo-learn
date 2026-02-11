

# 🇰🇷 Korean Language Learning App

A beautifully crafted SoftUI language learning experience with soft shadows, rounded elements, and a warm teal-green-coral palette inspired by your colors.

---

## Design System

- **SoftUI aesthetic**: Raised/inset card surfaces with soft box shadows, no hard borders, generous rounding, and subtle gradients
- **Color palette**: Teal greens (#066057, #318067, #4BC1A0) for primary actions, soft sage (#C9D1A5) for backgrounds, warm coral/orange (#E1814C, #D05657) for accents and scoring
- **Typography**: Clean sans-serif, large friendly headings, playful emoji accents throughout
- **Microinteractions**: Smooth card flips, fade-in animations, satisfying button presses with scale effects, progress bar animations

---

## Pages & Features

### 1. Dashboard (Home)
- Greeting with streak counter and motivational message
- Quick-start buttons: "Start Drill" and "Add Flashcard"
- Stats overview cards: total cards, accuracy rate, cards due for review
- Placeholder card teasing the upcoming "AI Sentence Quiz" feature (locked/coming soon badge)

### 2. Flashcard Bank
- Searchable, filterable list of all flashcards displayed as soft cards
- Filter by category, sort by date added or accuracy
- Each card shows Korean word, English translation, category badge, and accuracy indicator
- Inline delete with confirmation, tap to edit
- Floating "+" button to add new cards

### 3. Add / Edit Flashcard
- Clean form with Korean and English input fields
- Dictation button (microphone icon) on each field — uses browser Speech Recognition API to fill in the word via voice
- Optional category selector (dropdown with ability to create new categories)
- Save with a satisfying animation

### 4. Flashcard Drill
- Pre-drill setup screen: choose direction (English → Korean or Korean → Korean → English), optionally filter by category
- Drill view: large centered card with flip animation on tap/click
- Front shows the prompt word, back reveals the answer
- "Got it ✅" and "Missed ❌" buttons below the card
- Progress bar showing position in the deck
- End-of-drill summary screen with score, accuracy percentage, and breakdown of correct/missed cards

### 5. Stats / Progress
- Overall accuracy chart (bar or radial chart)
- Per-category breakdown
- Recent drill history with scores
- "Weakest words" list (lowest accuracy) for targeted review

### 6. AI Sentence Quiz (Placeholder)
- Locked feature card on the dashboard
- Dedicated page with a "Coming Soon" illustration and description: "Practice with AI-generated sentences using your flashcard words"
- Option to "Notify me" (non-functional placeholder button)

---

## Layout & Navigation

- Bottom tab bar on mobile (Home, Cards, Drill, Stats) with soft pill-shaped active indicator
- Sidebar navigation on desktop
- All pages fully responsive with mobile-first approach

---

## Data Storage

- All flashcard data stored in browser localStorage for now (no backend needed)
- Drill results and accuracy metrics persisted locally
- Structured so it can easily migrate to a database later


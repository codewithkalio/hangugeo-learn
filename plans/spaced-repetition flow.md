## Spaced Repetition (CBR Algorithm)

---

### Phase 1: Card Setup & Initialization

1. User creates or imports flashcards, organized into categories.
2. Each card is initialized with a default confidence score of **0** (unrated) and a **weight of 4** — the maximum, so new cards surface frequently until the user has rated them.
3. Each card is tagged with its category and marked as "new" (never reviewed).

---

### Phase 2: Session Start

1. User opens the app and chooses one of two modes:
    - **Smart Session** — the app draws cards from across all categories, weighted by confidence score. Low-confidence cards are up to 4× more likely to be drawn than high-confidence cards.
    - **Category Focus** — user selects a specific category to drill. Confidence weights still apply within that category.
2. The session pool is assembled silently in the background. The user is taken directly to the first card — no queue preview is shown.
3. A progress indicator in the top corner shows how many cards remain in the session, but not which cards or in what order.

---

### Phase 3: Active Review

1. The front of a card is shown. 
2. The user attempts to recall the answer, then taps to reveal.
3. Below their answer, the user rates their confidence on a 1–4 scale:
    - **1 — No idea:** I had no recall of this word.
    - **2 — Familiar:** I've seen it but couldn't retrieve it.
    - **3 — Got it:** I recalled it correctly with some effort.
    - **4 — Fluent:** I knew it instantly without hesitation.
    - There is a tool tip to explain the rating system.  This allows the UI to stay clean.
4. The rating is logged immediately. The user sees a brief animation showing how this score will affect the card's future frequency — e.g. "Will appear very frequently" or "Will surface rarely."
5. The card is retired from the current session. **No card repeats within a session under any circumstances**, regardless of rating.
6. The next card is drawn probabilistically from the remaining session pool based on current weights.

---

### Phase 4: Weight Update (Post-Session)

1. After the session ends, every rated card has its weight updated according to the confidence score:
    - **Score 1** → Weight set to **4** (surfaces very frequently)
    - **Score 2** → Weight set to **3** (surfaces often)
    - **Score 3** → Weight set to **2** (surfaces occasionally)
    - **Score 4** → Weight set to **1** (surfaces rarely, just to maintain fluency)
2. If a card's confidence score improves across consecutive sessions, its weight decreases gradually. If it regresses, the weight is immediately elevated back up.
3. There are no fixed review dates. Cards compete for selection each session based solely on their current weight relative to the rest of the pool.
4. If a card reaches a confidence score of 4 across five or more consecutive sessions, it can be marked **Fluent** and its weight drops to near zero — surfacing only occasionally as a maintenance check rather than active study.

---

---

### Key Principles

---

The **confidence rating in Phase 3 is the engine.** Unlike SM-2, there are no intervals to calculate and no due dates to manage. The algorithm is entirely driven by the relative weights of cards in the pool at any given moment.

The **no-repeat rule in Phase 3 is non-negotiable.** Once a card is rated in a session, it is done for that session. This keeps the experience feeling fair and prevents the frustration of seeing the same card twice in a row just because it was rated low.
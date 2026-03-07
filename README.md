# 🌸 한국어 Learn

A mobile-friendly Korean flashcard app with personal notes, audio pronunciation, typing practice, and contextual formality — built for serious learners who need more than vocabulary lists.

**→ [Live Demo](https://learnkorean.kaliolsen.com)** 

---

## The Problem

A few months into learning the Korean language I realized that Korean isn't just vocabulary — it's context. The same word changes its form depending on who you're talking to, how formal the situation is, and what level of respect is expected. Most flashcard apps weren't built for that nuance. Learners need a way to add personal notes, hear words spoken aloud, practice typing with a real Korean keyboard, and reinforce their weakest words — four gaps that no single app addressed well.

## The Solution

Hangugeo Learn is a custom-built web app that lets users study Korean vocabulary with layered context. Users can add personal notes to any card, hear pronunciation via the Speech Synthesis API, practice typing with a native Korean keyboard, and focus on weak words through adaptive reinforcement. Supabase powers auth and data with row-level security from Day 1, making it a deliberate test of building securely at AI speed.


## How to Use

### Prerequisites

- Node.js 18+ (or Bun)
- A Supabase project (for backend/auth)

### Setup

```sh
git clone https://github.com/codewithkalio/hangugeo-learn.git
cd hangugeo-learn
npm install
```

### Run

```sh
npm run dev
```

### Example

- **Input**: User adds a Korean word with formality context and personal notes
- **Output**: Flashcard with audio pronunciation, typing practice, and spaced repetition based on weak areas

## How It Works

The app is a React frontend deployed on Vercel, backed by Supabase for authentication, Postgres database, and row-level security. RLS policies enforce per-user data tenancy so each learner only sees their own cards and progress. The Speech Synthesis API converts text to spoken Korean using voices native to the user's device. PostHog provides product analytics with a custom data sanitization layer to protect user session data. A custom image API handles rendering images for abstract vocabulary concepts.

## Tradeoffs and Decisions

| DECISION AREA | CHOSEN | REJECTED | REASONING |
|---|---|---|---|
| Database | Supabase (Postgres) | Local storage / Firebase | RLS native, SQL familiar from eng background, auth built-in reduces attack surface |
| Dev approach | Lovable → Cursor handoff | Cursor from scratch | Lovable builds user-friendly UI fast; Cursor better for logic iteration and manual edits |
| Auth pattern | Supabase Auth + RLS | Clerk / Auth0 | Avoided a third auth surface; Supabase policies enforce data access at DB layer — a security default, not an afterthought |
| Observability | Supabase logs + PostHog + Vercel | Custom logging / Datadog | Low barrier to entry; free plans offer configurable error handling, analytics, speed metrics, and product metrics |
| Image rendering | Custom API | Unsplash API | Reliably generating images for abstract concepts requires a custom trained model |
| Text to Speech | Speech Synthesis API | Paid API | Converts text to speech using voices native to the user's device; adequate for launch; can be upgraded later |

**Why Lovable → Cursor over pure Cursor**: Lovable accelerates UI scaffolding and produces user-friendly interfaces quickly, but Cursor is better for iterating on business logic, debugging, and manual code edits. The handoff model captures the best of both.

**What I'd do differently**: Enforce security review checkpoints earlier in the AI-assisted workflow rather than auditing after features ship. Treat the AI tool's "it's secure" confirmation as a hypothesis, not a fact.

## What I Learned

1. **AI coding tools optimize for speed, not security.** Lovable built a strong database foundation early, but security became an afterthought as features grew. When asked to implement a feature securely, it assured me it had. Supabase's Security Advisor disagreed and flagged a flawed architecture.

2. **Don't use the same model to build it and audit it.** If you ask the same model that wrote your code to audit it for security flaws, you're working against yourself. Clear the chat context before switching to a scrutiny role — or better yet, use a different model entirely. A fresh model with no prior context will spot what the original model rationalized away.

3. **Observability requires intentional data hygiene.** Cursor wired up PostHog quickly but never asked whether I wanted to sanitize user session data before capturing it. I had to manually engineer a data sanitization layer after the fact.

## Next Steps

- [ ] Upgrade to a paid TTS API for higher-quality Korean voice options
- [ ] Build a custom model to accurately generate images
- [ ] Expand to additional Korean grammar patterns beyond vocabulary using a voice-to-voice conversational model

## Built With

- Lovable
- Cursor
- GitHub
- Supabase
- React / Next.js
- PostHog
- Vercel

---

  ![App Screenshots](screenshots/Hangugeo%20Learn%20Screenshots.png)


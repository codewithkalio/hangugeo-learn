# 🌸 한국어 Learn

A Korean language flashcard app with spaced repetition, multi-round reinforcement drills, and a neumorphic SoftUI design system.

**→ [Live Demo](https://learnkorean.kaliolsen.com)** 

---

![App Screenshots](screenshots/Hangugeo%20Learn%20Screenshots.png)

---

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Supabase · PostHog · Recharts

---

## Features

- **Flashcard Bank** — create, edit, and search cards with Hangul auto-detection and inline category creation
- **Spaced Repetition Drill** — CBR-weighted card selection with a 4-point confidence rating system; cards surface more often the weaker you are on them
- **Word Boost** — a 3-round reinforcement module for weak words: listen & choose, match pairs, and type it out
- **Korean TTS** — two-pass Web Speech API playback (normal speed, then slow)
- **CSV Import** — bulk import with column mapping, Zod validation, XSS sanitization, and duplicate resolution
- **Stats Page** — confidence ring, per-category bar chart, weakest words list, and drill history
- **SoftUI Design System** — neumorphic light/dark theme with semantic color tokens
- **Responsive Layout** — bottom nav on mobile, sidebar on desktop

---

## Local Development

> ⚠️ This project is a personal portfolio piece and is not open for contributions.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
npm install
cp .env.example .env
npm run dev
```

See `.env.example` for required environment variables.

---

## What I Tried

**Picture Match Round** — a Word Boost round that matched Korean words to Unsplash images via a Supabase edge function. Reverted because image relevance was too unreliable and API latency hurt the experience.

**Verb Conjugation Drill** — a 26-pattern conjugation drill built on the user's own vocabulary, with a custom engine handling vowel harmony and irregular verbs. Reverted because pulling from personal vocabulary produced nonsensical sentences (e.g. "I slept the book"). Korean conjugation complexity would require many more iterations to make this viable.

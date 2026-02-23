

## PostHog Integration — Error Tracking & Analytics

### What we will set up

PostHog's JavaScript SDK integrated into your app for:
- **Automatic error tracking** — uncaught exceptions and unhandled promise rejections captured as events
- **User identification** — link events to authenticated users so you can see who experienced errors
- **Session replay** — PostHog's free tier includes session recordings so you can watch what happened before an error
- **Basic analytics** — page views and feature usage tracked automatically

### What you need to provide

Your **PostHog API key** (the public project key from your PostHog project settings). This is a publishable key, so it is safe to store in the codebase — no secrets management needed.

### Technical steps

**1. Install `posthog-js`**
Add the PostHog JavaScript SDK as a dependency.

**2. Create `src/lib/posthog.ts`**
Initialize PostHog with your project API key and host URL. Enable:
- `autocapture` — automatic click/form tracking
- `capture_pageview` — automatic page view tracking
- Session replay recording

**3. Create `src/components/PostHogProvider.tsx`**
A React provider component that:
- Initializes PostHog on mount
- Identifies authenticated users (via `posthog.identify(user.id, { email })`) when auth state changes
- Resets identity on sign-out
- Captures route changes as pageview events (integrates with `react-router-dom`)

**4. Create `src/lib/errorCapture.ts`**
A utility that attaches `window.onerror` and `window.onunhandledrejection` listeners, forwarding errors to PostHog via `posthog.capture('$exception', { ... })`. This ensures all uncaught errors are tracked.

**5. Edit `src/App.tsx`**
Wrap the app with the PostHog provider inside the `BrowserRouter` (so it has access to routing context).

**6. Edit `src/main.tsx`**
Attach the global error listeners on startup.

### File changes summary

| Action | File |
|---|---|
| Install | `posthog-js` package |
| Create | `src/lib/posthog.ts` — SDK init config |
| Create | `src/components/PostHogProvider.tsx` — identity + pageview tracking |
| Create | `src/lib/errorCapture.ts` — global error listeners |
| Edit | `src/App.tsx` — add PostHogProvider wrapper |
| Edit | `src/main.tsx` — attach error listeners |

### What you will see in PostHog after this

- **Events** tab: page views, autocaptured clicks, and `$exception` events for any errors
- **Session Replay**: recordings of user sessions (toggleable)
- **Persons**: each authenticated user identified by their Supabase user ID and email
- **Error Tracking**: filterable list of captured exceptions with stack traces

No database changes or edge functions required. PostHog handles all storage on their end.


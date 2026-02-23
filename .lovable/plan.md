

## Enable Console Log Recording in PostHog Session Replays

### What this does

Adds `console_log_recording_enabled: true` to the PostHog `session_recording` configuration. This captures all `console.log`, `console.warn`, and `console.error` output and attaches it to session replays so you can see exactly what was logged during a user's session.

### Technical details

A single line addition to `src/lib/posthog.ts`:

| Action | File | Detail |
|---|---|---|
| Edit | `src/lib/posthog.ts` | Add `console_log_recording_enabled: true` inside the existing `session_recording` block |

The updated config block will look like:

```typescript
session_recording: {
  recordCrossOriginIframes: false,
  console_log_recording_enabled: true,
},
```

No other files need to change.


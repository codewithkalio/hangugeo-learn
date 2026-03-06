import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;

export function initPostHog() {
  if (!POSTHOG_KEY || !POSTHOG_HOST) {
    if (import.meta.env.DEV) {
      console.warn(
        'PostHog is disabled: VITE_POSTHOG_KEY or VITE_POSTHOG_HOST is missing. Set them in .env or Vercel env vars and redeploy.'
      );
    }
    return;
  }
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: false, // We handle this manually in the provider
    capture_pageleave: true,
    enable_recording_console_log: true,
    session_recording: {
      recordCrossOriginIframes: false,
    },
  });
}

export { posthog };

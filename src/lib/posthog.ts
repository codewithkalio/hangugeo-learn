import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_EMLusYv95dP5ombcFj0WZN7AoUXPDc3gaqxEV5PBFWq';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export function initPostHog() {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: false, // We handle this manually in the provider
    capture_pageleave: true,
    session_recording: {
      recordCrossOriginIframes: false,
    },
  });
}

export { posthog };

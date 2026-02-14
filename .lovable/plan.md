

# Add Email/Password Dev Login for Non-Production Environments

## Overview

Add email + password authentication as a development shortcut. On non-production URLs (Lovable preview and localhost), the Auth page will show a password field so you can sign in instantly without waiting for a magic link email. On production (`hanguk-eo-bloom.lovable.app`), only magic links are shown -- no changes there.

## How It Works

- The app checks `window.location.hostname` at runtime
- If the hostname is the production domain (`hanguk-eo-bloom.lovable.app`), it behaves exactly as it does today (magic link only)
- Otherwise (Lovable preview URLs, `localhost`), it shows an additional **password field** and uses `supabase.auth.signInWithPassword` / `supabase.auth.signUp` instead of OTP
- You create one dev account with a password and reuse it -- no email round-trips

## What You Need to Do First

1. **Enable email/password provider** in Supabase: Go to Authentication > Providers > Email and ensure "Enable Email Signup" is on (it likely already is since magic links use the email provider)
2. **Create a dev user**: After the code is deployed, go to the Auth page in preview, sign up with an email + password, then confirm the user in the Supabase dashboard (Authentication > Users) if email confirmations are enabled. Alternatively, you can disable "Confirm email" in the Supabase email provider settings for faster dev setup.

## Technical Details

### 1. Auth Page (`src/pages/Auth.tsx`)

- Add a helper constant: `const isProduction = window.location.hostname === 'hanguk-eo-bloom.lovable.app'`
- Add a `password` state field
- When `!isProduction`: render a password input below the email field
- Change `handleSubmit`:
  - If `isProduction`: use existing `signInWithOtp` flow (unchanged)
  - If `!isProduction` and `isSignUp`: use `supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })`
  - If `!isProduction` and `!isSignUp`: use `supabase.auth.signInWithPassword({ email, password })`
- On successful password sign-in, the `AuthContext` picks up the session automatically via `onAuthStateChange` -- no additional changes needed
- Hide the "Check your inbox" confirmation screen for password flow (sign-in is instant)

### 2. No Changes Needed

- **AuthContext** -- no changes, it already listens for any auth state change
- **ProtectedRoute** -- no changes
- **Database / RLS** -- no changes, `auth.uid()` works regardless of sign-in method
- **Production behavior** -- completely unchanged


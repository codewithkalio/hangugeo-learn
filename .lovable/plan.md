

# Authentication Setup: Magic Link / OTP Login

## Overview

Add email-based authentication using Supabase Auth with Magic Link (passwordless). Users enter their email, receive a one-time link/code, and are signed in. All app routes will be protected behind authentication.

## What You'll See

- A beautiful SoftUI login page matching the existing design (teal/sage/coral palette, soft shadows, Korean-themed branding)
- Email input field with a "Send Magic Link" button
- After sending, a confirmation message telling users to check their inbox
- A user menu in the sidebar/nav showing the logged-in email with a sign-out option
- Automatic redirect to login if not authenticated

## Technical Details

### 1. Create Auth Page (`src/pages/Auth.tsx`)
- SoftUI-styled centered card with the HanGeul branding (flag emoji + app name)
- Email input + "Send Magic Link" button
- Loading state while sending
- Success message after email is sent
- Uses `supabase.auth.signInWithOtp({ email })` with `emailRedirectTo: window.location.origin`

### 2. Create Auth Context (`src/contexts/AuthContext.tsx`)
- `AuthProvider` wrapping the app that listens to `onAuthStateChange`
- Exposes `session`, `user`, `loading`, and `signOut` values
- Sets up the auth listener BEFORE calling `getSession()` (per Supabase best practices)

### 3. Create Protected Route Wrapper (`src/components/ProtectedRoute.tsx`)
- Checks if user is authenticated
- Shows a loading spinner while auth state is resolving
- Redirects to `/auth` if not logged in

### 4. Update App.tsx
- Wrap routes with `AuthProvider`
- Add `/auth` route for the login page
- Wrap all other routes with `ProtectedRoute`

### 5. Update Navigation (Sidebar + BottomNav)
- Add user email display and sign-out button to the desktop sidebar (bottom area)
- Add a small user/sign-out affordance accessible from mobile nav

### 6. Supabase Auth Configuration
- No database tables needed (using built-in `auth.users` only -- no user profiles table for now)
- No RLS policies needed yet since data is still in localStorage


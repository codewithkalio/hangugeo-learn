

# Split Login Page into Sign In / Sign Up States

## Overview

Convert the login page into a two-tab (or toggle) interface: one for existing users ("Sign In") that only asks for email, and one for new users ("Sign Up") that asks for both name and email. Both use the same Magic Link/OTP flow under the hood.

## What You'll See

- Two toggle buttons at the top of the login card: "Sign In" and "Sign Up"
- **Sign In**: Shows only the email field and a "Send Magic Link" button
- **Sign Up**: Shows both the "Your name" and email fields, then sends the magic link with the name in metadata
- The confirmation screen ("Check your inbox!") remains the same for both flows
- A text link below the form to switch between modes (e.g., "Don't have an account? Sign up" / "Already have an account? Sign in")

## Technical Details

### Update `src/pages/Auth.tsx`

- Add an `isSignUp` boolean state (default `false` for Sign In)
- **Sign In mode**: Hide the name field entirely; call `signInWithOtp({ email, options: { emailRedirectTo } })` without metadata
- **Sign Up mode**: Show the name field; call `signInWithOtp({ email, options: { emailRedirectTo, data: { full_name: name } } })` with metadata
- Adjust the submit button disabled logic: Sign In requires only email; Sign Up requires both name and email
- Add a toggle link below the form to switch between modes, resetting the name field when switching
- Update the button text to reflect mode: "Send Magic Link" for Sign In, "Create Account" for Sign Up
- Reset `isSignUp` state alongside other fields when clicking "Use a different email"

### No other files need changes

The `AuthContext`, `DesktopSidebar`, `BottomNav`, and `ProtectedRoute` remain unchanged since the underlying auth mechanism (Magic Link OTP) is the same for both flows.


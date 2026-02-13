

# Add Name Field to Login Page

## Overview

Add a "Your name" input field to the Magic Link login form. The name will be stored in the user's Supabase Auth metadata (`user_metadata.full_name`) so it's available throughout the app without needing a separate profiles table.

## What You'll See

- A new "Your name" text input above the email field on the login page, with a User icon
- The name is passed to Supabase via `signInWithOtp` metadata and stored on the user record
- The sidebar will show the user's name instead of (or alongside) their email

## Technical Details

### 1. Update `src/pages/Auth.tsx`
- Add a `name` state variable
- Add a name input field (with a User icon) above the email field
- Pass the name as `data: { full_name: name }` in the `signInWithOtp` options, which Supabase stores in `user_metadata`
- Require both name and email before enabling the submit button
- Reset the name field alongside email when user clicks "Use a different email"

### 2. Update `src/components/DesktopSidebar.tsx`
- Display `user.user_metadata.full_name` (if available) above the email in the sidebar user section

### 3. Update `src/components/BottomNav.tsx`
- No changes needed (it only shows the sign-out button on mobile)




# Create Profile Page with Stats as Sub-Page

## Overview

Create a new Profile page that shows user info (name, email, avatar) and contains the Stats content as a sub-section. The current `/stats` route and its nav entry will be replaced by `/profile`, with Stats embedded within the Profile page.

## Changes

### 1. Create `src/pages/Profile.tsx`
- Display user avatar (initials fallback), name, and email from `useAuth()`
- Include a sign-out button
- Render the existing Stats content below the user info section (import and embed the Stats component directly)

### 2. Update `src/pages/Stats.tsx`
- Remove the top-level heading (`h1`) so it fits cleanly as a sub-section within Profile
- Export remains the same -- Profile will import and render it inline

### 3. Update Routes in `src/App.tsx`
- Replace `/stats` route with `/profile` pointing to the new Profile page
- Remove the standalone `/stats` route

### 4. Update Navigation
- **`src/components/BottomNav.tsx`**: Change the Stats tab to Profile (`/profile`, `User` icon, label "Profile")
- **`src/components/DesktopSidebar.tsx`**: Change the Stats link to Profile (`/profile`, "Profile" label, user emoji)

## Technical Details

### Profile Page Structure
```
Profile Page (/profile)
+-- User Info Card (avatar, name, email, sign-out)
+-- Stats Component (embedded directly)
```

### Files to Create
- `src/pages/Profile.tsx`

### Files to Modify
- `src/pages/Stats.tsx` -- remove standalone heading
- `src/App.tsx` -- swap `/stats` route for `/profile`
- `src/components/BottomNav.tsx` -- update tab entry
- `src/components/DesktopSidebar.tsx` -- update sidebar link


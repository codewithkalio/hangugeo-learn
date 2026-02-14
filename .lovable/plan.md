

# Move Stats to Its Own Sub-Page Under Profile

## Overview

Instead of embedding Stats directly on the Profile page, Stats will become its own route (`/profile/stats`) that users navigate to via a button on the Profile page.

## Changes

### 1. Update `src/pages/Profile.tsx`
- Remove the inline `<Stats />` component and its import
- Add a "Stats" button/link that navigates to `/profile/stats` (using `Link` from react-router-dom)
- Style it as a menu item card (e.g., a soft-card row with a chart icon, "Stats" label, and a chevron-right indicator)

### 2. Restore `src/pages/Stats.tsx`
- Change the `h2` back to `h1` so it works as a standalone page heading again

### 3. Update `src/App.tsx`
- Add a new route: `/profile/stats` pointing to the Stats component (protected, with AppLayout)
- Re-add the Stats import


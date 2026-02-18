

# Fix: Search Input Focus Issue on iOS After Card Creation

## Problem
After creating a card and navigating back to the Flashcards page, iOS requires multiple taps to focus the search input and bring up the keyboard. This happens because:

1. The `useEffect` fires `searchRef.current?.focus()` immediately on mount
2. But at that point, React Query is invalidating/refetching flashcards data, causing re-renders
3. The AnimatePresence animations are also running (each card animates in with a staggered delay)
4. These re-renders and layout shifts steal or reset focus on iOS, which is stricter than desktop browsers about maintaining focus during DOM mutations

## Solution
Replace the immediate `useEffect` focus with a delayed focus that waits for the initial data refetch and animations to settle. Additionally, on iOS specifically, programmatic `.focus()` outside a user gesture context won't open the keyboard -- so we should set the input's `autoFocus` attribute as a secondary mechanism and use a `requestAnimationFrame` + `setTimeout` combination to catch the right moment.

### Changes

**`src/pages/FlashcardBank.tsx`**

Replace the current focus effect:

```typescript
useEffect(() => {
  searchRef.current?.focus();
}, []);
```

With a delayed version that waits for re-renders to settle:

```typescript
useEffect(() => {
  // Delay focus to let query refetches and entry animations settle.
  // On iOS, immediate focus during re-renders gets lost.
  const timer = setTimeout(() => {
    searchRef.current?.focus();
  }, 300);
  return () => clearTimeout(timer);
}, []);
```

Also add `autoFocus` to the Input element as a belt-and-suspenders approach -- this helps on first navigation (before any re-renders interfere):

```tsx
<Input
  ref={searchRef}
  autoFocus
  placeholder="Search cards..."
  ...
/>
```

### Why This Works
- The 300ms delay lets React Query's refetch complete and AnimatePresence finish its initial render pass
- `autoFocus` gives the browser a native hint to focus on mount (works better than programmatic focus on some mobile browsers)
- The cleanup function prevents the focus from firing if the user navigates away quickly


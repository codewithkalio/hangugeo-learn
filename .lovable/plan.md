
# Smooth the Flashcard Flip Transition

## Problem

The current flip uses `AnimatePresence mode="wait"` with `rotateY` and `opacity` changes. This causes the old content to animate out (fade + rotate) and then the new content to animate in (fade + rotate), producing a visible flash/flicker.

## Solution

Replace the unmount/remount animation with a simple in-place crossfade. Instead of using `AnimatePresence` with keyed elements (which unmounts one and mounts another), we keep a single card element and just animate its content opacity when flipping.

## Technical Details

### File: `src/pages/FlashcardDrill.tsx` (lines 198-227)

Remove `AnimatePresence` and the keyed `motion.div` inside. Replace with a single `motion.div` card that stays mounted, and use a simple opacity transition on the text content:

- Remove `AnimatePresence mode="wait"` wrapper
- Remove the `key={flipped ? 'back' : 'front'}` inner `motion.div` with `rotateY` animations
- Keep the outer `motion.div` with `whileTap` and add a subtle `scale` or short opacity animation via `animate={{ opacity: 1 }}` with `key={flipped}` if needed
- Use a single `motion.div` for the card body, and swap text content based on `flipped` state with a quick fade using `animate={{ opacity: 1 }}` and `initial={{ opacity: 0 }}` with a short 150ms duration -- or simply drop the animation to just an instant swap (no flash at all)

The simplest reliable approach: replace the `AnimatePresence` block with a single static card `div` and use `motion.div` with `key={flipped + '-' + currentIndex}` and only an opacity fade (no rotateY), with a short 150ms duration. This prevents the double-animation flash.

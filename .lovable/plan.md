

# Fix Flashcard Flip Flash (For Real This Time)

## Root Cause

The current approach uses a `key` prop that changes on flip (`key={\`${flipped}-${currentIndex}\`}`). When a React key changes, the element is **unmounted and remounted**. This means for at least one frame, the old card is gone and the new one hasn't rendered yet -- causing the visible flash. No amount of opacity tweaking fixes this because the DOM node itself is being destroyed and recreated.

## Solution

Remove all motion/animation from the card flip entirely. Keep a single stable DOM element that never unmounts, and simply swap its text content based on the `flipped` state. The content change is instant with no intermediate blank frame.

The answer buttons below the card already have their own fade-in animation, so the flip still feels responsive.

## Technical Details

### File: `src/pages/FlashcardDrill.tsx` (lines 198-224)

Replace the nested `motion.div` structure with a single stable `div`:

- Remove the inner `motion.div` with the `key`, `initial`, `animate`, and `transition` props
- Replace it with a plain `div` (same classes, no key, no animation)
- The outer `motion.div` wrapper (with `whileTap={{ scale: 0.98 }}`) stays for the tap feedback
- All content rendering (front/back text, category badge, note) remains unchanged

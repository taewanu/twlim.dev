import { type RefObject, useEffect, useRef } from 'react';

import { prefersReducedMotion } from '@/lib/motion';

const LEARNED_KEY = 'drawer-swipe-learned';
const SHOWN_KEY = 'drawer-swipe-hint-shown';
// Readers who never swipe, such as mouse users, stop seeing the hint after a few visits.
const MAX_SHOWINGS = 3;
const DELAY_MS = 1200;
const BOUNCES: Keyframe[] = [
  { translate: '0', offset: 0 },
  { translate: '-16px', offset: 0.2, easing: 'ease-in' },
  { translate: '0', offset: 0.42, easing: 'ease-out' },
  { translate: '-9px', offset: 0.6, easing: 'ease-in' },
  { translate: '0', offset: 0.8 },
  { translate: '0', offset: 1 },
];

/** Records that the reader opened an article by swiping, so the hint stops. */
export function markSwipeLearned() {
  try {
    localStorage.setItem(LEARNED_KEY, '1');
  } catch {
    // Storage can be blocked; the hint then shows up to its limit again.
  }
}

function readShowings() {
  try {
    if (localStorage.getItem(LEARNED_KEY)) return MAX_SHOWINGS;
    return Number(localStorage.getItem(SHOWN_KEY) ?? 0);
  } catch {
    return MAX_SHOWINGS;
  }
}

/** Nudges the first article row on screen twice after an index page loads, to show rows can be swiped. */
export function useSwipeHint(indexRef: RefObject<HTMLElement | null>, onIndex: boolean) {
  const loadedOnIndex = useRef(onIndex);
  useEffect(() => {
    if (!loadedOnIndex.current || prefersReducedMotion()) return undefined;
    const showings = readShowings();
    if (showings >= MAX_SHOWINGS) return undefined;
    const timer = setTimeout(() => {
      const row = [...(indexRef.current?.querySelectorAll('[data-swipe-article]') ?? [])].find(
        (candidate) => {
          const box = candidate.getBoundingClientRect();
          return box.top >= 0 && box.bottom <= innerHeight;
        },
      );
      if (!row) return;
      try {
        localStorage.setItem(SHOWN_KEY, String(showings + 1));
      } catch {
        // Without storage the count can't advance; the learned check still applies.
      }
      row.animate(BOUNCES, { duration: 1100 });
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [indexRef]);
}

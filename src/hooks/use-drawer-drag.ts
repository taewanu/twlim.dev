import { type RefObject, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { prefersReducedMotion } from '@/lib/motion';

// Matches --duration-drawer in globals.css.
const DURATION_MS = 420;

type Options = {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  indexRef: RefObject<HTMLElement | null>;
  setOpen: (open: boolean) => void;
  onCommit: (closed: boolean) => void;
};

export type DrawerDrag = ReturnType<typeof createDrawerDrag>;

// The curve's starting slope is the finger's speed, so the panel carries on without a jump.
function releaseTransition(remaining: number, speed: number) {
  let ms = DURATION_MS;
  if ((speed * ms) / remaining > 3) ms = Math.max(160, (3 * remaining) / speed);
  ms = Math.round(ms);
  const y1 = Math.min(1, (0.3 * speed * ms) / remaining);
  const easing = `${ms}ms cubic-bezier(0.3, ${y1.toFixed(3)}, 0.2, 1)`;
  return { ms, transition: `translate ${easing}, opacity ${easing}` };
}

function createDrawerDrag(initial: Options) {
  let current = initial;
  let drag: { closing: boolean; travel: number; speed: number; time: number } | null = null;
  let settle: ReturnType<typeof setTimeout> | undefined;

  const layers = () => {
    const { panelRef, indexRef } = current;
    return [panelRef.current, indexRef.current].filter((el): el is HTMLElement => el !== null);
  };

  // The index reads its shift and dim from CSS variables, so the drag and the open state agree.
  function paint(openness: number) {
    const { panelRef, indexRef } = current;
    if (panelRef.current) panelRef.current.style.translate = `${(1 - openness) * 100}vw`;
    if (indexRef.current) {
      indexRef.current.style.translate = `calc(var(--index-shift) * ${openness})`;
      indexRef.current.style.opacity = `calc(1 - (1 - var(--index-opacity)) * ${openness})`;
    }
  }

  return {
    /** The open state from the latest render, for gesture handlers that outlive it. */
    isOpen: () => current.open,

    /** Keeps the latest state and callbacks without restarting a gesture in progress. */
    update(next: Options) {
      current = next;
    },

    /** Moves the panel `travel` px toward the drawer's other state; the first call starts the drag. */
    move(travel: number, time: number) {
      if (!drag) {
        const { open, setOpen } = current;
        // Opening has to mount the panel before it can follow the finger.
        if (!open) flushSync(() => setOpen(true));
        clearTimeout(settle);
        for (const el of layers()) el.style.transition = 'none';
        drag = { closing: open, travel: 0, speed: 0, time: time - 16 };
      }
      drag.speed = (travel - drag.travel) / Math.max(1, time - drag.time);
      drag.travel = travel;
      drag.time = time;
      const progress = Math.min(1, travel / innerWidth);
      paint(drag.closing ? 1 - progress : progress);
      return { progress, speed: drag.speed };
    },

    /** Lets go: `commit` finishes the swipe, otherwise the panel springs back. */
    end(commit: boolean) {
      if (!drag) return;
      const { closing, travel, speed } = drag;
      drag = null;
      const progress = Math.min(1, travel / innerWidth);
      const remaining = Math.max(1, (commit ? 1 - progress : progress) * innerWidth);
      const release = releaseTransition(remaining, Math.max(0, commit ? speed : -speed));

      const { setOpen, onCommit } = current;
      flushSync(() => setOpen(closing !== commit));
      for (const el of layers()) {
        el.style.transition = prefersReducedMotion() ? 'none' : release.transition;
        el.style.translate = '';
        el.style.opacity = '';
      }
      settle = setTimeout(() => {
        for (const el of layers()) el.style.transition = '';
      }, release.ms + 50);
      if (commit) onCommit(closing);
    },
  };
}

/** Moves the panel and the index with a finger or trackpad, then releases at the gesture's speed. */
export function useDrawerDrag(options: Options): DrawerDrag {
  const [drag] = useState(() => createDrawerDrag(options));
  useEffect(() => {
    drag.update(options);
  });
  return drag;
}

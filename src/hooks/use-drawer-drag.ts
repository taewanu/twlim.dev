import { type RefObject, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { prefersReducedMotion } from '@/lib/motion';

// globals.css owns the slide length, so clicks and released gestures take the same time.
function drawerDuration() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--duration-drawer');
  // The production build minifies 420ms to .42s.
  return value.trim().endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
}

type Options = {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  indexRef: RefObject<HTMLElement | null>;
  setOpen: (open: boolean) => void;
  /** An opening swipe is starting on `row`, or on empty space; false means there is nothing to open. */
  onOpenStart: (row: HTMLElement | null) => boolean;
  onCommit: (closed: boolean, row: HTMLElement | null) => void;
};

// How far a swiped row leans out ahead of the index; it eases into this, so it never races the panel.
const ROW_LEAN = 56;

export type DrawerDrag = ReturnType<typeof createDrawerDrag>;

// The curve's starting slope is the finger's speed, so the panel carries on without a jump.
function releaseTransition(remaining: number, speed: number) {
  let ms = drawerDuration();
  if ((speed * ms) / remaining > 3) ms = Math.max(160, (3 * remaining) / speed);
  ms = Math.round(ms);
  const y1 = Math.min(1, (0.3 * speed * ms) / remaining);
  const easing = `${ms}ms cubic-bezier(0.3, ${y1.toFixed(3)}, 0.2, 1)`;
  return { ms, transition: `translate ${easing}, opacity ${easing}` };
}

function createDrawerDrag(initial: Options) {
  let current = initial;
  let drag: {
    closing: boolean;
    row: HTMLElement | null;
    travel: number;
    speed: number;
    time: number;
  } | null = null;
  let settle: ReturnType<typeof setTimeout> | undefined;
  let leaning: HTMLElement | null = null;

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

  // The swiped row leans out and lights up while the other rows step back (styled through these attributes).
  function arm(row: HTMLElement) {
    current.indexRef.current?.setAttribute('data-swipe-arming', '');
    row.setAttribute('data-swipe-armed', '');
    row.style.transition = 'none';
    leaning = row;
  }

  function disarm(row: HTMLElement, ms: number) {
    current.indexRef.current?.removeAttribute('data-swipe-arming');
    row.removeAttribute('data-swipe-armed');
    row.style.transition = `translate ${ms}ms var(--ease-drawer)`;
    row.style.translate = '';
  }

  return {
    /** The open state from the latest render, for gesture handlers that outlive it. */
    isOpen: () => current.open,

    /** Keeps the latest state and callbacks without restarting a gesture in progress. */
    update(next: Options) {
      current = next;
    },

    /**
     * Moves the panel `travel` px toward the drawer's other state; the first call starts the drag.
     * An opening drag opens the article of the `row` it started on, or the last article on empty space.
     */
    move(travel: number, time: number, row: HTMLElement | null = null) {
      if (!drag) {
        const { open, setOpen, onOpenStart } = current;
        if (!open) {
          let canOpen = false;
          // Opening has to mount the panel, showing what it opens, before it can follow the finger.
          flushSync(() => {
            canOpen = onOpenStart(row);
            if (canOpen) setOpen(true);
          });
          if (!canOpen) return { progress: 0, speed: 0 };
        }
        clearTimeout(settle);
        if (leaning) leaning.style.transition = '';
        for (const el of layers()) el.style.transition = 'none';
        drag = { closing: open, row: open ? null : row, travel: 0, speed: 0, time: time - 16 };
        if (drag.row) arm(drag.row);
      }
      drag.speed = (travel - drag.travel) / Math.max(1, time - drag.time);
      drag.travel = travel;
      drag.time = time;
      const progress = Math.min(1, travel / innerWidth);
      paint(drag.closing ? 1 - progress : progress);
      if (drag.row)
        drag.row.style.translate = `${-ROW_LEAN * (1 - Math.exp(-travel / ROW_LEAN))}px`;
      return { progress, speed: drag.speed };
    },

    /** Lets go: `commit` finishes the swipe, otherwise the panel springs back. */
    end(commit: boolean) {
      if (!drag) return;
      const { closing, row, travel, speed } = drag;
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
      if (row) disarm(row, release.ms);
      settle = setTimeout(() => {
        for (const el of layers()) el.style.transition = '';
        if (leaning) leaning.style.transition = '';
        leaning = null;
      }, release.ms + 50);
      if (commit) onCommit(closing, row);
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

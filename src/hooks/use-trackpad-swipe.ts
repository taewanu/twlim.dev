import { useEffect, useRef } from 'react';

import { stepTrackpad, type TrackpadGesture } from '@/lib/trackpad-gesture';

import type { DrawerDrag } from './use-drawer-drag';

// Wheel events less than this far apart belong to one gesture.
const GESTURE_GAP_MS = 150;

/** A two-finger horizontal swipe drives the same drag as touch; wheel events are all a trackpad sends. */
export function useTrackpadSwipe(
  drag: DrawerDrag,
  { enabled, open }: { enabled: boolean; open: boolean },
) {
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let gesture: TrackpadGesture | null = null;
    let idle: ReturnType<typeof setTimeout> | undefined;

    function onWheel(event: WheelEvent) {
      if (event.target instanceof Element && event.target.closest('pre')) return;
      const commitAt = Math.min(innerWidth / 3, 200);
      const [next, step] = stepTrackpad(gesture, event, { open: openRef.current, commitAt });
      gesture = next;

      clearTimeout(idle);
      idle = setTimeout(() => {
        if (gesture?.dragging) drag.end(false);
        gesture = null;
      }, GESTURE_GAP_MS);

      if (step.type === 'pass') return;
      // Also keeps the browser's two-finger history swipe from firing.
      event.preventDefault();
      if (step.type === 'hold') return;
      drag.move(step.travel, event.timeStamp);
      if (step.type === 'commit') drag.end(true);
    }

    addEventListener('wheel', onWheel, { passive: false });
    return () => {
      removeEventListener('wheel', onWheel);
      clearTimeout(idle);
    };
  }, [drag, enabled]);
}

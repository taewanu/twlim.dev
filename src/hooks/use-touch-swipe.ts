import { useEffect, useRef } from 'react';

import type { DrawerDrag } from './use-drawer-drag';

const AXIS_LOCK = 10;
const FLICK_SPEED = 0.4;
const COMMIT_PROGRESS = 1 / 3;
// The browser's own back gesture starts at the left edge.
const BACK_GESTURE_EDGE = 24;

/** Drags the article right to close it, or the index left to bring the last article back. */
export function useTouchSwipe(
  drag: DrawerDrag,
  { enabled, open }: { enabled: boolean; open: boolean },
) {
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let swipe: {
      x: number;
      y: number;
      closing: boolean;
      axis: 'x' | 'y' | null;
      progress: number;
      speed: number;
    } | null = null;

    function onDown(event: PointerEvent) {
      if (event.pointerType !== 'touch' || event.clientX < BACK_GESTURE_EDGE) return;
      if (event.target instanceof Element && event.target.closest('[data-swipe-ignore], pre'))
        return;
      swipe = {
        x: event.clientX,
        y: event.clientY,
        closing: openRef.current,
        axis: null,
        progress: 0,
        speed: 0,
      };
    }

    function onMove(event: PointerEvent) {
      if (!swipe || event.pointerType !== 'touch') return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      if (!swipe.axis) {
        if (Math.hypot(dx, dy) < AXIS_LOCK) return;
        swipe.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (swipe.axis === 'y') {
        swipe = null;
        return;
      }
      const travel = Math.max(0, swipe.closing ? dx : -dx);
      if (travel === 0 && swipe.progress === 0) return;
      ({ progress: swipe.progress, speed: swipe.speed } = drag.move(travel, event.timeStamp));
    }

    function onUp() {
      if (swipe?.axis === 'x')
        drag.end(swipe.speed > FLICK_SPEED || swipe.progress > COMMIT_PROGRESS);
      swipe = null;
    }

    function onCancel() {
      if (swipe?.axis === 'x') drag.end(false);
      swipe = null;
    }

    addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onCancel);
    return () => {
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onCancel);
    };
  }, [drag, enabled]);
}

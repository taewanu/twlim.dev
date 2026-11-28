import type { DrawerDrag } from '@/hooks/use-drawer-drag';

import { swipeRowAt } from './swipe-row';
import { stepTrackpad, type TrackpadGesture } from './trackpad-gesture';

// Wheel events less than this far apart belong to one gesture.
const GESTURE_GAP_MS = 150;

/** Lets a two-finger horizontal swipe drive the drawer until the signal aborts; wheel events are all a trackpad sends. */
export function listenForTrackpadSwipes(drag: DrawerDrag, signal: AbortSignal) {
  let gesture: TrackpadGesture | null = null;
  let row: HTMLElement | null = null;
  let idle: ReturnType<typeof setTimeout> | undefined;

  function onWheel(event: WheelEvent) {
    if (event.target instanceof Element && event.target.closest('pre')) return;
    const commitAt = Math.min(innerWidth / 3, 200);
    // Until the panel moves, the row under the pointer is the one an opening swipe opens.
    if (!gesture?.dragging) row = swipeRowAt(event.clientX, event.clientY);
    const [next, step] = stepTrackpad(gesture, event, { open: drag.isOpen(), commitAt });
    // With nothing to open, the browser keeps the swipe for its own history navigation.
    if (step.type !== 'pass' && !next.closing && !drag.canOpen(row)) {
      gesture = null;
      return;
    }
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
    drag.move(step.travel, event.timeStamp, row);
    if (step.type === 'commit') drag.end(true);
  }

  addEventListener('wheel', onWheel, { passive: false, signal });
  signal.addEventListener('abort', () => clearTimeout(idle));
}

import type { DrawerDrag } from '@/hooks/use-drawer-drag';

import {
  autoCommitDistance,
  commits,
  startPointer,
  stepPointer,
  type PointerGesture,
} from './pointer-gesture';
import { swipeRowAt } from './swipe-row';

/** Lets touch and mouse drags drive the drawer until the signal aborts. */
export function listenForPointerSwipes(drag: DrawerDrag, signal: AbortSignal) {
  let press: {
    id: number;
    touch: boolean;
    row: HTMLElement | null;
    gesture: PointerGesture;
    last: { progress: number; speed: number };
  } | null = null;

  function onDown(event: PointerEvent) {
    const target = event.target instanceof Element ? event.target : null;
    const touch = event.pointerType === 'touch';
    const open = drag.isOpen();
    const row = open ? null : swipeRowAt(event.clientX, event.clientY);
    const start = startPointer({
      touch,
      x: event.clientX,
      plainPress:
        event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey,
      ignored: Boolean(target?.closest('[data-swipe-ignore], pre')),
      open,
      onArticleText: Boolean(target?.closest('article')),
      onRow: row !== null,
      canOpen: !open && drag.canOpen(row),
    });
    if (!start) return;
    press = {
      id: event.pointerId,
      touch,
      row,
      gesture: {
        x: event.clientX,
        y: event.clientY,
        closing: start === 'close',
        axis: null,
        moving: false,
        committed: false,
      },
      last: { progress: 0, speed: 0 },
    };
  }

  function onMove(event: PointerEvent) {
    if (!press || event.pointerId !== press.id) return;
    const commitAt = press.touch ? Infinity : autoCommitDistance(innerWidth);
    const [gesture, step] = stepPointer(
      press.gesture,
      { x: event.clientX, y: event.clientY },
      { commitAt },
    );
    press.gesture = gesture;
    if (step.type === 'abandon') {
      press = null;
      return;
    }
    if (step.type === 'wait') return;
    if (step.first && !press.touch) holdSelection();
    press.last = drag.move(step.travel, event.timeStamp, press.row);
    if (step.type === 'commit') drag.end(true);
  }

  function finish(event: PointerEvent, released: boolean) {
    if (!press || event.pointerId !== press.id) return;
    if (press.gesture.axis === 'x') {
      if (!press.gesture.committed) drag.end(released && commits(press.last));
      swallowNextClick();
    }
    releaseSelection();
    press = null;
  }

  addEventListener('pointerdown', onDown, { signal });
  addEventListener('pointermove', onMove, { signal });
  addEventListener('pointerup', (event) => finish(event, true), { signal });
  addEventListener('pointercancel', (event) => finish(event, false), { signal });
  // Dragging a row's link would start the browser's link drag and cancel the swipe.
  addEventListener('dragstart', (event) => press && event.preventDefault(), { signal });
  signal.addEventListener('abort', releaseSelection);
}

function holdSelection() {
  getSelection()?.removeAllRanges();
  document.documentElement.style.userSelect = 'none';
}

function releaseSelection() {
  document.documentElement.style.removeProperty('user-select');
}

function swallowClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

/** The press that ended a swipe must not also follow the row's link or dismiss the panel. */
function swallowNextClick() {
  addEventListener('click', swallowClick, { capture: true, once: true });
  setTimeout(() => removeEventListener('click', swallowClick, { capture: true }));
}

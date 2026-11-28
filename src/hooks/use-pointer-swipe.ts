import { useEffect } from 'react';

import { swipeRowAt } from '@/lib/swipe-row';

import type { DrawerDrag } from './use-drawer-drag';

const AXIS_LOCK = 10;
const FLICK_SPEED = 0.4;
const COMMIT_PROGRESS = 1 / 3;
// The browser's own back gesture starts at the left edge.
const BACK_GESTURE_EDGE = 24;

/** Drags the article right to close it, or an index row left to open its article, by touch or mouse. */
export function usePointerSwipe(drag: DrawerDrag, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return undefined;
    let swipe: {
      id: number;
      touch: boolean;
      x: number;
      y: number;
      closing: boolean;
      row: HTMLElement | null;
      axis: 'x' | 'y' | null;
      moving: boolean;
      progress: number;
      speed: number;
    } | null = null;

    function onDown(event: PointerEvent) {
      const start = swipeStart(event, drag);
      if (!start) return;
      swipe = {
        ...start,
        id: event.pointerId,
        touch: event.pointerType === 'touch',
        x: event.clientX,
        y: event.clientY,
        axis: null,
        moving: false,
        progress: 0,
        speed: 0,
      };
    }

    function onMove(event: PointerEvent) {
      if (!swipe || event.pointerId !== swipe.id) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      if (!swipe.axis) {
        if (Math.hypot(dx, dy) < AXIS_LOCK) return;
        swipe.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      // A vertical drag is a scroll or a text selection, not a swipe.
      if (swipe.axis === 'y') {
        swipe = null;
        return;
      }
      const travel = Math.max(0, swipe.closing ? dx : -dx);
      if (!swipe.moving) {
        // A pull the other way, such as selecting a title rightward, never moves the panel.
        if (travel === 0) return;
        swipe.moving = true;
        if (!swipe.touch) holdSelection();
      }
      const step = drag.move(travel, event.timeStamp, swipe.row);
      swipe.progress = step.progress;
      swipe.speed = step.speed;
    }

    function finish(event: PointerEvent, released: boolean) {
      if (!swipe || event.pointerId !== swipe.id) return;
      if (swipe.axis === 'x') {
        drag.end(released && (swipe.speed > FLICK_SPEED || swipe.progress > COMMIT_PROGRESS));
        swallowNextClick();
      }
      releaseSelection();
      swipe = null;
    }

    const onUp = (event: PointerEvent) => finish(event, true);
    const onCancel = (event: PointerEvent) => finish(event, false);
    // Dragging a row's link would start the browser's link drag and cancel the swipe.
    const onDragStart = (event: DragEvent) => {
      if (swipe) event.preventDefault();
    };

    const listeners = new AbortController();
    const { signal } = listeners;
    addEventListener('pointerdown', onDown, { signal });
    addEventListener('pointermove', onMove, { signal });
    addEventListener('pointerup', onUp, { signal });
    addEventListener('pointercancel', onCancel, { signal });
    addEventListener('dragstart', onDragStart, { signal });
    return () => {
      listeners.abort();
      releaseSelection();
    };
  }, [drag, enabled]);
}

/** What a press would swipe, or null when the press belongs to the page: scrolling, selecting text or the browser's back gesture. */
function swipeStart(event: PointerEvent, drag: DrawerDrag) {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('[data-swipe-ignore], pre')) return null;
  const touch = event.pointerType === 'touch';
  if (touch && event.clientX < BACK_GESTURE_EDGE) return null;
  if (!touch && !isPlainPress(event)) return null;

  if (drag.isOpen()) {
    // A mouse drag on the article's text selects it.
    if (!touch && target?.closest('article')) return null;
    return { closing: true, row: null };
  }
  const row = swipeRowAt(event.clientX, event.clientY);
  // A touch on empty space reopens the last article; a mouse there selects text.
  if (!touch && !row) return null;
  return drag.canOpen(row) ? { closing: false, row } : null;
}

function isPlainPress(event: PointerEvent) {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
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

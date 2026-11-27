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
      progress: number;
      speed: number;
    } | null = null;

    function onDown(event: PointerEvent) {
      const touch = event.pointerType === 'touch';
      if (touch ? event.clientX < BACK_GESTURE_EDGE : !isPlainPress(event)) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[data-swipe-ignore], pre')) return;
      const closing = drag.isOpen();
      // A mouse drag on article text or outside a row selects text instead.
      if (!touch && closing && target?.closest('article')) return;
      const row = closing ? null : swipeRowAt(event.clientX, event.clientY);
      if (!touch && !closing && !row) return;
      if (!closing && !drag.canOpen(row)) return;
      swipe = {
        id: event.pointerId,
        touch,
        x: event.clientX,
        y: event.clientY,
        closing,
        row,
        axis: null,
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
      if (swipe.axis === 'y') {
        swipe = null;
        return;
      }
      const travel = Math.max(0, swipe.closing ? dx : -dx);
      if (travel === 0 && swipe.progress === 0) return;
      if (!swipe.touch && swipe.progress === 0) holdSelection();
      ({ progress: swipe.progress, speed: swipe.speed } = drag.move(
        travel,
        event.timeStamp,
        swipe.row,
      ));
    }

    function finish(event: PointerEvent, commit: boolean) {
      if (!swipe || event.pointerId !== swipe.id) return;
      if (swipe.axis === 'x') {
        drag.end(commit);
        swallowNextClick();
      }
      releaseSelection();
      swipe = null;
    }

    const onUp = (event: PointerEvent) =>
      finish(
        event,
        swipe !== null && (swipe.speed > FLICK_SPEED || swipe.progress > COMMIT_PROGRESS),
      );
    const onCancel = (event: PointerEvent) => finish(event, false);
    // Dragging a row's link would start the browser's link drag and cancel the swipe.
    const onDragStart = (event: DragEvent) => {
      if (swipe) event.preventDefault();
    };

    addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onCancel);
    addEventListener('dragstart', onDragStart);
    return () => {
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onCancel);
      removeEventListener('dragstart', onDragStart);
      releaseSelection();
    };
  }, [drag, enabled]);
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

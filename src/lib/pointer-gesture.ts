const AXIS_LOCK = 10;
const FLICK_SPEED = 0.4;
const COMMIT_PROGRESS = 1 / 3;
const AUTO_COMMIT_MAX = 200;
// The browser's own back gesture starts at the left edge.
const BACK_GESTURE_EDGE = 24;

/** What the page says about a press, read by the caller. */
export type PressFacts = {
  touch: boolean;
  x: number;
  /** The primary button with no modifier keys. */
  plainPress: boolean;
  /** On an element that keeps its own sideways drags, such as a code box or a slider. */
  ignored: boolean;
  open: boolean;
  /** On the open article's text. */
  onArticleText: boolean;
  onRow: boolean;
  /** Whether the row under the press, or the last article when there is none, can open. */
  canOpen: boolean;
};

/** Which swipe a press may start, or null when the press belongs to the page. */
export function startPointer(press: PressFacts): 'close' | 'open' | null {
  if (press.ignored) return null;
  if (press.touch && press.x < BACK_GESTURE_EDGE) return null;
  if (!press.touch && !press.plainPress) return null;
  if (press.open) {
    // A mouse drag on the article's text selects it.
    return !press.touch && press.onArticleText ? null : 'close';
  }
  // A touch on empty space reopens the last article; a mouse there selects text.
  if (!press.touch && !press.onRow) return null;
  return press.canOpen ? 'open' : null;
}

/** One press that may become a swipe, from pointerdown to pointerup. */
export type PointerGesture = {
  x: number;
  y: number;
  /** Whether the gesture closes the drawer; fixed when it starts. */
  closing: boolean;
  axis: 'x' | 'y' | null;
  /** Whether the panel has started to follow the pointer. */
  moving: boolean;
  /** After a commit the rest of the press does nothing. */
  committed: boolean;
};

export type PointerStep =
  | { type: 'wait' }
  | { type: 'abandon' }
  | { type: 'drag'; travel: number; first: boolean }
  | { type: 'commit'; travel: number; first: boolean };

/** How far a mouse or trackpad swipe travels before it finishes by itself, so a wide screen needs no longer drag than a narrow one. */
export function autoCommitDistance(viewportWidth: number) {
  return Math.min(viewportWidth / 3, AUTO_COMMIT_MAX);
}

/** Reads one move; `commitAt` is Infinity for touch, whose finger carries the panel until release. */
export function stepPointer(
  gesture: PointerGesture,
  { x, y }: { x: number; y: number },
  { commitAt }: { commitAt: number },
): [PointerGesture, PointerStep] {
  if (gesture.committed) return [gesture, { type: 'wait' }];
  const dx = x - gesture.x;
  const dy = y - gesture.y;
  let { axis } = gesture;
  if (!axis) {
    if (Math.hypot(dx, dy) < AXIS_LOCK) return [gesture, { type: 'wait' }];
    axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
  }
  // A vertical drag is a scroll or a text selection, not a swipe.
  if (axis === 'y') return [{ ...gesture, axis }, { type: 'abandon' }];
  const travel = Math.max(0, gesture.closing ? dx : -dx);
  // A pull the other way, such as selecting a title rightward, never moves the panel.
  if (!gesture.moving && travel === 0) return [{ ...gesture, axis }, { type: 'wait' }];
  const first = !gesture.moving;
  if (travel >= commitAt)
    return [
      { ...gesture, axis, moving: true, committed: true },
      { type: 'commit', travel, first },
    ];
  return [
    { ...gesture, axis, moving: true },
    { type: 'drag', travel, first },
  ];
}

export function commits({ progress, speed }: { progress: number; speed: number }) {
  return speed > FLICK_SPEED || progress > COMMIT_PROGRESS;
}

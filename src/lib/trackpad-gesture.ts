/** One two-finger swipe, read from a run of wheel events. */
export type TrackpadGesture = {
  axis: 'x' | 'y';
  /** Whether the gesture closes the drawer; fixed when it starts. */
  closing: boolean;
  /** Direction of the last event that clearly moved, so a reversal can be told apart from wobble. */
  sign: number;
  /** Distance travelled toward the drawer's other state, in px. */
  travel: number;
  dragging: boolean;
  /** After a commit the rest of the gesture, momentum included, does nothing. */
  committed: boolean;
};

export type TrackpadStep =
  | { type: 'pass' }
  | { type: 'hold' }
  | { type: 'drag'; travel: number }
  | { type: 'commit'; travel: number };

const MIN_DELTA = 2;

export function stepTrackpad(
  gesture: TrackpadGesture | null,
  { deltaX, deltaY }: { deltaX: number; deltaY: number },
  { open, commitAt }: { open: boolean; commitAt: number },
): [TrackpadGesture, TrackpadStep] {
  const size = Math.abs(deltaX);
  const sign = Math.sign(deltaX);
  // After a commit only a swipe the other way can do anything, so only a reversal starts a new gesture.
  const current = gesture?.committed && size >= MIN_DELTA && sign !== gesture.sign ? null : gesture;
  const next: TrackpadGesture = current
    ? { ...current }
    : {
        axis: size > Math.abs(deltaY) ? 'x' : 'y',
        closing: open,
        sign: 0,
        travel: 0,
        dragging: false,
        committed: false,
      };
  if (size >= MIN_DELTA) next.sign = sign;

  if (next.axis === 'y') return [next, { type: 'pass' }];
  if (next.committed) return [next, { type: 'hold' }];

  next.travel = Math.max(0, next.travel + (next.closing ? -deltaX : deltaX));
  // A drag that never moved the panel would still replace its transition, so it waits for travel.
  if (!next.dragging && next.travel === 0) return [next, { type: 'hold' }];

  if (next.travel >= commitAt) {
    next.dragging = false;
    next.committed = true;
    return [next, { type: 'commit', travel: next.travel }];
  }
  next.dragging = true;
  return [next, { type: 'drag', travel: next.travel }];
}

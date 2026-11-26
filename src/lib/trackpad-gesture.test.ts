import { expect, test } from 'vite-plus/test';

import { stepTrackpad, type TrackpadGesture, type TrackpadStep } from './trackpad-gesture';

const COMMIT_AT = 200;

function run(deltas: number[], open: boolean, start: TrackpadGesture | null = null) {
  let gesture = start;
  const steps: TrackpadStep['type'][] = [];
  for (const deltaX of deltas) {
    const [next, step] = stepTrackpad(
      gesture,
      { deltaX, deltaY: 0 },
      { open, commitAt: COMMIT_AT },
    );
    gesture = next;
    steps.push(step.type);
  }
  return { gesture, steps };
}

test('a swipe commits once, then its momentum is swallowed even when the deltas wobble', () => {
  const swipe = run([-40, -60, -70, -50], true);
  expect(swipe.steps).toEqual(['drag', 'drag', 'drag', 'commit']);

  const coast = run([-30, -12, -18, -6, -9, -2, -1, 0, -1], false, swipe.gesture);
  expect(coast.steps.every((type) => type === 'hold')).toBe(true);
  expect(coast.gesture?.committed).toBe(true);
});

test('after a commit, a reversal starts a new gesture in the other direction', () => {
  const swipe = run([-120, -100], true);
  expect(swipe.steps.at(-1)).toBe('commit');

  const reverse = run([1, 30], false, swipe.gesture);
  expect(reverse.steps).toEqual(['hold', 'drag']);
  expect(reverse.gesture?.closing).toBe(false);
  expect(reverse.gesture?.travel).toBe(30);
});

test('a swipe away from the other state never starts a drag', () => {
  expect(run([20, 30, 10], true).steps).toEqual(['hold', 'hold', 'hold']);
});

test('a mostly vertical first event passes the whole gesture to the page', () => {
  const [gesture, step] = stepTrackpad(
    null,
    { deltaX: 3, deltaY: 20 },
    { open: true, commitAt: 200 },
  );
  expect(step.type).toBe('pass');
  expect(
    stepTrackpad(gesture, { deltaX: -50, deltaY: 0 }, { open: true, commitAt: 200 })[1].type,
  ).toBe('pass');
});

import { expect, test } from 'vite-plus/test';

import {
  commits,
  startPointer,
  stepPointer,
  type PointerGesture,
  type PointerStep,
  type PressFacts,
} from './pointer-gesture';

function run(closing: boolean, ...points: [number, number][]) {
  let gesture: PointerGesture = { x: 0, y: 0, closing, axis: null, moving: false };
  const steps: PointerStep[] = [];
  for (const [x, y] of points) {
    const [next, step] = stepPointer(gesture, { x, y });
    gesture = next;
    steps.push(step);
  }
  return steps;
}

const OPENING = false;
const CLOSING = true;

test('a press waits until it has moved past the axis lock', () => {
  expect(run(OPENING, [-4, 0], [-9, 0])).toEqual([{ type: 'wait' }, { type: 'wait' }]);
});

test('a mostly vertical drag is abandoned to the page', () => {
  expect(run(OPENING, [-6, -12])).toEqual([{ type: 'abandon' }]);
});

test('opening travels left, and only the first drag step is marked first', () => {
  expect(run(OPENING, [-12, 0], [-30, 0])).toEqual([
    { type: 'drag', travel: 12, first: true },
    { type: 'drag', travel: 30, first: false },
  ]);
});

test('closing travels right', () => {
  expect(run(CLOSING, [20, 3])).toEqual([{ type: 'drag', travel: 20, first: true }]);
});

test('a pull the wrong way waits, and can still turn into a swipe', () => {
  expect(run(OPENING, [15, 0], [-12, 0])).toEqual([
    { type: 'wait' },
    { type: 'drag', travel: 12, first: true },
  ]);
});

test('once the panel moves, pulling back past the start keeps dragging it home', () => {
  expect(run(OPENING, [-20, 0], [10, 0]).at(-1)).toEqual({ type: 'drag', travel: 0, first: false });
});

test('a release commits on a flick or past a third of the way', () => {
  expect(commits({ progress: 0.2, speed: 0.5 })).toBe(true);
  expect(commits({ progress: 0.4, speed: 0 })).toBe(true);
  expect(commits({ progress: 0.3, speed: 0.3 })).toBe(false);
});

const TOUCH_ON_ROW: PressFacts = {
  touch: true,
  x: 200,
  plainPress: false,
  ignored: false,
  open: false,
  onArticleText: false,
  onRow: true,
  canOpen: true,
};
const MOUSE_ON_ROW: PressFacts = { ...TOUCH_ON_ROW, touch: false, plainPress: true };

test('a press on a row opens it, by touch or mouse', () => {
  expect(startPointer(TOUCH_ON_ROW)).toBe('open');
  expect(startPointer(MOUSE_ON_ROW)).toBe('open');
});

test('a row that cannot open, or a code box or slider, starts nothing', () => {
  expect(startPointer({ ...TOUCH_ON_ROW, canOpen: false })).toBeNull();
  expect(startPointer({ ...TOUCH_ON_ROW, ignored: true })).toBeNull();
});

test('a touch at the left edge is left to the browser back gesture', () => {
  expect(startPointer({ ...TOUCH_ON_ROW, x: 10 })).toBeNull();
});

test('a mouse press with another button or a modifier key starts nothing', () => {
  expect(startPointer({ ...MOUSE_ON_ROW, plainPress: false })).toBeNull();
});

test('empty space reopens the last article by touch, but selects text by mouse', () => {
  expect(startPointer({ ...TOUCH_ON_ROW, onRow: false })).toBe('open');
  expect(startPointer({ ...MOUSE_ON_ROW, onRow: false })).toBeNull();
});

test('an open article closes from anywhere by touch, and from outside its text by mouse', () => {
  const open = { open: true, onRow: false, canOpen: false };
  expect(startPointer({ ...TOUCH_ON_ROW, ...open, onArticleText: true })).toBe('close');
  expect(startPointer({ ...MOUSE_ON_ROW, ...open, onArticleText: false })).toBe('close');
  expect(startPointer({ ...MOUSE_ON_ROW, ...open, onArticleText: true })).toBeNull();
});

'use client';

import { type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react';

import { vibrateTick } from '@/lib/haptics';
import { cn } from '@/lib/utils';

import { HapticSwitch } from './HapticSwitch';

const MINOR_STEP = 9;
const MAJOR_CLEARANCE = 4;
const HEADING_OFFSET = 24;
const LIFT = 12;
const LIFT_SIGMA = 22;
const MAJOR_WIDTH = 16;
const MINOR_WIDTH = 7;
const CURRENT_WIDTH = 22;

type Tick = { key: string; pos: number; y: number; major: boolean };
type Section = { pos: number; label: string };
type Layout = { ticks: Tick[]; sections: Section[] };

// Each tick's height on the rail maps linearly to a scroll position in the article.
function measure(scroller: HTMLElement, railHeight: number): Layout {
  const range = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
  const contentTop = scroller.getBoundingClientRect().top - scroller.scrollTop;
  const sections = [...scroller.querySelectorAll('h2')].map((heading) => ({
    pos: Math.min(
      range,
      Math.max(0, heading.getBoundingClientRect().top - contentTop - HEADING_OFFSET),
    ),
    label: heading.textContent ?? '',
  }));
  const majors = sections.map(({ pos }, index) => ({
    key: `section-${index}`,
    pos,
    y: (pos / range) * railHeight,
    major: true,
  }));
  const minors: Tick[] = [];
  for (let y = 0; y <= railHeight; y += MINOR_STEP) {
    if (majors.every((major) => Math.abs(major.y - y) > MAJOR_CLEARANCE)) {
      minors.push({ key: `minor-${y}`, pos: (y / railHeight) * range, y, major: false });
    }
  }
  return { sections, ticks: [...majors, ...minors].toSorted((a, b) => a.pos - b.pos) };
}

function nearest(ticks: Tick[], key: 'pos' | 'y', value: number) {
  return ticks.reduce((best, tick) =>
    Math.abs(tick[key] - value) < Math.abs(best[key] - value) ? tick : best,
  );
}

/** A rail of ticks beside the article: hover to read section names, click to jump, drag to scrub. */
export function SectionScrubber({
  scrollerRef,
  onSnap,
}: {
  scrollerRef: RefObject<HTMLElement | null>;
  onSnap: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const [layout, setLayout] = useState<Layout>({ ticks: [], sections: [] });
  const [scrollTop, setScrollTop] = useState(0);
  const [pointerY, setPointerY] = useState<number | null>(null);
  const [snapped, setSnapped] = useState<Tick | null>(null);
  const [touch, setTouch] = useState(false);

  // Rebuild when the article's height changes, such as when images load or the window resizes.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const rail = railRef.current;
    if (!scroller || !rail) return undefined;
    const rebuild = () => setLayout(measure(scroller, rail.clientHeight));
    const onScroll = () => setScrollTop(scroller.scrollTop);
    const observer = new ResizeObserver(rebuild);
    observer.observe(scroller);
    for (const child of scroller.children) observer.observe(child);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', onScroll);
    };
  }, [scrollerRef]);

  const { ticks, sections } = layout;
  const current = ticks.length > 0 ? nearest(ticks, 'pos', scrollTop) : null;

  function track(event: PointerEvent) {
    const rail = railRef.current;
    const scroller = scrollerRef.current;
    if (!rail || !scroller || ticks.length === 0) return;
    const y = Math.min(
      rail.clientHeight,
      Math.max(0, event.clientY - rail.getBoundingClientRect().top),
    );
    const next = nearest(ticks, 'y', y);
    setPointerY(y);
    if (next !== snapped) {
      setSnapped(next);
      if (dragging.current) {
        onSnap();
        vibrateTick();
      }
    }
    // A press without movement is a click, which scrolls smoothly on release.
    if (dragging.current && moved.current) scroller.scrollTop = next.pos;
  }

  function release(event: PointerEvent) {
    dragging.current = false;
    if (event.pointerType !== 'mouse') setPointerY(null);
  }

  const section = snapped ? sections.findLastIndex(({ pos }) => pos <= snapped.pos + 1) : -1;

  return (
    <div
      ref={railRef}
      aria-hidden="true"
      data-swipe-ignore
      className="absolute top-1/2 right-3 h-90 w-10 -translate-y-1/2 cursor-ns-resize touch-none select-none"
      onPointerEnter={track}
      onPointerMove={(event) => {
        if (dragging.current) moved.current = true;
        track(event);
      }}
      onPointerLeave={() => {
        if (!dragging.current) setPointerY(null);
      }}
      onPointerDown={(event) => {
        dragging.current = true;
        moved.current = false;
        // Touch stays captured by the tapped label, so the iOS switch still receives the tap.
        if (event.pointerType === 'mouse') event.currentTarget.setPointerCapture(event.pointerId);
        setTouch(event.pointerType !== 'mouse');
        track(event);
      }}
      onPointerUp={(event) => {
        if (!moved.current && snapped) {
          scrollerRef.current?.scrollTo({ top: snapped.pos, behavior: 'smooth' });
        }
        release(event);
      }}
      onPointerCancel={release}
    >
      {ticks.map((tick) => {
        const isCurrent = tick === current;
        const base = tick.major ? MAJOR_WIDTH : MINOR_WIDTH;
        const lift =
          pointerY === null
            ? 0
            : LIFT * Math.exp(-((tick.y - pointerY) ** 2) / (2 * LIFT_SIGMA ** 2));
        let color = tick.major ? 'bg-muted' : 'bg-underline';
        if (tick.pos < scrollTop) color = 'bg-subtle';
        if (isCurrent) color = 'bg-text';
        return (
          <span
            key={tick.key}
            className={cn(
              'pointer-events-none absolute right-0 -translate-y-1/2 rounded-full transition-[width,background-color] duration-100 ease-out',
              isCurrent ? 'h-0.5' : 'h-tick',
              color,
            )}
            style={{
              top: tick.y,
              width: (isCurrent ? Math.max(base, CURRENT_WIDTH) : base) + lift,
            }}
          />
        );
      })}

      {pointerY !== null && snapped && (
        <span
          className={cn(
            'pointer-events-none absolute right-full mr-2.5 -translate-y-1/2 rounded-sm bg-bg px-2 py-0.5 text-meta whitespace-nowrap text-text outline outline-underline',
            // Under a finger, lift the label up and away from the thumb and make it bigger.
            touch && 'mr-3 -translate-y-[calc(50%+--spacing(8))] px-3 py-1.5 text-tip-touch',
          )}
          style={{ top: snapped.y }}
        >
          <span className="mr-2 text-muted tabular-nums">
            {section + 2}/{sections.length + 1}
          </span>
          {section < 0 ? 'Intro' : sections[section].label}
        </span>
      )}

      <HapticSwitch />
    </div>
  );
}

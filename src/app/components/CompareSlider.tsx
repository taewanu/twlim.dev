'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Media = { src: string; alt: string; poster?: string };

const isVideo = (src: string) => /\.(mp4|webm)$/i.test(src);

export function CompareSlider({
  before,
  after,
  width,
  height,
  caption,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: {
  before: Media;
  after: Media;
  width: number;
  height: number;
  caption: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [split, setSplit] = useState(50);
  const [gliding, setGliding] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragged = useRef(false);
  const size = height > width * 1.5 ? 'w-[240px]' : 'w-full';

  function splitAt(clientX: number) {
    const box = boxRef.current;
    if (!box) return;
    const { left, width: boxWidth } = box.getBoundingClientRect();
    setSplit(Math.round(Math.min(100, Math.max(0, ((clientX - left) / boxWidth) * 100))));
  }

  function jumpTo(clientX: number) {
    setGliding(true);
    splitAt(clientX);
  }

  // Touch waits for a sideways move or a tap, so a vertical scroll that starts on the frame leaves the split alone.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    inputRef.current?.focus({ preventScroll: true });
    dragged.current = false;
    if (event.pointerType === 'mouse') {
      event.preventDefault();
      jumpTo(event.clientX);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    dragged.current = true;
    setGliding(false);
    splitAt(event.clientX);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' && !dragged.current) jumpTo(event.clientX);
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    boxRef.current?.querySelectorAll('video').forEach((video) => {
      video.play().catch(() => {});
    });
  }, []);

  const layer = (media: Media) =>
    isVideo(media.src) ? (
      <video
        src={media.src}
        poster={media.poster}
        aria-label={media.alt}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />
    ) : (
      <Image
        src={media.src}
        alt={media.alt}
        width={width}
        height={height}
        className="absolute inset-0 size-full object-cover"
      />
    );

  const pill =
    'pointer-events-none absolute top-2 rounded-full bg-bg/80 px-2 py-0.5 text-meta text-text';

  return (
    <figure className="my-6">
      <div
        ref={boxRef}
        style={
          {
            aspectRatio: `${width} / ${height}`,
            '--split': `${split}%`,
          } as React.CSSProperties
        }
        className={`relative cursor-ew-resize touch-pan-y overflow-hidden [-webkit-touch-callout:none] rounded-lg border border-underline select-none ${size}`}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <input
          ref={inputRef}
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(e) => {
            setGliding(false);
            setSplit(Number(e.target.value));
          }}
          aria-label={`${beforeLabel} and ${afterLabel.toLowerCase()}: ${caption}`}
          aria-valuetext={`${100 - split}% ${afterLabel.toLowerCase()}`}
          className="peer pointer-events-none sr-only"
        />
        {layer(before)}
        <div
          className={`absolute inset-0 [clip-path:inset(0_0_0_var(--split))] ${gliding ? 'motion-safe:transition-[clip-path] motion-safe:duration-150' : ''}`}
        >
          {layer(after)}
        </div>
        <span className={`${pill} left-2`}>{beforeLabel}</span>
        <span className={`${pill} right-2`}>{afterLabel}</span>
        <div
          className={`pointer-events-none absolute inset-y-0 left-(--split) w-px -translate-x-1/2 bg-bg outline outline-text/25 peer-focus-visible:*:outline-2 peer-focus-visible:*:outline-offset-2 peer-focus-visible:*:outline-text ${gliding ? 'motion-safe:transition-[left] motion-safe:duration-150' : ''}`}
        >
          <span className="absolute top-1/2 left-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-text bg-bg text-text">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 1 L0.8 4 L3.5 7" />
              <path d="M8.5 1 L11.2 4 L8.5 7" />
            </svg>
          </span>
        </div>
      </div>
      <figcaption className="mt-2 text-meta text-muted">{caption}</figcaption>
    </figure>
  );
}

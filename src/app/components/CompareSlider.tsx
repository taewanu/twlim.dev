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
  const boxRef = useRef<HTMLDivElement>(null);
  const size = height > width * 1.5 ? 'w-[240px]' : 'w-full';

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
        className={`relative [container-type:size] overflow-hidden rounded-lg border border-underline ${size}`}
      >
        <input
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label={`${beforeLabel} and ${afterLabel.toLowerCase()}: ${caption}`}
          aria-valuetext={`${100 - split}% ${afterLabel.toLowerCase()}`}
          className="peer absolute inset-y-0 -left-5.5 z-10 m-0 h-full w-[calc(100%+2.75rem)] cursor-ew-resize touch-pan-y appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-11 [&::-moz-range-track]:h-full [&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-thumb]:h-[100cqh] [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none"
        />
        {layer(before)}
        <div className="absolute inset-0 [clip-path:inset(0_0_0_var(--split))]">{layer(after)}</div>
        <span className={`${pill} left-2`}>{beforeLabel}</span>
        <span className={`${pill} right-2`}>{afterLabel}</span>
        <div className="pointer-events-none absolute inset-y-0 left-(--split) w-px -translate-x-1/2 bg-bg outline outline-text/25 peer-focus-visible:*:outline-2 peer-focus-visible:*:outline-offset-2 peer-focus-visible:*:outline-text">
          <span className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-text bg-bg" />
        </div>
      </div>
      <figcaption className="mt-2 text-meta text-muted">{caption}</figcaption>
    </figure>
  );
}

"use client";

import { useEffect, useRef } from "react";

// Loops like a GIF, but holds still for reduced motion and pauses on tap.
export function Clip({
  src,
  poster,
  caption,
  width = 390,
  height = 844,
}: {
  src: string;
  poster: string;
  caption: string;
  width?: number;
  height?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const size = height > width * 1.5 ? "w-[240px]" : "w-full";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ref.current?.play().catch(() => {});
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  return (
    <figure className="my-6">
      <button
        type="button"
        onClick={toggle}
        aria-label="Play or pause the clip"
        className={`block cursor-pointer ${size}`}
      >
        <video
          ref={ref}
          src={src}
          poster={poster}
          width={width}
          height={height}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full rounded-lg border border-underline"
        />
      </button>
      <figcaption className="mt-2 text-[0.8125rem] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

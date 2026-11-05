"use client";

import { useEffect, useRef } from "react";

// Loops like a GIF, but holds still for reduced motion and pauses on tap.
export function Clip({
  src,
  poster,
  caption,
}: {
  src: string;
  poster: string;
  caption: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

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
        className="block cursor-pointer"
      >
        <video
          ref={ref}
          src={src}
          poster={poster}
          width={390}
          height={844}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-[240px] rounded-lg border border-underline"
        />
      </button>
      <figcaption className="mt-2 text-[0.8125rem] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

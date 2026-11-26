'use client';

import { useRef } from 'react';

import { prefersReducedMotion } from '@/lib/motion';

import { IndexItem } from './IndexItem';

const VIEWPORT_GAP = 24;

type PreviewClip = { src: string; poster: string; width: number; height: number };

export function PreviewItem({
  href,
  title,
  summary,
  clip,
}: {
  href: string;
  title: string;
  summary: string;
  clip: PreviewClip;
}) {
  const video = useRef<HTMLVideoElement>(null);

  function show() {
    const el = video.current;
    const item = el?.closest('li');
    if (!el || !item) return;
    const { top, bottom } = item.getBoundingClientRect();
    const roomBelow = window.innerHeight - VIEWPORT_GAP - top;
    const roomAbove = bottom - VIEWPORT_GAP;
    const opensUp = el.offsetHeight > roomBelow && roomAbove > roomBelow;
    el.style.top = opensUp ? 'auto' : '';
    el.style.bottom = opensUp ? '0' : '';
    if (prefersReducedMotion()) return;
    el.play().catch(() => {});
  }

  function hide() {
    video.current?.pause();
  }

  return (
    <IndexItem
      href={href}
      title={title}
      summary={summary}
      className="relative"
      linkProps={{
        className: 'peer',
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
      }}
    >
      <video
        ref={video}
        src={clip.src}
        poster={clip.poster}
        width={clip.width}
        height={clip.height}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-full ml-12 hidden max-h-72 w-auto max-w-64 rounded-lg border border-underline opacity-0 transition-opacity duration-200 peer-hover:opacity-100 peer-focus-visible:opacity-100 xl:block"
      />
    </IndexItem>
  );
}

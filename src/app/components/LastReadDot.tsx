'use client';

import { createContext, use } from 'react';

export type LastRead = { href: string; title: string | null };

/** The row a swipe on empty space reopens, or null while the drawer is open. */
export const LastReadContext = createContext<LastRead | null>(null);

export function LastReadDot({ href, title }: { href: string; title: string }) {
  const last = use(LastReadContext);
  if (last?.href !== href || last.title !== title) return null;
  return (
    <span aria-hidden className="absolute top-0 -left-3.5 flex h-lh items-center">
      <span className="size-1.25 rounded-full bg-muted" />
    </span>
  );
}

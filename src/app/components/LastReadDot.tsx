'use client';

import { createContext, use } from 'react';

/** The article a swipe on empty space reopens, or null while the drawer is open. */
export const LastReadContext = createContext<string | null>(null);

export function LastReadDot({ href }: { href: string }) {
  if (use(LastReadContext) !== href) return null;
  return (
    <span
      aria-hidden
      className="mr-2 mb-0.5 inline-block size-1.25 rounded-full bg-muted align-middle"
    />
  );
}

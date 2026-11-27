'use client';

import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, use, useLayoutEffect } from 'react';

import { useHydrated } from '@/hooks/use-hydrated';

export const RememberArticleContext = createContext<(href: string, article: ReactNode) => void>(
  () => {},
);

/** Hands the article to the drawer to render, showing it in place only as the server-rendered panel. */
export function RememberArticle({ children }: { children: ReactNode }) {
  const remember = use(RememberArticleContext);
  const pathname = usePathname();
  const hydrated = useHydrated();
  useLayoutEffect(() => remember(pathname, children), [remember, pathname, children]);
  return hydrated ? null : children;
}

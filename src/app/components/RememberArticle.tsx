'use client';

import { createContext, type ReactNode, use, useLayoutEffect } from 'react';

import { useHydrated } from '@/hooks/use-hydrated';

export const RememberArticleContext = createContext<(article: ReactNode) => void>(() => {});

/** Hands the article to the drawer to render, showing it in place only as the server-rendered panel. */
export function RememberArticle({ children }: { children: ReactNode }) {
  const remember = use(RememberArticleContext);
  const hydrated = useHydrated();
  useLayoutEffect(() => remember(children), [remember, children]);
  return hydrated ? null : children;
}

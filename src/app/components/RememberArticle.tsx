'use client';

import { createContext, type ReactNode, use, useLayoutEffect } from 'react';

import { useHydrated } from '@/hooks/use-hydrated';

export const RememberArticleContext = createContext<(article: ReactNode) => void>(() => {});

/**
 * Hands the article to the drawer, which renders it in one place through every navigation so its
 * scroll and media survive. Before hydration it renders in place as the plain HTML panel.
 */
export function RememberArticle({ children }: { children: ReactNode }) {
  const remember = use(RememberArticleContext);
  const hydrated = useHydrated();
  useLayoutEffect(() => remember(children), [remember, children]);
  return hydrated ? null : children;
}

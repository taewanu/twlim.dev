'use client';

import { createContext, type ReactNode, use, useLayoutEffect } from 'react';

export const RememberArticleContext = createContext<(article: ReactNode) => void>(() => {});

/**
 * Hands the rendered article to the drawer, which keeps showing this copy at `/` (where the
 * @article slot is empty) while the panel slides out or is swiped back.
 */
export function RememberArticle({ children }: { children: ReactNode }) {
  const remember = use(RememberArticleContext);
  useLayoutEffect(() => remember(children), [remember, children]);
  return children;
}

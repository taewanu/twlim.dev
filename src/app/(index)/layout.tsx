import type { ReactNode } from 'react';

import { ArticleDrawer } from '@/app/components/ArticleDrawer';

export function IndexLayout({ children, article }: { children: ReactNode; article: ReactNode }) {
  return <ArticleDrawer article={article}>{children}</ArticleDrawer>;
}

export default IndexLayout;

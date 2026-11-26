import type { ReactNode } from 'react';

import { ARTICLE_TITLE_ID } from '@/lib/article';

export function ArticleBody({
  title,
  titleId = ARTICLE_TITLE_ID,
  meta,
  lang,
  children,
}: {
  title: string;
  /** The id that names the drawer's dialog; a stand-in shown over the real article passes none. */
  titleId?: string | null;
  meta?: ReactNode;
  lang?: string;
  children?: ReactNode;
}) {
  return (
    <article
      lang={lang}
      className="mx-auto max-w-article px-6 pt-20 pb-50 text-article tracking-tight font-reading max-sm:pr-14"
    >
      <h1 id={titleId ?? undefined} className="font-serif text-heading tracking-tight">
        {title}
      </h1>
      <p className="mt-1.5 mb-11 text-meta text-muted">{meta}</p>
      {children}
    </article>
  );
}

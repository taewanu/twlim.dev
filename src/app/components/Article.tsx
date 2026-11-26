import type { ReactNode } from 'react';

import { ARTICLE_TITLE_ID } from '@/lib/article';

import { RememberArticle } from './RememberArticle';

export function Article({
  title,
  meta,
  lang,
  children,
}: {
  title: string;
  meta: ReactNode;
  lang?: string;
  children: ReactNode;
}) {
  return (
    <RememberArticle>
      <article
        lang={lang}
        className="mx-auto max-w-article px-6 pt-20 pb-50 text-article tracking-tight font-reading max-sm:pr-14"
      >
        <h1 id={ARTICLE_TITLE_ID} className="font-serif text-heading tracking-tight">
          {title}
        </h1>
        <p className="mt-1.5 mb-11 text-meta text-muted">{meta}</p>
        {children}
      </article>
    </RememberArticle>
  );
}

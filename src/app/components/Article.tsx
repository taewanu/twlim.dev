import type { ComponentProps } from 'react';

import { ArticleBody } from './ArticleBody';
import { RememberArticle } from './RememberArticle';

export function Article(props: ComponentProps<typeof ArticleBody>) {
  return (
    <RememberArticle>
      <ArticleBody {...props} />
    </RememberArticle>
  );
}

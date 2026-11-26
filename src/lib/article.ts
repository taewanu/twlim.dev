// Lives outside Article so the client drawer can name its dialog without importing the server component.
export const ARTICLE_TITLE_ID = 'article-title';

// Pages that stay behind the drawer; every other route in the index group opens as an article.
const INDEX_PAGES = new Set(['/', '/garden']);

export function isIndexPage(pathname: string) {
  return INDEX_PAGES.has(pathname);
}

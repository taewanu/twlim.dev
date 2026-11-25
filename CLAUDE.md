# twlim.dev

Taewan Lim's personal site: Next.js App Router on Vercel, with lint, format and the pre-commit hook run by Vite+ (`vite.config.ts`).

## Design

- Use the tokens in `src/app/globals.css` (`@theme`) instead of raw values.
- Serif headings, sans body, generous whitespace, no decorative elements.
- Never: hero images, gradients, card shadows, purple accents, the Inter font.

## Code

- Named exports; a page also default-exports the same component because Next.js requires it.
- Server components by default; `'use client'` only when needed.
- Tailwind classes on elements; no `@apply`.
- One component per file, PascalCase.

## Verify

- `npm run check` before committing (the pre-commit hook runs it on staged files).
- `npm run build` before calling work done.

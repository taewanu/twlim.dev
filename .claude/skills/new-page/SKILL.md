# new-page

Scaffold a new page for the personal website.

## Trigger
"new page", "add a route", "create /about", "build the work section", or any request to add a new page/route.

## Steps
1. Read CLAUDE.md for design system and code conventions
2. Check existing pages in `src/app/` for established patterns (layout, naming, exports)
3. Create the route directory and `page.tsx` under `src/app/`
4. Use server component by default with named export
5. Apply only approved colors: #2C2926, #9B9590, #FDFDFC
6. Use serif for headings, system sans for body text
7. Ensure responsive design (mobile-first, min font 16px)
8. Run `npm run build` to verify no errors

## Rules
- Follow existing page patterns exactly
- No default exports — use `export function PageName()`
- No external UI libraries
- No decorative elements, gradients, or shadows

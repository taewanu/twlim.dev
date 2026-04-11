# Personal Website — Wanu

Minimal, text-centric personal website.

## Stack

- Next.js (App Router, src/ directory)
- TypeScript (strict)
- Tailwind CSS
- Vercel deploy

## Design System

- Background: #FDFDFC
- Text: #2C2926 (warm black)
- Muted: #9B9590 (warm grey)
- Typography hierarchy: serif headings, system sans body
- Aesthetic: generous whitespace, no decorative elements
- Fonts: Source Sans 3 (body), Lora (headings)
- NEVER: hero images, gradients, card shadows, purple accents, Inter font

## Code Conventions

- Named exports (not default)
- Server components by default; 'use client' only when necessary
- Tailwind classes on elements directly, no @apply
- No external UI libraries (no MUI, Chakra, Radix). shadcn OK
- One component per file, PascalCase.tsx

## Verification

- `npm run build` — must pass before considering work done
- `npm run lint` — must pass before commit

## Gotchas

<!-- Claude가 실수할 때마다 여기에 한 줄씩 추가 -->

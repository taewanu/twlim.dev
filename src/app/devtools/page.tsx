import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Metadata } from 'next';
import Link from 'next/link';

import { SectionNav } from '@/app/components/SectionNav';
import Content from '@/content/projects/devtools.mdx';
import { sectionsOf } from '@/lib/garden';

export const metadata: Metadata = {
  title: 'Lendit Devtools · Taewan Lim',
  description:
    'A VS Code extension I built at Lendit to preview and inspect app screens next to their code.',
};

const sections = sectionsOf(
  readFileSync(path.join(process.cwd(), 'src/content/projects/devtools.mdx'), 'utf8'),
);

export function Devtools() {
  return (
    <>
      <SectionNav backHref="/" backLabel="Index" sections={sections} />

      <main className="mx-auto max-w-article px-6 pt-20 pb-50 text-article tracking-tight font-reading">
        <Link
          href="/"
          className="-my-3 mb-4 inline-block py-3 pr-3 text-meta text-muted min-[1100px]:hidden"
        >
          ← Index
        </Link>
        <h1 className="font-serif text-heading tracking-tight">Lendit Devtools</h1>
        <p className="mt-1.5 mb-11 text-meta text-muted">
          Lendit, Feb 2023 – Oct 2025 · Written 2026-11-16
        </p>
        <Content />
        <Link
          href="/"
          className="-my-3 mt-8 inline-block py-3 pr-3 text-meta text-muted min-[1100px]:hidden"
        >
          ← Index
        </Link>
      </main>
    </>
  );
}

export default Devtools;

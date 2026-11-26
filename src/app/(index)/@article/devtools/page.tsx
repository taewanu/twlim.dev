import type { Metadata } from 'next';

import { Article } from '@/app/components/Article';
import Content from '@/content/projects/devtools.mdx';

export const metadata: Metadata = {
  title: 'Lendit Devtools · Taewan Lim',
  description:
    'A VS Code extension I built at Lendit to preview and inspect app screens next to their code.',
};

export function Devtools() {
  return (
    <Article title="Lendit Devtools" meta="Lendit, Feb 2023 – Oct 2025 · Written 2026-11-16">
      <Content />
    </Article>
  );
}

export default Devtools;

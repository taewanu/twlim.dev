import type { Metadata } from 'next';

import { Article } from '@/app/components/Article';
import { TextLink } from '@/app/components/TextLink';
import Content from '@/content/projects/sounds-abroad.mdx';

export const metadata: Metadata = {
  title: 'Sounds Abroad · Taewan Lim',
  description:
    "A 3D globe for finding trending music by country, and what the AI couldn't do while building it.",
};

export function SoundsAbroad() {
  return (
    <Article
      title="Sounds Abroad"
      meta={
        <>
          Launched 2026-06-08 · Written 2026-11-05 ·{' '}
          <TextLink href="https://soundsabroad.app">soundsabroad.app</TextLink>
        </>
      }
    >
      <Content />
    </Article>
  );
}

export default SoundsAbroad;

import type { Metadata } from 'next';

import { Article } from '@/app/components/Article';
import { TextLink } from '@/app/components/TextLink';
import { loadNote, noteSlugs } from '@/lib/garden';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return noteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await loadNote(slug);
  return { title: `${meta.title} · Taewan Lim` };
}

export async function GardenNote({ params }: Props) {
  const { slug } = await params;
  const { Content, meta } = await loadNote(slug);

  return (
    <Article
      title={meta.title}
      lang={meta.lang}
      meta={
        <>
          <TextLink href="/garden/about" className="capitalize">
            {meta.stage}
          </TextLink>{' '}
          · Planted {meta.planted} · Tended {meta.tended}
        </>
      }
    >
      <Content />
    </Article>
  );
}

export default GardenNote;

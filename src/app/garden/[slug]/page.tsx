import type { Metadata } from "next";
import Link from "next/link";
import { SectionNav } from "@/app/components/SectionNav";
import { loadNote, noteSlugs } from "@/lib/garden";

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
  const { Content, meta, sections } = await loadNote(slug);

  return (
    <>
      <SectionNav key={slug} backHref="/" backLabel="Index" sections={sections} />

      <main
        lang={meta.lang}
        className="mx-auto max-w-[560px] px-6 pt-20 pb-50 text-[0.875rem] leading-[1.7] tracking-tight"
        style={{ fontWeight: 460 }}
      >
        <Link
          href="/"
          className="-my-3 mb-4 inline-block py-3 pr-3 text-[0.8125rem] text-muted min-[1100px]:hidden"
        >
          ← Index
        </Link>
        <h1 className="font-serif text-[0.875rem] leading-[1.4rem] tracking-tight">
          {meta.title}
        </h1>
        <p className="mt-1.5 mb-11 text-[0.8125rem] text-muted">
          <Link href="/garden/about" className="capitalize">
            {meta.stage}
          </Link>{" "}
          · Planted {meta.planted} · Tended {meta.tended}
        </p>
        <Content />
        <Link
          href="/"
          className="-my-3 mt-8 inline-block py-3 pr-3 text-[0.8125rem] text-muted min-[1100px]:hidden"
        >
          ← Index
        </Link>
      </main>
    </>
  );
}

export default GardenNote;

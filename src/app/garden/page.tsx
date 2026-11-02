import type { Metadata } from "next";
import Link from "next/link";
import { loadPlantedNotes } from "@/lib/garden";

export const metadata: Metadata = {
  title: "Garden · Taewan Lim",
  description: "Unfinished notes on what I am building and learning.",
};

export async function Garden() {
  const notes = await loadPlantedNotes();
  const topics = [...new Set(notes.flatMap((note) => note.meta.topics))].sort();

  return (
    <main
      className="mx-auto max-w-[560px] px-6 pt-20 pb-50 text-[0.875rem] leading-[1.7] tracking-tight"
      style={{ fontWeight: 460 }}
    >
      <Link
        href="/"
        className="-my-3 mb-4 inline-block py-3 pr-3 text-[0.8125rem] text-muted"
      >
        ← Index
      </Link>
      <h1 className="font-serif text-[0.875rem] leading-[1.4rem] tracking-tight">
        Garden
      </h1>
      <p className="mt-1.5 mb-11 text-[0.8125rem] text-muted">
        Notes that are unfinished on purpose.{" "}
        <Link href="/garden/about">How to read them.</Link>
      </p>

      {topics.map((topic) => (
        <section key={topic} className="mb-10">
          <h2 className="font-serif text-[0.875rem] leading-[1.4rem] font-bold tracking-tight">
            {topic}
          </h2>
          <ul className="mt-3 space-y-[0.4rem]">
            {notes
              .filter((note) => note.meta.topics.includes(topic))
              .map(({ slug, meta }) => (
                <li key={slug}>
                  <Link href={`/garden/${slug}`}>{meta.title}</Link>
                  <span className="text-muted capitalize"> · {meta.stage}</span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

export default Garden;

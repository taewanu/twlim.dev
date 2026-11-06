import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionNav } from "@/app/components/SectionNav";
import Content from "@/content/projects/sounds-abroad.mdx";
import { sectionsOf } from "@/lib/garden";

export const metadata: Metadata = {
  title: "Sounds Abroad · Taewan Lim",
  description:
    "A 3D globe for finding trending music by country, and what the AI couldn't do while building it.",
};

const sections = sectionsOf(
  readFileSync(
    path.join(process.cwd(), "src/content/projects/sounds-abroad.mdx"),
    "utf8",
  ),
);

export function SoundsAbroad() {
  return (
    <>
      <SectionNav backHref="/" backLabel="Index" sections={sections} />

      <main
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
          Sounds Abroad
        </h1>
        <p className="mt-1.5 mb-11 text-[0.8125rem] text-muted">
          Launched 2026-06-08 · Written 2026-11-05 ·{" "}
          <a
            href="https://soundsabroad.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            soundsabroad.app
          </a>
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

export default SoundsAbroad;

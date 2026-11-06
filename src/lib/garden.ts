import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import type { MDXContent } from "mdx/types";

const GARDEN_DIR = path.join(process.cwd(), "src/content/garden");
const STAGES = ["seed", "sapling", "mallorn"] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type NoteMeta = {
  title: string;
  stage: (typeof STAGES)[number];
  planted: string;
  tended: string;
  topics: string[];
  lang?: string;
};

function noteFiles() {
  return readdirSync(GARDEN_DIR).filter((file) => /\.mdx?$/.test(file));
}

function slugOf(file: string) {
  return file.replace(/\.mdx?$/, "");
}

// Slugs every heading level, as rehype-slug does, so the ids stay in sync with the page.
export function sectionsOf(source: string) {
  const slugger = new GithubSlugger();
  const withoutCode = source.replace(/^```[\s\S]*?^```/gm, "");
  return [...withoutCode.matchAll(/^(#{1,6}) (.+)$/gm)]
    .map(([, hashes, text]) => {
      const label = text.replace(/`/g, "").trim();
      return { level: hashes.length, id: slugger.slug(label), label };
    })
    .filter((heading) => heading.level === 2)
    .map(({ id, label }) => ({ id, label }));
}

export function noteSlugs() {
  return noteFiles().map(slugOf);
}

export async function loadNote(slug: string) {
  const file = noteFiles().find((candidate) => slugOf(candidate) === slug);
  if (!file) throw new Error(`No garden note for slug "${slug}"`);

  const note = (await import(`@/content/garden/${file}`)) as {
    default: MDXContent;
    frontmatter: NoteMeta;
  };

  const { title, stage, planted, tended, topics } = note.frontmatter;
  if (
    !title ||
    !STAGES.includes(stage) ||
    !ISO_DATE.test(planted) ||
    !ISO_DATE.test(tended) ||
    !Array.isArray(topics)
  ) {
    throw new Error(`${file}: invalid frontmatter`);
  }

  return {
    slug,
    Content: note.default,
    meta: note.frontmatter,
    sections: sectionsOf(readFileSync(path.join(GARDEN_DIR, file), "utf8")),
  };
}

export async function loadPlantedNotes() {
  const notes = await Promise.all(noteSlugs().map((slug) => loadNote(slug)));
  return notes
    .filter((note) => note.meta.topics.length > 0)
    .sort((a, b) => b.meta.tended.localeCompare(a.meta.tended));
}

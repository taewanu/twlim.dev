import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import type { MDXContent, MDXModule } from "mdx/types";
import { z } from "zod";

const GARDEN_DIR = path.join(process.cwd(), "src/content/garden");

const NoteMeta = z.object({
  title: z.string().min(1),
  stage: z.enum(["seed", "sapling", "mallorn"]),
  planted: z.iso.date(),
  tended: z.iso.date(),
  topics: z.array(z.string()),
  lang: z.string().optional(),
});
export type NoteMeta = z.infer<typeof NoteMeta>;

const NoteModule = z.object({
  default: z.custom<MDXContent>((value) => typeof value === "function"),
  frontmatter: NoteMeta,
}) satisfies z.ZodType<MDXModule>;

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

  const note = NoteModule.safeParse(await import(`@/content/garden/${file}`));
  if (!note.success) {
    throw new Error(`${file}: invalid note\n${z.prettifyError(note.error)}`);
  }

  return {
    slug,
    Content: note.data.default,
    meta: note.data.frontmatter,
    sections: sectionsOf(readFileSync(path.join(GARDEN_DIR, file), "utf8")),
  };
}

export async function loadPlantedNotes() {
  const notes = await Promise.all(noteSlugs().map((slug) => loadNote(slug)));
  return notes
    .filter((note) => note.meta.topics.length > 0)
    .toSorted((a, b) => b.meta.tended.localeCompare(a.meta.tended));
}

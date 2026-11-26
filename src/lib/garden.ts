import { readdirSync } from 'node:fs';
import path from 'node:path';

import type { MDXContent, MDXModule } from 'mdx/types';
import { z } from 'zod';

const GARDEN_DIR = path.join(process.cwd(), 'src/content/garden');

const NoteMeta = z.object({
  title: z.string().min(1),
  stage: z.enum(['seed', 'sapling', 'mallorn']),
  planted: z.iso.date(),
  tended: z.iso.date(),
  topics: z.array(z.string()),
  lang: z.string().optional(),
});
export type NoteMeta = z.infer<typeof NoteMeta>;

const NoteModule = z.object({
  default: z.custom<MDXContent>((value) => typeof value === 'function'),
  frontmatter: NoteMeta,
}) satisfies z.ZodType<MDXModule>;

function noteFiles() {
  return readdirSync(GARDEN_DIR).filter((file) => /\.mdx?$/.test(file));
}

function slugOf(file: string) {
  return file.replace(/\.mdx?$/, '');
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
  };
}

export async function loadPlantedNotes() {
  const notes = await Promise.all(noteSlugs().map((slug) => loadNote(slug)));
  return notes
    .filter((note) => note.meta.topics.length > 0)
    .toSorted((a, b) => b.meta.tended.localeCompare(a.meta.tended));
}

import Link from 'next/link';

import { loadPlantedNotes } from '@/lib/garden';

import { LocalTime } from './components/LocalTime';
import { PreviewItem } from './components/PreviewItem';

export async function Home() {
  const notes = await loadPlantedNotes();

  return (
    <main className="mx-auto max-w-xl px-6 py-12 sm:py-20">
      <h1 className="fade-in font-serif text-3xl font-bold tracking-tight">Taewan Lim</h1>

      <div className="fade-in stagger-1 mt-12 space-y-5 text-base leading-relaxed tracking-tight font-reading">
        <p>I was born in Seoul, Korea. Currently, based in Vancouver, Canada.</p>

        <p>
          I&apos;m a software developer. Previously at a fintech company in Seoul, where I built
          internal dashboards, a customer-facing loan site, and{' '}
          <Link href="/devtools">developer tooling as a VS Code extension</Link>.
        </p>

        <p>
          Before switching to an engineering career, I had a product management background at a food
          delivery startup in Seoul. It helped me think not just about building features, but why
          they exist, which is a mindset I still carry.
        </p>

        <p>
          I&apos;ve also done a handful of different things. I picked blueberries in Tasmania, made
          bath bombs at a LUSH factory in Sydney, led beer tours in Seoul, and promoted a Korean
          theatre team at the Edinburgh Fringe Festival in Scotland.
        </p>

        <p>
          You can also find me on{' '}
          <a href="https://github.com/taewanu" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          ,{' '}
          <a href="https://linkedin.com/in/taewanlim" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>{' '}
          and{' '}
          <a href="https://linktr.ee/wanu" target="_blank" rel="noopener noreferrer">
            Linktree
          </a>
          , or reach me via <a href="mailto:twlim.dev@gmail.com">email</a>.
        </p>
      </div>

      <section className="fade-in stagger-2 mt-12">
        <h2 className="font-serif text-lg font-bold">Experience</h2>
        <ul className="mt-4 space-y-3 text-base leading-relaxed tracking-tight font-reading">
          <PreviewItem
            href="/devtools"
            title="Lendit Devtools"
            summary="VS Code extension for previewing and inspecting app screens"
            clip={{
              src: '/devtools/node-type-filter.mp4',
              poster: '/devtools/node-type-filter.jpg',
              width: 1200,
              height: 754,
            }}
          />
        </ul>
      </section>

      <section className="fade-in stagger-3 mt-12">
        <h2 className="font-serif text-lg font-bold">Projects</h2>
        <ul className="mt-4 space-y-3 text-base leading-relaxed tracking-tight font-reading">
          <PreviewItem
            href="/sounds-abroad"
            title="Sounds Abroad"
            summary="3D globe for discovering trending music around the world"
            clip={{
              src: '/sounds-abroad/flick.mp4',
              poster: '/sounds-abroad/flick.jpg',
              width: 390,
              height: 844,
            }}
          />
          <li>
            <Link href="/garden/pr-review-agent">PR Review Agent</Link>
            <span className="text-muted">
              {' '}
              · An AI agent that reviews my pull requests, including its own
            </span>
          </li>
        </ul>
      </section>

      <section className="fade-in stagger-4 mt-12">
        <h2 className="font-serif text-lg font-bold">
          <Link href="/garden">Garden</Link>
        </h2>
        <ul className="mt-4 space-y-3 text-base leading-relaxed tracking-tight font-reading">
          {notes.map(({ slug, meta }) => (
            <li key={slug} className="flex justify-between gap-6">
              <span>
                <Link href={`/garden/${slug}`}>{meta.title}</Link>
                <span className="text-muted capitalize"> · {meta.stage}</span>
              </span>
              <span className="shrink-0 text-muted">{meta.tended}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="fade-in stagger-5 mt-12">
        <h2 className="font-serif text-lg font-bold">Client Works</h2>
        <ul className="mt-4 space-y-3 text-base leading-relaxed tracking-tight font-reading">
          <li>
            <a
              href="https://renewal.serene-renewal.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Serene
            </a>
            <span className="text-muted">
              {' '}
              · Corporate website for a signage design and build company
            </span>
          </li>
          <li>
            <a href="https://turiya.kr" target="_blank" rel="noopener noreferrer">
              Turiya
            </a>
            <span className="text-muted">
              {' '}
              · Shopify store curating works by artists and designers
            </span>
          </li>
        </ul>
      </section>

      <section className="fade-in stagger-6 mt-12">
        <h2 className="font-serif text-lg font-bold">Contact</h2>
        <p className="mt-4 text-base leading-relaxed tracking-tight font-reading">
          <a href="mailto:twlim.dev@gmail.com">Email</a>
          <span className="text-muted"> · </span>
          <a href="https://linkedin.com/in/taewanlim" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <span className="text-muted"> · </span>
          <a href="https://github.com/taewanu" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </section>

      <footer className="fade-in stagger-7 mt-12 flex justify-end">
        <LocalTime />
      </footer>
    </main>
  );
}

export default Home;

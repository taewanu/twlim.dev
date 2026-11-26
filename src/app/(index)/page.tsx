import { IndexItem } from '@/app/components/IndexItem';
import { IndexList } from '@/app/components/IndexList';
import { IndexSection } from '@/app/components/IndexSection';
import { LocalTime } from '@/app/components/LocalTime';
import { PreviewItem } from '@/app/components/PreviewItem';
import { TextLink } from '@/app/components/TextLink';
import { loadPlantedNotes } from '@/lib/garden';

// Stays mounted under an open article: on client navigation, Next keeps the active page of this slot.
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
          <TextLink href="/devtools">developer tooling as a VS Code extension</TextLink>.
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
          You can also find me on <TextLink href="https://github.com/taewanu">GitHub</TextLink>,{' '}
          <TextLink href="https://linkedin.com/in/taewanlim">LinkedIn</TextLink> and{' '}
          <TextLink href="https://linktr.ee/wanu">Linktree</TextLink>, or reach me via{' '}
          <TextLink href="mailto:twlim.dev@gmail.com">email</TextLink>.
        </p>
      </div>

      <IndexSection title="Experience" stagger={2}>
        <IndexList>
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
        </IndexList>
      </IndexSection>

      <IndexSection title="Projects" stagger={3}>
        <IndexList>
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
          <IndexItem
            href="/garden/pr-review-agent"
            title="PR Review Agent"
            summary="An AI agent that reviews my pull requests, including its own"
          />
        </IndexList>
      </IndexSection>

      <IndexSection title={<TextLink href="/garden">Garden</TextLink>} stagger={4}>
        <IndexList>
          {notes.map(({ slug, meta }) => (
            <IndexItem
              key={slug}
              href={`/garden/${slug}`}
              title={meta.title}
              summary={<span className="capitalize">{meta.stage}</span>}
              aside={meta.tended}
            />
          ))}
        </IndexList>
      </IndexSection>

      <IndexSection title="Client Works" stagger={5}>
        <IndexList>
          <IndexItem
            href="https://renewal.serene-renewal.pages.dev"
            title="Serene"
            summary="Corporate website for a signage design and build company"
          />
          <IndexItem
            href="https://turiya.kr"
            title="Turiya"
            summary="Shopify store curating works by artists and designers"
          />
        </IndexList>
      </IndexSection>

      <IndexSection title="Contact" stagger={6}>
        <p>
          <TextLink href="mailto:twlim.dev@gmail.com">Email</TextLink>
          <span className="text-muted"> · </span>
          <TextLink href="https://linkedin.com/in/taewanlim">LinkedIn</TextLink>
          <span className="text-muted"> · </span>
          <TextLink href="https://github.com/taewanu">GitHub</TextLink>
        </p>
      </IndexSection>

      <footer className="fade-in stagger-7 mt-12 flex justify-end">
        <LocalTime />
      </footer>
    </main>
  );
}

export default Home;

import { LocalTime } from "./components/LocalTime";

export function Home() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12 sm:py-20">
      <h1 className="fade-in font-serif text-3xl font-bold tracking-tight">
        Taewan Lim
      </h1>

      <div
        className="fade-in stagger-1 mt-12 space-y-5 text-base leading-relaxed tracking-tight"
        style={{ fontWeight: 460 }}
      >
        <p>
          I was born in Seoul, Korea. Currently, based in Bangkok, Thailand.
        </p>

        <p>
          I&apos;m a frontend engineer. Previously at a fintech company in
          Seoul, where I built internal dashboards, a customer-facing loan site,
          and developer tooling as a VSCode extension.
        </p>

        <p>
          Before switching to an engineering career, I had a product
          management background at a food delivery startup in Seoul. It helped
          me think not just about building features, but why they exist, which
          is a mindset I still carry.
        </p>

        <p>
          I&apos;ve also done a handful of different things. I picked
          blueberries in Tasmania, made bath bombs at a LUSH factory in Sydney,
          led beer tours in Seoul, and promoted a Korean theatre team at the
          Edinburgh Fringe Festival in Scotland.
        </p>

        <p>
          You can also find me on{" "}
          <a
            href="https://linkedin.com/in/taewanlim"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          {" "}and{" "}
          <a
            href="https://linktr.ee/wanu"
            target="_blank"
            rel="noopener noreferrer"
          >
            Linktree
          </a>
          , or reach me via{" "}
          <a href="mailto:twlim.dev@gmail.com">email</a>.
        </p>
      </div>

      <section className="fade-in stagger-2 mt-12">
        <h2 className="font-serif text-lg font-bold">Projects</h2>
        <ul
          className="mt-4 space-y-3 text-base leading-relaxed tracking-tight"
          style={{ fontWeight: 460 }}
        >
          <li>
            <a
              href="https://soundsabroad.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sounds Abroad
            </a>
            <span className="text-muted">
              {" "}
              — 3D globe for discovering trending music around the world
            </span>
          </li>
        </ul>
      </section>

      <section className="fade-in stagger-3 mt-12">
        <h2 className="font-serif text-lg font-bold">Client Works</h2>
        <ul
          className="mt-4 space-y-3 text-base leading-relaxed tracking-tight"
          style={{ fontWeight: 460 }}
        >
          <li>
            <a
              href="https://serene.kr"
              target="_blank"
              rel="noopener noreferrer"
            >
              Serene
            </a>
            <span className="text-muted">
              {" "}
              — Corporate website for an exterior design studio
            </span>
          </li>
          <li>
            <a
              href="https://store.thegegenuber.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gegenüber Store
            </a>
            <span className="text-muted"> — Shopify e-commerce store</span>
          </li>
        </ul>
      </section>

      <section className="fade-in stagger-4 mt-12">
        <h2 className="font-serif text-lg font-bold">Contact</h2>
        <ul
          className="mt-4 space-y-3 text-base leading-relaxed tracking-tight"
          style={{ fontWeight: 460 }}
        >
          <li>
            <a href="mailto:twlim.dev@gmail.com">Email</a>
          </li>
          <li>
            <a
              href="https://linkedin.com/in/taewanlim"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://github.com/taewanu"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>
        </ul>
      </section>

      <footer className="fade-in stagger-5 mt-12">
        <LocalTime />
      </footer>
    </main>
  );
}

export default Home;

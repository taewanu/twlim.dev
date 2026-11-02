"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Section = { id: string; label: string };

export function SectionNav({
  backHref,
  backLabel,
  sections,
}: {
  backHref: string;
  backLabel: string;
  sections: Section[];
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-12% 0px -76% 0px" },
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="fixed top-20 left-[max(24px,calc(50%-540px))] hidden w-[188px] text-[0.8125rem] text-muted min-[1100px]:block">
      <Link href={backHref} className="mb-7 inline-block no-underline!">
        ← {backLabel}
      </Link>
      <nav>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`mb-[9px] block leading-[1.4] no-underline! transition-colors ${
              active === section.id ? "text-[#6f6a64]" : "text-muted"
            }`}
          >
            {section.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

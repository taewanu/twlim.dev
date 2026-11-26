import type { ReactNode } from 'react';

export function IndexSection({
  title,
  stagger,
  children,
}: {
  title: ReactNode;
  stagger: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}) {
  return (
    <section className={`fade-in stagger-${stagger} mt-12`}>
      <h2 className="font-serif text-lg font-bold">{title}</h2>
      <div className="mt-4 text-base leading-relaxed tracking-tight font-reading">{children}</div>
    </section>
  );
}

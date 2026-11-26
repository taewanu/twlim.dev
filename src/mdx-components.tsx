import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';

import { Clip } from '@/app/components/Clip';
import { CompareSlider } from '@/app/components/CompareSlider';
import { TextLink } from '@/app/components/TextLink';

const components: MDXComponents = {
  Clip,
  CompareSlider,
  Image,
  a: ({ href = '', children }) => <TextLink href={href}>{children}</TextLink>,
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="mt-10 mb-3 scroll-mt-20 font-serif text-heading font-bold tracking-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="mt-8 mb-2 scroll-mt-20 font-serif text-heading font-bold tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="mb-block">{children}</p>,
  ul: ({ children }) => <ul className="mb-block list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-block list-decimal space-y-1.5 pl-5">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mb-block border-l border-underline pl-4 text-muted">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-block overflow-x-auto rounded-md bg-code-bg p-4 text-meta [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <table className="mb-block w-full border-collapse text-left text-meta">{children}</table>
  ),
  th: ({ children }) => (
    <th className="border-b border-underline py-1.5 pr-4 font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-underline py-1.5 pr-4">{children}</td>,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

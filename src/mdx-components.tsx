import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

const components: MDXComponents = {
  Image,
  a: ({ href = "", children }) => {
    if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
    if (!href.startsWith("http")) return <a href={href}>{children}</a>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="mt-10 mb-3 scroll-mt-20 font-serif text-[0.875rem] leading-[1.4rem] font-bold tracking-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3
      id={id}
      className="mt-8 mb-2 scroll-mt-20 font-serif text-[0.875rem] leading-[1.4rem] font-bold tracking-tight"
    >
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="mb-[1.1rem]">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-[1.1rem] list-disc space-y-1.5 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-[1.1rem] list-decimal space-y-1.5 pl-5">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-[1.1rem] border-l border-underline pl-4 text-muted">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-[1.1rem] overflow-x-auto rounded-md bg-[#f4f2ef] p-4 text-[0.8125rem] [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <table className="mb-[1.1rem] w-full border-collapse text-left text-[0.8125rem]">
      {children}
    </table>
  ),
  th: ({ children }) => (
    <th className="border-b border-underline py-1.5 pr-4 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-underline py-1.5 pr-4">{children}</td>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
